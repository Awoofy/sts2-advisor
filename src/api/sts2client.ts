import type { GameState } from '../types/gameState'

const BASE_URL = 'http://localhost:15526'

export async function fetchGameState(): Promise<GameState> {
  const res = await fetch(`${BASE_URL}/api/v1/singleplayer?format=json`)
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }
  return res.json()
}

export interface ActionPayload {
  action: string
  card_index?: number
  target?: string
  index?: number
  slot?: number
}

export async function sendAction(payload: ActionPayload): Promise<unknown> {
  const res = await fetch(`${BASE_URL}/api/v1/singleplayer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(`Action error: ${res.status}`)
  }
  return res.json()
}
