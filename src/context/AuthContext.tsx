import { createContext, useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'

import { supabase } from '../lib/supabase'

export interface AuthUser {
  id: string
  email: string | null
  nickname: string | null
}

export interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string) => Promise<{ error: string | null }>
  verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  updateNickname: (nickname: string) => Promise<{ error: string | null }>
}

// createContext lives next to the Provider that consumes it; the non-component
// export is intentional, so opt out of the fast-refresh rule for this line.
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// Hydrate the AuthUser shape from a session + their profile row.
const toUser = async (session: Session | null): Promise<AuthUser | null> => {
  if (!session?.user) return null
  const { data } = await supabase
    .from('profiles')
    .select('nickname')
    .eq('id', session.user.id)
    .maybeSingle()
  return {
    id: session.user.id,
    email: session.user.email ?? null,
    nickname: data?.nickname ?? null,
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return
      setUser(await toUser(data.session))
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(await toUser(session))
      setLoading(false)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: window.location.origin,
      },
    })
    return { error: error?.message ?? null }
  }, [])

  const verifyOtp = useCallback(async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
    return { error: error?.message ?? null }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  const updateNickname = useCallback(async (nickname: string) => {
    if (!user) return { error: 'Not signed in' }
    const { error } = await supabase.from('profiles').update({ nickname }).eq('id', user.id)
    if (!error) setUser({ ...user, nickname })
    return { error: error?.message ?? null }
  }, [user])

  return (
    <AuthContext.Provider value={{ user, loading, signIn, verifyOtp, signOut, updateNickname }}>
      {children}
    </AuthContext.Provider>
  )
}
