'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'
import { User, Heart, ArrowLeft, Edit, X, Check, Mail, Phone, MapPin, Building2, Calendar, Users, Camera, Trash2 } from 'lucide-react'
import { useAuth } from '@/lib/useAuthFixed'
import ThemeToggle from '@/components/ThemeToggle'
import { AuthGuard } from '@/components/AuthGuard'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface ProfileData {
  name: string
  age: number
  sex: string
  phone_number: string
  hospital_name?: string
  address?: string
  avatar_url?: string
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  )
}

function ProfileContent() {
  const { user, profile, loading: authLoading, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    age: 0,
    sex: '',
    phone_number: '',
    hospital_name: '',
    address: '',
    avatar_url: ''
  })

  const [originalData, setOriginalData] = useState<ProfileData>({
    name: '',
    age: 0,
    sex: '',
    phone_number: '',
    hospital_name: '',
    address: '',
    avatar_url: ''
  })

  const fetchHospitalName = useCallback(async (userId: string) => {
    try {
      // Try to get hospital name from hospitals table where the admin is linked
      const { data, error } = await supabase
        .from('hospitals')
        .select('name')
        .eq('admin_id', userId)
        .single()

      if (data && !error) {
        const updatedProfileData = {
          ...formData,
          hospital_name: data.name
        }
        setFormData(updatedProfileData)
        setOriginalData(updatedProfileData)
        
        // Also update the profile in the database
        await supabase
          .from('profiles')
          .update({ hospital_name: data.name })
          .eq('id', userId)
      }
    } catch (error) {
      console.error('Error fetching hospital name:', error)
    }
  }, [formData])

  useEffect(() => {
    if (profile) {
      const profileData = {
        name: profile.name || '',
        age: profile.age || 0,
        sex: profile.sex || '',
        phone_number: profile.phone_number || '',
        hospital_name: profile.hospital_name || '',
        address: profile.address || '',
        avatar_url: profile.avatar_url || ''
      }
      setFormData(profileData)
      setOriginalData(profileData)
      
      // If user is hospital admin and hospital_name is empty, fetch it from hospitals table
      if (profile.role === 'hospital_admin' && !profile.hospital_name && user) {
        fetchHospitalName(user.id)
      }
    }
  }, [profile, user, fetchHospitalName])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) || 0 : value
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    setUploadingImage(true)
    setError('')

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update form data
      setFormData(prev => ({
        ...prev,
        avatar_url: publicUrl
      }))

      setSuccess('Profile picture uploaded successfully!')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image'
      setError(errorMessage)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveProfilePicture = async () => {
    try {
      setUploadingImage(true)
      setError('')

      // Remove from form data
      setFormData(prev => ({
        ...prev,
        avatar_url: ''
      }))

      setSuccess('Profile picture removed successfully!')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove profile picture'
      setError(errorMessage)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSave = async () => {
    if (!user || !profile) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Prepare update data - exclude hospital_name for hospital admins
      const updateData: Record<string, unknown> = {
        name: formData.name,
        age: formData.age,
        sex: formData.sex,
        phone_number: formData.phone_number,
        address: formData.address,
        avatar_url: formData.avatar_url
      }

      // Only include hospital_name if user is not a hospital admin
      if (profile.role !== 'hospital_admin') {
        updateData.hospital_name = formData.hospital_name
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)

      if (updateError) throw updateError

      setOriginalData(formData)
      setIsEditing(false)
      setSuccess('Profile updated successfully!')
      
      // Refresh the page to get updated profile data
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData(originalData)
    setIsEditing(false)
    setError('')
    setSuccess('')
  }

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData)

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
              <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                Dashboard
              </Link>
              <Link href="/profile" className="text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-3 py-2 rounded-lg">
                Profile
              </Link>
              <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                Contact
              </Link>
              
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
                <ThemeToggle />
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{profile?.name || 'User'}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
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
                <div className="text-xs text-gray-500 dark:text-gray-400">Profile</div>
              </div>
              <button 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsMobileMenuOpen(false)}></div>
              <div className="relative flex w-full max-w-xs flex-col bg-white dark:bg-gray-900 pb-12 shadow-xl">
                <div className="flex px-4 pb-2 pt-5">
                  <button
                    type="button"
                    className="-m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:text-gray-500"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6 border-t border-gray-200 dark:border-gray-700 px-4 py-6">
                  <div className="flow-root">
                    <Link
                      href="/dashboard"
                      className="-m-2 block p-2 font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </div>
                  <div className="flow-root">
                    <Link
                      href="/profile"
                      className="-m-2 block p-2 font-medium text-blue-600 dark:text-blue-400"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                  </div>
                  <div className="flow-root">
                    <Link
                      href="/about"
                      className="-m-2 block p-2 font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      About
                    </Link>
                  </div>
                  <div className="flow-root">
                    <Link
                      href="/contact"
                      className="-m-2 block p-2 font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Contact
                    </Link>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-6">
                  <div className="space-y-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Welcome, {profile?.name || 'User'}!
                    </div>
                    <button 
                      onClick={() => {
                        handleSignOut()
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
          {/* Enhanced Profile Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8 mb-8">
            {/* Enhanced Profile Picture Section */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600" style={{outline: 'none', border: 'none', boxShadow: 'none'}}>
                {formData.avatar_url ? (
                  <Image 
                    src={formData.avatar_url} 
                    alt="Profile" 
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                    style={{outline: 'none', border: 'none', boxShadow: 'none'}}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                    <User className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
                  </div>
                )}
              </div>
              
              {/* Enhanced Upload/Delete Buttons */}
              {isEditing && (
                <div className="absolute -bottom-1 -right-1 flex space-x-1">
                  {/* Upload Button */}
                  <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-xl transition-all duration-200 hover:scale-110 group-hover:scale-105">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    {uploadingImage ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Camera className="h-5 w-5" />
                    )}
                  </label>
                  
                  {/* Delete Button - only show if there's a profile picture */}
                  {formData.avatar_url && (
                    <button
                      onClick={handleRemoveProfilePicture}
                      disabled={uploadingImage}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white p-3 rounded-full shadow-xl transition-all duration-200 hover:scale-110 group-hover:scale-105"
                      title="Remove profile picture"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}
              
              {/* Upload Instruction */}
              {isEditing && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {formData.avatar_url ? 'Upload new or remove current photo' : 'Click to upload photo'}
                  </div>
                </div>
              )}
            </div>
            
            {/* Profile Info */}
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {profile?.name || 'User Profile'}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                <p className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                  {profile?.role === 'hospital_admin' ? '🏥 Hospital Administrator' : '👤 Patient'}
                </p>
                {profile?.hospital_name && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    📍 {profile.hospital_name}
                  </p>
                )}
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mt-4 sm:max-w-md">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {profile?.age || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Age</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {profile?.sex || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Gender</div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col space-y-3 sm:space-y-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 hover:shadow-lg font-medium"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={handleCancel}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 font-medium"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges || loading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 font-medium hover:shadow-lg"
                  >
                    {loading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-600 dark:text-green-400">{success}</p>
            </div>
          )}

          {/* Profile Information */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Basic Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{profile?.name || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-900 dark:text-white">{user?.email}</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Email cannot be changed from this page
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Age
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    min="1"
                    max="120"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your age"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900 dark:text-white">{profile?.age || 'Not specified'} years old</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gender
                </label>
                {isEditing ? (
                  <select
                    name="sex"
                    value={formData.sex}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900 dark:text-white capitalize">{profile?.sex || 'Not specified'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact & Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Contact Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900 dark:text-white">{profile?.phone_number || 'Not specified'}</p>
                  </div>
                )}
              </div>

              {profile?.role === 'hospital_admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hospital Name
                  </label>
                  {/* Hospital name is not editable for admins */}
                  <div className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <p className="flex-1">{profile?.hospital_name || 'Loading hospital information...'}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Cannot be edited</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Hospital name is managed by system administrators
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your address"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900 dark:text-white">{profile?.address || 'Not specified'}</p>
                  </div>
                )}
              </div>

              {/* Role Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Type
                </label>
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    profile?.role === 'hospital_admin' 
                      ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300'
                      : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                  }`}>
                    {profile?.role === 'hospital_admin' ? 'Hospital Administrator' : 'Patient'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
