import type { GameState } from '../types/gameState'
import type { MapAdvice } from '../logic/advisorEngine'

const nodeTypeLabels: Record<string, string> = {
  monster: 'Monster',
  elite: 'Elite',
  rest: 'Rest',
  shop: 'Shop',
  event: '?',
  treasure: 'Treasure',
  boss: 'Boss',
}

const nodeTypeEmoji: Record<string, string> = {
  monster: '\u{1F5E1}',
  elite: '\u{1F525}',
  rest: '\u{1F6CF}',
  shop: '\u{1F4B0}',
  event: '\u{2753}',
  treasure: '\u{1F4E6}',
  boss: '\u{1F480}',
}

const nodeTypeColors: Record<string, string> = {
  monster: 'bg-spire-red/20 text-spire-red border-spire-red/50',
  elite: 'bg-spire-gold/20 text-spire-gold border-spire-gold/50',
  rest: 'bg-spire-green/20 text-spire-green border-spire-green/50',
  shop: 'bg-spire-gold/20 text-spire-gold border-spire-gold/50',
  event: 'bg-spire-accent/20 text-spire-accent border-spire-accent/50',
  treasure: 'bg-spire-gold/20 text-spire-gold border-spire-gold/50',
  boss: 'bg-spire-red/20 text-spire-red border-spire-red/50',
}

export function MapView({
  state,
  advice,
}: {
  state: GameState
  advice: MapAdvice | null
}) {
  const options = state.next_options

  return (
    <div className="bg-spire-panel border border-spire-border rounded-lg p-4">
      <h2 className="text-lg font-bold text-spire-text mb-3">Map</h2>

      {state.current_position && (
        <div className="text-sm text-spire-muted mb-3">
          Current: {nodeTypeLabels[state.current_position.type] ?? state.current_position.type}
          {' '}(col {state.current_position.col}, row {state.current_position.row})
        </div>
      )}

      {advice && (
        <div className="bg-spire-green/10 border border-spire-green/30 rounded p-2 mb-3 text-sm text-spire-green">
          {advice.reason}
        </div>
      )}

      {options && options.length > 0 && (
        <div className="space-y-2">
          {options.map((opt, i) => {
            const isRecommended = advice?.recommendedIndex === opt.index
            const adviceItem = advice?.options.find((a) => a.index === opt.index)
            const colors =
              nodeTypeColors[opt.type] ?? 'bg-spire-border text-spire-text border-spire-border'
            const label = nodeTypeLabels[opt.type] ?? opt.type
            const emoji = nodeTypeEmoji[opt.type] ?? ''
            const posLabel = options.length > 1
              ? opt.col != null
                ? `(${opt.col < (state.current_position?.col ?? 99) ? 'Left' : opt.col > (state.current_position?.col ?? -1) ? 'Right' : 'Center'})`
                : `#${i + 1}`
              : ''

            return (
              <div
                key={opt.index}
                className={`
                  rounded-lg border p-3 transition-all
                  ${colors}
                  ${isRecommended ? 'ring-2 ring-spire-green' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{emoji}</span>
                    <span className="font-bold">{label}</span>
                    <span className="text-xs opacity-60">{posLabel}</span>
                  </div>
                  {isRecommended && (
                    <span className="text-xs bg-spire-green/20 text-spire-green px-2 py-0.5 rounded font-bold">
                      Recommended
                    </span>
                  )}
                </div>
                {adviceItem && (
                  <div className="text-xs mt-1 opacity-80">
                    {adviceItem.reasoning}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
