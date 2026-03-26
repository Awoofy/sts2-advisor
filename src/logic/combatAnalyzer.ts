import type { Card, Enemy, StatusEffect } from '../types/gameState'
import { estimateCardDamage } from './damageCalculator'

export interface ThreatAssessment {
  enemyId: string
  enemyName: string
  totalIncomingDamage: number
  isAttacking: boolean
  isBuffing: boolean
  isDebuffing: boolean
  threatLevel: 'low' | 'medium' | 'high' | 'critical'
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
  canKillEnemy: { enemyId: string; enemyName: string; cardsNeeded: string[] }[]
  shouldFocusBlock: boolean
  summary: string
}

function assessThreat(enemy: Enemy): ThreatAssessment {
  let totalIncomingDamage = 0
  let isAttacking = false
  let isBuffing = false
  let isDebuffing = false

  for (const intent of enemy.intents) {
    const type = intent.type.toLowerCase()
    if (type.includes('attack') || intent.damage != null) {
      isAttacking = true
      const dmg = intent.damage ?? 0
      const hits = intent.hits ?? 1
      totalIncomingDamage += dmg * hits
    }
    if (type.includes('buff')) isBuffing = true
    if (type.includes('debuff')) isDebuffing = true
  }

  let threatLevel: ThreatAssessment['threatLevel'] = 'low'
  if (totalIncomingDamage >= 30) threatLevel = 'critical'
  else if (totalIncomingDamage >= 20) threatLevel = 'high'
  else if (totalIncomingDamage >= 10 || isDebuffing) threatLevel = 'medium'

  return {
    enemyId: enemy.combat_id,
    enemyName: enemy.name,
    totalIncomingDamage,
    isAttacking,
    isBuffing,
    isDebuffing,
    threatLevel,
  }
}

function findKillableEnemies(
  hand: Card[],
  enemies: Enemy[],
  playerStatus: StatusEffect[],
  energy: number,
): { enemyId: string; enemyName: string; cardsNeeded: string[] }[] {
  const results: { enemyId: string; enemyName: string; cardsNeeded: string[] }[] = []

  for (const enemy of enemies) {
    const killLine = enemy.hp + enemy.block
    const attacks = hand
      .filter((c) => c.type === 'Attack' && c.can_play && c.cost <= energy)
      .map((c) => ({
        card: c,
        damage: estimateCardDamage(c, playerStatus, enemy),
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
  _playerStatus: StatusEffect[],
  energy: number,
  threats: ThreatAssessment[],
  killableEnemies: { enemyId: string; enemyName: string; cardsNeeded: string[] }[],
): PlayRecommendation[] {
  const recs: PlayRecommendation[] = []
  const totalIncoming = threats.reduce((sum, t) => sum + t.totalIncomingDamage, 0)
  const anyAttacking = threats.some((t) => t.isAttacking)

  // Zero-cost cards first
  for (const card of hand) {
    if (card.cost === 0 && card.can_play) {
      recs.push({
        cardIndex: card.index,
        cardName: card.name,
        reason: '0コスト: 先に使う',
        priority: 100,
      })
    }
  }

  // If we can kill an enemy, prioritize that
  if (killableEnemies.length > 0) {
    const target = killableEnemies[0]
    for (const cardName of target.cardsNeeded) {
      const card = hand.find((c) => c.name === cardName && c.can_play)
      if (card) {
        recs.push({
          cardIndex: card.index,
          cardName: card.name,
          reason: `${target.enemyName} を倒せる!`,
          priority: 90,
          target: target.enemyId,
        })
      }
    }
  }

  // Powers (play early for value)
  for (const card of hand) {
    if (card.type === 'Power' && card.can_play && card.cost <= energy) {
      recs.push({
        cardIndex: card.index,
        cardName: card.name,
        reason: 'パワー: 早めに展開',
        priority: 70,
      })
    }
  }

  // Block vs Attack decision
  if (anyAttacking && totalIncoming > 15) {
    for (const card of hand) {
      if (
        card.type === 'Skill' &&
        card.can_play &&
        card.cost <= energy &&
        card.description.toLowerCase().includes('block')
      ) {
        recs.push({
          cardIndex: card.index,
          cardName: card.name,
          reason: `受けるダメージ ${totalIncoming}: ブロック推奨`,
          priority: 80,
        })
      }
    }
  }

  // Remaining attacks
  if (!anyAttacking || totalIncoming <= 15) {
    const highestEnemy = [...enemies].sort(
      (a, b) => a.hp + a.block - (b.hp + b.block),
    )[0]
    for (const card of hand) {
      if (card.type === 'Attack' && card.can_play && card.cost <= energy) {
        const alreadyRecommended = recs.some((r) => r.cardIndex === card.index)
        if (!alreadyRecommended) {
          recs.push({
            cardIndex: card.index,
            cardName: card.name,
            reason: '攻撃: ダメージを与える',
            priority: 50,
            target: highestEnemy?.combat_id,
          })
        }
      }
    }
  }

  // Deduplicate and sort
  const seen = new Set<number>()
  return recs
    .filter((r) => {
      if (seen.has(r.cardIndex)) return false
      seen.add(r.cardIndex)
      return true
    })
    .sort((a, b) => b.priority - a.priority)
}

export function analyzeTurn(
  hand: Card[],
  enemies: Enemy[],
  playerStatus: StatusEffect[],
  energy: number,
  playerHp: number,
  playerBlock: number,
): TurnAnalysis {
  const threats = enemies.map(assessThreat)
  const totalIncomingDamage = threats.reduce((sum, t) => sum + t.totalIncomingDamage, 0)
  const killableEnemies = findKillableEnemies(hand, enemies, playerStatus, energy)
  const shouldFocusBlock =
    totalIncomingDamage > 15 && playerHp - (totalIncomingDamage - playerBlock) < playerHp * 0.3

  const recommendations = generateRecommendations(
    hand,
    enemies,
    playerStatus,
    energy,
    threats,
    killableEnemies,
  )

  let summary: string
  if (killableEnemies.length > 0) {
    const names = killableEnemies.map((k) => k.enemyName).join(', ')
    summary = `${names} を倒せます! 攻撃優先で。`
  } else if (shouldFocusBlock) {
    summary = `大ダメージ (${totalIncomingDamage}) が来ます。ブロック優先!`
  } else if (totalIncomingDamage === 0) {
    summary = '攻撃なし。全力で攻めましょう!'
  } else {
    summary = `受ける予定ダメージ: ${totalIncomingDamage}。バランスよくプレイ。`
  }

  return {
    threats,
    recommendations,
    totalIncomingDamage,
    canKillEnemy: killableEnemies,
    shouldFocusBlock,
    summary,
  }
}
