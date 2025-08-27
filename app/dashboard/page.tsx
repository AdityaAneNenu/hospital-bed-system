'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

interface Hospital {
  id: number
  name: string
  address: string
  latitude: number
  longitude: number
  availability?: {
    available_beds: number
    available_oxygen: number
    last_updated: string
  }[]
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string>('patient')
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [updateLoading, setUpdateLoading] = useState(false)
  const router = useRouter()

  // Check if Supabase credentials are configured
  if (!supabaseUrl || !supabaseAnonKey) {
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

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const [error, setError] = useState('')
  
  // Admin form state
  const [selectedHospital, setSelectedHospital] = useState('')
  const [beds, setBeds] = useState('')
  const [oxygen, setOxygen] = useState('')

  useEffect(() => {
    checkAuth()
    loadHospitals()
  }, [])

  const checkAuth = async () => {
    if (supabaseUrl === 'your_project_url_here') {
      setError('Please configure Supabase credentials')
      setLoading(false)
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/')
        return
      }

      setUser(session.user)
      
      // Get user role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
      
      setUserRole(profile?.role || 'patient')
    } catch (error: any) {
      console.error('Auth error:', error)
      setError('Authentication failed')
    }
  }

  const loadHospitals = async () => {
    if (supabaseUrl === 'your_project_url_here') return

    try {
      const { data: hospitals, error } = await supabase
        .from('hospitals')
        .select(`
          id,
          name,
          address,
          latitude,
          longitude,
          availability (
            available_beds,
            available_oxygen,
            last_updated
          )
        `)
        .order('name')

      if (error) throw error
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

    try {
      const { error } = await supabase
        .from('availability')
        .upsert({
          hospital_id: parseInt(selectedHospital),
          available_beds: parseInt(beds),
          available_oxygen: parseInt(oxygen),
          last_updated: new Date().toISOString()
        })

      if (error) throw error
      
      alert('Availability updated successfully!')
      setSelectedHospital('')
      setBeds('')
      setOxygen('')
      loadHospitals() // Refresh data
    } catch (error: any) {
      alert('Error updating availability: ' + error.message)
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Hospital Bed Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{user?.email}</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                {userRole}
              </span>
              <button
                onClick={handleLogout}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Panel */}
        {userRole === 'admin' && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Update Hospital Availability</h2>
            <form onSubmit={updateAvailability} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Hospital
                </label>
                <select
                  value={selectedHospital}
                  onChange={(e) => setSelectedHospital(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Choose a hospital...</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Beds
                  </label>
                  <input
                    type="number"
                    value={beds}
                    onChange={(e) => setBeds(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Oxygen Cylinders
                  </label>
                  <input
                    type="number"
                    value={oxygen}
                    onChange={(e) => setOxygen(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={updateLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {updateLoading ? 'Updating...' : 'Update Availability'}
              </button>
            </form>
          </div>
        )}

        {/* Hospital List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Hospital Availability</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {hospitals.map((hospital) => {
              const availability = hospital.availability?.[0]
              const beds = availability?.available_beds || 0
              const oxygenCount = availability?.available_oxygen || 0
              
              return (
                <div key={hospital.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-1">{hospital.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{hospital.address}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1">{beds}</div>
                      <div className="text-xs text-gray-600 mb-2">Available Beds</div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(beds)}`}>
                        {getStatusText(beds)}
                      </span>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1">{oxygenCount}</div>
                      <div className="text-xs text-gray-600 mb-2">Oxygen Cylinders</div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(oxygenCount)}`}>
                        {getStatusText(oxygenCount)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 text-center pt-3 border-t">
                    Last updated: {availability?.last_updated 
                      ? new Date(availability.last_updated).toLocaleString()
                      : 'Never'
                    }
                  </div>
                </div>
              )
            })}
          </div>
          
          {hospitals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hospital data available. Please configure your Supabase database.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
