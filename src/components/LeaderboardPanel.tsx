import { Badge, Table, Text } from '@mantine/core'

import { useLeaderboard } from '../hooks/useLeaderboard'

interface LeaderboardPanelProps {
  seed?: string
}

const formatTime = (seconds: number) => `${seconds.toFixed(2)}s`

// Best-times leaderboard for a single board (seed). Highlights the viewer's row.
const LeaderboardPanel = ({ seed }: LeaderboardPanelProps) => {
  const { rows, loading } = useLeaderboard(seed)

  if (loading) return <Text size="sm" c="dimmed">Loading…</Text>
  if (!rows.length) return <Text size="sm" c="dimmed">No records yet. Be the first to solve this board!</Text>

  return (
    <Table highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>#</Table.Th>
          <Table.Th>Player</Table.Th>
          <Table.Th>Time</Table.Th>
          <Table.Th />
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.map(row => (
          <Table.Tr key={row.rank} bg={row.is_current_user ? 'indigo.0' : undefined}>
            <Table.Td>{row.rank}</Table.Td>
            <Table.Td>{row.nickname}{row.is_current_user && ' (you)'}</Table.Td>
            <Table.Td>{formatTime(row.time_seconds)}</Table.Td>
            <Table.Td>{row.flawless && <Badge size="xs" color="yellow">Flawless</Badge>}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}

export default LeaderboardPanel
