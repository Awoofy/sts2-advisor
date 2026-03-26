import { describe, it, expect } from 'vitest'
import { estimateCardDamage, calculateKillLines, estimateHandDamage } from './damageCalculator'
import { mockCombatState, mockVulnerableCombat } from '../test/mockGameState'
import type { StatusEffect } from '../types/gameState'

describe('estimateCardDamage', () => {
  const playerStatus = mockCombatState.status!
  const jawWorm = mockCombatState.enemies![0]

  it('calculates base attack damage from description', () => {
    const strike = mockCombatState.hand![0] // Strike: Deal 6 damage
    const damage = estimateCardDamage(strike, playerStatus, jawWorm)
    // 6 base + 2 strength = 8
    expect(damage).toBe(8)
  })

  it('returns 0 for non-attack cards', () => {
    const defend = mockCombatState.hand![2] // Defend: Skill
    expect(estimateCardDamage(defend, playerStatus, jawWorm)).toBe(0)
  })

  it('applies Vulnerable (1.5x) to enemy', () => {
    const vulnEnemy = mockVulnerableCombat.enemies![0]
    const strike = mockCombatState.hand![0] // Strike: Deal 6 damage
    const damage = estimateCardDamage(strike, playerStatus, vulnEnemy)
    // (6 + 2 strength) * 1.5 vulnerable = 12
    expect(damage).toBe(12)
  })

  it('applies Weak (0.75x) to player', () => {
    const weakStatus: StatusEffect[] = [
      { id: 'weak', name: 'Weak', description: 'Deals 25% less damage.', amount: 2 },
    ]
    const strike = mockCombatState.hand![0]
    const damage = estimateCardDamage(strike, weakStatus, jawWorm)
    // (6 + 0 strength) * 0.75 weak = 4 (floor)
    expect(damage).toBe(4)
  })

  it('applies both Strength and Weak', () => {
    const mixedStatus: StatusEffect[] = [
      { id: 'strength', name: 'Strength', description: '', amount: 3 },
      { id: 'weak', name: 'Weak', description: '', amount: 1 },
    ]
    const strike = mockCombatState.hand![0] // 6 base
    const damage = estimateCardDamage(strike, mixedStatus, jawWorm)
    // (6 + 3) * 0.75 = 6 (floor)
    expect(damage).toBe(6)
  })
})

describe('calculateKillLines', () => {
  it('calculates effective HP (hp + block)', () => {
    const enemies = mockCombatState.enemies!
    const killLines = calculateKillLines(enemies)

    expect(killLines).toHaveLength(2)

    const jawWorm = killLines.find((kl) => kl.enemyName === 'Jaw Worm')!
    expect(jawWorm.damageNeeded).toBe(28 + 5) // 28 HP + 5 Block

    const cultist = killLines.find((kl) => kl.enemyName === 'Cultist')!
    expect(cultist.damageNeeded).toBe(15) // 15 HP + 0 Block
  })
})

describe('estimateHandDamage', () => {
  it('returns damage estimates for playable attacks within energy', () => {
    const hand = mockCombatState.hand!
    const playerStatus = mockCombatState.status!
    const jawWorm = mockCombatState.enemies![0]
    const energy = mockCombatState.energy!

    const estimates = estimateHandDamage(hand, playerStatus, jawWorm, energy)

    // Strike x2 (cost 1), Bash (cost 2), Cleave (cost 1) = 4 attacks
    expect(estimates.length).toBeGreaterThanOrEqual(3)

    const strikeEst = estimates.find((e) => e.cardName === 'Strike')!
    expect(strikeEst.rawDamage).toBe(8) // 6 + 2 str
  })

  it('identifies if a card can kill the target', () => {
    const vulnEnemy = mockVulnerableCombat.enemies![0] // 20 HP, 0 block, vulnerable
    const hand = mockCombatState.hand!
    const playerStatus = mockCombatState.status!

    const estimates = estimateHandDamage(hand, playerStatus, vulnEnemy, 3)

    const bashEst = estimates.find((e) => e.cardName === 'Bash')!
    // Bash: (8 + 2 str) * 1.5 vuln = 15, effective vs 20 HP
    expect(bashEst.rawDamage).toBe(15)
  })
})
