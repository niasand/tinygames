import { useEffect, useState } from 'react'

import { supabase } from '../lib/supabase'
import type { MyRecord } from '../types/db'

// Fetches the signed-in user's own completion history (newest first).
export const useMyRecords = (userId: string | undefined) => {
  const [records, setRecords] = useState<MyRecord[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) {
      setRecords([])
      return
    }
    setLoading(true)
    void (async () => {
      try {
        const { data, error } = await supabase
          .from('game_records')
          .select('id, seed, time_seconds, flawless, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50)
        if (!error) setRecords((data ?? []) as MyRecord[])
      } finally {
        setLoading(false)
      }
    })()
  }, [userId])

  return { records, loading }
}
