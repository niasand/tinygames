import { useCallback, useEffect, useState } from 'react'

import { ActionIcon, Anchor, Button, Container, Group, Paper, Stack, Text, Title } from '@mantine/core'
import { useListState } from '@mantine/hooks'
import { IconBrandGithubFilled, IconReload } from '@tabler/icons-react'

import styles from './App.module.css'
import AccountButton from './components/AccountButton'
import Game from './components/Game'
import useHash from './hooks/useHash'
import { newHash } from './utils/hash'


function App() {
  const [hash, setHash] = useHash()
  const [currentHash, setCurrentHash] = useState('')
  const [seeds, { append: appendSeed, shift: shiftSeeds, setItem: setSeeds }] = useListState<string>()

  useEffect(() => {
    if (seeds.length) {
      setHash(seeds[0])
      setCurrentHash(seeds[0])
    }

    if (seeds.length >= 2) return
    appendSeed(newHash())
  }, [seeds, setHash, appendSeed])

  useEffect(() => {
    if (hash === currentHash) return
    if (!hash) {
      shiftSeeds()
      return
    }

    setSeeds(0, hash)
  }, [hash, currentHash, shiftSeeds, setSeeds])

  const handleNext = useCallback(() => {
    shiftSeeds()
  }, [shiftSeeds])

  return (
    <Container component="main" size="xs" className={styles.shell}>
      <Stack className={styles.page} mih="100dvh" align="center" ta="center" py="xl">
        <Group className={styles.header} justify="space-between" w="100%" mb="lg" wrap="nowrap">
          <Title className={styles.title} order={1}>Tango Unlimited</Title>
          <AccountButton />
        </Group>
        <Game seeds={seeds} onNext={handleNext} />
        <Text size="lg" fw={700}>Tango, now truly unlimited!</Text>
        <Text className={styles.copy}>All boards are randomly generated - no two are the same! To return to this board, save the link.</Text>
        <Paper className={styles.boardUrl} withBorder px="lg" py="xs">
          <Text component="span" className={styles.boardUrlText}>{location.href}</Text>
        </Paper>
        <Button variant="filled" onClick={handleNext} leftSection={<IconReload size={14} />}>Generate another</Button>
        <Text className={styles.copy} size="xs" mt="xl" mb="md">Inspired by the LinkedIn game Tango. Tango Unlimited is an independent product and is not affiliated with, nor has been authorized, sponsored, or otherwise approved by LinkedIn Corporation. Play the original game <Anchor href="https://www.linkedin.com/games/tango" target="_blank">here</Anchor>.</Text>
        <ActionIcon variant="transparent" color="gray" component="a" href="https://github.com/themintchoco/tango" target="_blank">
          <IconBrandGithubFilled />
        </ActionIcon>
      </Stack>
    </Container>
  )
}

export default App
