import type { Card, GameState, CardReward } from '../types/gameState'
import { analyzeCardEffects } from './damageCalculator'
import { lookupCard, lookupCardByName } from '../data/cardLookup'

// -- Archetype definitions --

export type Archetype =
  // Ironclad
  | 'strength'
  | 'exhaust'
  | 'block_barricade'
  // Silent
  | 'poison'
  | 'shiv'
  | 'sly_discard'
  // Defect
  | 'orb_lightning'
  | 'orb_frost'
  | 'orb_dark'
  // Regent
  | 'stars'
  | 'forge'
  // Necrobinder
  | 'doom'
  | 'summon'
  // Generic
  | 'generic'

export interface ArchetypeScore {
  archetype: Archetype
  score: number
  label: string
  description: string
}

export type DeckRole = 'frontload' | 'scaling' | 'block' | 'draw' | 'aoe'

export interface RoleAnalysis {
  role: DeckRole
  label: string
  count: number
  sufficient: boolean
}

export interface DeckAnalysis {
  totalCards: number
  attackCount: number
  skillCount: number
  powerCount: number
  avgCost: number
  archetypes: ArchetypeScore[]
  primaryArchetype: ArchetypeScore | null
  deckQuality: 'lean' | 'balanced' | 'bloated'
  warnings: string[]
  roles: RoleAnalysis[]
  missingRoles: DeckRole[]
}

// Keyword/description patterns that indicate archetypes
const archetypePatterns: Record<Archetype, { keywords: string[]; descPatterns: RegExp[]; label: string; description: string }> = {
  strength: {
    keywords: [],
    descPatterns: [/strength/i, /heavy blade/i, /limit break/i, /spot weakness/i, /inflame/i, /demon form/i],
    label: 'Strength',
    description: 'Strength スケーリング',
  },
  exhaust: {
    keywords: ['Exhaust'],
    descPatterns: [/exhaust/i, /corruption/i, /dark embrace/i, /feel no pain/i, /sentinel/i],
    label: 'Exhaust',
    description: 'Exhaust エンジン',
  },
  block_barricade: {
    keywords: [],
    descPatterns: [/barricade/i, /body slam/i, /entrench/i, /impervious/i, /metallicize/i],
    label: 'Block/Barricade',
    description: 'Block 蓄積型',
  },
  poison: {
    keywords: ['Poison'],
    descPatterns: [/poison/i, /noxious fumes/i, /envenom/i, /catalyst/i, /corpse explosion/i],
    label: 'Poison',
    description: 'Poison スタック',
  },
  shiv: {
    keywords: [],
    descPatterns: [/shiv/i, /blade dance/i, /cloak and dagger/i, /infinite blades/i, /accuracy/i],
    label: 'Shiv',
    description: 'Shiv スパム',
  },
  sly_discard: {
    keywords: ['Sly'],
    descPatterns: [/sly/i, /discard/i, /calculated gamble/i, /tactician/i, /reflex/i],
    label: 'Sly/Discard',
    description: 'Sly + Discard チェーン',
  },
  orb_lightning: {
    keywords: [],
    descPatterns: [/lightning/i, /electrodynamics/i, /storm/i, /thunder strike/i],
    label: 'Lightning Orbs',
    description: 'Lightning Orb ダメージ',
  },
  orb_frost: {
    keywords: [],
    descPatterns: [/frost/i, /glacier/i, /coolheaded/i, /chill/i],
    label: 'Frost Orbs',
    description: 'Frost Orb 防御',
  },
  orb_dark: {
    keywords: [],
    descPatterns: [/dark\b/i, /doom and gloom/i, /darkness/i],
    label: 'Dark Orbs',
    description: 'Dark Orb 蓄積',
  },
  stars: {
    keywords: [],
    descPatterns: [/star/i, /bombardment/i, /genesis/i, /hidden cache/i, /glow/i],
    label: 'Stars',
    description: 'Stars リソース蓄積',
  },
  forge: {
    keywords: ['Forge'],
    descPatterns: [/forge/i, /sovereign blade/i, /temper steel/i, /masterwork/i],
    label: 'Forge',
    description: 'Forge + Sovereign Blade',
  },
  doom: {
    keywords: ['Doom'],
    descPatterns: [/doom/i, /no escape/i, /death's door/i],
    label: 'Doom',
    description: 'Doom 即死',
  },
  summon: {
    keywords: ['Summon'],
    descPatterns: [/summon/i, /osty/i, /bodyguard/i, /unleash/i],
    label: 'Summon',
    description: 'Osty/Summon 強化',
  },
  generic: {
    keywords: [],
    descPatterns: [],
    label: 'Generic',
    description: '特化なし',
  },
}

function scoreCardForArchetype(
  card: Card,
  archetype: Archetype,
): number {
  const patterns = archetypePatterns[archetype]
  let score = 0

  for (const kw of patterns.keywords) {
    if (card.keywords.some((k) => k.toLowerCase() === kw.toLowerCase())) {
      score += 2
    }
  }

  for (const pattern of patterns.descPatterns) {
    if (pattern.test(card.description) || pattern.test(card.name)) {
      score += 1
    }
  }

  return score
}

function getAllDeckCards(state: GameState): Card[] {
  const cards: Card[] = []
  if (state.hand) cards.push(...state.hand)
  if (state.draw_pile) cards.push(...state.draw_pile)
  if (state.discard_pile) cards.push(...state.discard_pile)
  if (state.exhaust_pile) cards.push(...state.exhaust_pile)
  return cards
}

export function analyzeDeck(state: GameState): DeckAnalysis {
  const allCards = getAllDeckCards(state)
  const totalCards = allCards.length

  const attackCount = allCards.filter((c) => c.type === 'Attack').length
  const skillCount = allCards.filter((c) => c.type === 'Skill').length
  const powerCount = allCards.filter((c) => c.type === 'Power').length
  const avgCost = totalCards > 0
    ? allCards.reduce((sum, c) => sum + c.cost, 0) / totalCards
    : 0

  // Score each archetype
  const archetypeScores: ArchetypeScore[] = []
  const allArchetypes = Object.keys(archetypePatterns) as Archetype[]

  for (const arch of allArchetypes) {
    if (arch === 'generic') continue

    let score = 0
    for (const card of allCards) {
      score += scoreCardForArchetype(card, arch)
    }

    if (score > 0) {
      const patterns = archetypePatterns[arch]
      archetypeScores.push({
        archetype: arch,
        score,
        label: patterns.label,
        description: patterns.description,
      })
    }
  }

  archetypeScores.sort((a, b) => b.score - a.score)

  const primaryArchetype = archetypeScores.length > 0 ? archetypeScores[0] : null

  // Deck quality
  let deckQuality: DeckAnalysis['deckQuality'] = 'balanced'
  if (totalCards <= 20) deckQuality = 'lean'
  else if (totalCards >= 30) deckQuality = 'bloated'

  // Warnings
  const warnings: string[] = []
  if (totalCards >= 30) {
    warnings.push(`デッキが大きい (${totalCards}枚)。カードスキップ or 除去を検討`)
  }
  if (avgCost >= 2.0) {
    warnings.push(`平均コストが高い (${avgCost.toFixed(1)})。低コストカードを追加検討`)
  }
  if (powerCount === 0 && totalCards > 15) {
    warnings.push('パワーカードがありません。スケーリング不足の可能性')
  }
  if (archetypeScores.length >= 3 && archetypeScores[0].score - archetypeScores[2].score < 2) {
    warnings.push('アーキタイプが分散しています。1つに絞るとデッキが回りやすくなります')
  }

  // Role analysis (Jobs framework)
  const roles: RoleAnalysis[] = []
  let frontloadCount = 0
  let scalingCount = 0
  let blockCount = 0
  let drawCount = 0
  let aoeCount = 0

  for (const card of allCards) {
    const fx = analyzeCardEffects(card)
    if (card.type === 'Attack' && fx.damage != null && !fx.hasScaling) frontloadCount++
    if (fx.hasScaling || card.type === 'Power') scalingCount++
    if (fx.block != null) blockCount++
    if (fx.drawCards > 0) drawCount++
    if (fx.isAoe) aoeCount++
  }

  const thresholds: Record<DeckRole, { label: string; min: number }> = {
    frontload: { label: 'Frontload (即ダメージ)', min: 3 },
    scaling: { label: 'Scaling (成長)', min: 1 },
    block: { label: 'Block (防御)', min: 3 },
    draw: { label: 'Draw (ドロー)', min: 1 },
    aoe: { label: 'AoE (全体攻撃)', min: 1 },
  }

  const counts: Record<DeckRole, number> = {
    frontload: frontloadCount,
    scaling: scalingCount,
    block: blockCount,
    draw: drawCount,
    aoe: aoeCount,
  }

  const missingRoles: DeckRole[] = []
  for (const [role, config] of Object.entries(thresholds)) {
    const r = role as DeckRole
    const count = counts[r]
    const sufficient = count >= config.min
    roles.push({ role: r, label: config.label, count, sufficient })
    if (!sufficient) missingRoles.push(r)
  }

  if (missingRoles.includes('scaling') && totalCards > 15) {
    warnings.push('Scaling カードが不足。パワーやバフカードを検討')
  }

  return {
    totalCards,
    attackCount,
    skillCount,
    powerCount,
    avgCost,
    archetypes: archetypeScores.slice(0, 3),
    primaryArchetype,
    deckQuality,
    warnings,
    roles,
    missingRoles,
  }
}

// -- Card pick advisor with archetype context --

export interface ContextualCardAdvice {
  index: number
  name: string
  archetypeFit: number
  reasoning: string
}

function cardRewardToCard(reward: CardReward): Card {
  return {
    index: reward.index,
    id: reward.id,
    name: reward.name,
    type: reward.type,
    cost: reward.cost,
    description: reward.description,
    target_type: 'single',
    can_play: true,
    is_upgraded: reward.is_upgraded,
    rarity: reward.rarity,
    keywords: [],
  }
}

function evaluateRoleFit(card: Card, missingRoles: DeckRole[]): { score: number; roles: string[] } {
  const fx = analyzeCardEffects(card)
  let score = 0
  const filledRoles: string[] = []

  if (missingRoles.includes('frontload') && card.type === 'Attack' && fx.damage != null && !fx.hasScaling) {
    score += 3
    filledRoles.push('Frontload')
  }
  if (missingRoles.includes('scaling') && (fx.hasScaling || card.type === 'Power')) {
    score += 4 // Scaling is high value
    filledRoles.push('Scaling')
  }
  if (missingRoles.includes('block') && fx.block != null) {
    score += 2
    filledRoles.push('Block')
  }
  if (missingRoles.includes('draw') && fx.drawCards > 0) {
    score += 3
    filledRoles.push('Draw')
  }
  if (missingRoles.includes('aoe') && fx.isAoe) {
    score += 2
    filledRoles.push('AoE')
  }

  return { score, roles: filledRoles }
}

export function adviseCardPickWithContext(
  state: GameState,
  deckAnalysis: DeckAnalysis,
): ContextualCardAdvice[] | null {
  const rewards = state.card_rewards
  if (!rewards || rewards.length === 0) return null

  const primary = deckAnalysis.primaryArchetype

  const evaluated = rewards.map((reward) => {
    const card = cardRewardToCard(reward)
    let totalScore = 0
    const reasons: string[] = []

    // 1. Tier DB lookup (highest weight)
    const cardInfo = lookupCard(reward.id) ?? lookupCardByName(reward.name)
    if (cardInfo?.tier) {
      const tierScore = cardInfo.tier.score * 3 // S=15, A=12, B=9, C=6, D=3
      totalScore += tierScore
      reasons.push(`${cardInfo.tier.tier}-tier`)
    }

    // 2. Rarity bonus (lower weight now that we have tier data)
    if (!cardInfo?.tier) {
      // Only use rarity as fallback when no tier data
      if (reward.rarity === 'Rare') {
        totalScore += 4
        reasons.push('レア')
      } else if (reward.rarity === 'Uncommon') {
        totalScore += 2
      }
    }
    if (reward.is_upgraded) {
      totalScore += 2
      reasons.push('UG済み')
    }

    // 3. Archetype fit
    if (primary) {
      const archFit = scoreCardForArchetype(card, primary.archetype)
      totalScore += archFit * 2
      if (archFit > 0) {
        reasons.push(`${primary.label} シナジー`)
      }
    }

    // 4. Role fit (fills missing roles)
    const roleFit = evaluateRoleFit(card, deckAnalysis.missingRoles)
    totalScore += roleFit.score
    if (roleFit.roles.length > 0) {
      reasons.push(`不足補完: ${roleFit.roles.join('+')}`)
    }

    // 5. Deck size penalty
    if (deckAnalysis.deckQuality === 'bloated') {
      const tierScore = cardInfo?.tier?.score ?? 0
      if (tierScore < 4) { // Only skip if not A or S tier
        totalScore -= 5
        reasons.push('デッキ肥大 → スキップ検討')
      }
    }

    return {
      index: reward.index,
      name: reward.name,
      archetypeFit: totalScore,
      reasoning: reasons.length > 0 ? reasons.join(' | ') : reward.rarity,
    }
  })

  evaluated.sort((a, b) => b.archetypeFit - a.archetypeFit)

  // Skip recommendation: only if all cards score poorly
  const allLowTier = evaluated.every((e) => e.archetypeFit <= 8)
  if (deckAnalysis.deckQuality === 'bloated' && allLowTier) {
    evaluated[0].reasoning += ' [全体的にスキップを推奨]'
  }

  return evaluated
}
