import { describe, it, expect } from 'vitest'
import { adviseMap, adviseCardPick, adviseRest, adviseShop } from './advisorEngine'
import {
  mockMapState,
  mockCardRewardState,
  mockRestState,
  mockShopState,
} from '../test/mockGameState'

describe('adviseMap', () => {
  it('returns advice with recommended index', () => {
    const advice = adviseMap(mockMapState)
    expect(advice).not.toBeNull()
    expect(typeof advice!.recommendedIndex).toBe('number')
    expect(advice!.options).toHaveLength(3)
  })

  it('avoids elite when HP is low', () => {
    const lowHpState = { ...mockMapState, hp: 20, max_hp: 80 }
    const advice = adviseMap(lowHpState)
    // Elite should not be recommended at 25% HP
    const recommended = advice!.options.find(
      (o) => o.index === advice!.recommendedIndex,
    )
    expect(recommended!.type).not.toBe('elite')
  })

  it('prefers rest when HP is very low', () => {
    const veryLowHpState = { ...mockMapState, hp: 15, max_hp: 80 }
    const advice = adviseMap(veryLowHpState)
    const recommended = advice!.options.find(
      (o) => o.index === advice!.recommendedIndex,
    )
    expect(recommended!.type).toBe('rest')
  })
})

describe('adviseCardPick', () => {
  it('recommends rare cards', () => {
    const advice = adviseCardPick(mockCardRewardState.card_rewards, mockCardRewardState)
    expect(advice).not.toBeNull()
    // Demon Form is Rare, should be recommended
    expect(advice!.cards[0].name).toBe('Demon Form')
  })

  it('suggests skip for bloated decks with weak cards', () => {
    const bigDeckState = {
      ...mockCardRewardState,
      draw_pile_count: 25,
      discard_pile_count: 5,
      hand: mockCardRewardState.hand,
      card_rewards: [
        { index: 0, id: 'strike', name: 'Strike', type: 'Attack', cost: 1, description: 'Deal 6 damage.', rarity: 'Common', is_upgraded: false },
        { index: 1, id: 'defend', name: 'Defend', type: 'Skill', cost: 1, description: 'Gain 5 Block.', rarity: 'Common', is_upgraded: false },
      ],
    }
    const advice = adviseCardPick(bigDeckState.card_rewards, bigDeckState)
    expect(advice!.shouldSkip).toBe(true)
  })
})

describe('adviseRest', () => {
  it('recommends rest when HP is low', () => {
    const advice = adviseRest(mockRestState) // hp: 35 / 80 = ~44%
    expect(advice).not.toBeNull()
    expect(advice!.reason).toContain('回復')
  })

  it('recommends smith when HP is high', () => {
    const highHpState = { ...mockRestState, hp: 75, max_hp: 80 }
    const advice = adviseRest(highHpState)
    expect(advice).not.toBeNull()
    expect(advice!.reason).toContain('アップグレード')
  })
})

describe('adviseShop', () => {
  it('returns recommendations for affordable items', () => {
    const advice = adviseShop(mockShopState)
    expect(advice).not.toBeNull()
    expect(advice!.recommendations.length).toBeGreaterThan(0)
  })

  it('prioritizes sale items and relics', () => {
    const advice = adviseShop(mockShopState)
    const top = advice!.recommendations[0]
    // Headbutt (on sale) or Meat on the Bone (relic) should be high priority
    expect(top.priority).toBeGreaterThanOrEqual(3)
  })
})
