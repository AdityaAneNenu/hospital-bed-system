'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create supabase client once outside the hook
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface Profile {
  id: string
  name: string
  age: number
  sex: string
  role: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (isMounted) {
          if (error) {
            console.error('Session error:', error)
          } else if (session?.user) {
            setUser(session.user)
            await fetchProfile(session.user.id)
          }
          setLoading(false)
          setInitialized(true)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (isMounted) {
          setLoading(false)
          setInitialized(true)
        }
      }
    }

    const fetchProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (isMounted) {
          if (error) {
            console.error('Profile fetch error:', error)
            // Create default profile if none exists
            setProfile({
              id: userId,
              name: 'New User',
              age: 0,
              sex: 'other',
              role: 'patient'
            })
          } else {
            setProfile(data)
          }
        }
      } catch (error) {
        console.error('Profile error:', error)
      }
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (isMounted && initialized) {
          console.log('Auth state changed:', event)
          
          if (session?.user) {
            setUser(session.user)
            await fetchProfile(session.user.id)
          } else {
            setUser(null)
            setProfile(null)
          }
          setLoading(false)
        }
      }
    )

    // Initialize authentication
    initializeAuth()

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [initialized])

  const signOut = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setLoading(false)
    } catch (error) {
      console.error('Sign out error:', error)
      setLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (data) {
        setProfile(data)
      }
    }
  }

  return {
    user,
    profile,
    loading,
    signOut,
    refreshProfile,
    isAuthenticated: !!user && !!profile,
    supabase // Expose supabase client for direct use
  }
}
