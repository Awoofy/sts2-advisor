import { describe, it, expect } from 'vitest'
import { getRunPhase, analyzeRun } from './runCoach'
import { mockCombatState, mockBossCombat } from '../test/mockGameState'
import type { GameState } from '../types/gameState'

describe('getRunPhase', () => {
  it('identifies early Act 1', () => {
    expect(getRunPhase(1, 3)).toBe('early_act1')
  })

  it('identifies mid Act 1', () => {
    expect(getRunPhase(1, 8)).toBe('mid_act1')
  })

  it('identifies pre-boss Act 1', () => {
    expect(getRunPhase(1, 15)).toBe('pre_boss_act1')
  })

  it('identifies Act 2 phases', () => {
    expect(getRunPhase(2, 2)).toBe('early_act2')
    expect(getRunPhase(2, 8)).toBe('mid_act2')
    expect(getRunPhase(2, 14)).toBe('pre_boss_act2')
  })

  it('identifies Act 3', () => {
    expect(getRunPhase(3, 5)).toBe('act3')
  })
})

describe('analyzeRun', () => {
  it('returns strategic advice for early Act 1', () => {
    const state: GameState = { ...mockCombatState, act: 1, floor: 2 }
    const advice = analyzeRun(state)

    expect(advice.phaseLabel).toBe('Act 1 序盤')
    expect(advice.priorities.length).toBeGreaterThan(0)
    expect(advice.priorities[0]).toContain('Frontload')
    expect(advice.eliteAdvice).not.toBeNull()
    expect(advice.runHealth.score).toBeGreaterThan(0)
  })

  it('provides boss prep for pre-boss floors', () => {
    const state: GameState = { ...mockCombatState, act: 1, floor: 15 }
    const advice = analyzeRun(state)

    expect(advice.bossPrep).not.toBeNull()
    expect(advice.bossPrep!.checklist.length).toBeGreaterThan(0)
  })

  it('returns null bossPrep for non-boss floors', () => {
    const state: GameState = { ...mockCombatState, act: 1, floor: 5 }
    const advice = analyzeRun(state)
    expect(advice.bossPrep).toBeNull()
  })

  it('scores run health', () => {
    const healthyState: GameState = {
      ...mockCombatState,
      hp: 75,
      max_hp: 80,
      relics: [
        { id: 'r1', name: 'Relic1', description: '', keywords: [] },
        { id: 'r2', name: 'Relic2', description: '', keywords: [] },
        { id: 'r3', name: 'Relic3', description: '', keywords: [] },
      ],
      gold: 250,
    }
    const advice = analyzeRun(healthyState)
    expect(advice.runHealth.score).toBeGreaterThanOrEqual(50)
  })

  it('warns about low HP for elite', () => {
    const lowHpState: GameState = { ...mockCombatState, hp: 20, max_hp: 80 }
    const advice = analyzeRun(lowHpState)
    expect(advice.eliteAdvice).toContain('回避')
  })

  it('handles Act 3 priorities', () => {
    const state: GameState = { ...mockBossCombat, act: 3, floor: 5 }
    const advice = analyzeRun(state)
    expect(advice.priorities.some((p) => p.includes('2 連戦'))).toBe(true)
  })
})
