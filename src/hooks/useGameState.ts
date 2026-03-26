import { useState, useEffect, useRef, useCallback } from 'react'
import type { GameState, ConnectionStatus } from '../types/gameState'
import { fetchGameState } from '../api/sts2client'

const POLL_INTERVAL = 1500

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting')
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<number | null>(null)

  const poll = useCallback(async () => {
    try {
      const state = await fetchGameState()
      setGameState(state)
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
