import type { StrategicAdvice } from '../logic/runCoach'

export function RunCoachPanel({ advice }: { advice: StrategicAdvice }) {
  return (
    <div className="bg-spire-panel border border-spire-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-spire-text">Strategy Coach</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-spire-muted">{advice.phaseLabel}</span>
          <RunHealthBadge health={advice.runHealth} />
        </div>
      </div>

      {/* Priorities */}
      <div className="mb-3">
        <h3 className="text-xs font-bold text-spire-muted uppercase mb-1">Priorities</h3>
        <div className="space-y-1">
          {advice.priorities.map((p, i) => (
            <div key={i} className="text-sm bg-spire-bg rounded px-2 py-1 flex items-center gap-2">
              <span className="text-spire-accent font-bold w-4 text-center text-xs">{i + 1}</span>
              <span className="text-spire-text">{p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Elite Advice */}
      {advice.eliteAdvice && (
        <div className="mb-3">
          <h3 className="text-xs font-bold text-spire-muted uppercase mb-1">Elite</h3>
          <div className="text-sm bg-spire-bg rounded px-2 py-1 text-spire-text">
            {advice.eliteAdvice}
          </div>
        </div>
      )}

      {/* Boss Prep */}
      {advice.bossPrep && (
        <div className="mb-3">
          <h3 className="text-xs font-bold text-spire-muted uppercase mb-1">Boss Prep</h3>
          <div
            className={`text-sm font-bold rounded p-2 mb-2 ${
              advice.bossPrep.ready
                ? 'bg-spire-green/20 text-spire-green'
                : 'bg-spire-gold/20 text-spire-gold'
            }`}
          >
            {advice.bossPrep.suggestion}
          </div>
          <div className="space-y-1">
            {advice.bossPrep.checklist.map((item, i) => (
              <div
                key={i}
                className="text-sm bg-spire-bg rounded px-2 py-1 flex items-center gap-2"
              >
                <span className={item.ok ? 'text-spire-green' : 'text-spire-red'}>
                  {item.ok ? '\u2713' : '\u2717'}
                </span>
                <span className={item.ok ? 'text-spire-text' : 'text-spire-red'}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Run Health Factors */}
      <div>
        <h3 className="text-xs font-bold text-spire-muted uppercase mb-1">Run Health</h3>
        <div className="flex flex-wrap gap-1.5">
          {advice.runHealth.factors.map((f, i) => (
            <span
              key={i}
              className={`text-xs px-2 py-0.5 rounded ${
                f.impact > 0
                  ? 'bg-spire-green/10 text-spire-green'
                  : f.impact < 0
                    ? 'bg-spire-red/10 text-spire-red'
                    : 'bg-spire-border text-spire-muted'
              }`}
            >
              {f.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function RunHealthBadge({ health }: { health: StrategicAdvice['runHealth'] }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-spire-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            health.score >= 75
              ? 'bg-spire-green'
              : health.score >= 50
                ? 'bg-spire-blue'
                : health.score >= 30
                  ? 'bg-spire-gold'
                  : 'bg-spire-red'
          }`}
          style={{ width: `${health.score}%` }}
        />
      </div>
      <span className={`text-sm font-bold ${health.color}`}>
        {health.label} ({health.score})
      </span>
    </div>
  )
}
