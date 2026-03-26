export type StateType =
  | 'monster'
  | 'elite'
  | 'boss'
  | 'hand_select'
  | 'map'
  | 'card_reward'
  | 'combat_rewards'
  | 'card_select'
  | 'relic_select'
  | 'shop'
  | 'rest_site'
  | 'event'
  | 'treasure'
  | 'overlay'
  | 'menu'

export interface StatusEffect {
  id: string
  name: string
  description: string
  amount: number
}

export interface Card {
  index: number
  id: string
  name: string
  type: string
  cost: number
  star_cost?: number
  description: string
  target_type: string
  can_play: boolean
  unplayable_reason?: string
  is_upgraded: boolean
  rarity: string
  keywords: string[]
}

export interface Enemy {
  entity_id: string
  combat_id: string
  name: string
  hp: number
  max_hp: number
  block: number
  status: StatusEffect[]
  intents: Intent[]
}

export interface Intent {
  type: string
  label: string
  title: string
  description: string
  damage?: number
  hits?: number
}

export interface Relic {
  id: string
  name: string
  description: string
  counter?: number
  keywords: string[]
}

export interface Potion {
  id: string
  name: string
  description: string
  slot: number
  can_use_in_combat: boolean
  target_type: string
  keywords: string[]
}

export interface Orb {
  id: string
  name: string
  description: string
  passive_val: number
  evoke_val: number
  keywords: string[]
}

export interface MapNode {
  col: number
  row: number
  type: string
  children: { col: number; row: number }[]
}

export interface MapNextOption {
  index: number
  col: number
  row: number
  type: string
}

export interface ShopItem {
  index: number
  category: string
  cost: number
  is_stocked: boolean
  can_afford: boolean
  on_sale: boolean
  id?: string
  name?: string
  description?: string
}

export interface EventOption {
  index: number
  label: string
  description?: string
  is_locked: boolean
  is_chosen: boolean
}

export interface CardReward {
  index: number
  id: string
  name: string
  type: string
  cost: number
  description: string
  rarity: string
  is_upgraded: boolean
}

export interface CombatReward {
  index: number
  type: string
  label: string
  gold?: number
  relic?: Relic
  potion?: Potion
}

export interface RestOption {
  index: number
  label: string
  description: string
}

export interface GameState {
  state_type: StateType

  // Player
  character?: string
  hp?: number
  max_hp?: number
  block?: number
  energy?: number
  max_energy?: number
  stars?: number
  gold?: number
  act?: number
  floor?: number
  ascension?: number

  // Combat
  hand?: Card[]
  draw_pile?: Card[]
  discard_pile?: Card[]
  exhaust_pile?: Card[]
  draw_pile_count?: number
  discard_pile_count?: number
  exhaust_pile_count?: number
  enemies?: Enemy[]
  round?: number
  turn?: string
  is_play_phase?: boolean
  status?: StatusEffect[]

  // Orbs (Defect)
  orbs?: Orb[]
  orb_slots?: number
  orb_empty_slots?: number

  // Relics & Potions
  relics?: Relic[]
  potions?: Potion[]

  // Map
  current_position?: { col: number; row: number; type: string }
  next_options?: MapNextOption[]
  nodes?: MapNode[]
  boss?: MapNode
  visited?: { col: number; row: number }[]

  // Rewards
  combat_rewards?: CombatReward[]
  card_rewards?: CardReward[]

  // Shop
  shop_items?: ShopItem[]

  // Event
  event_id?: string
  event_name?: string
  is_ancient?: boolean
  in_dialogue?: boolean
  body?: string
  event_options?: EventOption[]

  // Rest
  rest_options?: RestOption[]
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting'
