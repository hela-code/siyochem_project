'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  FlaskConical,
  Search,
  Menu,
  X,
  User,
  LogOut,
  MessageSquare,
  Brain,
  TrendingUp,
  PlusCircle,
  Send,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import SearchModal from '@/components/ui/SearchModal'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const dropdownRef = useRef(null)

  // Auto-close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isDropdownOpen])

  const handleLogout = () => {
    logout()
    router.push('/')
    setIsMenuOpen(false)
    setIsDropdownOpen(false)
  }

  const navItems = [
    { name: 'Home', path: '/', icon: FlaskConical },
    { name: 'Topics', path: '/topics', icon: TrendingUp },
    { name: 'Feedback', path: '/feedback', icon: MessageSquare },
    { name: 'Quizzes', path: '/quizzes', icon: Brain },
  ]

  const isActivePath = (path) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  return (
    <>
      <nav className="glass-morphism sticky top-0 z-50 border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg"
              >
                <FlaskConical className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-xl font-bold text-gradient">Chem Hub</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActivePath(item.path)
                        ? 'bg-primary-500/20 text-primary-400'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* User menu */}
              {isAuthenticated ? (
                <div className="hidden md:block relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                  >
                    {user?.profile?.avatar ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img src={user.profile.avatar} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="hidden md:block text-gray-300">
                      {user?.profile?.firstName} {user?.profile?.lastName}
                    </span>
                  </button>

                  {/* Dropdown menu */}
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 z-50 glass-card rounded-xl shadow-xl border border-white/20"
                    >
                      <div className="p-4 border-b border-white/10 flex items-center gap-3">
                        {user?.profile?.avatar ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                            <img src={user.profile.avatar} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-white text-sm font-bold">
                              {user?.profile?.firstName?.[0] || ''}{user?.profile?.lastName?.[0] || ''}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">
                            {user?.profile?.firstName} {user?.profile?.lastName}
                          </p>
                          <p className="text-gray-400 text-sm">{user?.email}</p>
                          <p className="text-primary-400 text-xs mt-1 capitalize">{user?.role}</p>
                        </div>
                      </div>

                      <div className="p-2">
                        <Link
                          href="/dashboard"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center space-x-2 w-full px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                        >
                          <TrendingUp className="w-4 h-4" />
                          <span>Dashboard</span>
                        </Link>

                        <Link
                          href={`/profile/${user?.id}`}
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center space-x-2 w-full px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                        >
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </Link>

                        <Link
                          href="/messages"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center space-x-2 w-full px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                        >
                          <Send className="w-4 h-4" />
                          <span>Messages</span>
                        </Link>

                        {user?.role === 'teacher' && (
                          <Link
                            href="/create-quiz"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center space-x-2 w-full px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                          >
                            <PlusCircle className="w-4 h-4" />
                            <span>Create Quiz</span>
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 w-full px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link href="/register" className="btn-primary text-sm py-2 px-4">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden glass-morphism border-b border-white/10 sticky top-16 z-50"
        >
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActivePath(item.path)
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}

            <div className="border-t border-white/10 pt-2 mt-2">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    href={`/profile/${user?.id}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>

                  <Link
                    href="/messages"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  >
                    <Send className="w-4 h-4" />
                    <span>Messages</span>
                  </Link>

                  {user?.role === 'teacher' && (
                    <Link
                      href="/create-quiz"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Create Quiz</span>
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  >
                    <span>Login</span>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 w-full px-3 py-2 btn-primary rounded-lg"
                  >
                    <span>Sign Up</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}

export default Navbar
