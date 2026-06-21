import { useEffect, useState } from 'react'

import { supabase } from '../lib/supabase'
import type { LeaderboardRow } from '../types/db'

// Fetches the best-times leaderboard for a given seed via the security-definer
// RPC. Anonymous viewers allowed (is_current_user will be false for all rows).
export const useLeaderboard = (seed: string | undefined) => {
  const [rows, setRows] = useState<LeaderboardRow[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!seed) {
      setRows([])
      return
    }
    setLoading(true)
    void (async () => {
      try {
        const { data, error } = await supabase.rpc('get_seed_leaderboard', { p_seed: seed, p_limit: 20 })
        if (!error) setRows((data ?? []) as LeaderboardRow[])
      } finally {
        setLoading(false)
      }
    })()
  }, [seed])

  return { rows, loading }
}
