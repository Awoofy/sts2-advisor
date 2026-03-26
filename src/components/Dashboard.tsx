import type { GameState } from '../types/gameState'
import { PlayerStatus } from './PlayerStatus'
import { HandDisplay } from './HandDisplay'
import { EnemyPanel } from './EnemyPanel'
import { CombatAdvisor } from './CombatAdvisor'
import { CharacterPanel } from './CharacterPanel'
import { MapView } from './MapView'
import { CardRewardView, RestSiteView, ShopView, EventView } from './RewardPicker'
import { analyzeTurn } from '../logic/combatAnalyzer'
import { calculateKillLines } from '../logic/damageCalculator'
import { analyzeCharacter } from '../logic/characterMechanics'
import { adviseMap, adviseCardPick, adviseRest, adviseShop } from '../logic/advisorEngine'

function isCombatState(stateType: string): boolean {
  return ['monster', 'elite', 'boss'].includes(stateType)
}

export function Dashboard({ state }: { state: GameState }) {
  const inCombat = isCombatState(state.state_type)

  return (
    <div className="space-y-4">
      <PlayerStatus state={state} />

      {inCombat && <CombatView state={state} />}
      {state.state_type === 'map' && <MapSection state={state} />}
      {state.state_type === 'card_reward' && <CardRewardSection state={state} />}
      {state.state_type === 'rest_site' && <RestSection state={state} />}
      {state.state_type === 'shop' && <ShopSection state={state} />}
      {state.state_type === 'event' && <EventView state={state} />}
      {state.state_type === 'combat_rewards' && <CombatRewardsView state={state} />}
      {state.state_type === 'menu' && <MenuView />}

      {/* Pile counts in combat */}
      {inCombat && (
        <div className="flex gap-4 text-sm text-spire-muted justify-center">
          <span>Draw: {state.draw_pile_count ?? 0}</span>
          <span>Discard: {state.discard_pile_count ?? 0}</span>
          <span>Exhaust: {state.exhaust_pile_count ?? 0}</span>
        </div>
      )}

      {/* Relics */}
      {state.relics && state.relics.length > 0 && (
        <div className="bg-spire-panel border border-spire-border rounded-lg p-3">
          <h3 className="text-xs font-bold text-spire-muted uppercase mb-2">
            Relics ({state.relics.length})
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {state.relics.map((r, i) => (
              <span
                key={i}
                className="px-2 py-1 text-xs rounded bg-spire-bg text-spire-text"
                title={r.description}
              >
                {r.name}
                {r.counter != null && r.counter > 0 && (
                  <span className="text-spire-gold ml-1">({r.counter})</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Potions */}
      {state.potions && state.potions.length > 0 && (
        <div className="bg-spire-panel border border-spire-border rounded-lg p-3">
          <h3 className="text-xs font-bold text-spire-muted uppercase mb-2">
            Potions
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {state.potions.map((p, i) => (
              <span
                key={i}
                className="px-2 py-1 text-xs rounded bg-spire-accent/10 text-spire-accent"
                title={p.description}
              >
                {p.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CombatView({ state }: { state: GameState }) {
  const hand = state.hand ?? []
  const enemies = state.enemies ?? []
  const playerStatus = state.status ?? []
  const energy = state.energy ?? 0

  const analysis = analyzeTurn(
    hand,
    enemies,
    playerStatus,
    energy,
    state.hp ?? 0,
    state.block ?? 0,
  )
  const killLines = calculateKillLines(enemies)
  const charAnalysis = analyzeCharacter(state)

  return (
    <>
      <CombatAdvisor analysis={analysis} killLines={killLines} />
      <CharacterPanel analysis={charAnalysis} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <HandDisplay hand={hand} energy={energy} />
        <EnemyPanel enemies={enemies} />
      </div>
    </>
  )
}

function MapSection({ state }: { state: GameState }) {
  const advice = adviseMap(state)
  return <MapView state={state} advice={advice} />
}

function CardRewardSection({ state }: { state: GameState }) {
  const advice = adviseCardPick(state.card_rewards, state)
  return <CardRewardView state={state} advice={advice} />
}

function RestSection({ state }: { state: GameState }) {
  const advice = adviseRest(state)
  return <RestSiteView state={state} advice={advice} />
}

function ShopSection({ state }: { state: GameState }) {
  const advice = adviseShop(state)
  return <ShopView state={state} advice={advice} />
}

function CombatRewardsView({ state }: { state: GameState }) {
  const rewards = state.combat_rewards
  if (!rewards || rewards.length === 0) return null

  return (
    <div className="bg-spire-panel border border-spire-border rounded-lg p-4">
      <h2 className="text-lg font-bold text-spire-text mb-2">Combat Rewards</h2>
      <div className="space-y-2">
        {rewards.map((r) => (
          <div
            key={r.index}
            className="bg-spire-bg rounded p-3 border border-spire-border"
          >
            <span className="font-bold text-spire-text">{r.label}</span>
            {r.gold != null && (
              <span className="text-spire-gold ml-2">{r.gold}G</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function MenuView() {
  return (
    <div className="bg-spire-panel border border-spire-border rounded-lg p-8 text-center">
      <h2 className="text-2xl font-bold text-spire-text mb-2">STS2 Advisor</h2>
      <p className="text-spire-muted">
        ゲームを開始すると自動的にアドバイスが表示されます
      </p>
    </div>
  )
}
