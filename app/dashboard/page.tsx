'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Activity, Bed, MapPin, Phone, Clock, Plus, LogOut, RefreshCw, ArrowLeft, Heart, X, User, Building, Droplets, TrendingUp } from 'lucide-react'
import { useAuth } from '@/lib/useAuthFixed'
import ThemeToggle from '@/components/ThemeToggle'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

interface Hospital {
  id: number
  name: string
  address: string
  phone_number?: string
  latitude: number
  longitude: number
  availability?: {
    available_beds: number
    available_oxygen: number
    last_updated: string
  }[]
}

export default function Dashboard() {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()
  const [hospitals, setHospitals] = useState<Hospital[]>([])

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show nothing while redirecting
  if (!user) {
    return null
  }

  return <DashboardContent user={user} profile={profile} signOut={signOut} />
}

function DashboardContent({ user, profile, signOut }: { 
  user: any, 
  profile: any, 
  signOut: () => Promise<void> 
}) {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [userHospital, setUserHospital] = useState<Hospital | null>(null)
  const [error, setError] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Admin form state
  const [selectedHospital, setSelectedHospital] = useState('')
  const [beds, setBeds] = useState('')
  const [oxygen, setOxygen] = useState('')

  // Create Supabase client only once
  const supabase = useMemo(() => {
    if (!supabaseUrl || !supabaseAnonKey) return null
    return createClient(supabaseUrl, supabaseAnonKey)
  }, [])

  // Debug logging (only when needed)
  console.log('Dashboard - User ID:', user?.id)
  console.log('Dashboard - Profile:', { 
    id: profile?.id, 
    role: profile?.role, 
    hospital_id: profile?.hospital_id,
    name: profile?.name 
  })
  console.log('Dashboard - UserHospital:', userHospital)

  // Check if Supabase credentials are configured
  if (!supabaseUrl || !supabaseAnonKey || !supabase) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Configuration Required
          </h2>
          <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Supabase Configuration Missing
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Please set up your Supabase environment variables to access the dashboard.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (supabase) {
      loadHospitals()
    }
  }, [supabase])

  useEffect(() => {
    if (profile?.role === 'hospital_admin' && profile?.hospital_id && supabase) {
      loadUserHospital()
    }
  }, [profile?.role, profile?.hospital_id, supabase])

  const loadUserHospital = async () => {
    if (!profile?.hospital_id || !supabase) return

    console.log('Loading hospital for hospital_id:', profile.hospital_id)

    try {
      const { data: hospital, error } = await supabase
        .from('hospitals')
        .select(`
          id,
          name,
          address,
          phone_number,
          latitude,
          longitude,
          availability (
            available_beds,
            available_oxygen,
            last_updated
          )
        `)
        .eq('id', profile.hospital_id)
        .single()

      if (error) throw error
      console.log('Loaded hospital data:', hospital)
      setUserHospital(hospital)
      setSelectedHospital(hospital.id.toString()) // Pre-select user's hospital
    } catch (error: any) {
      console.error('Error loading user hospital:', error)
      setError('Failed to load your hospital data')
    }
  }

  const loadHospitals = async () => {
    if (!supabase) return

    try {
      // Try the original nested query first
      let { data: hospitals, error } = await supabase
        .from('hospitals')
        .select(`
          id,
          name,
          address,
          phone_number,
          latitude,
          longitude,
          availability (
            available_beds,
            available_oxygen,
            last_updated
          )
        `)
        .order('name')

      // If the nested query fails or returns no availability data, 
      // try a simpler approach with separate queries
      if (error || !hospitals || hospitals.every(h => !h.availability || h.availability.length === 0)) {
        console.log('Nested query failed or returned no availability, trying alternative approach')
        
        // Get hospitals first
        const { data: hospitalsOnly, error: hospitalsError } = await supabase
          .from('hospitals')
          .select('id, name, address, phone_number, latitude, longitude')
          .order('name')

        if (hospitalsError) throw hospitalsError

        // Get all availability data
        const { data: availabilityData, error: availabilityError } = await supabase
          .from('availability')
          .select('hospital_id, available_beds, available_oxygen, last_updated')

        if (availabilityError) throw availabilityError

        // Manually join the data
        hospitals = hospitalsOnly?.map(hospital => ({
          ...hospital,
          availability: availabilityData?.filter(a => a.hospital_id === hospital.id) || []
        })) || []
      }

      if (error && !hospitals) throw error
      console.log('Loaded hospitals data:', hospitals)
      console.log('First hospital availability structure:', hospitals?.[0]?.availability)
      console.log('Hospital 6 data:', hospitals?.find(h => h.id === 6))
      setHospitals(hospitals || [])
    } catch (error: any) {
      console.error('Error loading hospitals:', error)
      setError('Failed to load hospital data')
    } finally {
      setLoading(false)
    }
  }

  const updateAvailability = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdateLoading(true)
    setError('') // Clear any previous errors

    try {
      // Validate inputs
      if (!beds || !oxygen) {
        throw new Error('Please enter both bed count and oxygen count')
      }

      if (parseInt(beds) < 0 || parseInt(oxygen) < 0) {
        throw new Error('Bed and oxygen counts cannot be negative')
      }

      // For hospital admins, use their hospital ID, for super admins use selected hospital
      const hospitalIdToUpdate = profile?.role === 'hospital_admin' 
        ? profile.hospital_id || userHospital?.id
        : parseInt(selectedHospital)

      if (!hospitalIdToUpdate) {
        throw new Error('No hospital selected or assigned')
      }

      console.log('Updating hospital:', {
        hospitalId: hospitalIdToUpdate,
        beds: parseInt(beds),
        oxygen: parseInt(oxygen),
        userRole: profile?.role,
        userId: user?.id
      })

      // Try to update existing record first
      const { data: updateData, error: updateError } = await supabase
        .from('availability')
        .update({
          available_beds: parseInt(beds),
          available_oxygen: parseInt(oxygen),
          last_updated: new Date().toISOString(),
          updated_by: user.id
        })
        .eq('hospital_id', hospitalIdToUpdate)
        .select()

      console.log('Update response:', { updateData, updateError })
      
      if (updateError) {
        console.error('Update error:', updateError)
        throw new Error(`Database error: ${updateError.message}`)
      }

      // If no rows were updated, insert a new record
      if (!updateData || updateData.length === 0) {
        const { data: insertData, error: insertError } = await supabase
          .from('availability')
          .insert({
            hospital_id: hospitalIdToUpdate,
            available_beds: parseInt(beds),
            available_oxygen: parseInt(oxygen),
            last_updated: new Date().toISOString(),
            updated_by: user.id
          })
          .select()

        console.log('Insert response:', { insertData, insertError })
        
        if (insertError) {
          console.error('Insert error:', insertError)
          throw new Error(`Database error: ${insertError.message}`)
        }
      }
      
      // Success - show success message and reset form
      alert('Availability updated successfully!')
      setBeds('')
      setOxygen('')
      
      // Refresh data
      if (supabase) {
        await loadHospitals()
        if (profile?.role === 'hospital_admin') {
          await loadUserHospital()
        }
      }
      
    } catch (error: any) {
      console.error('Update error:', error)
      const errorMessage = error.message || 'Unknown error occurred'
      setError(`Failed to update availability: ${errorMessage}`)
      alert(`Error updating availability: ${errorMessage}`)
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getStatusColor = (count: number) => {
    if (count >= 20) return 'bg-green-100 text-green-800'
    if (count >= 10) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getStatusText = (count: number) => {
    if (count >= 20) return 'Good'
    if (count >= 10) return 'Moderate'
    return 'Low'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
          <div className="w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
        </div>
        <div className="absolute bottom-0 left-0 transform -translate-x-1/2 translate-y-1/2">
          <div className="w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-64 h-64 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-2xl animate-bounce"></div>
        </div>
      </div>
      
      {/* Header */}
      <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <Heart className="h-8 w-8 text-red-500" />
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Smart Med Tracker
                </h1>
              </Link>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg">
                Dashboard
              </Link>
              <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">About</Link>
              <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">Contact</Link>
              
              {/* Theme Toggle */}
              <ThemeToggle />
              
              <div className="flex items-center space-x-3">
                <div className="text-right mr-2">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{profile?.name || 'User'}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{profile?.role === 'hospital_admin' ? 'Hospital Admin' : profile?.role || 'Patient'}</div>
                </div>
                <Link
                  href="/profile"
                  className="relative flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors group"
                  title="View Profile"
                >
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium ml-2"
                >
                  Sign Out
                </button>
              </div>
            </nav>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <div className="text-right mr-2">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{profile?.name || 'User'}</div>
              </div>
              <button 
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Simplified Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="px-4 py-4 space-y-3">
              <Link
                href="/dashboard"
                className="block text-blue-600 dark:text-blue-400 font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/about"
                className="block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-3">
                  <Link
                    href="/profile"
                    className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt="Profile" 
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    )}
                  </Link>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {profile?.name || 'User'}
                  </span>
                </div>
                <button 
                  onClick={() => {
                    handleLogout()
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Welcome Message */}
        {profile && (
          <div className="relative group mb-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl blur-lg opacity-25 group-hover:opacity-50 transition-opacity duration-500 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 dark:from-blue-700 dark:via-indigo-800 dark:to-purple-900 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden">
              {/* Background decorations */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
              </div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                      <Heart className="h-8 w-8 text-white animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
                        Welcome back, {profile.name || 'User'}! 👋
                      </h2>
                      <div className="flex items-center space-x-2 text-blue-100">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                        <span className="text-sm font-medium">Online • Dashboard Active</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xl text-blue-100/90 mb-6 max-w-3xl leading-relaxed">
                    {profile.role === 'hospital_admin' 
                      ? '🏥 Monitor and manage your hospital\'s real-time bed and oxygen cylinder availability with our advanced healthcare management system.'
                      : '📊 Access comprehensive real-time hospital bed availability across our network and find the healthcare services you need instantly.'
                    }
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="group relative">
                      <div className="absolute -inset-1 bg-white/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative bg-white/20 backdrop-blur-xl text-white px-6 py-3 rounded-2xl flex items-center space-x-3 border border-white/30 hover:bg-white/30 transition-all duration-300">
                        <Activity className="h-5 w-5" />
                        <span className="font-bold">Role: {profile.role === 'hospital_admin' ? 'Hospital Administrator' : profile.role}</span>
                      </div>
                    </div>
                    {profile.role === 'hospital_admin' && userHospital && (
                      <div className="group relative">
                        <div className="absolute -inset-1 bg-white/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative bg-white/20 backdrop-blur-xl text-white px-6 py-3 rounded-2xl flex items-center space-x-3 border border-white/30 hover:bg-white/30 transition-all duration-300">
                          <MapPin className="h-5 w-5" />
                          <span className="font-bold">Managing: {userHospital.name}</span>
                        </div>
                      </div>
                    )}
                    <div className="group relative">
                      <div className="absolute -inset-1 bg-white/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative bg-white/20 backdrop-blur-xl text-white px-6 py-3 rounded-2xl flex items-center space-x-3 border border-white/30 hover:bg-white/30 transition-all duration-300">
                        <Clock className="h-5 w-5" />
                        <span className="font-bold">Live Updates Active</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="hidden xl:block">
                  <div className="relative">
                    <div className="w-48 h-48 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                      <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                        <Activity className="h-20 w-20 text-white animate-pulse" />
                      </div>
                    </div>
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Premium Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Total Hospitals Card */}
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/30 hover:scale-105 transition-all duration-500">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg">
                  <Building className="h-8 w-8 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                    {hospitals.length}
                  </div>
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Active Network
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                Partner Hospitals
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Healthcare facilities in network
              </p>
            </div>
          </div>

          {/* Available Beds Card */}
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/30 hover:scale-105 transition-all duration-500">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                  <Bed className="h-8 w-8 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                    {hospitals.reduce((total, hospital) => {
                      let availability = null
                      if (hospital.availability && Array.isArray(hospital.availability) && hospital.availability.length > 0) {
                        availability = hospital.availability[0]
                      } else if (hospital.availability && !Array.isArray(hospital.availability)) {
                        availability = hospital.availability
                      }
                      return total + (availability?.available_beds || 0)
                    }, 0)}
                  </div>
                  <div className="flex items-center justify-end space-x-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      Real-time
                    </span>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                Available Beds
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Total beds across network
              </p>
            </div>
          </div>

          {/* Oxygen Cylinders Card */}
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/30 hover:scale-105 transition-all duration-500">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-lg">
                  <Droplets className="h-8 w-8 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                    {hospitals.reduce((total, hospital) => {
                      let availability = null
                      if (hospital.availability && Array.isArray(hospital.availability) && hospital.availability.length > 0) {
                        availability = hospital.availability[0]
                      } else if (hospital.availability && !Array.isArray(hospital.availability)) {
                        availability = hospital.availability
                      }
                      return total + (availability?.available_oxygen || 0)
                    }, 0)}
                  </div>
                  <div className="flex items-center justify-end space-x-1">
                    <Activity className="h-4 w-4 text-purple-500 animate-pulse" />
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                      Monitored
                    </span>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                Oxygen Cylinders
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Available oxygen supply units
              </p>
            </div>
          </div>
        </div>

        {/* Hospital Admin's Own Hospital Management */}
        {profile?.role === 'hospital_admin' && userHospital && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-blue-800 dark:text-blue-300 font-bold text-xl flex items-center">
                  <MapPin className="h-6 w-6 mr-2" />
                  Your Hospital
                </h3>
                <div className="bg-blue-600 dark:bg-blue-700 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Live Dashboard
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center text-blue-700 dark:text-blue-300">
                    <strong className="mr-2">Name:</strong> 
                    <span className="font-medium">{userHospital.name}</span>
                  </div>
                  <div className="flex items-start text-blue-700 dark:text-blue-300">
                    <strong className="mr-2">Address:</strong> 
                    <span>{userHospital.address}</span>
                  </div>
                  {userHospital.phone_number && (
                    <div className="flex items-center text-blue-700 dark:text-blue-300">
                      <Phone className="h-4 w-4 mr-2" />
                      <strong className="mr-2">Phone:</strong> 
                      <span>{userHospital.phone_number}</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm border dark:border-gray-600">
                    <div className="text-3xl font-bold text-blue-800 dark:text-blue-300 mb-1">
                      {(() => {
                        let availability = null
                        if (userHospital.availability && Array.isArray(userHospital.availability) && userHospital.availability.length > 0) {
                          availability = userHospital.availability[0]
                        } else if (userHospital.availability && !Array.isArray(userHospital.availability)) {
                          availability = userHospital.availability
                        }
                        return availability?.available_beds || 0
                      })()}
                    </div>
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Bed className="h-4 w-4 mr-1" />
                      Available Beds
                    </div>
                  </div>
                  <div className="text-center bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm border dark:border-gray-600">
                    <div className="text-3xl font-bold text-green-700 dark:text-green-400 mb-1">
                      {(() => {
                        let availability = null
                        if (userHospital.availability && Array.isArray(userHospital.availability) && userHospital.availability.length > 0) {
                          availability = userHospital.availability[0]
                        } else if (userHospital.availability && !Array.isArray(userHospital.availability)) {
                          availability = userHospital.availability
                        }
                        return availability?.available_oxygen || 0
                      })()}
                    </div>
                    <div className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center justify-center">
                      <Activity className="h-4 w-4 mr-1" />
                      Oxygen Cylinders
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <RefreshCw className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
                Update Availability
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Real-time updates
              </div>
            </div>
            
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-600 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400 dark:text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-red-800 dark:text-red-300 font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={updateAvailability} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <Bed className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                    Available Beds
                  </label>
                  <input
                    type="number"
                    value={beds}
                    onChange={(e) => setBeds(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 font-medium"
                    min="0"
                    placeholder={(() => {
                      let availability = null
                      if (userHospital.availability && Array.isArray(userHospital.availability) && userHospital.availability.length > 0) {
                        availability = userHospital.availability[0]
                      } else if (userHospital.availability && !Array.isArray(userHospital.availability)) {
                        availability = userHospital.availability
                      }
                      return `Current: ${availability?.available_beds || 0}`
                    })()}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                    Available Oxygen Cylinders
                  </label>
                  <input
                    type="number"
                    value={oxygen}
                    onChange={(e) => setOxygen(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 transition-all duration-200 font-medium"
                    min="0"
                    placeholder={(() => {
                      let availability = null
                      if (userHospital.availability && Array.isArray(userHospital.availability) && userHospital.availability.length > 0) {
                        availability = userHospital.availability[0]
                      } else if (userHospital.availability && !Array.isArray(userHospital.availability)) {
                        availability = userHospital.availability
                      }
                      return `Current: ${availability?.available_oxygen || 0}`
                    })()}
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={updateLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {updateLoading ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Updating Availability...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    <span>Update Availability</span>
                    <Activity className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Super Admin Panel */}
        {profile?.role === 'admin' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-green-800 dark:text-green-300 font-bold text-xl flex items-center">
                  <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Super Admin Access
                </h3>
                <div className="bg-green-600 dark:bg-green-700 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Full Control
                </div>
              </div>
              <p className="text-green-700 dark:text-green-300 text-sm mt-2">You have super administrator privileges. You can manage all hospitals in the network.</p>
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <RefreshCw className="h-6 w-6 mr-2 text-green-600 dark:text-green-400" />
                Update Any Hospital
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <Activity className="h-4 w-4 mr-1" />
                System-wide control
              </div>
            </div>
            
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400 dark:text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-red-800 dark:text-red-300 font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={updateAvailability} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                  Select Hospital
                </label>
                <select
                  value={selectedHospital}
                  onChange={(e) => setSelectedHospital(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 font-medium"
                  required
                >
                  <option value="">Choose a hospital to manage...</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.name} - {hospital.address}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <Bed className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                    Available Beds
                  </label>
                  <input
                    type="number"
                    value={beds}
                    onChange={(e) => setBeds(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium"
                    min="0"
                    placeholder="Enter bed count"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                    Available Oxygen Cylinders
                  </label>
                  <input
                    type="number"
                    value={oxygen}
                    onChange={(e) => setOxygen(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 font-medium"
                    min="0"
                    placeholder="Enter oxygen count"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={updateLoading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-500 dark:to-emerald-500 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 dark:hover:from-green-600 dark:hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {updateLoading ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Updating Hospital...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Update Hospital Availability</span>
                    <Activity className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Premium Hospital List */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
          <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative px-8 py-6 border-b border-white/20 dark:border-gray-700/50 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 backdrop-blur-xl rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    Hospital Availability Network
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Real-time bed and oxygen availability across our partner hospitals
                  </p>
                </div>
                <div className="hidden lg:flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-2xl border border-green-200 dark:border-green-800">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-green-700 dark:text-green-400">Live Updates</span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-8">
            {hospitals.map((hospital) => {
              // Handle different possible availability data structures
              let availability = null
              if (hospital.availability && Array.isArray(hospital.availability) && hospital.availability.length > 0) {
                availability = hospital.availability[0]
              } else if (hospital.availability && !Array.isArray(hospital.availability)) {
                availability = hospital.availability
              }
              
              const beds = availability?.available_beds || 0
              const oxygenCount = availability?.available_oxygen || 0
              
              return (
                <div key={hospital.id} className="group bg-white dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 rounded-xl p-6 hover:border-blue-200 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{hospital.name}</h3>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${beds > 0 || oxygenCount > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={`text-xs font-medium ${beds > 0 || oxygenCount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {beds > 0 || oxygenCount > 0 ? 'Available' : 'Full'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-start text-sm text-gray-600 dark:text-gray-400 mb-6">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-400 dark:text-gray-500" />
                    <p className="line-clamp-2">{hospital.address}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">{beds}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 flex items-center justify-center">
                        <Bed className="h-3 w-3 mr-1" />
                        Available Beds
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(beds)}`}>
                        {getStatusText(beds)}
                      </span>
                    </div>
                    <div className="text-center bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">{oxygenCount}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 flex items-center justify-center">
                        <Activity className="h-3 w-3 mr-1" />
                        Oxygen Cylinders
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(oxygenCount)}`}>
                        {getStatusText(oxygenCount)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-center pt-4 border-t border-gray-100 dark:border-gray-600">
                    <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="h-3 w-3 mr-1" />
                      Last updated: {availability?.last_updated 
                        ? new Date(availability.last_updated).toLocaleString()
                        : 'Never'
                      }
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {hospitals.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Hospital Data Available</h3>
              <p className="text-gray-500 max-w-md mx-auto">Please configure your Supabase database to view hospital information.</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}
