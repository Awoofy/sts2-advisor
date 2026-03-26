import { describe, it, expect } from 'vitest'
import { analyzeTurn } from './combatAnalyzer'
import { mockCombatState, mockBossCombat } from '../test/mockGameState'
import type { Enemy } from '../types/gameState'

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
    expect(totalIncomingDamage).toBe(11)
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

  it('calculates available block from hand', () => {
    const { availableBlock } = analyzeTurn(
      mockCombatState.hand!,
      mockCombatState.enemies!,
      mockCombatState.status!,
      mockCombatState.energy!,
      mockCombatState.hp!,
      mockCombatState.block!,
    )
    // Defend gives 5 block, current block is 0
    expect(availableBlock).toBe(5)
  })

  it('includes incoming after block info', () => {
    const result = analyzeTurn(
      mockBossCombat.hand!,
      mockBossCombat.enemies!,
      mockBossCombat.status!,
      mockBossCombat.energy!,
      mockBossCombat.hp!,
      mockBossCombat.block!, // 8 block
    )
    expect(result.incomingAfterBlock).toBe(24) // 32 - 8
  })

  it('detects poison lethal turns', () => {
    const poisonedEnemies: Enemy[] = [
      {
        entity_id: 'E0',
        combat_id: 'E0',
        name: 'Poisoned Foe',
        hp: 10,
        max_hp: 50,
        block: 0,
        status: [{ id: 'poison', name: 'Poison', description: '', amount: 5 }],
        intents: [{ type: 'attack', label: 'Hit', title: 'Hit', description: '', damage: 5, hits: 1 }],
      },
    ]

    const { threats } = analyzeTurn(
      mockCombatState.hand!,
      poisonedEnemies,
      [],
      3,
      50,
      0,
    )

    expect(threats[0].poisonLethalTurns).toBe(3)
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
