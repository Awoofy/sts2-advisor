import type { DeckAnalysis } from '../logic/deckAnalyzer'

const qualityColors: Record<string, string> = {
  lean: 'text-spire-green',
  balanced: 'text-spire-blue',
  bloated: 'text-spire-red',
}

const qualityLabels: Record<string, string> = {
  lean: 'スリム',
  balanced: 'バランス',
  bloated: '肥大',
}

export function DeckStats({ analysis }: { analysis: DeckAnalysis }) {
  return (
    <div className="bg-spire-panel border border-spire-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-spire-text">Deck</h2>
        <span className={`text-sm font-bold ${qualityColors[analysis.deckQuality]}`}>
          {analysis.totalCards}枚 ({qualityLabels[analysis.deckQuality]})
        </span>
      </div>

      {/* Card type breakdown */}
      <div className="flex gap-3 text-sm mb-3">
        <span className="bg-spire-red/10 text-spire-red px-2 py-0.5 rounded">
          Attack: {analysis.attackCount}
        </span>
        <span className="bg-spire-blue/10 text-spire-blue px-2 py-0.5 rounded">
          Skill: {analysis.skillCount}
        </span>
        <span className="bg-spire-accent/10 text-spire-accent px-2 py-0.5 rounded">
          Power: {analysis.powerCount}
        </span>
        <span className="bg-spire-bg text-spire-muted px-2 py-0.5 rounded">
          Avg: {analysis.avgCost.toFixed(1)}
        </span>
      </div>

      {/* Archetype */}
      {analysis.archetypes.length > 0 && (
        <div className="mb-3">
          <h3 className="text-xs font-bold text-spire-muted uppercase mb-1">Archetype</h3>
          <div className="space-y-1">
            {analysis.archetypes.map((arch, i) => (
              <div
                key={arch.archetype}
                className="flex items-center justify-between text-sm bg-spire-bg rounded px-2 py-1"
              >
                <div className="flex items-center gap-2">
                  {i === 0 && (
                    <span className="text-spire-gold text-xs font-bold">PRIMARY</span>
                  )}
                  <span className="text-spire-text font-bold">{arch.label}</span>
                  <span className="text-spire-muted text-xs">{arch.description}</span>
                </div>
                <span className="text-spire-accent font-mono">{arch.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {analysis.warnings.length > 0 && (
        <div className="space-y-1">
          {analysis.warnings.map((w, i) => (
            <div key={i} className="text-xs bg-spire-gold/10 text-spire-gold rounded px-2 py-1">
              {w}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
