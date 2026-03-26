import type { Card } from '../types/gameState'

const typeColors: Record<string, string> = {
  Attack: 'border-spire-red',
  Skill: 'border-spire-blue',
  Power: 'border-spire-accent',
  Status: 'border-spire-muted',
  Curse: 'border-spire-red/50',
}

export function HandDisplay({
  hand,
  energy,
}: {
  hand: Card[]
  energy: number
}) {
  return (
    <div className="bg-spire-panel border border-spire-border rounded-lg p-4">
      <h2 className="text-lg font-bold text-spire-text mb-3">
        Hand ({hand.length})
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {hand.map((card) => (
          <CardItem key={card.index} card={card} energy={energy} />
        ))}
      </div>
    </div>
  )
}

function CardItem({ card, energy }: { card: Card; energy: number }) {
  const affordable = card.cost <= energy
  const playable = card.can_play
  const borderColor = typeColors[card.type] ?? 'border-spire-border'

  return (
    <div
      className={`
        relative rounded-lg border-2 p-3 transition-all
        ${borderColor}
        ${playable && affordable ? 'opacity-100' : 'opacity-50'}
      `}
      title={card.description}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm text-spire-text truncate">
              {card.name}
            </span>
            {card.is_upgraded && (
              <span className="text-xs text-spire-green">+</span>
            )}
          </div>
          <div className="text-xs text-spire-muted mt-0.5">{card.type}</div>
        </div>
        <CostBadge cost={card.cost} affordable={affordable && playable} />
      </div>
      <p className="text-xs text-spire-muted mt-2 line-clamp-2">
        {card.description}
      </p>
      {card.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {card.keywords.map((kw) => (
            <span
              key={kw}
              className="text-[10px] px-1.5 py-0.5 rounded bg-spire-border text-spire-muted"
            >
              {kw}
            </span>
          ))}
        </div>
      )}
      {!playable && card.unplayable_reason && (
        <div className="text-[10px] text-spire-red mt-1">
          {card.unplayable_reason}
        </div>
      )}
    </div>
  )
}

function CostBadge({
  cost,
  affordable,
}: {
  cost: number
  affordable: boolean
}) {
  return (
    <span
      className={`
        flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold shrink-0
        ${affordable ? 'bg-spire-gold/20 text-spire-gold' : 'bg-spire-border text-spire-muted'}
      `}
    >
      {cost}
    </span>
  )
}
