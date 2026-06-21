import { useState } from 'react'

import { ActionIcon, Button, Menu, Modal } from '@mantine/core'
import { IconHistory, IconLogin, IconLogout, IconTrophy, IconUser } from '@tabler/icons-react'

import { useAuth } from '../hooks/useAuth'
import useHash from '../hooks/useHash'
import AuthModal from './AuthModal'
import LeaderboardPanel from './LeaderboardPanel'
import MyRecordsPanel from './MyRecordsPanel'

// Top-bar account entry. Signed-out → "Sign in"; signed-in → avatar menu with
// Leaderboard / My records / Sign out. Panels open in modals.
const AccountButton = () => {
  const { user, signOut } = useAuth()
  const [hash] = useHash()
  const [authOpened, setAuthOpened] = useState(false)
  const [leaderboardOpened, setLeaderboardOpened] = useState(false)
  const [recordsOpened, setRecordsOpened] = useState(false)

  if (!user) {
    return (
      <>
        <Button variant="default" size="xs" leftSection={<IconLogin size={14} />} aria-label="Sign in" onClick={() => setAuthOpened(true)}>
          Sign in
        </Button>
        <AuthModal opened={authOpened} onClose={() => setAuthOpened(false)} />
      </>
    )
  }

  return (
    <>
      <Menu shadow="md" width={200} position="bottom-end">
        <Menu.Target>
          <ActionIcon variant="light" color="indigo" radius="xl" size="lg" aria-label="Account">
            <IconUser size={18} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>{user.nickname ?? user.email}</Menu.Label>
          <Menu.Item leftSection={<IconTrophy size={14} />} onClick={() => setLeaderboardOpened(true)}>
            Leaderboard
          </Menu.Item>
          <Menu.Item leftSection={<IconHistory size={14} />} onClick={() => setRecordsOpened(true)}>
            My records
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item leftSection={<IconLogout size={14} />} onClick={() => signOut()}>
            Sign out
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Modal opened={leaderboardOpened} onClose={() => setLeaderboardOpened(false)} title="Leaderboard" size="md" centered>
        <LeaderboardPanel seed={hash} />
      </Modal>
      <Modal opened={recordsOpened} onClose={() => setRecordsOpened(false)} title="My records" size="md" centered>
        <MyRecordsPanel userId={user.id} />
      </Modal>
    </>
  )
}

export default AccountButton
