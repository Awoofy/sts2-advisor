import type { Card, GameState } from '../types/gameState'

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
  }
}

// -- Card pick advisor with archetype context --

export interface ContextualCardAdvice {
  index: number
  name: string
  archetypeFit: number
  reasoning: string
}

export function adviseCardPickWithContext(
  state: GameState,
  deckAnalysis: DeckAnalysis,
): ContextualCardAdvice[] | null {
  const rewards = state.card_rewards
  if (!rewards || rewards.length === 0) return null

  const primary = deckAnalysis.primaryArchetype

  return rewards.map((card) => {
    let archetypeFit = 0
    let reasoning = ''

    if (primary) {
      // Check if this card fits the primary archetype
      const fakeCard: Card = {
        index: card.index,
        id: card.id,
        name: card.name,
        type: card.type,
        cost: card.cost,
        description: card.description,
        target_type: 'single',
        can_play: true,
        is_upgraded: card.is_upgraded,
        rarity: card.rarity,
        keywords: [],
      }
      archetypeFit = scoreCardForArchetype(fakeCard, primary.archetype)

      if (archetypeFit > 0) {
        reasoning = `${primary.label} シナジー (適合度: ${archetypeFit})`
      } else {
        reasoning = `${primary.label} と無関係`
      }
    }

    // Rarity bonus
    if (card.rarity === 'Rare') {
      reasoning = 'レア! ' + reasoning
    }
    if (card.is_upgraded) {
      reasoning = 'UG済み! ' + reasoning
    }

    // Deck size penalty
    if (deckAnalysis.deckQuality === 'bloated' && archetypeFit === 0) {
      reasoning += ' (デッキ肥大 → スキップ推奨)'
    }

    return {
      index: card.index,
      name: card.name,
      archetypeFit,
      reasoning: reasoning || card.rarity,
    }
  }).sort((a, b) => b.archetypeFit - a.archetypeFit)
}
