import Link from 'next/link'
import { GraduationCap, Users, Heart, ArrowRight, Globe, BookOpen, Clock } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg" />
              <span className="text-xl font-bold">Academics4</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900">
                How It Works
              </Link>
              <Link href="#causes" className="text-gray-600 hover:text-gray-900">
                Our Causes
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link
                href="/register"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Education Knows No Boundaries
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Connect tutors with students affected by crises around the world.
            Every lesson brings hope and opportunity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register/volunteer"
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              <Users className="h-5 w-5 mr-2" />
              Become a Tutor
            </Link>
            <Link
              href="/register/student"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <GraduationCap className="h-5 w-5 mr-2" />
              Register as a Student
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-primary">500+</p>
              <p className="text-gray-600 mt-1">Tutors</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary">1,200+</p>
              <p className="text-gray-600 mt-1">Students Helped</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary">10,000+</p>
              <p className="text-gray-600 mt-1">Hours Tutored</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary">50+</p>
              <p className="text-gray-600 mt-1">Subjects Covered</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Register</h3>
              <p className="text-gray-600">
                Sign up as a tutor or student. Tell us about your subjects
                and availability.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Get Matched</h3>
              <p className="text-gray-600">
                Our admin team carefully matches students with tutors based on
                subjects, language, and availability.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Start Learning</h3>
              <p className="text-gray-600">
                Schedule sessions, track progress, and make a real difference in
                a student&apos;s educational journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Causes */}
      <section id="causes" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">Our Causes</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            We support students affected by crises around the world. Each cause represents
            a community in need of educational support.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Globe className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Gaza Crisis</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Supporting students affected by the ongoing conflict in Gaza.
              </p>
            </div>
            <div className="border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Globe className="h-5 w-5 text-yellow-600" />
                <h3 className="font-semibold">Ukraine Conflict</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Helping displaced Ukrainian students continue their education.
              </p>
            </div>
            <div className="border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Globe className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">Syrian Refugees</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Educational support for Syrian refugee students worldwide.
              </p>
            </div>
            <div className="border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Globe className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold">Afghan Students</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Supporting students affected by changes in Afghanistan.
              </p>
            </div>
            <div className="border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Globe className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold">Yemen Crisis</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Educational assistance for students impacted by the Yemen crisis.
              </p>
            </div>
            <div className="border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Globe className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold">Sudan Conflict</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Helping students affected by the Sudan conflict continue learning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="h-12 w-12 text-white mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            Whether you&apos;re looking to tutor or a student
            seeking educational support, we&apos;re here to help.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center px-6 py-3 bg-white text-primary rounded-lg hover:bg-gray-100 font-medium"
          >
            Join Academics4 Today
            <ArrowRight className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-lg" />
                <span className="text-xl font-bold text-white">Academics4</span>
              </div>
              <p className="text-sm">
                Connecting tutors with students affected by crises worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/register/volunteer" className="hover:text-white">Become a Tutor</Link></li>
                <li><Link href="/register/student" className="hover:text-white">Register as Student</Link></li>
                <li><Link href="/login" className="hover:text-white">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white">How It Works</Link></li>
                <li><Link href="#" className="hover:text-white">FAQ</Link></li>
                <li><Link href="#" className="hover:text-white">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p>&copy; 2024 Academics4. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
