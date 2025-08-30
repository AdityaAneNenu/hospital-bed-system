'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface Profile {
  id: string
  name: string
  age: number
  sex: string
  role: string
  hospital_name?: string
  address?: string
  phone_number?: string
  avatar_url?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const checkUser = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
        await fetchProfile(session.user.id)
      }
      setLoading(false)
    } catch (error) {
      console.error('Auth error:', error)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Get initial session
    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [checkUser])

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (data) {
        console.log('Profile data loaded:', data)
        setProfile(data)
      } else {
        console.log('No profile data found for user:', userId)
      }
      
      if (error) {
        console.error('Profile fetch error:', error)
      }
    } catch (error) {
      console.error('Profile error:', error)
    }
  }

  const signOut = async () => {
    try {
      console.log('Starting sign out process...')
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        throw error
      }
      console.log('Sign out successful, clearing state...')
      // Clear local state immediately
      setUser(null)
      setProfile(null)
      console.log('Redirecting to home page...')
      // Redirect to home page
      window.location.href = '/'
    } catch (error) {
      console.error('Failed to sign out:', error)
      alert('Failed to sign out. Please try again.')
    } finally {
      setLoading(false)
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
