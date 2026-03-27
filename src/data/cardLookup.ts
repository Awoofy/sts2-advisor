import cardDatabaseJson from './cardDatabase.json'
import { getCardTier, type CardTierEntry } from './cardTiers'

interface CardDbEntry {
  id: string
  name: string
  name_jp: string
  type: string
  rarity: string
  cost: number | null
  star_cost: number | null
  damage: number | null
  block: number | null
  hit_count: number | null
  target: string | null
  description: string
  keywords: string[]
  tags: string[]
}

type CardDatabase = Record<string, CardDbEntry[]>

const cardDatabase = cardDatabaseJson as CardDatabase

// Build lookup maps
const idToCard = new Map<string, { card: CardDbEntry; character: string }>()
const jpNameToId = new Map<string, string>()
const enNameToId = new Map<string, string>()

for (const [character, cards] of Object.entries(cardDatabase)) {
  for (const card of cards) {
    idToCard.set(card.id, { card, character })
    jpNameToId.set(card.name_jp, card.id)
    enNameToId.set(card.name.toLowerCase(), card.id)
  }
}

export interface CardEvaluation {
  id: string
  nameEn: string
  nameJp: string
  character: string
  tier: CardTierEntry | null
  tierLabel: string
  type: string
  rarity: string
}

export function lookupCard(cardId: string): CardEvaluation | null {
  const entry = idToCard.get(cardId)
  if (!entry) return null

  const tier = getCardTier(entry.card.name, entry.character)

  return {
    id: entry.card.id,
    nameEn: entry.card.name,
    nameJp: entry.card.name_jp,
    character: entry.character,
    tier,
    tierLabel: tier ? `${tier.tier}-tier` : 'Unrated',
    type: entry.card.type,
    rarity: entry.card.rarity,
  }
}

export function lookupCardByName(name: string): CardEvaluation | null {
  // Try exact JP name match
  const idFromJp = jpNameToId.get(name)
  if (idFromJp) return lookupCard(idFromJp)

  // Try exact EN name match
  const idFromEn = enNameToId.get(name.toLowerCase())
  if (idFromEn) return lookupCard(idFromEn)

  // Try fuzzy match (remove +/upgrade markers)
  const cleaned = name.replace(/\+$/, '').trim()
  const idFromCleanJp = jpNameToId.get(cleaned)
  if (idFromCleanJp) return lookupCard(idFromCleanJp)
  const idFromCleanEn = enNameToId.get(cleaned.toLowerCase())
  if (idFromCleanEn) return lookupCard(idFromCleanEn)

  return null
}

export function getCharacterCards(character: string): CardDbEntry[] {
  const charMap: Record<string, string> = {
    'アイアンクラッド': 'ironclad',
    'サイレント': 'silent',
    'ディフェクト': 'defect',
    'リージェント': 'regent',
    'ネクロバインダー': 'necrobinder',
  }
  const key = charMap[character] ?? character.toLowerCase()
  return cardDatabase[key] ?? []
}
