import type { GameState } from '../types/gameState'
import type { CardPickAdvice, RestAdvice, ShopAdvice } from '../logic/advisorEngine'
import type { ContextualCardAdvice } from '../logic/deckAnalyzer'

export function CardRewardView({
  state,
  advice,
  contextAdvice,
}: {
  state: GameState
  advice: CardPickAdvice | null
  contextAdvice?: ContextualCardAdvice[] | null
}) {
  const cards = state.card_rewards
  if (!cards || cards.length === 0) return null

  return (
    <div className="bg-spire-panel border border-spire-border rounded-lg p-4">
      <h2 className="text-lg font-bold text-spire-text mb-2">Card Reward</h2>

      {advice && (
        <div
          className={`text-sm rounded p-2 mb-3 ${
            advice.shouldSkip
              ? 'bg-spire-gold/10 text-spire-gold'
              : 'bg-spire-green/10 text-spire-green'
          }`}
        >
          {advice.reason}
        </div>
      )}

      <div className="space-y-2">
        {cards.map((card) => {
          const isRecommended = advice?.recommendedIndex === card.index
          const adviceItem = advice?.cards.find((c) => c.index === card.index)

          return (
            <div
              key={card.index}
              className={`
                bg-spire-bg rounded-lg p-3 border
                ${isRecommended ? 'border-spire-green ring-1 ring-spire-green' : 'border-spire-border'}
              `}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-spire-text">{card.name}</span>
                  {card.is_upgraded && (
                    <span className="text-xs text-spire-green">+</span>
                  )}
                  <span className="text-xs text-spire-muted">{card.rarity}</span>
                </div>
                <span className="text-sm text-spire-gold">{card.cost} Energy</span>
              </div>
              <p className="text-xs text-spire-muted">{card.description}</p>
              {(() => {
                const ctx = contextAdvice?.find((c) => c.index === card.index)
                if (ctx) {
                  return (
                    <div className="text-xs mt-1 bg-spire-accent/10 text-spire-accent rounded px-2 py-1">
                      {ctx.reasoning}
                      {ctx.archetypeFit > 0 && (
                        <span className="ml-1 text-spire-gold font-bold">
                          (Score: {ctx.archetypeFit})
                        </span>
                      )}
                    </div>
                  )
                }
                if (adviceItem) {
                  return (
                    <div className="text-xs text-spire-accent mt-1">
                      {adviceItem.reasoning}
                    </div>
                  )
                }
                return null
              })()}
              {isRecommended && (
                <span className="inline-block text-xs bg-spire-green/20 text-spire-green px-2 py-0.5 rounded mt-1">
                  Pick
                </span>
              )}
            </div>
          )
        })}
      </div>

      {advice?.shouldSkip && (
        <div className="mt-2 text-sm text-spire-gold text-center">
          Skip recommended
        </div>
      )}
    </div>
  )
}

export function RestSiteView({
  state,
  advice,
}: {
  state: GameState
  advice: RestAdvice | null
}) {
  const options = state.rest_options
  if (!options || options.length === 0) return null

  return (
    <div className="bg-spire-panel border border-spire-border rounded-lg p-4">
      <h2 className="text-lg font-bold text-spire-text mb-2">Rest Site</h2>

      {advice && (
        <div className="bg-spire-green/10 text-spire-green text-sm rounded p-2 mb-3">
          {advice.reason}
        </div>
      )}

      <div className="space-y-2">
        {options.map((opt) => {
          const isRecommended = advice?.recommendedIndex === opt.index
          return (
            <div
              key={opt.index}
              className={`
                bg-spire-bg rounded-lg p-3 border
                ${isRecommended ? 'border-spire-green ring-1 ring-spire-green' : 'border-spire-border'}
              `}
            >
              <span className="font-bold text-spire-text">{opt.label}</span>
              <p className="text-xs text-spire-muted mt-0.5">{opt.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ShopView({
  state,
  advice,
}: {
  state: GameState
  advice: ShopAdvice | null
}) {
  const items = state.shop_items
  if (!items || items.length === 0) return null

  return (
    <div className="bg-spire-panel border border-spire-border rounded-lg p-4">
      <h2 className="text-lg font-bold text-spire-text mb-2">
        Shop <span className="text-sm text-spire-gold">{state.gold ?? 0}G</span>
      </h2>

      <div className="space-y-2">
        {items
          .filter((item) => item.is_stocked)
          .map((item) => {
            const rec = advice?.recommendations.find((r) => r.index === item.index)
            return (
              <div
                key={item.index}
                className={`
                bg-spire-bg rounded-lg p-3 border flex items-center justify-between
                ${rec ? 'border-spire-green/50' : 'border-spire-border'}
                ${!item.can_afford ? 'opacity-40' : ''}
              `}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-spire-text">
                      {item.name ?? item.category}
                    </span>
                    {item.on_sale && (
                      <span className="text-[10px] bg-spire-red/20 text-spire-red px-1.5 rounded">
                        SALE
                      </span>
                    )}
                  </div>
                  {rec && (
                    <div className="text-xs text-spire-accent mt-0.5">
                      {rec.reasoning}
                    </div>
                  )}
                </div>
                <span
                  className={`font-bold ${item.can_afford ? 'text-spire-gold' : 'text-spire-muted'}`}
                >
                  {item.cost}G
                </span>
              </div>
            )
          })}
      </div>
    </div>
  )
}

export function EventView({ state }: { state: GameState }) {
  return (
    <div className="bg-spire-panel border border-spire-border rounded-lg p-4">
      <h2 className="text-lg font-bold text-spire-text mb-2">
        {state.event_name ?? 'Event'}
      </h2>
      {state.body && (
        <p className="text-sm text-spire-muted mb-3">{state.body}</p>
      )}
      {state.event_options && (
        <div className="space-y-2">
          {state.event_options.map((opt) => (
            <div
              key={opt.index}
              className={`
                bg-spire-bg rounded-lg p-3 border border-spire-border
                ${opt.is_locked ? 'opacity-40' : ''}
                ${opt.is_chosen ? 'ring-1 ring-spire-accent' : ''}
              `}
            >
              <span className="text-spire-text">{opt.label}</span>
              {opt.description && (
                <p className="text-xs text-spire-muted mt-0.5">{opt.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
