import type { TurnAnalysis } from '../logic/combatAnalyzer'
import type { KillLine } from '../logic/damageCalculator'

const threatColors: Record<string, string> = {
  low: 'text-spire-green',
  medium: 'text-spire-gold',
  high: 'text-spire-red',
  critical: 'text-spire-red font-bold',
}

export function CombatAdvisor({
  analysis,
  killLines,
}: {
  analysis: TurnAnalysis
  killLines: KillLine[]
}) {
  return (
    <div className="bg-spire-panel border border-spire-border rounded-lg p-4">
      <h2 className="text-lg font-bold text-spire-text mb-2">Advisor</h2>

      {/* Summary */}
      <div
        className={`text-sm font-bold rounded p-2 mb-3 ${
          analysis.shouldFocusBlock
            ? 'bg-spire-red/20 text-spire-red'
            : analysis.canKillEnemy.length > 0
              ? 'bg-spire-green/20 text-spire-green'
              : 'bg-spire-blue/20 text-spire-blue'
        }`}
      >
        {analysis.summary}
      </div>

      {/* Kill Lines */}
      {killLines.length > 0 && (
        <div className="mb-3">
          <h3 className="text-xs font-bold text-spire-muted uppercase mb-1">
            Kill Line
          </h3>
          <div className="space-y-1">
            {killLines.map((kl) => (
              <div
                key={kl.enemyId}
                className="flex justify-between text-sm bg-spire-bg rounded px-2 py-1"
              >
                <span className="text-spire-text">{kl.enemyName}</span>
                <span className="text-spire-red font-mono">
                  {kl.block > 0
                    ? `${kl.block} Block + ${kl.currentHp} HP = ${kl.damageNeeded}`
                    : `${kl.damageNeeded} DMG`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Threat Assessment */}
      {analysis.threats.length > 0 && (
        <div className="mb-3">
          <h3 className="text-xs font-bold text-spire-muted uppercase mb-1">
            Threat
          </h3>
          <div className="space-y-1">
            {analysis.threats.map((t) => (
              <div
                key={t.enemyId}
                className="flex items-center justify-between text-sm bg-spire-bg rounded px-2 py-1"
              >
                <span className="text-spire-text">{t.enemyName}</span>
                <div className="flex items-center gap-2">
                  {t.isAttacking && (
                    <span className="text-spire-red">
                      {t.totalIncomingDamage} DMG
                    </span>
                  )}
                  {t.isBuffing && <span className="text-spire-gold">Buff</span>}
                  {t.isDebuffing && (
                    <span className="text-spire-accent">Debuff</span>
                  )}
                  <span className={threatColors[t.threatLevel]}>
                    [{t.threatLevel.toUpperCase()}]
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-spire-muted uppercase mb-1">
            Play Order
          </h3>
          <div className="space-y-1">
            {analysis.recommendations.map((rec, i) => (
              <div
                key={rec.cardIndex}
                className="flex items-center gap-2 text-sm bg-spire-bg rounded px-2 py-1"
              >
                <span className="text-spire-accent font-bold w-5 text-center">
                  {i + 1}
                </span>
                <span className="text-spire-text font-bold">{rec.cardName}</span>
                {rec.target && (
                  <span className="text-spire-muted text-xs">
                    → {rec.target}
                  </span>
                )}
                <span className="text-spire-muted text-xs ml-auto">
                  {rec.reason}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
