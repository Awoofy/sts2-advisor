import type { Card, Enemy, StatusEffect, Potion } from '../types/gameState'
import {
  estimateCardTotalDamage,
  estimateCardBlock,
  calculateIncomingDamage,
  calculatePoisonLethalTurns,
  hasStatus,
  analyzeCardEffects,
  describeCardEffects,
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

export interface PotionAdvice {
  slot: number
  name: string
  reason: string
  priority: number
  target?: string
}

export interface WeakTip {
  enemyName: string
  currentDamage: number
  withWeakDamage: number
  saved: number
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
  potionAdvice: PotionAdvice[]
  weakTips: WeakTip[]
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

  // Helper: pick best target for a single-target attack card
  function pickTarget(card: Card): { id: string; name: string } | undefined {
    if (card.target_type === 'all' || card.target_type === 'Self' || card.target_type === 'none') {
      return undefined
    }
    // Prefer: buffing enemies > lowest effective HP > first
    const sorted = [...enemies].sort((a, b) => {
      const aBuff = threats.find((t) => t.enemyId === a.combat_id)?.isBuffing ? 1 : 0
      const bBuff = threats.find((t) => t.enemyId === b.combat_id)?.isBuffing ? 1 : 0
      if (aBuff !== bBuff) return bBuff - aBuff
      return (a.hp + a.block) - (b.hp + b.block)
    })
    return sorted[0] ? { id: sorted[0].combat_id, name: sorted[0].name } : undefined
  }

  // Helper: describe target for display
  function targetName(card: Card, override?: { id: string; name: string }): string | undefined {
    if (card.target_type === 'all') return '全体'
    if (card.target_type === 'Self' || card.target_type === 'none') return undefined
    const t = override ?? pickTarget(card)
    return t?.name
  }

  // Zero-cost cards first
  for (const card of hand) {
    if (card.cost === 0 && card.can_play) {
      const target = pickTarget(card)
      const fx = describeCardEffects(card)
      candidates.push({
        cardIndex: card.index,
        cardName: card.name,
        cost: 0,
        reason: `0コスト${fx ? ': ' + fx : ''}`,
        priority: 100,
        target: targetName(card, target),
      })
    }
  }

  // Debuff cards (Vulnerable/Weak) before attacks — increases subsequent damage
  for (const card of hand) {
    if (card.cost > 0 && card.can_play && !candidates.some((c) => c.cardIndex === card.index)) {
      const fx = analyzeCardEffects(card)
      if (fx.appliesVulnerable > 0 || fx.appliesWeak > 0) {
        const target = pickTarget(card)
        const parts: string[] = []
        if (fx.appliesVulnerable > 0) parts.push(`脆弱${fx.appliesVulnerable} → 以降+50%DMG`)
        if (fx.appliesWeak > 0) parts.push(`弱体${fx.appliesWeak} → 被DMG-25%`)
        candidates.push({
          cardIndex: card.index,
          cardName: card.name,
          cost: card.cost,
          reason: parts.join(', '),
          priority: 85,
          target: targetName(card, target),
        })
      }
    }
  }

  // If we can kill an enemy, prioritize that
  if (killableEnemies.length > 0) {
    const sorted = [...killableEnemies].sort((a, b) => {
      const aThreats = threats.find((t) => t.enemyId === a.enemyId)
      const bThreats = threats.find((t) => t.enemyId === b.enemyId)
      return (bThreats?.totalIncomingDamage ?? 0) - (aThreats?.totalIncomingDamage ?? 0)
    })

    const killTarget = sorted[0]
    for (const cardName of killTarget.cardsNeeded) {
      const card = hand.find((c) => c.name === cardName && c.can_play)
      if (card && !candidates.some((r) => r.cardIndex === card.index)) {
        candidates.push({
          cardIndex: card.index,
          cardName: card.name,
          cost: card.cost,
          reason: `${killTarget.enemyName} を倒せる!`,
          priority: 95,
          target: killTarget.enemyName,
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
  for (const card of hand) {
    if (card.type === 'Attack' && card.can_play && card.cost > 0) {
      if (!candidates.some((r) => r.cardIndex === card.index)) {
        const t = pickTarget(card)
        const fx = describeCardEffects(card)
        candidates.push({
          cardIndex: card.index,
          cardName: card.name,
          cost: card.cost,
          reason: fx || '攻撃',
          priority: 50,
          target: targetName(card, t),
        })
      }
    }
  }

  // Skills that don't block (debuffs, draw, etc.)
  for (const card of hand) {
    if (card.type === 'Skill' && card.can_play && card.cost > 0) {
      if (!candidates.some((r) => r.cardIndex === card.index)) {
        const t = pickTarget(card)
        const fx = describeCardEffects(card)
        candidates.push({
          cardIndex: card.index,
          cardName: card.name,
          cost: card.cost,
          reason: fx || 'スキル',
          priority: 40,
          target: targetName(card, t),
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

// -- Weak tip calculation --

function calculateWeakTips(enemies: Enemy[], playerStatus: StatusEffect[]): WeakTip[] {
  const tips: WeakTip[] = []

  for (const enemy of enemies) {
    if (hasStatus(enemy.status, 'weak')) continue // already weak

    let currentDamage = 0
    let withWeakDamage = 0

    for (const intent of enemy.intents) {
      if (intent.damage != null) {
        const hits = intent.hits ?? 1
        let perHit = intent.damage
        if (hasStatus(playerStatus, 'vulnerable')) {
          perHit = Math.floor(perHit * 1.5)
        }
        currentDamage += perHit * hits

        let weakPerHit = Math.floor(intent.damage * 0.75)
        if (hasStatus(playerStatus, 'vulnerable')) {
          weakPerHit = Math.floor(weakPerHit * 1.5)
        }
        withWeakDamage += weakPerHit * hits
      }
    }

    if (currentDamage > 0) {
      const saved = currentDamage - withWeakDamage
      if (saved > 0) {
        tips.push({
          enemyName: enemy.name,
          currentDamage,
          withWeakDamage,
          saved,
        })
      }
    }
  }

  return tips.sort((a, b) => b.saved - a.saved)
}

// -- Potion advice --

function advisePotions(
  potions: Potion[],
  _enemies: Enemy[],
  threats: ThreatAssessment[],
  stateType: string,
  playerHp: number,
  playerMaxHp: number,
): PotionAdvice[] {
  const advice: PotionAdvice[] = []
  const isEliteOrBoss = stateType === 'elite' || stateType === 'boss'
  const totalIncoming = threats.reduce((sum, t) => sum + t.totalIncomingDamage, 0)
  const hpRatio = playerMaxHp > 0 ? playerHp / playerMaxHp : 1

  for (const potion of potions) {
    if (!potion.can_use_in_combat) continue

    const desc = potion.description.toLowerCase()
    let reason = ''
    let priority = 0

    // Damage potions: use on elite/boss or when can help kill
    if (desc.includes('ダメージ') || desc.includes('damage')) {
      if (isEliteOrBoss) {
        reason = 'ボス/エリート戦: ダメージポーション推奨'
        priority = 70
      }
    }

    // Block potions: use when heavy damage incoming
    if (desc.includes('ブロック') || desc.includes('block')) {
      if (totalIncoming >= 20) {
        reason = `大ダメージ (${totalIncoming}) 対策に使用推奨`
        priority = 75
      }
    }

    // Weak/Vulnerable potions: always good on elite/boss
    if (desc.includes('弱体') || desc.includes('weak') ||
        desc.includes('脆弱') || desc.includes('vulnerable')) {
      if (isEliteOrBoss) {
        reason = 'ボス/エリート: デバフポーション推奨'
        priority = 65
      }
    }

    // Strength/Dexterity potions: use on elite/boss
    if (desc.includes('筋力') || desc.includes('strength') ||
        desc.includes('敏捷') || desc.includes('dexterity')) {
      if (isEliteOrBoss) {
        reason = 'ボス/エリート: バフポーション推奨'
        priority = 60
      }
    }

    // HP potions: use when low
    if (desc.includes('hp') || desc.includes('回復') || desc.includes('heal')) {
      if (hpRatio < 0.4) {
        reason = `HP ${Math.round(hpRatio * 100)}%: 回復ポーション推奨`
        priority = 80
      }
    }

    if (reason && priority > 0) {
      const highestThreat = [...threats].sort(
        (a, b) => b.totalIncomingDamage - a.totalIncomingDamage,
      )[0]

      advice.push({
        slot: potion.slot,
        name: potion.name,
        reason,
        priority,
        target: potion.target_type !== 'none' && potion.target_type !== 'Self'
          ? highestThreat?.enemyName
          : undefined,
      })
    }
  }

  return advice.sort((a, b) => b.priority - a.priority)
}

export function analyzeTurn(
  hand: Card[],
  enemies: Enemy[],
  playerStatus: StatusEffect[],
  energy: number,
  playerHp: number,
  playerBlock: number,
  potions: Potion[] = [],
  stateType: string = 'monster',
  playerMaxHp: number = playerHp,
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

  // Smarter block focus: if we can't kill anyone AND incoming is significant
  const canKillAnyone = killableEnemies.length > 0
  const shouldFocusBlock =
    !canKillAnyone &&
    incoming.afterBlock > 0 &&
    ((playerHp - incoming.afterBlock) < playerHp * 0.3 || incoming.totalDamage >= 20)

  const recommendations = generateRecommendations(
    hand,
    enemies,
    playerStatus,
    energy,
    threats,
    killableEnemies,
    shouldFocusBlock,
  )

  // Weak tips
  const weakTips = calculateWeakTips(enemies, playerStatus)

  // Potion advice
  const potionAdvice = advisePotions(potions, enemies, threats, stateType, playerHp, playerMaxHp)

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

  // Add poison info
  const poisonKills = threats.filter((t) => t.poisonLethalTurns != null)
  if (poisonKills.length > 0) {
    const poisonInfo = poisonKills
      .map((t) => `${t.enemyName}: 毒で${t.poisonLethalTurns}T後に死亡`)
      .join(', ')
    summary += ` [${poisonInfo}]`
  }

  // Add weak tip to summary if significant
  if (weakTips.length > 0 && weakTips[0].saved >= 5) {
    summary += ` [${weakTips[0].enemyName} に弱体 → ${weakTips[0].saved}DMG軽減]`
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
    potionAdvice,
    weakTips,
  }
}
