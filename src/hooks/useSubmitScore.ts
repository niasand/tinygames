import { useCallback, useRef } from 'react'

import { supabase } from '../lib/supabase'

/**
 * Submits a completed board's score to game_records.
 *
 * Idempotency / timing guards (critical — see plan risk #1, #2):
 * - `userId` missing → skip silently (not signed in; don't interrupt the game).
 * - `time <= 0` → skip: `lastTime` is set asynchronously by Timer.onStop in a
 *   different effect than `completed`, so the first fire may see time = 0.
 *   The submit effect re-runs when lastTime updates and lands the real value.
 * - `submittedRef` → skip once a seed has been successfully inserted this session.
 * - `inFlightRef` → skip duplicate concurrent calls (React StrictMode double-fire).
 */
export const useSubmitScore = () => {
  const submittedRef = useRef<Set<string>>(new Set())
  const inFlightRef = useRef<Set<string>>(new Set())

  const submit = useCallback(
    async (seed: string, time: number, flawless: boolean, userId: string | undefined) => {
      if (!userId) return
      if (time <= 0) return
      if (submittedRef.current.has(seed)) return
      if (inFlightRef.current.has(seed)) return

      inFlightRef.current.add(seed)
      try {
        const { error } = await supabase.from('game_records').insert({
          user_id: userId,
          seed,
          time_seconds: time,
          flawless,
        })
        if (!error) submittedRef.current.add(seed)
      } finally {
        inFlightRef.current.delete(seed)
      }
    },
    []
  )

  return { submit }
}
