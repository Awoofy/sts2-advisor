import type { Card, Enemy, StatusEffect } from '../types/gameState'

// -- Interfaces --

export interface DamageEstimate {
  cardIndex: number
  cardName: string
  rawDamage: number
  effectiveDamage: number
  overkill: number
  killsTarget: boolean
  targetId: string
  hits: number
  totalRawDamage: number
}

export interface KillLine {
  enemyId: string
  enemyName: string
  currentHp: number
  block: number
  effectiveHp: number
  damageNeeded: number
  hasIntangible: boolean
}

export interface BlockEstimate {
  cardIndex: number
  cardName: string
  blockGained: number
}

// -- Status effect helpers --

export function getStatusAmount(status: StatusEffect[], id: string): number {
  const effect = status.find(
    (s) => s.id === id || s.name.toLowerCase() === id.toLowerCase(),
  )
  return effect?.amount ?? 0
}

export function hasStatus(status: StatusEffect[], id: string): boolean {
  return getStatusAmount(status, id) > 0
}

// -- Damage parsing (supports English and Japanese) --

function parseDamageFromDescription(description: string): number | null {
  // English: "Deal 6 damage"
  const enMatch = description.match(/Deal (\d+) damage/i)
  if (enMatch) return parseInt(enMatch[1], 10)

  // Japanese: "6ダメージを与える"
  const jpMatch = description.match(/(\d+)ダメージ/)
  if (jpMatch) return parseInt(jpMatch[1], 10)

  return null
}

function parseHitsFromDescription(description: string): number {
  // English: "Deal 5 damage 3 times"
  const enMatch = description.match(/(\d+)\s*times/i)
  if (enMatch) return parseInt(enMatch[1], 10)

  // Japanese: "3回行う" or "3回"
  const jpMatch = description.match(/(\d+)回/)
  if (jpMatch) return parseInt(jpMatch[1], 10)

  return 1
}

function parseBlockFromDescription(description: string): number | null {
  // English: "Gain 5 Block"
  const enMatch = description.match(/Gain (\d+) Block/i)
  if (enMatch) return parseInt(enMatch[1], 10)

  // Japanese: "5ブロックを得る"
  const jpMatch = description.match(/(\d+)ブロック/)
  if (jpMatch) return parseInt(jpMatch[1], 10)

  return null
}

// -- Core damage calculation (per hit) --
// Formula: floor((base + Strength + Vigor) * WeakMult * VulnMult * otherMults)

export function calculateSingleHitDamage(
  baseDamage: number,
  attackerStatus: StatusEffect[],
  defenderStatus: StatusEffect[],
): number {
  const strength = getStatusAmount(attackerStatus, 'strength')
  const vigor = getStatusAmount(attackerStatus, 'vigor')
  const isWeak = hasStatus(attackerStatus, 'weak')
  const isVulnerable = hasStatus(defenderStatus, 'vulnerable')

  let damage = baseDamage + strength + vigor

  // Multiplicative modifiers (applied after additives, each floor'd separately)
  if (isWeak) {
    damage = Math.floor(damage * 0.75)
  }
  if (isVulnerable) {
    damage = Math.floor(damage * 1.5)
  }

  return Math.max(0, damage)
}

// -- Card damage estimation --

export function estimateCardDamage(
  card: Card,
  playerStatus: StatusEffect[],
  enemy: Enemy,
): number {
  if (card.type !== 'Attack') return 0

  const baseDamage = parseDamageFromDescription(card.description)
  if (baseDamage == null) return 0

  return calculateSingleHitDamage(baseDamage, playerStatus, enemy.status)
}

export function estimateCardHits(card: Card): number {
  return parseHitsFromDescription(card.description)
}

export function estimateCardTotalDamage(
  card: Card,
  playerStatus: StatusEffect[],
  enemy: Enemy,
): number {
  const perHit = estimateCardDamage(card, playerStatus, enemy)
  const hits = estimateCardHits(card)
  return perHit * hits
}

// -- Block estimation --

export function estimateCardBlock(
  card: Card,
  playerStatus: StatusEffect[],
): number {
  const baseBlock = parseBlockFromDescription(card.description)
  if (baseBlock == null) return 0

  const dexterity = getStatusAmount(playerStatus, 'dexterity')
  return Math.max(0, baseBlock + dexterity)
}

// -- Kill lines --

export function calculateKillLines(enemies: Enemy[]): KillLine[] {
  return enemies.map((enemy) => {
    const intangible = hasStatus(enemy.status, 'intangible')
    const effectiveHp = enemy.hp + enemy.block
    return {
      enemyId: enemy.combat_id,
      enemyName: enemy.name,
      currentHp: enemy.hp,
      block: enemy.block,
      effectiveHp,
      damageNeeded: intangible ? Infinity : effectiveHp,
      hasIntangible: intangible,
    }
  })
}

// -- Hand damage estimates --

export function estimateHandDamage(
  hand: Card[],
  playerStatus: StatusEffect[],
  enemy: Enemy,
  energy: number,
): DamageEstimate[] {
  return hand
    .filter((card) => card.type === 'Attack' && card.can_play && card.cost <= energy)
    .map((card) => {
      const perHitDamage = estimateCardDamage(card, playerStatus, enemy)
      const hits = estimateCardHits(card)
      const totalRawDamage = perHitDamage * hits
      const afterBlock = Math.max(0, totalRawDamage - enemy.block)
      const killsTarget = afterBlock >= enemy.hp

      return {
        cardIndex: card.index,
        cardName: card.name,
        rawDamage: perHitDamage,
        effectiveDamage: afterBlock,
        overkill: killsTarget ? afterBlock - enemy.hp : 0,
        killsTarget,
        targetId: enemy.combat_id,
        hits,
        totalRawDamage,
      }
    })
}

// -- Hand block estimates --

export function estimateHandBlock(
  hand: Card[],
  playerStatus: StatusEffect[],
  energy: number,
): BlockEstimate[] {
  return hand
    .filter((card) => card.can_play && card.cost <= energy)
    .map((card) => ({
      cardIndex: card.index,
      cardName: card.name,
      blockGained: estimateCardBlock(card, playerStatus),
    }))
    .filter((est) => est.blockGained > 0)
}

// -- Incoming damage calculation --

export function calculateIncomingDamage(
  enemies: Enemy[],
  playerBlock: number,
  playerStatus: StatusEffect[],
): { totalDamage: number; afterBlock: number; perEnemy: { id: string; damage: number }[] } {
  const perEnemy: { id: string; damage: number }[] = []
  let totalDamage = 0

  for (const enemy of enemies) {
    let enemyDamage = 0
    for (const intent of enemy.intents) {
      if (intent.damage != null) {
        const hits = intent.hits ?? 1
        // Enemy damage also affected by player's Vulnerable/Weak on enemy
        const isPlayerVulnerable = hasStatus(playerStatus, 'vulnerable')
        const isEnemyWeak = hasStatus(enemy.status, 'weak')

        let perHit = intent.damage
        if (isEnemyWeak) perHit = Math.floor(perHit * 0.75)
        if (isPlayerVulnerable) perHit = Math.floor(perHit * 1.5)

        enemyDamage += perHit * hits
      }
    }
    perEnemy.push({ id: enemy.combat_id, damage: enemyDamage })
    totalDamage += enemyDamage
  }

  const afterBlock = Math.max(0, totalDamage - playerBlock)

  return { totalDamage, afterBlock, perEnemy }
}

// -- Poison tick calculation --

export function calculatePoisonDamage(enemy: Enemy): number {
  const poison = getStatusAmount(enemy.status, 'poison')
  // Poison deals damage equal to stacks, then decreases by 1 each turn
  // Total damage over time: poison + (poison-1) + ... + 1 = poison*(poison+1)/2
  return poison
}

export function calculatePoisonLethalTurns(enemy: Enemy): number | null {
  const poison = getStatusAmount(enemy.status, 'poison')
  if (poison <= 0) return null

  let hp = enemy.hp
  let currentPoison = poison
  let turns = 0

  while (hp > 0 && currentPoison > 0) {
    turns++
    hp -= currentPoison
    currentPoison--
  }

  return hp <= 0 ? turns : null
}

// -- Card effect analysis (for richer recommendations) --

export interface CardEffects {
  damage: number | null
  block: number | null
  appliesVulnerable: number
  appliesWeak: number
  appliesPoison: number
  appliesStrength: number
  drawCards: number
  isAoe: boolean
  exhausts: boolean
  hasScaling: boolean
}

export function analyzeCardEffects(card: Card): CardEffects {
  const desc = card.description.toLowerCase()

  const dmgMatch = desc.match(/(\d+)(?:ダメージ|damage)/i)
  const blkMatch = desc.match(/(\d+)(?:ブロック|block)/i)

  // Debuff application
  const vulnMatch = desc.match(/(?:脆弱|vulnerable)\s*(\d+)/i) ?? desc.match(/(\d+)\s*(?:脆弱|vulnerable)/i)
  const weakMatch = desc.match(/(?:弱体|weak)\s*(\d+)/i) ?? desc.match(/(\d+)\s*(?:弱体|weak)/i)
  const poisonMatch = desc.match(/(?:毒|poison)\s*(\d+)/i) ?? desc.match(/(\d+)\s*(?:毒|poison)/i)
  const strMatch = desc.match(/(?:筋力|strength)\s*(\d+)/i) ?? desc.match(/(\d+)\s*(?:筋力|strength)/i)

  const drawMatch = desc.match(/(?:カードを|draw\s+)(\d+)/i) ?? desc.match(/(\d+)(?:枚.*?引く|cards?)/i)

  const isAoe = card.target_type === 'all' || desc.includes('all') || desc.includes('全体') || desc.includes('全ての')
  const exhausts = card.keywords.some((k) => k.toLowerCase() === 'exhaust' || k === '排気' || k === '廃棄')
  const hasScaling = (strMatch != null && parseInt(strMatch[1], 10) > 0) ||
    desc.includes('demon form') || desc.includes('デーモンフォーム') ||
    desc.includes('noxious fumes') || card.type === 'Power'

  return {
    damage: dmgMatch ? parseInt(dmgMatch[1], 10) : null,
    block: blkMatch ? parseInt(blkMatch[1], 10) : null,
    appliesVulnerable: vulnMatch ? parseInt(vulnMatch[1], 10) : 0,
    appliesWeak: weakMatch ? parseInt(weakMatch[1], 10) : 0,
    appliesPoison: poisonMatch ? parseInt(poisonMatch[1], 10) : 0,
    appliesStrength: strMatch ? parseInt(strMatch[1], 10) : 0,
    drawCards: drawMatch ? parseInt(drawMatch[1], 10) : 0,
    isAoe,
    exhausts,
    hasScaling,
  }
}

export function describeCardEffects(card: Card): string {
  const fx = analyzeCardEffects(card)
  const parts: string[] = []

  if (fx.damage != null) parts.push(`${fx.damage}DMG`)
  if (fx.block != null) parts.push(`${fx.block}Block`)
  if (fx.appliesVulnerable > 0) parts.push(`脆弱${fx.appliesVulnerable}`)
  if (fx.appliesWeak > 0) parts.push(`弱体${fx.appliesWeak}`)
  if (fx.appliesPoison > 0) parts.push(`毒${fx.appliesPoison}`)
  if (fx.appliesStrength > 0) parts.push(`筋力+${fx.appliesStrength}`)
  if (fx.drawCards > 0) parts.push(`+${fx.drawCards}ドロー`)
  if (fx.isAoe) parts.push('全体')
  if (fx.hasScaling) parts.push('Scaling')

  return parts.join(', ')
}
