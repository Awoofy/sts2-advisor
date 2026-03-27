// Card tier data from Mobalytics (March 2026)
// S=5, A=4, B=3, C=2, D=1

export type TierRating = 'S' | 'A' | 'B' | 'C' | 'D'

export interface CardTierEntry {
  tier: TierRating
  score: number
}

const tierScores: Record<TierRating, number> = { S: 5, A: 4, B: 3, C: 2, D: 1 }

function t(tier: TierRating): CardTierEntry {
  return { tier, score: tierScores[tier] }
}

// Card name (English, lowercase) -> tier
// Names are normalized to lowercase for matching

const ironclad: Record<string, CardTierEntry> = {
  'expect a fight': t('S'), 'offering': t('S'), 'battle trance': t('S'),
  'bloodletting': t('S'), 'headbutt': t('S'), 'unmovable': t('S'), 'feed': t('S'),
  'pommel strike': t('A'), 'burning pact': t('A'), 'colossus': t('A'),
  'inferno': t('A'), 'rupture': t('A'), 'brand': t('A'), 'taunt': t('A'),
  'impervious': t('A'), 'flame barrier': t('A'), 'feel no pain': t('A'),
  'dark embrace': t('A'), 'pyre': t('A'), 'barricade': t('A'), 'thrash': t('A'),
  'stoke': t('A'), 'spite': t('A'), 'pillage': t('A'), 'evil eye': t('A'),
  'second wind': t('A'), 'crimson mantle': t('A'), 'vicious': t('A'),
  'aggression': t('A'), 'primal force': t('A'),
  'breakthrough': t('B'), 'hemokinesis': t('B'), 'shrug it off': t('B'),
  'whirlwind': t('B'), 'dismantle': t('B'), 'blood wall': t('B'),
  'molten fist': t('B'), 'true grit': t('B'), 'stomp': t('B'),
  'bludgeon': t('B'), 'perfected strike': t('B'), 'infernal blade': t('B'),
  'juggling': t('B'),
  'body slam': t('C'), 'dominate': t('C'), 'forgotten ritual': t('C'),
  'howl from beyond': t('C'), "pact's end": t('C'), 'uppercut': t('C'),
  'twin strike': t('C'), 'setup strike': t('C'), 'thunderclap': t('C'),
  'sword boomerang': t('C'), 'bully': t('C'), 'inflame': t('C'),
  'hellraiser': t('C'), 'tear asunder': t('C'), 'fiend fire': t('C'),
  'ashen strike': t('C'), 'drum of battle': t('C'), 'stampede': t('C'),
  'cruelty': t('C'), 'one-two punch': t('C'), 'juggernaut': t('C'),
  'demon form': t('C'), 'fight me!': t('C'), 'conflagration': t('C'),
  'unrelenting': t('C'), 'anger': t('C'), 'armaments': t('C'),
  'cinder': t('C'), 'rampage': t('C'), 'grapple': t('C'),
  'cascade': t('D'), 'mangle': t('D'), 'rage': t('D'), 'iron wave': t('D'),
  'stone armor': t('D'), 'tremble': t('D'), 'havoc': t('D'),
}

const silent: Record<string, CardTierEntry> = {
  'adrenaline': t('S'), 'well-laid plans': t('S'), 'calculated gamble': t('S'),
  'acrobatics': t('S'), 'prepared': t('S'), 'reflex': t('S'),
  'tactician': t('S'), 'untouchable': t('S'), 'piercing wail': t('S'),
  'tools of the trade': t('S'), 'the hunt': t('S'),
  'afterimage': t('A'), 'tracking': t('A'), 'expose': t('A'),
  'shadowmeld': t('A'), 'blur': t('A'), 'pinpoint': t('A'),
  'abrasive': t('A'), 'footwork': t('A'), 'corrosive wave': t('A'),
  'malaise': t('A'), 'assassinate': t('A'), 'escape plan': t('A'),
  'backflip': t('B'), 'dagger throw': t('B'), 'leg sweep': t('B'),
  'predator': t('B'), 'backstab': t('B'), 'haze': t('B'),
  'flick-flack': t('B'), 'ricochet': t('B'), 'blade dance': t('B'),
  'leading strike': t('B'), 'follow through': t('B'), 'flechettes': t('B'),
  'precise cut': t('B'), 'dash': t('B'), 'noxious fumes': t('B'),
  'knife trap': t('C'), 'murder': t('C'), 'master planner': t('C'),
  'fan of knives': t('C'), 'up my sleeve': t('C'), 'speedster': t('C'),
  'burst': t('C'), 'memento mori': t('C'), 'echoing slash': t('C'),
  'dagger spray': t('C'), 'sucker punch': t('C'), 'poisoned stab': t('C'),
  'slice': t('C'), 'outbreak': t('C'), 'hidden daggers': t('C'),
  'infinite blades': t('C'), 'accuracy': t('C'), 'serpent form': t('C'),
  'accelerant': t('C'), 'finisher': t('C'), 'strangle': t('C'),
  'expertise': t('C'), 'hand trick': t('C'), 'cloak and dagger': t('C'),
  'deadly poison': t('C'), 'pounce': t('C'), 'skewer': t('C'),
  'grand finale': t('D'), 'bullet time': t('D'), 'nightmare': t('D'),
  'shadow step': t('D'), 'storm of steel': t('D'), 'blade of ink': t('D'),
  'phantom blades': t('D'), 'mirage': t('D'), 'bubble bubble': t('D'),
  'bouncing flask': t('D'), 'envenom': t('D'), 'anticipate': t('D'),
  'deflect': t('D'), 'dodge and roll': t('D'), 'snakebite': t('D'),
}

const defect: Record<string, CardTierEntry> = {
  'echo form': t('S'), 'spinner': t('S'), 'defragment': t('S'),
  'glacier': t('S'), 'skim': t('S'), 'hologram': t('S'),
  'fusion': t('S'), 'modded': t('S'), 'genetic algorithm': t('S'),
  'supercritical': t('S'), 'double energy': t('S'),
  'machine learning': t('A'), 'shatter': t('A'), 'glasswork': t('A'),
  'rainbow': t('A'), 'multi-cast': t('A'), 'compact': t('A'),
  'turbo': t('A'), 'chill': t('A'), 'buffer': t('A'),
  'coolant': t('A'), 'reboot': t('A'),
  'coolheaded': t('B'), 'chaos': t('B'), 'shadow shield': t('B'),
  'darkness': t('B'), 'boot sequence': t('B'), 'compile driver': t('B'),
  'charge battery': t('B'), 'leap': t('B'), 'ball lightning': t('B'),
  'lightning rod': t('B'), 'tesla coil': t('B'), 'go for the eyes': t('B'),
  'ftl': t('B'), 'null': t('B'), 'sunder': t('B'),
  'white noise': t('B'), 'rip and tear': t('B'),
  'voltaic': t('C'), 'capacitor': t('C'), 'thunder': t('C'),
  'signal boost': t('C'), 'hailstorm': t('C'), 'consuming shadow': t('C'),
  'iteration': t('C'), 'trash to treasure': t('C'), 'creative ai': t('C'),
  'meteor strike': t('C'), 'adaptive strike': t('C'), 'all for one': t('C'),
  'feral': t('C'), 'fight through': t('C'), 'sweeping beam': t('C'),
  'cold snap': t('C'), 'momentum strike': t('C'), 'focused strike': t('C'),
  'barrage': t('C'), 'beam cell': t('C'), 'gunk up': t('C'),
  'scrape': t('C'), 'rocket punch': t('C'), 'overclock': t('C'),
  'scavenge': t('C'), 'synthesis': t('C'), 'refract': t('C'),
  'ice lance': t('C'), 'flak cannon': t('C'), 'bulk up': t('C'),
  'smokestack': t('C'),
  'hyperbeam': t('D'), 'claw': t('D'), 'subroutine': t('D'),
  'loop': t('D'), 'helix drill': t('D'), 'tempest': t('D'),
  'uproar': t('D'), 'boost away': t('D'), 'hotfix': t('D'),
  'synchronize': t('D'), 'storm': t('D'),
}

const regent: Record<string, CardTierEntry> = {
  'void form': t('S'), 'big bang': t('S'), 'genesis': t('S'),
  'child of the stars': t('S'), 'convergence': t('S'), 'glow': t('S'),
  'reflect': t('S'), 'particle wall': t('S'), 'guards!!!': t('S'),
  'foregone conclusion': t('S'),
  'comet': t('A'), 'gamma blast': t('A'), 'shining strike': t('A'),
  'dying star': t('A'), 'seven stars': t('A'), 'charge!!': t('A'),
  'glimmer': t('A'), 'neutron aegis': t('A'), 'bombardment': t('A'),
  'royalties': t('A'),
  'hidden cache': t('B'), 'gather light': t('B'), 'solar strike': t('B'),
  'cloak of stars': t('B'), 'cosmic indifference': t('B'), 'bulwark': t('B'),
  'summon forth': t('B'), 'guiding star': t('B'), 'photon cut': t('B'),
  'glitterstream': t('B'), 'astral pulse': t('B'), 'crush under': t('B'),
  'royal gamble': t('C'), 'alignment': t('C'), 'radiate': t('C'),
  'decisions decisions': t('C'), 'beat into shape': t('C'), 'the smith': t('C'),
  'seeking edge': t('C'), 'conqueror': t('C'), 'make it so': t('C'),
  'i am invincible': t('C'), 'tyranny': t('C'), 'knockout blow': t('C'),
  'devastate': t('C'), 'wrought in war': t('C'), 'crescent spear': t('C'),
  'hegemony': t('C'), 'lunar blast': t('C'), 'collision course': t('C'),
  'begone!': t('C'), 'patter': t('C'), 'manifest authority': t('C'),
  'black hole': t('C'), 'orbit': t('C'), 'furnace': t('C'),
  'pale blue dot': t('C'), 'resonance': t('C'), 'supermassive': t('C'),
  'pillar of creation': t('C'), 'spectrum shift': t('C'), 'sword sage': t('C'),
  'heirloom hammer': t('D'), 'crash landing': t('D'), 'heavenly drill': t('D'),
  "monarch's gaze": t('D'), 'arsenal': t('D'), 'bundle of joy': t('D'),
  'know thy place': t('D'), 'quasar': t('D'), 'kingly kick': t('D'),
  'kingly punch': t('D'), 'celestial might': t('D'), 'stardust': t('D'),
  'parry': t('D'), 'prophesize': t('D'), 'refine blade': t('D'),
  'spoils of battle': t('D'), 'terraforming': t('D'), 'monologue': t('D'),
}

const necrobinder: Record<string, CardTierEntry> = {
  'capture spirit': t('S'), 'undeath': t('S'), 'borrowed time': t('S'),
  'dredge': t('S'), 'graveblast': t('S'), 'friendship': t('S'),
  'neurosurge': t('S'), 'seance': t('S'), 'cleanse': t('S'),
  'demesne': t('S'),
  'lethality': t('A'), "death's door": t('A'), 'high five': t('A'),
  'fetch': t('A'), "sic 'em": t('A'), 'rattle': t('A'),
  'sacrifice': t('A'), 'necro mastery': t('A'), 'reanimate': t('A'),
  'debilitate': t('A'), 'putrefy': t('A'), 'devour life': t('A'),
  'shared fate': t('A'), 'transfigure': t('A'), 'call of the void': t('A'),
  'parse': t('A'),
  'spur': t('B'), 'pull aggro': t('B'), 'flatten': t('B'),
  'delay': t('B'), 'severance': t('B'), 'snap': t('B'),
  'grave warden': t('B'), 'enfeebling touch': t('B'), 'death march': t('B'),
  'scourge': t('B'), 'negative pulse': t('B'), 'defile': t('B'),
  'reave': t('B'), 'drain power': t('B'), 'poke': t('B'),
  'melancholy': t('B'), 'bone shards': t('B'),
  'haunt': t('C'), 'shroud': t('C'), 'hang': t('C'), 'oblivion': t('C'),
  'pagestorm': t('C'), 'end of days': t('C'), 'deathbringer': t('C'),
  'no escape': t('C'), 'soul storm': t('C'), "time's up": t('C'),
  'sow': t('C'), 'blight strike': t('C'), 'sculpting strike': t('C'),
  'defy': t('C'), 'fear': t('C'), 'invoke': t('C'), 'afterlife': t('C'),
  'right hand hand': t('C'), 'veilpiercer': t('C'), 'wisp': t('C'),
  'calcify': t('C'), 'countdown': t('C'), 'spirit of ash': t('C'),
  "banshee's cry": t('C'), 'sentry mode': t('C'), 'squeeze': t('C'),
  'pull from below': t('C'), 'the scythe': t('C'), 'misery': t('C'),
  'dirge': t('C'), 'eradicate': t('C'),
  'sleight of flesh': t('D'), 'eidolon': t('D'), 'reaper form': t('D'),
  'reap': t('D'), 'bury': t('D'), 'danse macabre': t('D'),
}

const allTiers: Record<string, Record<string, CardTierEntry>> = {
  ironclad, silent, defect, regent, necrobinder,
}

// Lookup by card name (case-insensitive, tries all characters)
export function getCardTier(cardName: string, character?: string): CardTierEntry | null {
  const normalized = cardName.toLowerCase().trim()

  // Try specific character first
  if (character) {
    const charKey = character.toLowerCase()
    // Map Japanese character names
    const charMap: Record<string, string> = {
      'アイアンクラッド': 'ironclad',
      'サイレント': 'silent',
      'ディフェクト': 'defect',
      'リージェント': 'regent',
      'ネクロバインダー': 'necrobinder',
    }
    const mapped = charMap[character] ?? charKey
    const charTiers = allTiers[mapped]
    if (charTiers && charTiers[normalized]) {
      return charTiers[normalized]
    }
  }

  // Try all characters
  for (const charTiers of Object.values(allTiers)) {
    if (charTiers[normalized]) {
      return charTiers[normalized]
    }
  }

  return null
}

// All tier data exported for stats
export function getAllTiers(): Record<string, Record<string, CardTierEntry>> {
  return allTiers
}
