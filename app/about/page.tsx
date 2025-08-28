'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Activity, Heart, Users, Award, ArrowLeft } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import { useAuth } from '@/lib/useAuthFixed'

export default function AboutPage() {
  const { user, profile, loading, signOut, isAuthenticated } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Navigation */}
      <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <Heart className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Smart Med Tracker
              </h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                Home
              </Link>
              <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                Dashboard
              </Link>
              <Link href="/about" className="text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 px-3 py-2 rounded-lg">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                Contact
              </Link>
              
              <ThemeToggle />
              
              {isAuthenticated ? (
                <button 
                  onClick={handleSignOut}
                  className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium ml-2"
                >
                  Sign Out
                </button>
              ) : (
                <Link 
                  href="/auth" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl font-medium ml-2"
                >
                  Get Started
                </Link>
              )}
            </nav>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-gray-100 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-6">
            About Smart Med Tracker
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
            We're on a mission to revolutionize healthcare accessibility by providing real-time hospital bed and resource tracking.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Every second counts in healthcare emergencies. Smart Med Tracker was born from the need to bridge the gap between patients seeking urgent care and hospitals with available resources.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                We believe that no one should suffer due to lack of information about hospital availability. Our platform ensures that critical healthcare information is accessible to everyone, when they need it most.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8">
              <Heart className="h-16 w-16 text-red-500 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Saving Lives Through Technology
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our real-time tracking system has helped thousands of patients find the care they need quickly and efficiently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ValueCard
              icon={<Activity className="h-12 w-12 text-blue-600 dark:text-blue-400" />}
              title="Reliability"
              description="Our platform maintains 99.9% uptime to ensure healthcare information is always accessible when needed."
            />
            <ValueCard
              icon={<Users className="h-12 w-12 text-green-600 dark:text-green-400" />}
              title="Accessibility"
              description="We design our platform to be accessible to everyone, regardless of technical expertise or physical abilities."
            />
            <ValueCard
              icon={<Award className="h-12 w-12 text-purple-600 dark:text-purple-400" />}
              title="Excellence"
              description="We continuously improve our platform to provide the most accurate and timely healthcare information."
            />
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Impact
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Making a difference in healthcare accessibility
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StatCard
              number="50,000+"
              label="Patients Helped"
              description="People who found hospital beds through our platform"
            />
            <StatCard
              number="200+"
              label="Partner Hospitals"
              description="Healthcare facilities using our tracking system"
            />
            <StatCard
              number="99.9%"
              label="Uptime"
              description="System reliability for critical healthcare needs"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Join Our Mission
          </h2>
          <p className="text-xl text-blue-100 dark:text-blue-200 mb-8">
            Help us make healthcare more accessible for everyone
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth?mode=signup" 
              className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg"
            >
              Get Started Today
            </Link>
            <Link 
              href="/contact" 
              className="border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-200 font-semibold text-lg"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Activity className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold">Smart Med Tracker</span>
            </div>
            <p className="text-gray-400">
              Connecting patients with healthcare facilities through real-time bed availability tracking.
            </p>
            <div className="mt-8 flex justify-center space-x-6">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
              <Link href="/auth" className="text-gray-400 hover:text-white transition-colors">Sign In</Link>
            </div>
            <div className="border-t border-gray-800 dark:border-gray-700 mt-8 pt-8 text-gray-400">
              <p>&copy; 2025 Smart Med Tracker. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function ValueCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200">
      <div className="flex justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
    </div>
  )
}

function StatCard({ number, label, description }: { number: string, label: string, description: string }) {
  return (
    <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl">
      <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{number}</div>
      <div className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{label}</div>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  )
}
