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
  energy,
}: {
  analysis: TurnAnalysis
  killLines: KillLine[]
  energy: number
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

      {/* Damage Overview */}
      <div className="flex gap-4 text-sm mb-3">
        <div className="bg-spire-bg rounded px-3 py-1.5">
          <span className="text-spire-muted">受ける: </span>
          <span className="text-spire-red font-bold">{analysis.totalIncomingDamage}</span>
          {analysis.incomingAfterBlock !== analysis.totalIncomingDamage && (
            <span className="text-spire-muted">
              {' '}
              (Block後: <span className="text-spire-red">{analysis.incomingAfterBlock}</span>)
            </span>
          )}
        </div>
        <div className="bg-spire-bg rounded px-3 py-1.5">
          <span className="text-spire-muted">Block可能: </span>
          <span className="text-spire-blue font-bold">{analysis.availableBlock}</span>
        </div>
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
                {kl.hasIntangible ? (
                  <span className="text-spire-accent font-mono">Intangible</span>
                ) : (
                  <span className="text-spire-red font-mono">
                    {kl.block > 0
                      ? `${kl.block} Block + ${kl.currentHp} HP = ${kl.damageNeeded}`
                      : `${kl.damageNeeded} DMG`}
                  </span>
                )}
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
                  {t.isSummoning && (
                    <span className="text-spire-gold">Summon</span>
                  )}
                  {t.poisonLethalTurns != null && (
                    <span className="text-spire-green">
                      毒死{t.poisonLethalTurns}T
                    </span>
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
            <span className="text-spire-gold ml-2 normal-case">
              ({analysis.recommendations.length}枚 / {energy} Energy)
            </span>
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
