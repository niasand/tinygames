import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock the supabase client so useSubmitScore never touches the network or
// triggers the real client's env-missing throw. vi.hoisted keeps insertMock
// defined when vi.mock's factory is hoisted above the imports.
const mocks = vi.hoisted(() => ({
  insert: vi.fn(),
}))
vi.mock('../lib/supabase', () => ({
  supabase: { from: () => ({ insert: mocks.insert }) },
}))

import { useSubmitScore } from './useSubmitScore'

describe('useSubmitScore', () => {
  beforeEach(() => {
    mocks.insert.mockReset()
  })

  it('skips when there is no signed-in user', async () => {
    const { result } = renderHook(() => useSubmitScore())
    await act(async () => {
      await result.current.submit('abc123', 10, true, undefined)
    })
    expect(mocks.insert).not.toHaveBeenCalled()
  })

  it('skips when time <= 0 (lastTime not ready yet)', async () => {
    const { result } = renderHook(() => useSubmitScore())
    await act(async () => {
      await result.current.submit('abc123', 0, true, 'user-1')
    })
    expect(mocks.insert).not.toHaveBeenCalled()
  })

  it('inserts once and dedupes a second submit for the same seed', async () => {
    mocks.insert.mockResolvedValue({ error: null })
    const { result } = renderHook(() => useSubmitScore())

    await act(async () => {
      await result.current.submit('abc123', 12.5, true, 'user-1')
    })
    expect(mocks.insert).toHaveBeenCalledTimes(1)

    // StrictMode / repeated completion of the same seed → must not double-insert.
    await act(async () => {
      await result.current.submit('abc123', 12.5, true, 'user-1')
    })
    expect(mocks.insert).toHaveBeenCalledTimes(1)
  })

  it('inserts again for a different seed', async () => {
    mocks.insert.mockResolvedValue({ error: null })
    const { result } = renderHook(() => useSubmitScore())

    await act(async () => {
      await result.current.submit('abc123', 12.5, true, 'user-1')
    })
    await act(async () => {
      await result.current.submit('xyz789', 9.9, false, 'user-1')
    })
    expect(mocks.insert).toHaveBeenCalledTimes(2)
  })
})
