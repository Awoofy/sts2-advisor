import { describe, it, expect } from 'vitest'
import {
  calculateSingleHitDamage,
  estimateCardDamage,
  estimateCardHits,
  estimateCardBlock,
  calculateKillLines,
  estimateHandDamage,
  estimateHandBlock,
  calculateIncomingDamage,
  calculatePoisonDamage,
  calculatePoisonLethalTurns,
  getStatusAmount,
  hasStatus,
} from './damageCalculator'
import { mockCombatState, mockVulnerableCombat, mockBossCombat } from '../test/mockGameState'
import type { StatusEffect, Enemy } from '../types/gameState'

describe('getStatusAmount / hasStatus', () => {
  const status: StatusEffect[] = [
    { id: 'strength', name: 'Strength', description: '', amount: 3 },
    { id: 'weak', name: 'Weak', description: '', amount: 2 },
  ]

  it('returns amount for existing status', () => {
    expect(getStatusAmount(status, 'strength')).toBe(3)
  })

  it('returns 0 for missing status', () => {
    expect(getStatusAmount(status, 'dexterity')).toBe(0)
  })

  it('hasStatus returns true/false', () => {
    expect(hasStatus(status, 'weak')).toBe(true)
    expect(hasStatus(status, 'vulnerable')).toBe(false)
  })
})

describe('calculateSingleHitDamage', () => {
  it('applies Strength additively', () => {
    const atk: StatusEffect[] = [{ id: 'strength', name: 'Strength', description: '', amount: 2 }]
    expect(calculateSingleHitDamage(6, atk, [])).toBe(8) // 6+2
  })

  it('applies Vigor additively', () => {
    const atk: StatusEffect[] = [{ id: 'vigor', name: 'Vigor', description: '', amount: 5 }]
    expect(calculateSingleHitDamage(6, atk, [])).toBe(11) // 6+5
  })

  it('applies Weak (x0.75) after additives', () => {
    const atk: StatusEffect[] = [{ id: 'weak', name: 'Weak', description: '', amount: 1 }]
    expect(calculateSingleHitDamage(6, atk, [])).toBe(4) // floor(6 * 0.75)
  })

  it('applies Vulnerable (x1.5) after additives', () => {
    const def: StatusEffect[] = [{ id: 'vulnerable', name: 'Vulnerable', description: '', amount: 2 }]
    expect(calculateSingleHitDamage(6, [], def)).toBe(9) // floor(6 * 1.5)
  })

  it('applies Strength then Vulnerable correctly', () => {
    const atk: StatusEffect[] = [{ id: 'strength', name: 'Strength', description: '', amount: 2 }]
    const def: StatusEffect[] = [{ id: 'vulnerable', name: 'Vulnerable', description: '', amount: 1 }]
    expect(calculateSingleHitDamage(6, atk, def)).toBe(12) // floor((6+2) * 1.5)
  })

  it('applies Weak then Vulnerable', () => {
    const atk: StatusEffect[] = [{ id: 'weak', name: 'Weak', description: '', amount: 1 }]
    const def: StatusEffect[] = [{ id: 'vulnerable', name: 'Vulnerable', description: '', amount: 1 }]
    // floor(floor(6 * 0.75) * 1.5) = floor(4 * 1.5) = 6
    expect(calculateSingleHitDamage(6, atk, def)).toBe(6)
  })

  it('floors to 0 minimum', () => {
    const atk: StatusEffect[] = [
      { id: 'strength', name: 'Strength', description: '', amount: -10 },
    ]
    expect(calculateSingleHitDamage(5, atk, [])).toBe(0)
  })
})

describe('estimateCardDamage', () => {
  const playerStatus = mockCombatState.status!
  const jawWorm = mockCombatState.enemies![0]

  it('calculates strike with strength', () => {
    const strike = mockCombatState.hand![0]
    expect(estimateCardDamage(strike, playerStatus, jawWorm)).toBe(8) // 6+2
  })

  it('returns 0 for non-attack', () => {
    const defend = mockCombatState.hand![2]
    expect(estimateCardDamage(defend, playerStatus, jawWorm)).toBe(0)
  })

  it('applies Vulnerable', () => {
    const vulnEnemy = mockVulnerableCombat.enemies![0]
    const strike = mockCombatState.hand![0]
    expect(estimateCardDamage(strike, playerStatus, vulnEnemy)).toBe(12) // floor((6+2)*1.5)
  })
})

describe('estimateCardHits', () => {
  it('returns 1 for single-hit cards', () => {
    const strike = mockCombatState.hand![0]
    expect(estimateCardHits(strike)).toBe(1)
  })
})

describe('estimateCardBlock', () => {
  it('calculates base block', () => {
    const defend = mockCombatState.hand![2] // Gain 5 Block
    expect(estimateCardBlock(defend, [])).toBe(5)
  })

  it('adds Dexterity', () => {
    const defend = mockCombatState.hand![2]
    const dexStatus: StatusEffect[] = [
      { id: 'dexterity', name: 'Dexterity', description: '', amount: 3 },
    ]
    expect(estimateCardBlock(defend, dexStatus)).toBe(8) // 5+3
  })

  it('returns 0 for non-block cards', () => {
    const strike = mockCombatState.hand![0]
    expect(estimateCardBlock(strike, [])).toBe(0)
  })
})

describe('calculateKillLines', () => {
  it('calculates effective HP', () => {
    const killLines = calculateKillLines(mockCombatState.enemies!)
    const jawWorm = killLines.find((kl) => kl.enemyName === 'Jaw Worm')!
    expect(jawWorm.damageNeeded).toBe(33) // 28 HP + 5 Block
    expect(jawWorm.hasIntangible).toBe(false)
  })

  it('marks Intangible enemies with infinite damage needed', () => {
    const intangibleEnemy: Enemy = {
      entity_id: 'TEST_0',
      combat_id: 'TEST_0',
      name: 'Test',
      hp: 50,
      max_hp: 50,
      block: 0,
      status: [{ id: 'intangible', name: 'Intangible', description: '', amount: 1 }],
      intents: [],
    }
    const killLines = calculateKillLines([intangibleEnemy])
    expect(killLines[0].damageNeeded).toBe(Infinity)
    expect(killLines[0].hasIntangible).toBe(true)
  })
})

describe('estimateHandDamage', () => {
  it('returns estimates for playable attacks', () => {
    const estimates = estimateHandDamage(
      mockCombatState.hand!,
      mockCombatState.status!,
      mockCombatState.enemies![0],
      mockCombatState.energy!,
    )
    expect(estimates.length).toBeGreaterThanOrEqual(3)
  })

  it('includes hit count and total damage', () => {
    const estimates = estimateHandDamage(
      mockCombatState.hand!,
      mockCombatState.status!,
      mockCombatState.enemies![0],
      mockCombatState.energy!,
    )
    for (const est of estimates) {
      expect(est.hits).toBeGreaterThanOrEqual(1)
      expect(est.totalRawDamage).toBe(est.rawDamage * est.hits)
    }
  })
})

describe('estimateHandBlock', () => {
  it('returns block estimates for block cards', () => {
    const estimates = estimateHandBlock(mockCombatState.hand!, mockCombatState.status!, 3)
    expect(estimates.length).toBeGreaterThan(0)
    const defend = estimates.find((e) => e.cardName === 'Defend')!
    expect(defend.blockGained).toBe(5)
  })
})

describe('calculateIncomingDamage', () => {
  it('calculates total incoming damage from enemy intents', () => {
    const result = calculateIncomingDamage(
      mockCombatState.enemies!,
      mockCombatState.block!,
      mockCombatState.status!,
    )
    expect(result.totalDamage).toBe(11) // Jaw Worm 11, Cultist 0
    expect(result.afterBlock).toBe(11) // 0 block
    expect(result.perEnemy).toHaveLength(2)
  })

  it('accounts for player block', () => {
    const result = calculateIncomingDamage(mockCombatState.enemies!, 5, mockCombatState.status!)
    expect(result.afterBlock).toBe(6) // 11 - 5
  })

  it('applies Weak to enemy attacks', () => {
    const weakEnemies: Enemy[] = [
      {
        entity_id: 'E0',
        combat_id: 'E0',
        name: 'Test',
        hp: 50,
        max_hp: 50,
        block: 0,
        status: [{ id: 'weak', name: 'Weak', description: '', amount: 2 }],
        intents: [{ type: 'attack', label: 'Hit', title: 'Hit', description: '', damage: 10, hits: 1 }],
      },
    ]
    const result = calculateIncomingDamage(weakEnemies, 0, [])
    expect(result.totalDamage).toBe(7) // floor(10 * 0.75)
  })

  it('handles boss multi-hit with Vulnerable', () => {
    const vulnStatus: StatusEffect[] = [
      { id: 'vulnerable', name: 'Vulnerable', description: '', amount: 1 },
    ]
    const result = calculateIncomingDamage(mockBossCombat.enemies!, 0, vulnStatus)
    expect(result.totalDamage).toBe(48) // floor(32 * 1.5)
  })
})

describe('calculatePoisonDamage', () => {
  it('returns current poison stacks as this-turn damage', () => {
    const enemy: Enemy = {
      entity_id: 'E0',
      combat_id: 'E0',
      name: 'Test',
      hp: 50,
      max_hp: 50,
      block: 0,
      status: [{ id: 'poison', name: 'Poison', description: '', amount: 8 }],
      intents: [],
    }
    expect(calculatePoisonDamage(enemy)).toBe(8)
  })

  it('returns 0 for no poison', () => {
    const enemy = mockCombatState.enemies![0]
    expect(calculatePoisonDamage(enemy)).toBe(0)
  })
})

describe('calculatePoisonLethalTurns', () => {
  it('calculates turns to kill via poison', () => {
    const enemy: Enemy = {
      entity_id: 'E0',
      combat_id: 'E0',
      name: 'Test',
      hp: 10,
      max_hp: 50,
      block: 0,
      status: [{ id: 'poison', name: 'Poison', description: '', amount: 5 }],
      intents: [],
    }
    // Turn 1: 5 dmg (hp=5), Turn 2: 4 dmg (hp=1), Turn 3: 3 dmg (hp=-2)
    expect(calculatePoisonLethalTurns(enemy)).toBe(3)
  })

  it('returns null if poison cannot kill', () => {
    const enemy: Enemy = {
      entity_id: 'E0',
      combat_id: 'E0',
      name: 'Test',
      hp: 100,
      max_hp: 100,
      block: 0,
      status: [{ id: 'poison', name: 'Poison', description: '', amount: 3 }],
      intents: [],
    }
    // 3+2+1=6 total, not enough for 100 HP
    expect(calculatePoisonLethalTurns(enemy)).toBeNull()
  })

  it('returns null for no poison', () => {
    expect(calculatePoisonLethalTurns(mockCombatState.enemies![0])).toBeNull()
  })
})
