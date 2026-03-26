import type { GameState } from '../types/gameState'
import { getStatusAmount } from './damageCalculator'

// -- Defect: Orb Analysis --

export interface OrbAnalysis {
  totalPassiveDamage: number
  totalPassiveBlock: number
  totalEvokeValue: number
  orbSummary: { name: string; passive: string; evoke: string }[]
  darkAccumulated: number
}

export function analyzeOrbs(state: GameState): OrbAnalysis | null {
  if (!state.orbs || state.orbs.length === 0) return null

  const focus = getStatusAmount(state.status ?? [], 'focus')
  let totalPassiveDamage = 0
  let totalPassiveBlock = 0
  let totalEvokeValue = 0
  let darkAccumulated = 0
  const orbSummary: { name: string; passive: string; evoke: string }[] = []

  for (const orb of state.orbs) {
    const id = orb.id.toLowerCase()

    if (id.includes('lightning')) {
      const passive = Math.max(0, 3 + focus)
      const evoke = Math.max(0, 8 + focus)
      totalPassiveDamage += passive
      totalEvokeValue += evoke
      orbSummary.push({ name: 'Lightning', passive: `${passive} DMG`, evoke: `${evoke} DMG` })
    } else if (id.includes('frost')) {
      const passive = Math.max(0, 2 + focus)
      const evoke = Math.max(0, 5 + focus)
      totalPassiveBlock += passive
      totalEvokeValue += evoke
      orbSummary.push({ name: 'Frost', passive: `${passive} Block`, evoke: `${evoke} Block` })
    } else if (id.includes('dark')) {
      const passiveGain = Math.max(0, 6 + focus)
      darkAccumulated = orb.passive_val + passiveGain
      totalEvokeValue += orb.evoke_val
      orbSummary.push({
        name: 'Dark',
        passive: `+${passiveGain}/turn (${orb.evoke_val} stored)`,
        evoke: `${orb.evoke_val} DMG to lowest HP`,
      })
    } else if (id.includes('plasma')) {
      orbSummary.push({ name: 'Plasma', passive: '+1 Energy', evoke: '+2 Energy' })
    } else if (id.includes('glass')) {
      const passive = Math.max(0, orb.passive_val + focus)
      totalPassiveDamage += passive
      orbSummary.push({ name: 'Glass', passive: `${passive} AoE`, evoke: 'AoE DMG' })
    }
  }

  return {
    totalPassiveDamage,
    totalPassiveBlock,
    totalEvokeValue,
    orbSummary,
    darkAccumulated,
  }
}

// -- Regent: Stars/Forge Analysis --

export interface RegentAnalysis {
  stars: number
  starCardsInHand: { name: string; starCost: number; index: number }[]
  canAffordStarCards: boolean
  forgeTotal: number
  sovereignBladeDamage: number
}

export function analyzeRegent(state: GameState): RegentAnalysis | null {
  if (state.character !== 'Regent') return null

  const stars = state.stars ?? 0
  const hand = state.hand ?? []

  const starCards = hand
    .filter((c) => c.star_cost != null && c.star_cost > 0 && c.can_play)
    .map((c) => ({ name: c.name, starCost: c.star_cost!, index: c.index }))

  const canAffordStarCards = starCards.some((c) => c.starCost <= stars)

  // Estimate Forge total from player status or description
  const forgeTotal = getStatusAmount(state.status ?? [], 'forge')

  // Sovereign Blade base = 8 + forge bonuses
  const sovereignBladeDamage = 8 + forgeTotal

  return {
    stars,
    starCardsInHand: starCards,
    canAffordStarCards,
    forgeTotal,
    sovereignBladeDamage,
  }
}

// -- Necrobinder: Osty/Doom Analysis --

export interface NecrobinderAnalysis {
  ostyHp: number
  ostyAlive: boolean
  doomTargets: { enemyId: string; enemyName: string; doom: number; hp: number; willDie: boolean; turnsToLethal: number | null }[]
  totalDoomOnField: number
}

export function analyzeNecrobinder(state: GameState): NecrobinderAnalysis | null {
  if (state.character !== 'Necrobinder') return null

  // Osty info might come through player status or a special field
  const ostyHp = getStatusAmount(state.status ?? [], 'osty')
  const ostyAlive = ostyHp > 0

  const enemies = state.enemies ?? []
  const doomTargets = enemies.map((enemy) => {
    const doom = getStatusAmount(enemy.status, 'doom')
    const willDie = doom >= enemy.hp

    // Estimate turns to lethal if we keep applying Doom
    let turnsToLethal: number | null = null
    if (doom > 0 && !willDie) {
      turnsToLethal = null // Would need to know Doom application rate
    }

    return {
      enemyId: enemy.combat_id,
      enemyName: enemy.name,
      doom,
      hp: enemy.hp,
      willDie,
      turnsToLethal,
    }
  })

  const totalDoomOnField = doomTargets.reduce((sum, t) => sum + t.doom, 0)

  return {
    ostyHp,
    ostyAlive,
    doomTargets,
    totalDoomOnField,
  }
}

// -- Silent: Sly/Discard Analysis --

export interface SilentAnalysis {
  slyCardsInHand: { name: string; index: number }[]
  discardTriggersInHand: { name: string; index: number }[]
  poisonOnEnemies: { enemyId: string; enemyName: string; poison: number; lethalTurns: number | null }[]
  totalPoisonOnField: number
}

export function analyzeSilent(state: GameState): SilentAnalysis | null {
  if (state.character !== 'Silent') return null

  const hand = state.hand ?? []
  const enemies = state.enemies ?? []

  const slyCardsInHand = hand
    .filter((c) => c.keywords.some((k) => k.toLowerCase() === 'sly'))
    .map((c) => ({ name: c.name, index: c.index }))

  const discardTriggersInHand = hand
    .filter((c) =>
      c.description.toLowerCase().includes('discard') && c.can_play,
    )
    .map((c) => ({ name: c.name, index: c.index }))

  const poisonOnEnemies = enemies.map((enemy) => {
    const poison = getStatusAmount(enemy.status, 'poison')
    let lethalTurns: number | null = null

    if (poison > 0) {
      let hp = enemy.hp
      let p = poison
      let turns = 0
      while (hp > 0 && p > 0) {
        turns++
        hp -= p
        p--
      }
      if (hp <= 0) lethalTurns = turns
    }

    return {
      enemyId: enemy.combat_id,
      enemyName: enemy.name,
      poison,
      lethalTurns,
    }
  })

  const totalPoisonOnField = poisonOnEnemies.reduce((sum, e) => sum + e.poison, 0)

  return {
    slyCardsInHand,
    discardTriggersInHand,
    poisonOnEnemies,
    totalPoisonOnField,
  }
}

// -- Unified character analysis --

export interface CharacterAnalysis {
  character: string
  orbs: OrbAnalysis | null
  regent: RegentAnalysis | null
  necrobinder: NecrobinderAnalysis | null
  silent: SilentAnalysis | null
}

export function analyzeCharacter(state: GameState): CharacterAnalysis {
  return {
    character: state.character ?? 'Unknown',
    orbs: analyzeOrbs(state),
    regent: analyzeRegent(state),
    necrobinder: analyzeNecrobinder(state),
    silent: analyzeSilent(state),
  }
}
