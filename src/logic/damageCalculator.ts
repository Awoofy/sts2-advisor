import type { Card, Enemy, StatusEffect } from '../types/gameState'

export interface DamageEstimate {
  cardIndex: number
  cardName: string
  rawDamage: number
  effectiveDamage: number
  overkill: number
  killsTarget: boolean
  targetId: string
}

export interface KillLine {
  enemyId: string
  enemyName: string
  currentHp: number
  block: number
  effectiveHp: number
  damageNeeded: number
}

function getStrength(status: StatusEffect[]): number {
  const str = status.find((s) => s.id === 'strength' || s.name === 'Strength')
  return str?.amount ?? 0
}

function getVulnerable(status: StatusEffect[]): boolean {
  return status.some(
    (s) => (s.id === 'vulnerable' || s.name === 'Vulnerable') && s.amount > 0,
  )
}

function getWeak(status: StatusEffect[]): boolean {
  return status.some(
    (s) => (s.id === 'weak' || s.name === 'Weak') && s.amount > 0,
  )
}

function parseDamageFromDescription(description: string): number | null {
  const match = description.match(/Deal (\d+) damage/i)
  return match ? parseInt(match[1], 10) : null
}

export function estimateCardDamage(
  card: Card,
  playerStatus: StatusEffect[],
  enemy: Enemy,
): number {
  if (card.type !== 'Attack') return 0

  let baseDamage = parseDamageFromDescription(card.description)
  if (baseDamage == null) return 0

  const strength = getStrength(playerStatus)
  baseDamage += strength

  if (getWeak(playerStatus)) {
    baseDamage = Math.floor(baseDamage * 0.75)
  }

  if (getVulnerable(enemy.status)) {
    baseDamage = Math.floor(baseDamage * 1.5)
  }

  return Math.max(0, baseDamage)
}

export function calculateKillLines(enemies: Enemy[]): KillLine[] {
  return enemies.map((enemy) => {
    const effectiveHp = enemy.hp + enemy.block
    return {
      enemyId: enemy.combat_id,
      enemyName: enemy.name,
      currentHp: enemy.hp,
      block: enemy.block,
      effectiveHp,
      damageNeeded: effectiveHp,
    }
  })
}

export function estimateHandDamage(
  hand: Card[],
  playerStatus: StatusEffect[],
  enemy: Enemy,
  energy: number,
): DamageEstimate[] {
  return hand
    .filter((card) => card.type === 'Attack' && card.can_play && card.cost <= energy)
    .map((card) => {
      const rawDamage = estimateCardDamage(card, playerStatus, enemy)
      const effectiveDamage = Math.max(0, rawDamage - enemy.block)
      const afterBlock = Math.max(0, rawDamage - enemy.block)
      const killsTarget = afterBlock >= enemy.hp

      return {
        cardIndex: card.index,
        cardName: card.name,
        rawDamage,
        effectiveDamage,
        overkill: killsTarget ? afterBlock - enemy.hp : 0,
        killsTarget,
        targetId: enemy.combat_id,
      }
    })
}
