// Row shapes for Supabase tables / RPC results.

export interface GameRecord {
  id: string
  user_id: string
  seed: string
  time_seconds: number
  flawless: boolean
  created_at: string
}

// What we select for personal history (user_id already known).
export interface MyRecord {
  id: string
  seed: string
  time_seconds: number
  flawless: boolean
  created_at: string
}

// Result row of the get_seed_leaderboard RPC.
export interface LeaderboardRow {
  rank: number
  nickname: string
  time_seconds: number
  flawless: boolean
  is_current_user: boolean
}
