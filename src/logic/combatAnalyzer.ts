import type { Card, Enemy, StatusEffect } from '../types/gameState'
import {
  estimateCardTotalDamage,
  estimateCardBlock,
  calculateIncomingDamage,
  calculatePoisonLethalTurns,
  hasStatus,
} from './damageCalculator'

export interface ThreatAssessment {
  enemyId: string
  enemyName: string
  totalIncomingDamage: number
  isAttacking: boolean
  isBuffing: boolean
  isDebuffing: boolean
  isSummoning: boolean
  threatLevel: 'low' | 'medium' | 'high' | 'critical'
  poisonLethalTurns: number | null
}

export interface PlayRecommendation {
  cardIndex: number
  cardName: string
  reason: string
  priority: number
  target?: string
}

export interface TurnAnalysis {
  threats: ThreatAssessment[]
  recommendations: PlayRecommendation[]
  totalIncomingDamage: number
  incomingAfterBlock: number
  canKillEnemy: { enemyId: string; enemyName: string; cardsNeeded: string[] }[]
  shouldFocusBlock: boolean
  availableBlock: number
  summary: string
}

function assessThreat(enemy: Enemy, playerStatus: StatusEffect[]): ThreatAssessment {
  let totalIncomingDamage = 0
  let isAttacking = false
  let isBuffing = false
  let isDebuffing = false
  let isSummoning = false

  for (const intent of enemy.intents) {
    const type = intent.type.toLowerCase()
    if (type.includes('attack') || intent.damage != null) {
      isAttacking = true
      let perHit = intent.damage ?? 0
      const hits = intent.hits ?? 1

      // Apply Weak on enemy
      if (hasStatus(enemy.status, 'weak')) {
        perHit = Math.floor(perHit * 0.75)
      }
      // Apply Vulnerable on player
      if (hasStatus(playerStatus, 'vulnerable')) {
        perHit = Math.floor(perHit * 1.5)
      }

      totalIncomingDamage += perHit * hits
    }
    if (type.includes('buff')) isBuffing = true
    if (type.includes('debuff')) isDebuffing = true
    if (type.includes('summon')) isSummoning = true
  }

  let threatLevel: ThreatAssessment['threatLevel'] = 'low'
  if (totalIncomingDamage >= 30) threatLevel = 'critical'
  else if (totalIncomingDamage >= 20) threatLevel = 'high'
  else if (totalIncomingDamage >= 10 || isDebuffing) threatLevel = 'medium'
  else if (isBuffing) threatLevel = 'medium'

  const poisonLethalTurns = calculatePoisonLethalTurns(enemy)

  return {
    enemyId: enemy.combat_id,
    enemyName: enemy.name,
    totalIncomingDamage,
    isAttacking,
    isBuffing,
    isDebuffing,
    isSummoning,
    threatLevel,
    poisonLethalTurns,
  }
}

function findKillableEnemies(
  hand: Card[],
  enemies: Enemy[],
  playerStatus: StatusEffect[],
  energy: number,
): { enemyId: string; enemyName: string; cardsNeeded: string[]; energyCost: number }[] {
  const results: { enemyId: string; enemyName: string; cardsNeeded: string[]; energyCost: number }[] = []

  for (const enemy of enemies) {
    if (hasStatus(enemy.status, 'intangible')) continue

    const killLine = enemy.hp + enemy.block
    const attacks = hand
      .filter((c) => c.type === 'Attack' && c.can_play && c.cost <= energy)
      .map((c) => ({
        card: c,
        damage: estimateCardTotalDamage(c, playerStatus, enemy),
      }))
      .sort((a, b) => b.damage - a.damage)

    let totalDamage = 0
    let energyUsed = 0
    const cardsUsed: string[] = []

    for (const { card, damage } of attacks) {
      if (energyUsed + card.cost > energy) continue
      totalDamage += damage
      energyUsed += card.cost
      cardsUsed.push(card.name)
      if (totalDamage >= killLine) {
        results.push({
          enemyId: enemy.combat_id,
          enemyName: enemy.name,
          cardsNeeded: cardsUsed,
          energyCost: energyUsed,
        })
        break
      }
    }
  }

  return results
}

function generateRecommendations(
  hand: Card[],
  enemies: Enemy[],
  playerStatus: StatusEffect[],
  energy: number,
  threats: ThreatAssessment[],
  killableEnemies: { enemyId: string; enemyName: string; cardsNeeded: string[]; energyCost: number }[],
  shouldFocusBlock: boolean,
): PlayRecommendation[] {
  // Collect candidates with priority, then select respecting energy budget
  interface Candidate {
    cardIndex: number
    cardName: string
    cost: number
    reason: string
    priority: number
    target?: string
  }

  const candidates: Candidate[] = []
  const totalIncoming = threats.reduce((sum, t) => sum + t.totalIncomingDamage, 0)
  const anyAttacking = threats.some((t) => t.isAttacking)

  // Zero-cost cards first
  for (const card of hand) {
    if (card.cost === 0 && card.can_play) {
      candidates.push({
        cardIndex: card.index,
        cardName: card.name,
        cost: 0,
        reason: '0コスト: 先に使う',
        priority: 100,
      })
    }
  }

  // If we can kill an enemy, prioritize that
  if (killableEnemies.length > 0) {
    const sorted = [...killableEnemies].sort((a, b) => {
      const aThreats = threats.find((t) => t.enemyId === a.enemyId)
      const bThreats = threats.find((t) => t.enemyId === b.enemyId)
      return (bThreats?.totalIncomingDamage ?? 0) - (aThreats?.totalIncomingDamage ?? 0)
    })

    const target = sorted[0]
    for (const cardName of target.cardsNeeded) {
      const card = hand.find((c) => c.name === cardName && c.can_play)
      if (card && !candidates.some((r) => r.cardIndex === card.index)) {
        candidates.push({
          cardIndex: card.index,
          cardName: card.name,
          cost: card.cost,
          reason: `${target.enemyName} を倒せる!`,
          priority: 95,
          target: target.enemyId,
        })
      }
    }
  }

  // Powers (play early for value)
  for (const card of hand) {
    if (card.type === 'Power' && card.can_play && card.cost > 0) {
      if (!candidates.some((r) => r.cardIndex === card.index)) {
        candidates.push({
          cardIndex: card.index,
          cardName: card.name,
          cost: card.cost,
          reason: 'パワー: 早めに展開',
          priority: 70,
        })
      }
    }
  }

  // Block when needed
  if (shouldFocusBlock || (anyAttacking && totalIncoming > 15)) {
    for (const card of hand) {
      if (card.can_play && card.cost > 0) {
        const blockGained = estimateCardBlock(card, playerStatus)
        if (blockGained > 0 && !candidates.some((r) => r.cardIndex === card.index)) {
          candidates.push({
            cardIndex: card.index,
            cardName: card.name,
            cost: card.cost,
            reason: shouldFocusBlock
              ? `生存危機! ${blockGained} Block`
              : `${totalIncoming} DMG対策: ${blockGained} Block`,
            priority: shouldFocusBlock ? 90 : 75,
          })
        }
      }
    }
  }

  // Remaining attacks
  const primaryTarget = [...enemies].sort((a, b) => {
    const aBuffing = threats.find((t) => t.enemyId === a.combat_id)?.isBuffing ? 1 : 0
    const bBuffing = threats.find((t) => t.enemyId === b.combat_id)?.isBuffing ? 1 : 0
    if (aBuffing !== bBuffing) return bBuffing - aBuffing
    return (a.hp + a.block) - (b.hp + b.block)
  })[0]

  for (const card of hand) {
    if (card.type === 'Attack' && card.can_play && card.cost > 0) {
      if (!candidates.some((r) => r.cardIndex === card.index)) {
        candidates.push({
          cardIndex: card.index,
          cardName: card.name,
          cost: card.cost,
          reason: '攻撃: ダメージを与える',
          priority: 50,
          target: primaryTarget?.combat_id,
        })
      }
    }
  }

  // Skills that don't block (debuffs, draw, etc.)
  for (const card of hand) {
    if (card.type === 'Skill' && card.can_play && card.cost > 0) {
      if (!candidates.some((r) => r.cardIndex === card.index)) {
        candidates.push({
          cardIndex: card.index,
          cardName: card.name,
          cost: card.cost,
          reason: 'スキル',
          priority: 40,
        })
      }
    }
  }

  // Select cards respecting energy budget
  candidates.sort((a, b) => b.priority - a.priority)

  const selected: PlayRecommendation[] = []
  let energyRemaining = energy

  for (const c of candidates) {
    if (c.cost <= energyRemaining) {
      selected.push({
        cardIndex: c.cardIndex,
        cardName: c.cardName,
        reason: c.reason,
        priority: c.priority,
        target: c.target,
      })
      energyRemaining -= c.cost
    }
    if (energyRemaining <= 0) break
  }

  return selected
}

export function analyzeTurn(
  hand: Card[],
  enemies: Enemy[],
  playerStatus: StatusEffect[],
  energy: number,
  playerHp: number,
  playerBlock: number,
): TurnAnalysis {
  const threats = enemies.map((e) => assessThreat(e, playerStatus))
  const incoming = calculateIncomingDamage(enemies, playerBlock, playerStatus)
  const killableEnemies = findKillableEnemies(hand, enemies, playerStatus, energy)

  // Calculate available block from hand
  let availableBlock = playerBlock
  const blockCards = hand.filter(
    (c) => c.can_play && c.cost <= energy && estimateCardBlock(c, playerStatus) > 0,
  )
  for (const card of blockCards) {
    availableBlock += estimateCardBlock(card, playerStatus)
  }

  const shouldFocusBlock =
    incoming.afterBlock > 0 &&
    (playerHp - incoming.afterBlock) < playerHp * 0.3

  const recommendations = generateRecommendations(
    hand,
    enemies,
    playerStatus,
    energy,
    threats,
    killableEnemies,
    shouldFocusBlock,
  )

  let summary: string
  if (killableEnemies.length > 0) {
    const names = killableEnemies.map((k) => k.enemyName).join(', ')
    summary = `${names} を倒せます! 攻撃優先で。`
  } else if (shouldFocusBlock) {
    summary = `大ダメージ (${incoming.totalDamage}) が来ます。ブロック優先!`
  } else if (incoming.totalDamage === 0) {
    summary = '攻撃なし。全力で攻めましょう!'
  } else {
    summary = `受ける予定ダメージ: ${incoming.totalDamage}。バランスよくプレイ。`
  }

  // Add poison info to summary
  const poisonKills = threats.filter((t) => t.poisonLethalTurns != null)
  if (poisonKills.length > 0) {
    const poisonInfo = poisonKills
      .map((t) => `${t.enemyName}: 毒で${t.poisonLethalTurns}ターン後に死亡`)
      .join(', ')
    summary += ` [${poisonInfo}]`
  }

  return {
    threats,
    recommendations,
    totalIncomingDamage: incoming.totalDamage,
    incomingAfterBlock: incoming.afterBlock,
    canKillEnemy: killableEnemies,
    shouldFocusBlock,
    availableBlock,
    summary,
  }
}
