import type { GameState } from '../types/gameState'

export function PlayerStatus({ state }: { state: GameState }) {
  return (
    <div className="bg-spire-panel border border-spire-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-spire-text">
          {state.character ?? 'Player'}
        </h2>
        <div className="flex gap-3 text-sm text-spire-muted">
          {state.act != null && <span>Act {state.act}</span>}
          {state.floor != null && <span>Floor {state.floor}</span>}
          {state.ascension != null && state.ascension > 0 && (
            <span>A{state.ascension}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox
          label="HP"
          value={`${state.hp ?? 0}/${state.max_hp ?? 0}`}
          color="text-spire-red"
          ratio={state.hp && state.max_hp ? state.hp / state.max_hp : 0}
        />
        <StatBox
          label="Energy"
          value={`${state.energy ?? 0}/${state.max_energy ?? 0}`}
          color="text-spire-gold"
        />
        <StatBox
          label="Block"
          value={`${state.block ?? 0}`}
          color="text-spire-blue"
        />
        <StatBox
          label="Gold"
          value={`${state.gold ?? 0}`}
          color="text-spire-gold"
        />
      </div>

      {state.stars != null && state.stars > 0 && (
        <div className="mt-2 text-sm text-spire-accent">
          Stars: {state.stars}
        </div>
      )}

      {state.status && state.status.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {state.status.map((s, i) => (
            <span
              key={i}
              className="px-2 py-0.5 text-xs rounded bg-spire-border text-spire-text"
              title={s.description}
            >
              {s.name} {s.amount !== 0 && s.amount}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function StatBox({
  label,
  value,
  color,
  ratio,
}: {
  label: string
  value: string
  color: string
  ratio?: number
}) {
  return (
    <div className="bg-spire-bg rounded p-2 text-center">
      <div className="text-xs text-spire-muted mb-1">{label}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      {ratio != null && (
        <div className="mt-1 h-1 bg-spire-border rounded-full overflow-hidden">
          <div
            className="h-full bg-spire-red rounded-full transition-all"
            style={{ width: `${Math.max(0, Math.min(100, ratio * 100))}%` }}
          />
        </div>
      )}
    </div>
  )
}
