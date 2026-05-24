'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Tables } from '@/types/supabase'

export type AuthUser = User
export type UserProfile = Tables<'profiles'>

export interface AuthState {
  user: AuthUser | null
  profile: UserProfile | null
  loading: boolean
}

export function useAuthUser(): AuthState {
  const [state, setState] = useState<AuthState>({ user: null, profile: null, loading: true })

  useEffect(() => {
    const supabase = createClient()

    const fetchProfile = async (user: AuthUser) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setState({ user, profile, loading: false })
    }

    // Initial session check
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) fetchProfile(user)
      else setState({ user: null, profile: null, loading: false })
    })

    // Subscribe to auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) fetchProfile(session.user)
      else setState({ user: null, profile: null, loading: false })
    })

    return () => subscription.unsubscribe()
  }, [])

  return state
}
