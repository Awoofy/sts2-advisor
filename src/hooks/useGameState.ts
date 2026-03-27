import { useState, useEffect, useRef, useCallback } from 'react'
import type { GameState, ConnectionStatus } from '../types/gameState'
import { fetchGameState } from '../api/sts2client'

const POLL_INTERVAL = 1500

// Fields to carry over from the last state when the current state is missing them
const PERSISTENT_FIELDS = [
  'character', 'hp', 'max_hp', 'block', 'energy', 'max_energy',
  'gold', 'stars', 'relics', 'potions', 'status',
  'act', 'floor', 'ascension',
] as const

function mergeWithCachedPlayer(current: GameState, cached: GameState | null): GameState {
  if (!cached) return current

  const merged = { ...current }
  for (const field of PERSISTENT_FIELDS) {
    if (merged[field] == null && cached[field] != null) {
      (merged as Record<string, unknown>)[field] = cached[field]
    }
  }
  return merged
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting')
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<number | null>(null)
  const cachedRef = useRef<GameState | null>(null)

  const poll = useCallback(async () => {
    try {
      const state = await fetchGameState()
      const merged = mergeWithCachedPlayer(state, cachedRef.current)
      cachedRef.current = merged
      setGameState(merged)
      setConnectionStatus('connected')
      setError(null)
    } catch (e) {
      setConnectionStatus('disconnected')
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
  }, [])

  useEffect(() => {
    poll()
    intervalRef.current = window.setInterval(poll, POLL_INTERVAL)
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
      }
    }
  }, [poll])

  return { gameState, connectionStatus, error }
}
