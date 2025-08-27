'use client'

import Link from 'next/link'
import { Activity, Heart, Users, Award, ArrowLeft } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
            
            <div className="flex items-center space-x-2">
              <Activity className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                MedTracker
              </span>
            </div>

            <Link 
              href="/auth" 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-6">
            About MedTracker
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
            We're on a mission to revolutionize healthcare accessibility by providing real-time hospital bed and resource tracking.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Every second counts in healthcare emergencies. MedTracker was born from the need to bridge the gap between patients seeking urgent care and hospitals with available resources.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                We believe that no one should suffer due to lack of information about hospital availability. Our platform ensures that critical healthcare information is accessible to everyone, when they need it most.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-8">
              <Heart className="h-16 w-16 text-red-500 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Saving Lives Through Technology
              </h3>
              <p className="text-gray-600">
                Our real-time tracking system has helped thousands of patients find the care they need quickly and efficiently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ValueCard
              icon={<Activity className="h-12 w-12 text-blue-600" />}
              title="Reliability"
              description="Our platform maintains 99.9% uptime to ensure healthcare information is always accessible when needed."
            />
            <ValueCard
              icon={<Users className="h-12 w-12 text-green-600" />}
              title="Accessibility"
              description="We design our platform to be accessible to everyone, regardless of technical expertise or physical abilities."
            />
            <ValueCard
              icon={<Award className="h-12 w-12 text-purple-600" />}
              title="Excellence"
              description="We continuously improve our platform to provide the most accurate and timely healthcare information."
            />
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Impact
            </h2>
            <p className="text-xl text-gray-600">
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
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Join Our Mission
          </h2>
          <p className="text-xl text-blue-100 mb-8">
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
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Activity className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold">MedTracker</span>
            </div>
            <p className="text-gray-400">
              Connecting patients with healthcare facilities through real-time bed availability tracking.
            </p>
            <div className="mt-8 flex justify-center space-x-6">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
              <Link href="/auth" className="text-gray-400 hover:text-white transition-colors">Sign In</Link>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-gray-400">
              <p>&copy; 2025 MedTracker. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function ValueCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200">
      <div className="flex justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}

function StatCard({ number, label, description }: { number: string, label: string, description: string }) {
  return (
    <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
      <div className="text-4xl font-bold text-blue-600 mb-2">{number}</div>
      <div className="text-xl font-semibold text-gray-900 mb-2">{label}</div>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
