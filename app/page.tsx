'use client'

import Link from 'next/link'
import { Heart, Activity, Users, MapPin, ArrowRight, Building2, Phone, Mail, Shield, User, X, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/useAuthFixed'
import ThemeToggle from '@/components/ThemeToggle'
import { useState } from 'react'

export default function Home() {
  const { user, profile, loading, signOut, isAuthenticated } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  // Simple, fast loading check
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200"></div>
          <div className="h-96 bg-gray-100"></div>
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
              <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">Dashboard</Link>
              <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">About</Link>
              <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">Contact</Link>
              
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
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
                    onClick={handleSignOut}
                    className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium ml-2"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link href="/auth" className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl font-medium ml-2">
                  Sign In
                </Link>
              )}
            </nav>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
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
                  {isAuthenticated ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Link
                          href="/profile"
                          className="relative flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors group"
                          title="View Profile"
                          onClick={() => setIsMobileMenuOpen(false)}
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
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Welcome, {profile?.name || 'User'}!
                        </div>
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
                  ) : (
                    <Link 
                      href="/auth" 
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-center block"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-800 dark:via-blue-900 dark:to-indigo-900 text-white py-24 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
        {/* Enhanced animated background */}
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
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-5xl mx-auto">
            {/* Enhanced badge */}
            <div className="inline-flex items-center px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-8 hover:bg-white/20 transition-all duration-300">
              <Heart className="h-4 w-4 mr-2 text-red-400" />
              Smart Healthcare Management
              <div className="w-2 h-2 bg-green-400 rounded-full ml-3 animate-pulse"></div>
            </div>

            <h2 className="text-6xl md:text-8xl font-black mb-8 leading-tight tracking-tight">
              <span className="block text-white drop-shadow-2xl">Real-Time</span>
              <span className="block bg-gradient-to-r from-blue-200 via-cyan-200 to-indigo-200 bg-clip-text text-transparent animate-pulse">
                Hospital Intelligence
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl mb-12 text-blue-100/90 max-w-4xl mx-auto leading-relaxed font-light">
              🏥 Monitor bed availability • 🫁 Track oxygen levels • 📊 Analyze patient capacity
              <br />
              <span className="text-lg opacity-80">Make data-driven decisions for superior healthcare management</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Link 
                href="/dashboard" 
                className="group relative bg-white text-blue-600 px-12 py-5 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all duration-500 shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-2 hover:scale-105 flex items-center overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                <Activity className="h-6 w-6 mr-3 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" />
                <span className="relative z-10">View Dashboard</span>
                <svg className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              
              <Link 
                href="/auth" 
                className="group relative border-2 border-white/30 backdrop-blur-md bg-white/10 text-white px-12 py-5 rounded-2xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 flex items-center overflow-hidden"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Users className="h-6 w-6 mr-3 group-hover:scale-125 group-hover:-rotate-12 transition-all duration-300 relative z-10" />
                <span className="relative z-10">Get Started</span>
              </Link>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Real-Time Monitoring</h3>
                <p className="text-blue-100/80 text-sm">Live updates on bed availability and hospital capacity</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Smart Analytics</h3>
                <p className="text-blue-100/80 text-sm">AI-powered insights for better healthcare decisions</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Multi-Role Access</h3>
                <p className="text-blue-100/80 text-sm">Tailored interfaces for patients and administrators</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Account Info Section - Show when user is logged in */}
      {isAuthenticated && profile && (
        <section className="py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/50 hover:shadow-3xl transition-all duration-500">
              {/* Welcome Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium mb-4">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                  Account Active
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                  Welcome back, {profile.name}! 👋
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Your healthcare dashboard is ready</p>
              </div>

              {/* Enhanced Account Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* User Type Card */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      {profile.role === 'hospital_admin' ? (
                        <Building2 className="h-6 w-6 text-white" />
                      ) : (
                        <User className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs opacity-80">Account Type</div>
                      <div className="font-semibold">
                        {profile.role === 'hospital_admin' ? '🏥 Hospital Admin' : '👤 Patient'}
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-white/20 pt-4">
                    <div className="text-sm opacity-90">
                      {profile.role === 'hospital_admin' 
                        ? 'Manage hospital data and availability' 
                        : 'View hospital availability and book services'
                      }
                    </div>
                  </div>
                </div>

                {/* Hospital Info Card */}
                {profile.hospital_name && (
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Heart className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-xs opacity-80">Hospital</div>
                        <div className="font-semibold text-sm">{profile.hospital_name}</div>
                      </div>
                    </div>
                    <div className="border-t border-white/20 pt-4">
                      <div className="text-sm opacity-90">Healthcare facility</div>
                    </div>
                  </div>
                )}

                {/* Quick Actions Card */}
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-xs opacity-80">Quick Access</div>
                      <div className="font-semibold">Dashboard</div>
                    </div>
                  </div>
                  <div className="border-t border-white/20 pt-4">
                    <Link 
                      href="/dashboard" 
                      className="inline-flex items-center text-sm hover:underline"
                    >
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Link 
                  href="/dashboard" 
                  className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-center hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl flex items-center justify-center"
                >
                  <Activity className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Access Dashboard
                </Link>
                <Link 
                  href="/profile" 
                  className="group bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 px-8 py-4 rounded-xl font-semibold text-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl flex items-center justify-center"
                >
                  <User className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Manage Profile
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Enhanced Features Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm font-medium mb-6">
              <Heart className="h-4 w-4 mr-2" />
              Powerful Features
            </div>
            <h3 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
              Everything You Need for
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Smart Healthcare
              </span>
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Our platform revolutionizes hospital bed management with cutting-edge technology, 
              real-time analytics, and intuitive interfaces designed for healthcare professionals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Real-Time Monitoring Card */}
            <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20 dark:border-gray-700/50 transform hover:-translate-y-3 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <Activity className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Real-Time Monitoring
                </h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  Track bed availability, patient status, and hospital capacity across multiple facilities with instant updates and smart notifications.
                </p>
                <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-2 transition-transform">
                  Learn more <ArrowRight className="h-4 w-4 ml-2" />
                </div>
              </div>
            </div>
            
            {/* Capacity Management Card */}
            <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20 dark:border-gray-700/50 transform hover:-translate-y-3 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  Smart Analytics
                </h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  AI-powered insights for optimal bed allocation, patient flow optimization, and predictive capacity planning for better outcomes.
                </p>
                <div className="flex items-center text-green-600 dark:text-green-400 font-medium group-hover:translate-x-2 transition-transform">
                  Explore features <ArrowRight className="h-4 w-4 ml-2" />
                </div>
              </div>
            </div>
            
            {/* Location-Based Card */}
            <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20 dark:border-gray-700/50 transform hover:-translate-y-3 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Multi-Role Access
                </h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  Tailored interfaces for patients and administrators with location-based services, directions, and regional healthcare insights.
                </p>
                <div className="flex items-center text-purple-600 dark:text-purple-400 font-medium group-hover:translate-x-2 transition-transform">
                  Get started <ArrowRight className="h-4 w-4 ml-2" />
                </div>
              </div>
            </div>
          </div>

          {/* Feature Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            <div className="text-center">
              <div className="text-4xl font-black text-blue-600 dark:text-blue-400 mb-2">99.9%</div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-green-600 dark:text-green-400 mb-2">500+</div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Hospitals</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-purple-600 dark:text-purple-400 mb-2">24/7</div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Support</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mb-2">Real-time</div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Updates</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white dark:bg-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Trusted by Healthcare Providers</h3>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Join thousands of healthcare professionals who rely on our platform for critical decision making.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 group-hover:shadow-lg transition-all duration-300">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-3">24/7</div>
                <div className="text-gray-700 font-semibold text-lg">Monitoring</div>
                <div className="text-sm text-gray-500 mt-2">Continuous surveillance</div>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 group-hover:shadow-lg transition-all duration-300">
                <div className="text-4xl md:text-5xl font-bold text-green-600 mb-3">150+</div>
                <div className="text-gray-700 font-semibold text-lg">Hospitals</div>
                <div className="text-sm text-gray-500 mt-2">Partner facilities</div>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 group-hover:shadow-lg transition-all duration-300">
                <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-3">5000+</div>
                <div className="text-gray-700 font-semibold text-lg">Beds Tracked</div>
                <div className="text-sm text-gray-500 mt-2">Real-time updates</div>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-8 group-hover:shadow-lg transition-all duration-300">
                <div className="text-4xl md:text-5xl font-bold text-indigo-600 mb-3">99.9%</div>
                <div className="text-gray-700 font-semibold text-lg">Uptime</div>
                <div className="text-sm text-gray-500 mt-2">Reliable service</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        {/* Background animations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 animate-pulse"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-bounce"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-bounce delay-1000"></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/20 backdrop-blur-lg text-white text-sm font-medium mb-8">
            <Shield className="h-4 w-4 mr-2" />
            Trusted by 500+ Healthcare Facilities
          </div>
          
          <h3 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">
            Ready to Transform
            <span className="block text-transparent bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text">
              Healthcare Management?
            </span>
          </h3>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
            Join thousands of healthcare professionals who trust our platform for intelligent 
            bed management, real-time monitoring, and data-driven insights.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link 
              href="/auth" 
              className="group relative px-10 py-5 bg-white text-blue-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-white/25 transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 min-w-[200px]"
            >
              <span className="relative z-10 flex items-center justify-center">
                Get Started Free
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            
            <Link 
              href="/contact" 
              className="group px-10 py-5 border-2 border-white/30 text-white rounded-2xl font-bold text-lg backdrop-blur-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300 transform hover:scale-105 min-w-[200px] flex items-center justify-center"
            >
              Schedule Demo
              <Building2 className="h-5 w-5 ml-2 group-hover:scale-110 transition-transform" />
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-white/20">
            <div className="text-center">
              <div className="text-3xl font-black text-white mb-2">ISO 27001</div>
              <div className="text-blue-200 text-sm">Certified Security</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-white mb-2">HIPAA</div>
              <div className="text-blue-200 text-sm">Compliant</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-white mb-2">99.9%</div>
              <div className="text-blue-200 text-sm">SLA Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-white mb-2">24/7</div>
              <div className="text-blue-200 text-sm">Expert Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Smart Med Tracker
                </span>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed mb-6 max-w-md">
                Revolutionizing healthcare management with intelligent bed tracking, 
                real-time analytics, and seamless integration across multiple facilities.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <Heart className="h-5 w-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <Phone className="h-5 w-5" />
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="font-bold text-lg mb-6 text-white">Quick Links</h5>
              <div className="space-y-4">
                <Link href="/dashboard" className="block text-gray-400 hover:text-blue-400 transition-colors font-medium">
                  Dashboard
                </Link>
                <Link href="/about" className="block text-gray-400 hover:text-blue-400 transition-colors font-medium">
                  About Us
                </Link>
                <Link href="/contact" className="block text-gray-400 hover:text-blue-400 transition-colors font-medium">
                  Contact
                </Link>
                <Link href="/auth" className="block text-gray-400 hover:text-blue-400 transition-colors font-medium">
                  Get Started
                </Link>
              </div>
            </div>
            
            <div>
              <h5 className="font-bold text-lg mb-6 text-white">Contact Info</h5>
              <div className="space-y-4">
                <div className="flex items-center text-gray-400">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center mr-3">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center mr-3">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span>info@hospitaltracker.com</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center mr-3">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span>Healthcare District, Medical City</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              &copy; 2025 Smart Med Tracker. All rights reserved. 
              <span className="ml-2 text-blue-400">Privacy Policy</span> • 
              <span className="ml-2 text-blue-400">Terms of Service</span>
            </p>
            <div className="text-sm text-gray-500">
              Made with ❤️ for Healthcare Professionals
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
