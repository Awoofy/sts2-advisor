import type { GameState } from '../types/gameState'
import { analyzeDeck, type DeckAnalysis } from './deckAnalyzer'

// -- Run phase --

export type RunPhase = 'early_act1' | 'mid_act1' | 'pre_boss_act1' |
  'early_act2' | 'mid_act2' | 'pre_boss_act2' |
  'act3' | 'unknown'

export function getRunPhase(act: number, floor: number): RunPhase {
  if (act === 1) {
    if (floor <= 5) return 'early_act1'
    if (floor <= 12) return 'mid_act1'
    return 'pre_boss_act1'
  }
  if (act === 2) {
    if (floor <= 5) return 'early_act2'
    if (floor <= 12) return 'mid_act2'
    return 'pre_boss_act2'
  }
  if (act >= 3) return 'act3'
  return 'unknown'
}

// -- Strategic advice --

export interface StrategicAdvice {
  phase: RunPhase
  phaseLabel: string
  priorities: string[]
  warnings: string[]
  eliteAdvice: string | null
  bossPrep: BossPrep | null
  runHealth: RunHealth
}

export interface BossPrep {
  ready: boolean
  checklist: { label: string; ok: boolean }[]
  suggestion: string
}

export interface RunHealth {
  score: number // 0-100
  label: string
  color: string
  factors: { label: string; impact: number }[]
}

const phaseLabels: Record<RunPhase, string> = {
  early_act1: 'Act 1 序盤',
  mid_act1: 'Act 1 中盤',
  pre_boss_act1: 'Act 1 ボス前',
  early_act2: 'Act 2 序盤',
  mid_act2: 'Act 2 中盤',
  pre_boss_act2: 'Act 2 ボス前',
  act3: 'Act 3',
  unknown: '—',
}

function getPhasePriorities(phase: RunPhase): string[] {
  switch (phase) {
    case 'early_act1':
      return [
        'Frontload ダメージカードを確保',
        'エリート 1-2 体でレリック獲得を狙う',
        'ポーションは積極的に使ってHP温存',
        'Strike/Defend の除去を開始',
      ]
    case 'mid_act1':
      return [
        'アーキタイプの方向性を決める',
        'Scaling カードへのピボット開始',
        'ボスに向けてデッキを整える',
        'カード除去でデッキスリム化',
      ]
    case 'pre_boss_act1':
      return [
        'ボス準備: HP 確保が最優先',
        'デッキの穴を埋める最後のチャンス',
        'ポーションをボスに温存',
        'HP 80% 以下なら休憩推奨',
      ]
    case 'early_act2':
      return [
        'AoE カードの重要性が上がる',
        'Scaling をさらに強化',
        'アーキタイプを 1 つに絞る',
        'ショップでカード除去を優先',
      ]
    case 'mid_act2':
      return [
        'デッキの完成度を上げる',
        'エリートでレリックを追加',
        'Block の手段を確保',
        'パワーカードがなければ探す',
      ]
    case 'pre_boss_act2':
      return [
        'ボス準備: デッキと HP の最終確認',
        '弱いカードの除去ラストチャンス',
        'ポーション温存',
        'HP 回復を優先',
      ]
    case 'act3':
      return [
        'A10: 2 連戦ボス — Scaling + 持久力が必須',
        'デッキは完成しているべき',
        'カード追加は厳選のみ',
        'ポーション全投入',
      ]
    default:
      return []
  }
}

function getEliteAdvice(state: GameState, deckAnalysis: DeckAnalysis): string | null {
  const hpRatio = (state.hp ?? 0) / (state.max_hp ?? 1)
  const relicCount = state.relics?.length ?? 0

  if (hpRatio >= 0.7 && deckAnalysis.totalCards >= 10) {
    return `HP ${Math.round(hpRatio * 100)}% — エリート挑戦OK。レリック(現在${relicCount}個)を増やすチャンス`
  }
  if (hpRatio >= 0.5) {
    return `HP ${Math.round(hpRatio * 100)}% — エリートは慎重に。回復手段があるなら可`
  }
  return `HP ${Math.round(hpRatio * 100)}% — エリート回避推奨。休憩かショップへ`
}

function getBossPrep(state: GameState, deckAnalysis: DeckAnalysis, phase: RunPhase): BossPrep | null {
  if (!phase.startsWith('pre_boss')) return null

  const hpRatio = (state.hp ?? 0) / (state.max_hp ?? 1)
  const hasScaling = !deckAnalysis.missingRoles.includes('scaling')
  const hasBlock = !deckAnalysis.missingRoles.includes('block')
  const hasPotions = (state.potions?.length ?? 0) > 0
  const deckNotBloated = deckAnalysis.deckQuality !== 'bloated'

  const checklist = [
    { label: `HP 80%以上 (${Math.round(hpRatio * 100)}%)`, ok: hpRatio >= 0.8 },
    { label: 'Scaling カードあり', ok: hasScaling },
    { label: 'Block 手段あり', ok: hasBlock },
    { label: 'ポーション所持', ok: hasPotions },
    { label: 'デッキ肥大なし', ok: deckNotBloated },
  ]

  const okCount = checklist.filter((c) => c.ok).length
  const ready = okCount >= 4

  let suggestion: string
  if (ready) {
    suggestion = 'ボス準備OK! 全力で挑みましょう。'
  } else if (hpRatio < 0.5) {
    suggestion = 'HP が危険水域。休憩所があれば回復を最優先。'
  } else if (!hasScaling) {
    suggestion = 'Scaling が不足。ボス戦が長引くと負けます。パワーカードを探して。'
  } else {
    suggestion = `準備 ${okCount}/5。${!hasPotions ? 'ポーションがあると安心。' : ''}${!hasBlock ? 'Block が薄い。' : ''}`
  }

  return { ready, checklist, suggestion }
}

function calculateRunHealth(
  state: GameState,
  deckAnalysis: DeckAnalysis,
  _phase: RunPhase,
): RunHealth {
  const factors: { label: string; impact: number }[] = []
  let score = 50 // Start at neutral

  // HP factor
  const hpRatio = (state.hp ?? 0) / (state.max_hp ?? 1)
  if (hpRatio >= 0.8) {
    factors.push({ label: 'HP 良好', impact: 15 })
    score += 15
  } else if (hpRatio >= 0.5) {
    factors.push({ label: 'HP 普通', impact: 5 })
    score += 5
  } else {
    factors.push({ label: 'HP 危険', impact: -15 })
    score -= 15
  }

  // Relic count
  const relicCount = state.relics?.length ?? 0
  const act = state.act ?? 1
  const expectedRelics = act * 2
  if (relicCount >= expectedRelics) {
    factors.push({ label: `レリック充実 (${relicCount}個)`, impact: 10 })
    score += 10
  } else if (relicCount >= expectedRelics - 1) {
    factors.push({ label: `レリック普通 (${relicCount}個)`, impact: 0 })
  } else {
    factors.push({ label: `レリック不足 (${relicCount}個)`, impact: -10 })
    score -= 10
  }

  // Deck quality
  if (deckAnalysis.deckQuality === 'lean') {
    factors.push({ label: 'デッキスリム', impact: 10 })
    score += 10
  } else if (deckAnalysis.deckQuality === 'bloated') {
    factors.push({ label: 'デッキ肥大', impact: -10 })
    score -= 10
  }

  // Archetype coherence
  if (deckAnalysis.primaryArchetype && deckAnalysis.primaryArchetype.score >= 5) {
    factors.push({ label: `${deckAnalysis.primaryArchetype.label} 確立`, impact: 10 })
    score += 10
  } else if (!deckAnalysis.primaryArchetype) {
    factors.push({ label: 'アーキタイプ未確立', impact: -5 })
    score -= 5
  }

  // Missing roles
  if (deckAnalysis.missingRoles.length === 0) {
    factors.push({ label: '全役割充足', impact: 10 })
    score += 10
  } else if (deckAnalysis.missingRoles.length >= 3) {
    factors.push({ label: `役割不足 (${deckAnalysis.missingRoles.length}個)`, impact: -10 })
    score -= 10
  }

  // Gold
  const gold = state.gold ?? 0
  if (gold >= 200) {
    factors.push({ label: 'ゴールド豊富', impact: 5 })
    score += 5
  }

  score = Math.max(0, Math.min(100, score))

  let label: string
  let color: string
  if (score >= 75) { label = '好調'; color = 'text-spire-green' }
  else if (score >= 50) { label = '普通'; color = 'text-spire-blue' }
  else if (score >= 30) { label = '苦戦'; color = 'text-spire-gold' }
  else { label = '危機'; color = 'text-spire-red' }

  return { score, label, color, factors }
}

// -- Main export --

export function analyzeRun(state: GameState): StrategicAdvice {
  const act = state.act ?? 1
  const floor = state.floor ?? 1
  const phase = getRunPhase(act, floor)
  const deckAnalysis = analyzeDeck(state)

  return {
    phase,
    phaseLabel: phaseLabels[phase],
    priorities: getPhasePriorities(phase),
    warnings: deckAnalysis.warnings,
    eliteAdvice: getEliteAdvice(state, deckAnalysis),
    bossPrep: getBossPrep(state, deckAnalysis, phase),
    runHealth: calculateRunHealth(state, deckAnalysis, phase),
  }
}
