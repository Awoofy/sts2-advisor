import { describe, it, expect } from 'vitest'
import {
  analyzeOrbs,
  analyzeRegent,
  analyzeNecrobinder,
  analyzeSilent,
  analyzeCharacter,
} from './characterMechanics'
import type { GameState } from '../types/gameState'
import { mockCombatState, mockBossCombat } from '../test/mockGameState'

describe('analyzeOrbs', () => {
  it('returns null when no orbs', () => {
    expect(analyzeOrbs(mockCombatState)).toBeNull()
  })

  it('calculates Lightning orb damage with Focus', () => {
    const state: GameState = {
      ...mockCombatState,
      character: 'Defect',
      orbs: [
        { id: 'lightning', name: 'Lightning', description: '', passive_val: 3, evoke_val: 8, keywords: [] },
        { id: 'frost', name: 'Frost', description: '', passive_val: 2, evoke_val: 5, keywords: [] },
      ],
      status: [
        { id: 'focus', name: 'Focus', description: '', amount: 2 },
      ],
    }

    const result = analyzeOrbs(state)!
    expect(result.totalPassiveDamage).toBe(5) // Lightning: 3+2 focus
    expect(result.totalPassiveBlock).toBe(4) // Frost: 2+2 focus
    expect(result.orbSummary).toHaveLength(2)
  })

  it('handles Dark orb accumulation', () => {
    const state: GameState = {
      ...mockCombatState,
      character: 'Defect',
      orbs: [
        { id: 'dark', name: 'Dark', description: '', passive_val: 18, evoke_val: 18, keywords: [] },
      ],
      status: [],
    }

    const result = analyzeOrbs(state)!
    expect(result.darkAccumulated).toBe(24) // 18 + 6 base gain
    expect(result.orbSummary[0].name).toBe('Dark')
  })
})

describe('analyzeRegent', () => {
  it('returns null for non-Regent', () => {
    expect(analyzeRegent(mockCombatState)).toBeNull()
  })

  it('calculates Stars and star cards', () => {
    const state: GameState = {
      ...mockCombatState,
      character: 'Regent',
      stars: 5,
      hand: [
        {
          index: 0, id: 'bombardment', name: 'Bombardment', type: 'Attack',
          cost: 1, star_cost: 3, description: 'Deal damage equal to Stars.',
          target_type: 'single', can_play: true, is_upgraded: false, rarity: 'Rare', keywords: [],
        },
        {
          index: 1, id: 'strike', name: 'Strike', type: 'Attack',
          cost: 1, description: 'Deal 6 damage.', target_type: 'single',
          can_play: true, is_upgraded: false, rarity: 'Common', keywords: [],
        },
      ],
    }

    const result = analyzeRegent(state)!
    expect(result.stars).toBe(5)
    expect(result.starCardsInHand).toHaveLength(1)
    expect(result.canAffordStarCards).toBe(true)
    expect(result.sovereignBladeDamage).toBe(8) // base 8 + 0 forge
  })
})

describe('analyzeNecrobinder', () => {
  it('returns null for non-Necrobinder', () => {
    expect(analyzeNecrobinder(mockCombatState)).toBeNull()
  })

  it('detects Doom lethal', () => {
    const state: GameState = {
      ...mockCombatState,
      character: 'Necrobinder',
      enemies: [
        {
          entity_id: 'E0', combat_id: 'E0', name: 'Doomed Foe',
          hp: 15, max_hp: 50, block: 0,
          status: [{ id: 'doom', name: 'Doom', description: '', amount: 20 }],
          intents: [],
        },
      ],
    }

    const result = analyzeNecrobinder(state)!
    expect(result.doomTargets[0].willDie).toBe(true)
    expect(result.totalDoomOnField).toBe(20)
  })
})

describe('analyzeSilent', () => {
  it('returns null for non-Silent', () => {
    expect(analyzeSilent(mockCombatState)).toBeNull()
  })

  it('detects Sly cards and poison', () => {
    const state: GameState = {
      ...mockBossCombat,
      character: 'Silent',
      hand: [
        {
          index: 0, id: 'sly_strike', name: 'Sly Strike', type: 'Attack',
          cost: 1, description: 'Deal 6 damage.', target_type: 'single',
          can_play: true, is_upgraded: false, rarity: 'Common', keywords: ['Sly'],
        },
        {
          index: 1, id: 'calculated_gamble', name: 'Calculated Gamble', type: 'Skill',
          cost: 0, description: 'Discard your hand. Draw that many cards.',
          target_type: 'none', can_play: true, is_upgraded: false, rarity: 'Uncommon', keywords: [],
        },
      ],
      enemies: [
        {
          entity_id: 'E0', combat_id: 'E0', name: 'Poisoned Foe',
          hp: 10, max_hp: 50, block: 0,
          status: [{ id: 'poison', name: 'Poison', description: '', amount: 8 }],
          intents: [],
        },
      ],
    }

    const result = analyzeSilent(state)!
    expect(result.slyCardsInHand).toHaveLength(1)
    expect(result.discardTriggersInHand).toHaveLength(1)
    expect(result.poisonOnEnemies[0].poison).toBe(8)
    expect(result.poisonOnEnemies[0].lethalTurns).toBe(2) // 8+7=15 > 10
    expect(result.totalPoisonOnField).toBe(8)
  })
})

describe('analyzeCharacter', () => {
  it('returns unified analysis for any character', () => {
    const result = analyzeCharacter(mockCombatState)
    expect(result.character).toBe('Ironclad')
    expect(result.orbs).toBeNull()
    expect(result.regent).toBeNull()
    expect(result.necrobinder).toBeNull()
    expect(result.silent).toBeNull()
  })
})
