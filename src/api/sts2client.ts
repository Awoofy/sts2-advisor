import type { GameState, Card, Enemy, Intent, StatusEffect, Relic, Potion } from '../types/gameState'

const BASE_URL = 'http://localhost:15526'

// -- Raw API types (actual STS2MCP response structure) --

interface RawKeyword {
  name: string
  description: string
}

interface RawCard {
  index: number
  id: string
  name: string
  type: string
  cost: string | number
  star_cost: number | null
  description: string
  target_type: string
  can_play: boolean
  unplayable_reason: string | null
  is_upgraded: boolean
  keywords: RawKeyword[]
}

interface RawIntent {
  type: string
  label: string
  title: string
  description: string
}

interface RawEnemy {
  entity_id: string
  combat_id: number | string
  name: string
  hp: number
  max_hp: number
  block: number
  status: RawStatusEffect[]
  intents: RawIntent[]
}

interface RawStatusEffect {
  id?: string
  name: string
  description: string
  amount?: number
}

interface RawRelic {
  id: string
  name: string
  description: string
  counter: number | null
  keywords: RawKeyword[]
}

interface RawPotion {
  id: string
  name: string
  description: string
  slot: number
  can_use_in_combat?: boolean
  target_type: string
  keywords: RawKeyword[]
}

interface RawPileCard {
  name: string
  description: string
  id?: string
  type?: string
  cost?: string | number
}

interface RawPlayer {
  character: string
  hp: number
  max_hp: number
  block: number
  energy: number
  max_energy: number
  stars?: number
  gold: number
  hand: RawCard[]
  draw_pile_count: number
  discard_pile_count: number
  exhaust_pile_count: number
  draw_pile: RawPileCard[]
  discard_pile: RawPileCard[]
  exhaust_pile: RawPileCard[]
  status: RawStatusEffect[]
  relics: RawRelic[]
  potions: RawPotion[]
  orbs?: unknown[]
  orb_slots?: number
  orb_empty_slots?: number
}

interface RawBattle {
  round: number
  turn: string
  is_play_phase: boolean
  player: RawPlayer
  enemies: RawEnemy[]
}

interface RawRun {
  act: number
  floor: number
  ascension: number
}

interface RawApiResponse {
  state_type: string
  battle?: RawBattle
  run?: RawRun
  // Non-combat states may have different structures
  map?: unknown
  shop?: unknown
  event?: unknown
  rest?: unknown
  rewards?: unknown
  card_rewards?: unknown[]
  [key: string]: unknown
}

// -- Transformers --

function parseIntFromString(val: string | number | undefined | null): number {
  if (val == null) return 0
  if (typeof val === 'number') return val
  const parsed = parseInt(val, 10)
  return isNaN(parsed) ? 0 : parsed
}

function parseDamageFromIntentDesc(description: string): { damage: number; hits: number } | null {
  // Japanese: "6ダメージのアタックを1回行う。"
  // English: "Deals 6 damage." or "Deals 5 damage 3 times."
  const jpMatch = description.match(/(\d+)ダメージ.*?(\d+)回/)
  if (jpMatch) {
    return { damage: parseInt(jpMatch[1], 10), hits: parseInt(jpMatch[2], 10) }
  }

  const jpSimple = description.match(/(\d+)ダメージ/)
  if (jpSimple) {
    return { damage: parseInt(jpSimple[1], 10), hits: 1 }
  }

  const enMatch = description.match(/(\d+)\s*damage.*?(\d+)\s*times/i)
  if (enMatch) {
    return { damage: parseInt(enMatch[1], 10), hits: parseInt(enMatch[2], 10) }
  }

  const enSimple = description.match(/(?:Deal|Deals)\s+(\d+)\s+damage/i)
  if (enSimple) {
    return { damage: parseInt(enSimple[1], 10), hits: 1 }
  }

  // Try label as damage number
  const labelNum = description.length === 0 ? null : null
  return labelNum
}

function transformCard(raw: RawCard): Card {
  return {
    index: raw.index,
    id: raw.id,
    name: raw.name,
    type: raw.type,
    cost: parseIntFromString(raw.cost),
    star_cost: raw.star_cost ?? undefined,
    description: raw.description,
    target_type: raw.target_type,
    can_play: raw.can_play,
    unplayable_reason: raw.unplayable_reason ?? undefined,
    is_upgraded: raw.is_upgraded,
    rarity: 'Common', // Not provided by API, default
    keywords: raw.keywords.map((k) => k.name),
  }
}

function transformIntent(raw: RawIntent): Intent {
  const parsed = parseDamageFromIntentDesc(raw.description)

  // Also try to parse damage from label (often just the number)
  let damage = parsed?.damage
  let hits = parsed?.hits ?? 1
  if (damage == null && raw.label) {
    const labelMatch = raw.label.match(/^(\d+)$/)
    if (labelMatch) {
      damage = parseInt(labelMatch[1], 10)
    }
    // "6x3" format
    const multiMatch = raw.label.match(/(\d+)\s*x\s*(\d+)/)
    if (multiMatch) {
      damage = parseInt(multiMatch[1], 10)
      hits = parseInt(multiMatch[2], 10)
    }
  }

  return {
    type: raw.type.toLowerCase(),
    label: raw.label,
    title: raw.title,
    description: raw.description,
    damage,
    hits,
  }
}

function transformEnemy(raw: RawEnemy): Enemy {
  return {
    entity_id: raw.entity_id,
    combat_id: String(raw.combat_id),
    name: raw.name,
    hp: raw.hp,
    max_hp: raw.max_hp,
    block: raw.block,
    status: raw.status.map(transformStatusEffect),
    intents: raw.intents.map(transformIntent),
  }
}

function transformStatusEffect(raw: RawStatusEffect): StatusEffect {
  return {
    id: raw.id ?? raw.name.toLowerCase(),
    name: raw.name,
    description: raw.description,
    amount: raw.amount ?? 0,
  }
}

function transformRelic(raw: RawRelic): Relic {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    counter: raw.counter ?? undefined,
    keywords: raw.keywords.map((k) => k.name),
  }
}

function transformPotion(raw: RawPotion): Potion {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    slot: raw.slot,
    can_use_in_combat: raw.can_use_in_combat ?? true,
    target_type: raw.target_type,
    keywords: raw.keywords.map((k) => k.name),
  }
}

function transformResponse(raw: RawApiResponse): GameState {
  const state: GameState = {
    state_type: raw.state_type as GameState['state_type'],
  }

  // Run info
  if (raw.run) {
    state.act = raw.run.act
    state.floor = raw.run.floor
    state.ascension = raw.run.ascension
  }

  // Battle state
  if (raw.battle) {
    const b = raw.battle
    const p = b.player

    // Player stats
    state.character = p.character
    state.hp = p.hp
    state.max_hp = p.max_hp
    state.block = p.block
    state.energy = p.energy
    state.max_energy = p.max_energy
    state.stars = p.stars
    state.gold = p.gold

    // Hand & piles
    state.hand = p.hand.map(transformCard)
    state.draw_pile_count = p.draw_pile_count
    state.discard_pile_count = p.discard_pile_count
    state.exhaust_pile_count = p.exhaust_pile_count

    // Player status
    state.status = p.status.map(transformStatusEffect)

    // Relics & Potions
    state.relics = p.relics.map(transformRelic)
    state.potions = p.potions.map(transformPotion)

    // Combat info
    state.round = b.round
    state.turn = b.turn
    state.is_play_phase = b.is_play_phase

    // Enemies
    state.enemies = b.enemies.map(transformEnemy)
  }

  return state
}

// -- Public API --

export async function fetchGameState(): Promise<GameState> {
  const res = await fetch(`${BASE_URL}/api/v1/singleplayer?format=json`)
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }
  const raw: RawApiResponse = await res.json()
  return transformResponse(raw)
}

export interface ActionPayload {
  action: string
  card_index?: number
  target?: string
  index?: number
  slot?: number
}

export async function sendAction(payload: ActionPayload): Promise<unknown> {
  const res = await fetch(`${BASE_URL}/api/v1/singleplayer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(`Action error: ${res.status}`)
  }
  return res.json()
}
