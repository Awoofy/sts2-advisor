import { useGameState } from './hooks/useGameState'
import { ConnectionStatusBadge } from './components/ConnectionStatus'
import { Dashboard } from './components/Dashboard'

function App() {
  const { gameState, connectionStatus, error } = useGameState()

  return (
    <div className="min-h-screen bg-spire-bg text-spire-text">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-spire-panel/90 backdrop-blur border-b border-spire-border px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-spire-accent">STS2</span> Advisor
          </h1>
          <div className="flex items-center gap-4">
            {gameState && (
              <span className="text-xs text-spire-muted uppercase tracking-wider">
                {gameState.state_type}
              </span>
            )}
            <ConnectionStatusBadge status={connectionStatus} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-4">
        {connectionStatus === 'disconnected' && (
          <div className="bg-spire-red/10 border border-spire-red/30 rounded-lg p-4 mb-4">
            <h2 className="font-bold text-spire-red mb-1">STS2MCP に接続できません</h2>
            <p className="text-sm text-spire-muted">
              STS2MCP mod が有効でゲームが起動していることを確認してください。
              <br />
              API: <code className="text-spire-text">localhost:15526</code>
            </p>
            {error && (
              <p className="text-xs text-spire-muted mt-2">Error: {error}</p>
            )}
          </div>
        )}

        {connectionStatus === 'connecting' && !gameState && (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-2 border-spire-accent border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-spire-muted">STS2MCP に接続中...</p>
          </div>
        )}

        {gameState && <Dashboard state={gameState} />}
      </main>
    </div>
  )
}

export default App
