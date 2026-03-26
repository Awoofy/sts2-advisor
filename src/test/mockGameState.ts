import type { GameState, Card, Enemy } from '../types/gameState'

// -- Helpers --

function makeCard(overrides: Partial<Card> & { index: number; name: string }): Card {
  return {
    id: overrides.name.toLowerCase().replace(/\s+/g, '_'),
    type: 'Attack',
    cost: 1,
    description: '',
    target_type: 'single',
    can_play: true,
    is_upgraded: false,
    rarity: 'Common',
    keywords: [],
    ...overrides,
  }
}

function makeEnemy(overrides: Partial<Enemy> & { entity_id: string; name: string }): Enemy {
  return {
    combat_id: overrides.entity_id,
    hp: 40,
    max_hp: 40,
    block: 0,
    status: [],
    intents: [],
    ...overrides,
  }
}

// -- Mock: 戦闘中（中盤、Ironclad vs Jaw Worm + Cultist） --

export const mockCombatState: GameState = {
  state_type: 'monster',
  character: 'Ironclad',
  hp: 55,
  max_hp: 80,
  block: 0,
  energy: 3,
  max_energy: 3,
  gold: 120,
  act: 1,
  floor: 6,
  ascension: 5,
  round: 2,
  turn: 'player',
  is_play_phase: true,
  status: [
    { id: 'strength', name: 'Strength', description: 'Increases attack damage by 2', amount: 2 },
  ],
  hand: [
    makeCard({ index: 0, name: 'Strike', type: 'Attack', cost: 1, description: 'Deal 6 damage.' }),
    makeCard({ index: 1, name: 'Strike', type: 'Attack', cost: 1, description: 'Deal 6 damage.' }),
    makeCard({ index: 2, name: 'Defend', type: 'Skill', cost: 1, description: 'Gain 5 Block.', target_type: 'none' }),
    makeCard({ index: 3, name: 'Bash', type: 'Attack', cost: 2, description: 'Deal 8 damage. Apply 2 Vulnerable.', keywords: ['Vulnerable'] }),
    makeCard({ index: 4, name: 'Cleave', type: 'Attack', cost: 1, description: 'Deal 8 damage to ALL enemies.', target_type: 'all' }),
  ],
  enemies: [
    makeEnemy({
      entity_id: 'JAW_WORM_0',
      name: 'Jaw Worm',
      hp: 28,
      max_hp: 44,
      block: 5,
      intents: [
        { type: 'attack', label: 'Chomp', title: 'Chomp', description: 'Deals 11 damage.', damage: 11, hits: 1 },
      ],
    }),
    makeEnemy({
      entity_id: 'CULTIST_0',
      name: 'Cultist',
      hp: 15,
      max_hp: 50,
      block: 0,
      intents: [
        { type: 'buff', label: 'Incantation', title: 'Incantation', description: 'Gains 3 Ritual.' },
      ],
    }),
  ],
  draw_pile_count: 12,
  discard_pile_count: 3,
  exhaust_pile_count: 0,
  relics: [
    { id: 'burning_blood', name: 'Burning Blood', description: 'At the end of combat, heal 6 HP.', keywords: [] },
    { id: 'vajra', name: 'Vajra', description: 'At the start of each combat, gain 1 Strength.', counter: 0, keywords: [] },
  ],
  potions: [
    { id: 'fire_potion', name: 'Fire Potion', description: 'Deal 20 damage to a target enemy.', slot: 0, can_use_in_combat: true, target_type: 'single', keywords: [] },
  ],
}

// -- Mock: 戦闘中（ボス戦、Silent vs Boss） --

export const mockBossCombat: GameState = {
  state_type: 'boss',
  character: 'Silent',
  hp: 30,
  max_hp: 70,
  block: 8,
  energy: 3,
  max_energy: 3,
  gold: 250,
  act: 1,
  floor: 17,
  ascension: 10,
  round: 5,
  turn: 'player',
  is_play_phase: true,
  status: [
    { id: 'dexterity', name: 'Dexterity', description: 'Increases block gained from cards by 3', amount: 3 },
  ],
  hand: [
    makeCard({ index: 0, name: 'Neutralize', type: 'Attack', cost: 0, description: 'Deal 3 damage. Apply 1 Weak.', keywords: ['Weak'] }),
    makeCard({ index: 1, name: 'Blade Dance', type: 'Skill', cost: 1, description: 'Add 3 Shivs to your hand.', target_type: 'none' }),
    makeCard({ index: 2, name: 'Backflip', type: 'Skill', cost: 1, description: 'Gain 5 Block. Draw 2 cards.', target_type: 'none' }),
    makeCard({ index: 3, name: 'Dash', type: 'Attack', cost: 2, description: 'Deal 10 damage. Gain 10 Block.' }),
    makeCard({ index: 4, name: 'Deadly Poison', type: 'Skill', cost: 1, description: 'Apply 5 Poison.', target_type: 'single', keywords: ['Poison'] }),
  ],
  enemies: [
    makeEnemy({
      entity_id: 'GUARDIAN_0',
      name: 'The Guardian',
      hp: 180,
      max_hp: 240,
      block: 0,
      status: [
        { id: 'mode_shift', name: 'Mode Shift', description: 'When this takes 30 damage, enters Defensive Mode.', amount: 30 },
      ],
      intents: [
        { type: 'attack', label: 'Fierce Bash', title: 'Fierce Bash', description: 'Deals 32 damage.', damage: 32, hits: 1 },
      ],
    }),
  ],
  draw_pile_count: 18,
  discard_pile_count: 7,
  exhaust_pile_count: 2,
  relics: [
    { id: 'ring_of_snake', name: 'Ring of the Snake', description: 'At the start of each combat, draw 2 additional cards.', keywords: [] },
    { id: 'kunai', name: 'Kunai', description: 'Every time you play 3 Attacks in a single turn, gain 1 Dexterity.', keywords: [] },
    { id: 'after_image', name: 'After Image', description: 'Whenever you play a card, gain 1 Block.', keywords: [] },
  ],
  potions: [
    { id: 'weak_potion', name: 'Weak Potion', description: 'Apply 3 Weak to an enemy.', slot: 0, can_use_in_combat: true, target_type: 'single', keywords: [] },
    { id: 'block_potion', name: 'Block Potion', description: 'Gain 12 Block.', slot: 1, can_use_in_combat: true, target_type: 'none', keywords: [] },
  ],
}

// -- Mock: マップ画面 --

export const mockMapState: GameState = {
  state_type: 'map',
  character: 'Ironclad',
  hp: 55,
  max_hp: 80,
  block: 0,
  energy: 3,
  max_energy: 3,
  gold: 120,
  act: 1,
  floor: 6,
  ascension: 5,
  current_position: { col: 2, row: 5, type: 'monster' },
  next_options: [
    { index: 0, col: 1, row: 6, type: 'event' },
    { index: 1, col: 2, row: 6, type: 'elite' },
    { index: 2, col: 3, row: 6, type: 'rest' },
  ],
  relics: [
    { id: 'burning_blood', name: 'Burning Blood', description: 'At the end of combat, heal 6 HP.', keywords: [] },
  ],
  potions: [],
}

// -- Mock: カード報酬 --

export const mockCardRewardState: GameState = {
  state_type: 'card_reward',
  character: 'Ironclad',
  hp: 50,
  max_hp: 80,
  block: 0,
  energy: 3,
  max_energy: 3,
  gold: 140,
  act: 1,
  floor: 7,
  ascension: 5,
  card_rewards: [
    { index: 0, id: 'carnage', name: 'Carnage', type: 'Attack', cost: 2, description: 'Ethereal. Deal 20 damage.', rarity: 'Uncommon', is_upgraded: false },
    { index: 1, id: 'shrug_it_off', name: 'Shrug It Off', type: 'Skill', cost: 1, description: 'Gain 8 Block. Draw 1 card.', rarity: 'Common', is_upgraded: false },
    { index: 2, id: 'demon_form', name: 'Demon Form', type: 'Power', cost: 3, description: 'At the start of your turn, gain 2 Strength.', rarity: 'Rare', is_upgraded: false },
  ],
  draw_pile_count: 15,
  discard_pile_count: 0,
  exhaust_pile_count: 0,
  relics: [],
  potions: [],
}

// -- Mock: 休憩所 --

export const mockRestState: GameState = {
  state_type: 'rest_site',
  character: 'Ironclad',
  hp: 35,
  max_hp: 80,
  block: 0,
  energy: 3,
  max_energy: 3,
  gold: 160,
  act: 1,
  floor: 10,
  ascension: 5,
  rest_options: [
    { index: 0, label: 'Rest', description: 'Heal for 30% of your Max HP.' },
    { index: 1, label: 'Smith', description: 'Upgrade a card.' },
  ],
  relics: [],
  potions: [],
}

// -- Mock: ショップ --

export const mockShopState: GameState = {
  state_type: 'shop',
  character: 'Ironclad',
  hp: 60,
  max_hp: 80,
  block: 0,
  energy: 3,
  max_energy: 3,
  gold: 300,
  act: 2,
  floor: 12,
  ascension: 5,
  shop_items: [
    { index: 0, category: 'card', cost: 75, is_stocked: true, can_afford: true, on_sale: false, id: 'immolate', name: 'Immolate', description: 'Deal 21 damage to ALL enemies. Add a Burn to your discard pile.' },
    { index: 1, category: 'card', cost: 50, is_stocked: true, can_afford: true, on_sale: true, id: 'headbutt', name: 'Headbutt', description: 'Deal 9 damage. Put a card from your discard pile on top of your draw pile.' },
    { index: 2, category: 'relic', cost: 150, is_stocked: true, can_afford: true, on_sale: false, id: 'meat_on_bone', name: 'Meat on the Bone', description: 'If your HP is at or below 50% at the end of combat, heal 12 HP.' },
    { index: 3, category: 'potion', cost: 50, is_stocked: true, can_afford: true, on_sale: false, id: 'strength_potion', name: 'Strength Potion', description: 'Gain 2 Strength.' },
    { index: 4, category: 'removal', cost: 75, is_stocked: true, can_afford: true, on_sale: false, name: 'Card Removal' },
  ],
  relics: [],
  potions: [],
}

// -- Mock: メニュー --

export const mockMenuState: GameState = {
  state_type: 'menu',
}

// -- Mock: 敵が Vulnerable 状態 --

export const mockVulnerableCombat: GameState = {
  ...mockCombatState,
  enemies: [
    makeEnemy({
      entity_id: 'JAW_WORM_0',
      name: 'Jaw Worm',
      hp: 20,
      max_hp: 44,
      block: 0,
      status: [
        { id: 'vulnerable', name: 'Vulnerable', description: 'Takes 50% more damage.', amount: 2 },
      ],
      intents: [
        { type: 'attack', label: 'Chomp', title: 'Chomp', description: 'Deals 11 damage.', damage: 11, hits: 1 },
      ],
    }),
  ],
}
