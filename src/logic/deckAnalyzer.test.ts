import { describe, it, expect } from 'vitest'
import { analyzeDeck, adviseCardPickWithContext } from './deckAnalyzer'
import { mockCombatState, mockCardRewardState } from '../test/mockGameState'
import type { GameState, Card } from '../types/gameState'

function makeCard(name: string, type: string, cost: number, description: string, keywords: string[] = []): Card {
  return {
    index: 0,
    id: name.toLowerCase().replace(/\s+/g, '_'),
    name,
    type,
    cost,
    description,
    target_type: 'single',
    can_play: true,
    is_upgraded: false,
    rarity: 'Common',
    keywords,
  }
}

describe('analyzeDeck', () => {
  it('counts card types', () => {
    const result = analyzeDeck(mockCombatState)
    expect(result.attackCount).toBeGreaterThan(0)
    expect(result.totalCards).toBeGreaterThan(0)
  })

  it('detects Strength archetype from Ironclad cards', () => {
    const state: GameState = {
      ...mockCombatState,
      hand: [
        makeCard('Inflame', 'Power', 1, 'Gain 2 Strength.'),
        makeCard('Heavy Blade', 'Attack', 2, 'Deal 14 damage. Strength affects this 3x.'),
        makeCard('Limit Break', 'Skill', 1, 'Double your Strength. Exhaust.', ['Exhaust']),
      ],
      draw_pile: [
        makeCard('Spot Weakness', 'Skill', 1, 'If enemy intends to attack, gain 3 Strength.'),
        makeCard('Demon Form', 'Power', 3, 'At the start of your turn, gain 2 Strength.'),
      ],
    }

    const result = analyzeDeck(state)
    expect(result.primaryArchetype).not.toBeNull()
    expect(result.primaryArchetype!.archetype).toBe('strength')
  })

  it('detects Poison archetype from Silent cards', () => {
    const state: GameState = {
      ...mockCombatState,
      character: 'Silent',
      hand: [
        makeCard('Deadly Poison', 'Skill', 1, 'Apply 5 Poison.', ['Poison']),
        makeCard('Noxious Fumes', 'Power', 1, 'At the start of your turn, apply 2 Poison to ALL enemies.'),
        makeCard('Catalyst', 'Skill', 1, 'Double enemy Poison. Exhaust.'),
      ],
      draw_pile: [
        makeCard('Corpse Explosion', 'Skill', 2, 'Apply 6 Poison. When this enemy dies, deal damage to ALL enemies.'),
      ],
    }

    const result = analyzeDeck(state)
    expect(result.primaryArchetype!.archetype).toBe('poison')
  })

  it('detects bloated deck', () => {
    const cards: Card[] = Array.from({ length: 32 }, (_, i) =>
      makeCard(`Card ${i}`, 'Attack', 1, 'Deal 6 damage.'),
    )
    const state: GameState = { ...mockCombatState, hand: cards.slice(0, 5), draw_pile: cards.slice(5) }
    const result = analyzeDeck(state)
    expect(result.deckQuality).toBe('bloated')
    expect(result.warnings.length).toBeGreaterThan(0)
  })

  it('detects lean deck', () => {
    const cards: Card[] = Array.from({ length: 15 }, (_, i) =>
      makeCard(`Card ${i}`, 'Attack', 1, 'Deal 6 damage.'),
    )
    const state: GameState = { ...mockCombatState, hand: cards.slice(0, 5), draw_pile: cards.slice(5) }
    const result = analyzeDeck(state)
    expect(result.deckQuality).toBe('lean')
  })

  it('warns about high average cost', () => {
    const cards: Card[] = Array.from({ length: 20 }, (_, i) =>
      makeCard(`Card ${i}`, 'Attack', 3, 'Deal 20 damage.'),
    )
    const state: GameState = { ...mockCombatState, hand: cards.slice(0, 5), draw_pile: cards.slice(5) }
    const result = analyzeDeck(state)
    expect(result.warnings.some((w) => w.includes('コスト'))).toBe(true)
  })
})

describe('adviseCardPickWithContext', () => {
  it('ranks cards by archetype fit', () => {
    const strengthDeck: GameState = {
      ...mockCardRewardState,
      hand: [
        makeCard('Inflame', 'Power', 1, 'Gain 2 Strength.'),
        makeCard('Heavy Blade', 'Attack', 2, 'Deal 14 damage. Strength affects this 3x.'),
      ],
      draw_pile: [
        makeCard('Demon Form', 'Power', 3, 'At the start of your turn, gain 2 Strength.'),
      ],
    }

    const deckAnalysis = analyzeDeck(strengthDeck)
    const advice = adviseCardPickWithContext(strengthDeck, deckAnalysis)

    expect(advice).not.toBeNull()
    expect(advice!.length).toBe(3)
  })

  it('returns null for no card rewards', () => {
    const state: GameState = { ...mockCombatState, card_rewards: undefined }
    const deckAnalysis = analyzeDeck(state)
    expect(adviseCardPickWithContext(state, deckAnalysis)).toBeNull()
  })
})
