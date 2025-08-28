'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff, Activity, User, Building2, Heart } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function AuthForm() {
  // Common fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  
  // Role selection
  const [userType, setUserType] = useState('') // 'patient' or 'hospital_admin'
  
  // Patient fields
  const [patientName, setPatientName] = useState('')
  const [age, setAge] = useState('')
  const [sex, setSex] = useState('')
  
  // Hospital Admin fields
  const [adminName, setAdminName] = useState('')
  const [hospitalName, setHospitalName] = useState('')
  const [address, setAddress] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  useEffect(() => {
    const mode = searchParams.get('mode')
    if (mode === 'signup') {
      setIsSignUp(true)
    }
  }, [searchParams])

  const validatePatientForm = () => {
    if (!patientName.trim()) throw new Error('Name is required')
    if (!age || parseInt(age) <= 0 || parseInt(age) > 150) {
      throw new Error('Please enter a valid age between 1 and 150')
    }
    if (!sex) throw new Error('Please select your sex')
  }

  const validateHospitalAdminForm = () => {
    if (!adminName.trim()) throw new Error('Admin name is required')
    if (!hospitalName.trim()) throw new Error('Hospital name is required')
    if (!address.trim()) throw new Error('Address is required')
    if (!phoneNumber.trim()) throw new Error('Phone number is required')
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        if (!userType) throw new Error('Please select user type')
        
        // Validate based on user type
        if (userType === 'patient') {
          validatePatientForm()
        } else if (userType === 'hospital_admin') {
          validateHospitalAdminForm()
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        
        // Update the user profile with the additional information
        if (data.user) {
          console.log('User Type Selected:', userType)
          console.log('User ID:', data.user.id)
          
          if (userType === 'patient') {
            // Handle patient registration
            const profileData = {
              id: data.user.id,
              name: patientName.trim(),
              age: parseInt(age),
              sex: sex,
              role: 'patient'
            }

            console.log('Profile Data to Insert:', profileData)

            const { data: upsertData, error: profileError } = await supabase
              .from('profiles')
              .upsert(profileData, { 
                onConflict: 'id',
                ignoreDuplicates: false 
              })
              .select()
            
            if (profileError) {
              console.error('Profile upsert error:', profileError)
              alert('Failed to create profile: ' + profileError.message)
              return
            }
            
            console.log('Patient profile created successfully:', upsertData)
            
          } else if (userType === 'hospital_admin') {
            // Handle hospital admin registration
            try {
              // First update the profile to hospital_admin role
              const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                  id: data.user.id,
                  name: adminName.trim(),
                  age: 0,
                  sex: 'other',
                  role: 'hospital_admin',
                  phone_number: phoneNumber.trim()
                }, { 
                  onConflict: 'id',
                  ignoreDuplicates: false 
                })
              
              if (profileError) {
                console.error('Profile update error:', profileError)
                alert('Failed to update profile: ' + profileError.message)
                return
              }

              // Create the hospital and link it to the admin
              const { data: hospitalData, error: hospitalError } = await supabase
                .rpc('create_hospital_for_admin', {
                  admin_id: data.user.id,
                  hospital_name: hospitalName.trim(),
                  hospital_address: address.trim(),
                  hospital_phone: phoneNumber.trim()
                })

              if (hospitalError) {
                console.error('Hospital creation error:', hospitalError)
                alert('Failed to create hospital: ' + hospitalError.message)
                return
              }

              console.log('Hospital created successfully with ID:', hospitalData)
              
            } catch (error: any) {
              console.error('Hospital admin registration error:', error)
              alert('Failed to complete hospital admin registration: ' + error.message)
              return
            }
          }
        }
        
        alert(`${userType === 'patient' ? 'Patient' : 'Hospital Admin'} account created! Check your email for the confirmation link!`)
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/')
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setUserType('')
    setPatientName('')
    setAge('')
    setSex('')
    setAdminName('')
    setHospitalName('')
    setAddress('')
    setPhoneNumber('')
  }

  return (
    <>
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <Heart className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Smart Med Tracker
              </h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-50">
                Home
              </Link>
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-50">
                Dashboard
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-50">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                Contact
              </Link>
              
              <ThemeToggle />
              
              <Link 
                href="/auth" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium ml-2"
              >
                Sign In
              </Link>
            </nav>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                className="text-gray-700 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => {/* TODO: Add mobile menu toggle */}}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="mt-2 text-gray-600">
              {isSignUp 
                ? 'Join Smart Med Tracker to access real-time hospital data' 
                : 'Sign in to access your dashboard'
              }
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form className="space-y-6" onSubmit={handleAuth}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* User Type Selection for Signup */}
              {isSignUp && !userType && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 text-center">
                    Select Account Type
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <button
                      type="button"
                      onClick={() => setUserType('patient')}
                      className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                    >
                      <User className="h-8 w-8 text-blue-600 mr-4" />
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">Patient</div>
                        <div className="text-sm text-gray-600">Find and track hospital bed availability</div>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setUserType('hospital_admin')}
                      className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                    >
                      <Building2 className="h-8 w-8 text-blue-600 mr-4" />
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">Hospital Admin</div>
                        <div className="text-sm text-gray-600">Manage hospital data and bed availability</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Show form based on user type or for sign in */}
              {(!isSignUp || userType) && (
                <>
                  {/* Common Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {/* Patient Registration Fields */}
                  {isSignUp && userType === 'patient' && (
                    <>
                      <div>
                        <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          id="patientName"
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter your full name"
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                            Age *
                          </label>
                          <input
                            id="age"
                            type="number"
                            required
                            min="1"
                            max="150"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Age"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                          />
                        </div>

                        <div>
                          <label htmlFor="sex" className="block text-sm font-medium text-gray-700 mb-2">
                            Sex *
                          </label>
                          <select
                            id="sex"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            value={sex}
                            onChange={(e) => setSex(e.target.value)}
                          >
                            <option value="">Select...</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Hospital Admin Registration Fields */}
                  {isSignUp && userType === 'hospital_admin' && (
                    <>
                      <div>
                        <label htmlFor="adminName" className="block text-sm font-medium text-gray-700 mb-2">
                          Admin Name *
                        </label>
                        <input
                          id="adminName"
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter admin name"
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                        />
                      </div>

                      <div>
                        <label htmlFor="hospitalName" className="block text-sm font-medium text-gray-700 mb-2">
                          Hospital Name *
                        </label>
                        <input
                          id="hospitalName"
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter hospital name"
                          value={hospitalName}
                          onChange={(e) => setHospitalName(e.target.value)}
                        />
                      </div>

                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                          Address *
                        </label>
                        <textarea
                          id="address"
                          required
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter hospital address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                      </div>

                      <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          id="phoneNumber"
                          type="tel"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter phone number"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
                  </button>

                  {/* Back button for signup */}
                  {isSignUp && userType && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="w-full text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      ← Back to account type selection
                    </button>
                  )}
                </>
              )}
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                className="text-blue-600 hover:text-blue-500 font-medium"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  resetForm()
                }}
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : 'Need an account? Sign up'
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function AuthPage() {
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
                    <p>Please set up your Supabase environment variables.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Suspense fallback={<div>Loading...</div>}>
        <AuthForm />
      </Suspense>
    </div>
  )
}
