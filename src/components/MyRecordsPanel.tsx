import { Badge, Table, Text } from '@mantine/core'

import { useMyRecords } from '../hooks/useMyRecords'

interface MyRecordsPanelProps {
  userId: string
}

const formatTime = (seconds: number) => `${seconds.toFixed(2)}s`

// Personal completion history (newest first). Board links reload that seed via URL hash.
const MyRecordsPanel = ({ userId }: MyRecordsPanelProps) => {
  const { records, loading } = useMyRecords(userId)

  if (loading) return <Text size="sm" c="dimmed">Loading…</Text>
  if (!records.length) return <Text size="sm" c="dimmed">No completed boards yet.</Text>

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Board</Table.Th>
          <Table.Th>Time</Table.Th>
          <Table.Th>When</Table.Th>
          <Table.Th />
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {records.map(record => (
          <Table.Tr key={record.id}>
            <Table.Td><a href={`#${record.seed}`}>{record.seed}</a></Table.Td>
            <Table.Td>{formatTime(record.time_seconds)}</Table.Td>
            <Table.Td>{new Date(record.created_at).toLocaleDateString()}</Table.Td>
            <Table.Td>{record.flawless && <Badge size="xs" color="yellow">Flawless</Badge>}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}

export default MyRecordsPanel
