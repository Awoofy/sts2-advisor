import type { GameState, CardReward } from '../types/gameState'

export interface MapAdvice {
  recommendedIndex: number
  reason: string
  options: { index: number; type: string; reasoning: string }[]
}

export interface CardPickAdvice {
  recommendedIndex: number | null
  reason: string
  cards: { index: number; name: string; reasoning: string }[]
  shouldSkip: boolean
}

export interface RestAdvice {
  recommendedIndex: number
  reason: string
}

export interface ShopAdvice {
  recommendations: { index: number; name: string; reasoning: string; priority: number }[]
}

const nodeTypePriority: Record<string, number> = {
  elite: 4,
  event: 3,
  monster: 2,
  shop: 2,
  rest: 1,
  treasure: 5,
}

export function adviseMap(
  state: GameState,
): MapAdvice | null {
  const options = state.next_options
  if (!options || options.length === 0) return null

  const hpRatio = (state.hp ?? 1) / (state.max_hp ?? 1)

  const scored = options.map((opt) => {
    let score = nodeTypePriority[opt.type] ?? 2

    // Avoid elites at low HP
    if (opt.type === 'elite' && hpRatio < 0.7) score -= 3
    // Prefer rest at low HP
    if (opt.type === 'rest' && hpRatio < 0.4) score += 3
    // Prefer shop if we have gold
    if (opt.type === 'shop' && (state.gold ?? 0) >= 100) score += 1

    const reasoning = getNodeReasoning(opt.type, hpRatio, state.gold ?? 0)

    return { ...opt, score, reasoning }
  })

  scored.sort((a, b) => b.score - a.score)

  return {
    recommendedIndex: scored[0].index,
    reason: scored[0].reasoning,
    options: scored.map((o) => ({
      index: o.index,
      type: o.type,
      reasoning: o.reasoning,
    })),
  }
}

function getNodeReasoning(type: string, hpRatio: number, gold: number): string {
  switch (type) {
    case 'elite':
      return hpRatio >= 0.7
        ? 'エリート: HP十分、レリック狙い'
        : 'エリート: HP低め、リスクあり'
    case 'rest':
      return hpRatio < 0.5 ? '休憩: HP回復推奨' : '休憩: アップグレード可能'
    case 'event':
      return 'イベント: ランダムだが報酬の可能性あり'
    case 'shop':
      return gold >= 100 ? 'ショップ: 所持金十分' : 'ショップ: 所持金少なめ'
    case 'monster':
      return '通常戦闘: カード報酬と金貨'
    case 'treasure':
      return 'お宝: レリック確定!'
    default:
      return type
  }
}

export function adviseCardPick(
  cardRewards: CardReward[] | undefined,
  state: GameState,
): CardPickAdvice | null {
  if (!cardRewards || cardRewards.length === 0) return null

  const rarityScore: Record<string, number> = {
    Rare: 3,
    Uncommon: 2,
    Common: 1,
  }

  const scored = cardRewards.map((card) => {
    let score = rarityScore[card.rarity] ?? 1
    if (card.is_upgraded) score += 0.5

    const reasoning =
      card.rarity === 'Rare'
        ? 'レア: 高い確率で強力'
        : card.is_upgraded
          ? 'アップグレード済み: 即戦力'
          : `${card.rarity}: ${card.type}`

    return { ...card, score, reasoning }
  })

  scored.sort((a, b) => b.score - a.score)

  const deckSize = (state.draw_pile_count ?? 0) + (state.discard_pile_count ?? 0) + (state.hand?.length ?? 0)
  const shouldSkip = deckSize > 25 && scored[0].score <= 1

  return {
    recommendedIndex: shouldSkip ? null : scored[0].index,
    reason: shouldSkip
      ? 'デッキが大きめ。弱いカードはスキップ推奨'
      : `${scored[0].name} がおすすめ: ${scored[0].reasoning}`,
    cards: scored.map((c) => ({
      index: c.index,
      name: c.name,
      reasoning: c.reasoning,
    })),
    shouldSkip,
  }
}

export function adviseRest(state: GameState): RestAdvice | null {
  const options = state.rest_options
  if (!options || options.length === 0) return null

  const hpRatio = (state.hp ?? 1) / (state.max_hp ?? 1)

  if (hpRatio < 0.5) {
    const restIdx = options.findIndex(
      (o) => o.label.toLowerCase().includes('rest') || o.label.includes('回復'),
    )
    if (restIdx >= 0) {
      return {
        recommendedIndex: options[restIdx].index,
        reason: `HP ${Math.round(hpRatio * 100)}%: 回復推奨`,
      }
    }
  }

  const smithIdx = options.findIndex(
    (o) => o.label.toLowerCase().includes('smith') || o.label.includes('鍛冶'),
  )
  if (smithIdx >= 0) {
    return {
      recommendedIndex: options[smithIdx].index,
      reason: `HP ${Math.round(hpRatio * 100)}%: アップグレード推奨`,
    }
  }

  return {
    recommendedIndex: options[0].index,
    reason: options[0].label,
  }
}

export function adviseShop(state: GameState): ShopAdvice | null {
  const items = state.shop_items
  if (!items || items.length === 0) return null

  const affordable = items.filter((item) => item.can_afford && item.is_stocked)

  const recommendations = affordable
    .map((item) => {
      let priority = 1
      let reasoning = ''

      if (item.on_sale) {
        priority += 2
        reasoning = 'セール中!'
      }
      if (item.category === 'relic') {
        priority += 2
        reasoning += ' レリック: 永続効果'
      }
      if (item.category === 'card' && item.name) {
        priority += 1
        reasoning += ` カード: ${item.name}`
      }
      if (item.category === 'removal') {
        priority += 1
        reasoning += ' カード除去: デッキ圧縮'
      }

      return {
        index: item.index,
        name: item.name ?? item.category,
        reasoning: reasoning.trim() || item.category,
        priority,
      }
    })
    .sort((a, b) => b.priority - a.priority)

  return { recommendations }
}
