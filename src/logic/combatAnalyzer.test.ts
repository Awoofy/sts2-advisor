import { describe, it, expect } from 'vitest'
import { analyzeTurn } from './combatAnalyzer'
import { mockCombatState, mockBossCombat } from '../test/mockGameState'

describe('analyzeTurn', () => {
  it('detects threats from enemy intents', () => {
    const { threats } = analyzeTurn(
      mockCombatState.hand!,
      mockCombatState.enemies!,
      mockCombatState.status!,
      mockCombatState.energy!,
      mockCombatState.hp!,
      mockCombatState.block!,
    )

    const jawWorm = threats.find((t) => t.enemyName === 'Jaw Worm')!
    expect(jawWorm.isAttacking).toBe(true)
    expect(jawWorm.totalIncomingDamage).toBe(11)
    expect(jawWorm.threatLevel).toBe('medium')

    const cultist = threats.find((t) => t.enemyName === 'Cultist')!
    expect(cultist.isAttacking).toBe(false)
    expect(cultist.isBuffing).toBe(true)
  })

  it('calculates total incoming damage', () => {
    const { totalIncomingDamage } = analyzeTurn(
      mockCombatState.hand!,
      mockCombatState.enemies!,
      mockCombatState.status!,
      mockCombatState.energy!,
      mockCombatState.hp!,
      mockCombatState.block!,
    )

    expect(totalIncomingDamage).toBe(11) // Only Jaw Worm attacks
  })

  it('generates recommendations sorted by priority', () => {
    const { recommendations } = analyzeTurn(
      mockCombatState.hand!,
      mockCombatState.enemies!,
      mockCombatState.status!,
      mockCombatState.energy!,
      mockCombatState.hp!,
      mockCombatState.block!,
    )

    expect(recommendations.length).toBeGreaterThan(0)
    // Priorities should be descending
    for (let i = 1; i < recommendations.length; i++) {
      expect(recommendations[i].priority).toBeLessThanOrEqual(recommendations[i - 1].priority)
    }
  })

  it('detects critical threat in boss fight', () => {
    const { threats, shouldFocusBlock } = analyzeTurn(
      mockBossCombat.hand!,
      mockBossCombat.enemies!,
      mockBossCombat.status!,
      mockBossCombat.energy!,
      mockBossCombat.hp!,
      mockBossCombat.block!,
    )

    const guardian = threats.find((t) => t.enemyName === 'The Guardian')!
    expect(guardian.totalIncomingDamage).toBe(32)
    expect(guardian.threatLevel).toBe('critical')
    expect(shouldFocusBlock).toBe(true)
  })

  it('produces a summary string', () => {
    const { summary } = analyzeTurn(
      mockCombatState.hand!,
      mockCombatState.enemies!,
      mockCombatState.status!,
      mockCombatState.energy!,
      mockCombatState.hp!,
      mockCombatState.block!,
    )

    expect(typeof summary).toBe('string')
    expect(summary.length).toBeGreaterThan(0)
  })
})
