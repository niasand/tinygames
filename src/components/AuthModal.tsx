import { useState } from 'react'

import { Button, Modal, PinInput, Stack, Text, TextInput } from '@mantine/core'

import { useAuth } from '../hooks/useAuth'

interface AuthModalProps {
  opened: boolean
  onClose: () => void
}

// Two-step email OTP auth: enter email → Supabase sends a 6-digit code → verify.
const AuthModal = ({ opened, onClose }: AuthModalProps) => {
  const { signIn, verifyOtp } = useAuth()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const reset = () => {
    setEmail('')
    setCode('')
    setSent(false)
    setError(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSend = async () => {
    setError(null)
    setBusy(true)
    const { error } = await signIn(email)
    setBusy(false)
    if (error) setError(error)
    else setSent(true)
  }

  const handleVerify = async () => {
    setError(null)
    setBusy(true)
    const { error } = await verifyOtp(email, code)
    setBusy(false)
    if (error) {
      setError(error)
    } else {
      reset()
      onClose()
    }
  }

  return (
    <Modal opened={opened} onClose={handleClose} title="Sign in" centered>
      <Stack>
        {!sent ? (
          <>
            <TextInput
              label="Email"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={event => setEmail(event.currentTarget.value)}
              onKeyDown={event => event.key === 'Enter' && email && handleSend()}
            />
            <Button loading={busy} onClick={handleSend} disabled={!email}>
              Send code
            </Button>
          </>
        ) : (
          <>
            <Text size="sm" c="dimmed">Enter the 6-digit code sent to {email}.</Text>
            <PinInput length={6} value={code} onChange={setCode} type="number" />
            <Button loading={busy} onClick={handleVerify} disabled={code.length !== 6}>
              Verify &amp; sign in
            </Button>
          </>
        )}
        {error && <Text c="red" size="sm">{error}</Text>}
      </Stack>
    </Modal>
  )
}

export default AuthModal
