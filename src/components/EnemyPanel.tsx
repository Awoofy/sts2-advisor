import type { Enemy } from '../types/gameState'

const intentIcons: Record<string, string> = {
  attack: '  ',
  defend: '  ',
  buff: '  ',
  debuff: '  ',
  sleep: '  ',
  unknown: '  ',
}

export function EnemyPanel({ enemies }: { enemies: Enemy[] }) {
  return (
    <div className="bg-spire-panel border border-spire-border rounded-lg p-4">
      <h2 className="text-lg font-bold text-spire-text mb-3">
        Enemies ({enemies.length})
      </h2>
      <div className="space-y-3">
        {enemies.map((enemy) => (
          <EnemyCard key={enemy.entity_id} enemy={enemy} />
        ))}
      </div>
    </div>
  )
}

function EnemyCard({ enemy }: { enemy: Enemy }) {
  const hpRatio = enemy.max_hp > 0 ? enemy.hp / enemy.max_hp : 0

  return (
    <div className="bg-spire-bg rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-spire-text">{enemy.name}</span>
        <span className="text-sm text-spire-muted">{enemy.combat_id}</span>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1">
          <div className="flex justify-between text-xs text-spire-muted mb-1">
            <span>HP</span>
            <span>
              {enemy.hp}/{enemy.max_hp}
            </span>
          </div>
          <div className="h-2 bg-spire-border rounded-full overflow-hidden">
            <div
              className="h-full bg-spire-red rounded-full transition-all"
              style={{ width: `${hpRatio * 100}%` }}
            />
          </div>
        </div>
        {enemy.block > 0 && (
          <div className="text-center">
            <div className="text-xs text-spire-muted">Block</div>
            <div className="text-lg font-bold text-spire-blue">
              {enemy.block}
            </div>
          </div>
        )}
      </div>

      {enemy.intents.length > 0 && (
        <div className="space-y-1">
          {enemy.intents.map((intent, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-sm bg-spire-panel rounded px-2 py-1"
              title={intent.description}
            >
              <span>{intentIcons[intent.type] ?? intentIcons.unknown}</span>
              <span className="text-spire-text">{intent.title || intent.label}</span>
              {intent.damage != null && (
                <span className="text-spire-red font-bold ml-auto">
                  {intent.damage}
                  {intent.hits != null && intent.hits > 1 && ` x${intent.hits}`}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {enemy.status.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {enemy.status.map((s, i) => (
            <span
              key={i}
              className="px-1.5 py-0.5 text-[10px] rounded bg-spire-border text-spire-muted"
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
