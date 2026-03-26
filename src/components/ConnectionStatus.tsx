import type { ConnectionStatus as Status } from '../types/gameState'

const statusConfig: Record<Status, { label: string; color: string }> = {
  connected: { label: 'STS2MCP 接続中', color: 'bg-spire-green' },
  disconnected: { label: 'STS2MCP 未接続', color: 'bg-spire-red' },
  connecting: { label: '接続中...', color: 'bg-spire-gold' },
}

export function ConnectionStatusBadge({ status }: { status: Status }) {
  const { label, color } = statusConfig[status]
  return (
    <div className="flex items-center gap-2 text-sm text-spire-muted">
      <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} />
      {label}
    </div>
  )
}
