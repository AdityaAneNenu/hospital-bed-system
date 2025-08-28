'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { User } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

interface UserProfile {
  id: string
  name: string
  age: number
  sex: string
  role: string
}

// Create supabase client outside the hook to avoid recreating it
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    // Function to fetch user profile
    const fetchUserProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (isMounted) {
          if (error) {
            console.error('Error fetching profile:', error)
            // Set default profile if error
            setProfile({
              id: userId,
              name: '',
              age: 0,
              sex: 'other',
              role: 'patient'
            })
          } else {
            setProfile(data)
          }
        }
      } catch (error) {
        console.error('Profile fetch error:', error)
        if (isMounted) {
          setProfile({
            id: userId,
            name: '',
            age: 0,
            sex: 'other',
            role: 'patient'
          })
        }
      }
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (isMounted) {
          if (error) {
            console.error('Session error:', error)
            setLoading(false)
            return
          }

          if (session?.user) {
            setUser(session.user)
            await fetchUserProfile(session.user.id)
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('Initial session error:', error)
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (isMounted) {
          if (session?.user) {
            setUser(session.user)
            await fetchUserProfile(session.user.id)
          } else {
            setUser(null)
            setProfile(null)
          }
          setLoading(false)
        }
      }
    )

    // Get initial session
    getInitialSession()

    // Cleanup function
    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, []) // Empty dependency array

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return {
    user,
    profile,
    loading,
    signOut,
    isAuthenticated: !!user
  }
}
