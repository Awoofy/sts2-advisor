import type { CharacterAnalysis } from '../logic/characterMechanics'

export function CharacterPanel({ analysis }: { analysis: CharacterAnalysis }) {
  const { orbs, regent, necrobinder, silent } = analysis
  const hasContent = orbs || regent || necrobinder || silent

  if (!hasContent) return null

  return (
    <div className="bg-spire-panel border border-spire-border rounded-lg p-4">
      <h2 className="text-lg font-bold text-spire-text mb-3">
        {analysis.character} Mechanics
      </h2>

      {orbs && <OrbSection orbs={orbs} />}
      {regent && <RegentSection regent={regent} />}
      {necrobinder && <NecrobinderSection necrobinder={necrobinder} />}
      {silent && <SilentSection silent={silent} />}
    </div>
  )
}

function OrbSection({ orbs }: { orbs: NonNullable<CharacterAnalysis['orbs']> }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-3 text-sm">
        {orbs.totalPassiveDamage > 0 && (
          <span className="bg-spire-gold/10 text-spire-gold px-2 py-0.5 rounded">
            Passive: {orbs.totalPassiveDamage} DMG/turn
          </span>
        )}
        {orbs.totalPassiveBlock > 0 && (
          <span className="bg-spire-blue/10 text-spire-blue px-2 py-0.5 rounded">
            Passive: {orbs.totalPassiveBlock} Block/turn
          </span>
        )}
      </div>
      <div className="space-y-1">
        {orbs.orbSummary.map((orb, i) => (
          <div key={i} className="flex items-center justify-between text-sm bg-spire-bg rounded px-2 py-1">
            <span className="text-spire-text font-bold">{orb.name}</span>
            <div className="flex gap-3 text-xs">
              <span className="text-spire-muted">P: {orb.passive}</span>
              <span className="text-spire-accent">E: {orb.evoke}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RegentSection({ regent }: { regent: NonNullable<CharacterAnalysis['regent']> }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-3 text-sm">
        <span className="bg-spire-gold/10 text-spire-gold px-2 py-0.5 rounded">
          Stars: {regent.stars}
        </span>
        {regent.forgeTotal > 0 && (
          <span className="bg-spire-red/10 text-spire-red px-2 py-0.5 rounded">
            Sovereign Blade: {regent.sovereignBladeDamage} DMG
          </span>
        )}
      </div>
      {regent.starCardsInHand.length > 0 && (
        <div>
          <h3 className="text-xs text-spire-muted uppercase mb-1">Star Cards in Hand</h3>
          <div className="space-y-1">
            {regent.starCardsInHand.map((c) => (
              <div key={c.index} className="flex justify-between text-sm bg-spire-bg rounded px-2 py-1">
                <span className="text-spire-text">{c.name}</span>
                <span className={c.starCost <= regent.stars ? 'text-spire-gold' : 'text-spire-muted'}>
                  {c.starCost} Stars {c.starCost <= regent.stars ? '(OK)' : '(不足)'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function NecrobinderSection({ necrobinder }: { necrobinder: NonNullable<CharacterAnalysis['necrobinder']> }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-3 text-sm">
        <span className={`px-2 py-0.5 rounded ${necrobinder.ostyAlive ? 'bg-spire-green/10 text-spire-green' : 'bg-spire-red/10 text-spire-red'}`}>
          Osty: {necrobinder.ostyAlive ? `${necrobinder.ostyHp} HP` : 'Dead'}
        </span>
        {necrobinder.totalDoomOnField > 0 && (
          <span className="bg-spire-accent/10 text-spire-accent px-2 py-0.5 rounded">
            Doom: {necrobinder.totalDoomOnField}
          </span>
        )}
      </div>
      {necrobinder.doomTargets.some((t) => t.doom > 0) && (
        <div className="space-y-1">
          {necrobinder.doomTargets
            .filter((t) => t.doom > 0)
            .map((t) => (
              <div key={t.enemyId} className="flex justify-between text-sm bg-spire-bg rounded px-2 py-1">
                <span className="text-spire-text">{t.enemyName}</span>
                <span className={t.willDie ? 'text-spire-green font-bold' : 'text-spire-accent'}>
                  Doom {t.doom}/{t.hp} HP {t.willDie ? '(LETHAL!)' : ''}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

function SilentSection({ silent }: { silent: NonNullable<CharacterAnalysis['silent']> }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-3 text-sm flex-wrap">
        {silent.slyCardsInHand.length > 0 && (
          <span className="bg-spire-accent/10 text-spire-accent px-2 py-0.5 rounded">
            Sly: {silent.slyCardsInHand.map((c) => c.name).join(', ')}
          </span>
        )}
        {silent.totalPoisonOnField > 0 && (
          <span className="bg-spire-green/10 text-spire-green px-2 py-0.5 rounded">
            Poison: {silent.totalPoisonOnField}
          </span>
        )}
      </div>
      {silent.poisonOnEnemies.some((e) => e.poison > 0) && (
        <div className="space-y-1">
          {silent.poisonOnEnemies
            .filter((e) => e.poison > 0)
            .map((e) => (
              <div key={e.enemyId} className="flex justify-between text-sm bg-spire-bg rounded px-2 py-1">
                <span className="text-spire-text">{e.enemyName}</span>
                <span className={e.lethalTurns != null ? 'text-spire-green font-bold' : 'text-spire-green'}>
                  {e.poison} Poison
                  {e.lethalTurns != null && ` (${e.lethalTurns}T で死亡)`}
                </span>
              </div>
            ))}
        </div>
      )}
      {silent.discardTriggersInHand.length > 0 && silent.slyCardsInHand.length > 0 && (
        <div className="text-xs bg-spire-accent/10 text-spire-accent rounded p-2">
          Sly チェーン可能: {silent.discardTriggersInHand.map((c) => c.name).join(', ')} で Sly カードが自動プレイ
        </div>
      )}
    </div>
  )
}
