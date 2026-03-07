'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Users, BookOpen, Brain, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setSearchResults([])
    }
  }, [isOpen])

  const handleSearch = async (searchQuery) => {
    setQuery(searchQuery)

    if (searchQuery.trim().length < 2) {
      setSearchResults([])
      return
    }

    setLoading(true)

    setTimeout(() => {
      const mockResults = [
        {
          type: 'topic',
          title: 'Organic Chemistry Basics',
          description: 'Introduction to organic compounds and reactions',
          icon: BookOpen,
          path: '/topics/1',
        },
        {
          type: 'user',
          title: 'John Doe',
          description: 'A/L Chemistry Student',
          icon: Users,
          path: '/profile/1',
        },
        {
          type: 'quiz',
          title: 'Chemical Bonding Quiz',
          description: 'Test your knowledge of chemical bonds',
          icon: Brain,
          path: '/quizzes/1',
        },
      ].filter(
        (result) =>
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.description.toLowerCase().includes(searchQuery.toLowerCase())
      )

      setSearchResults(mockResults)
      setLoading(false)
    }, 300)
  }

  const handleResultClick = (result) => {
    router.push(result.path)
    onClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl z-50 px-4"
          >
            <div className="glass-card rounded-2xl shadow-2xl border border-white/20">
              {/* Search Input */}
              <div className="p-6 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search experiments, chemists, lab tests..."
                    className="input-field pl-12 pr-12"
                    autoFocus
                  />
                  <button
                    onClick={onClose}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Search Results */}
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-300">Scanning the periodic table...</p>
                  </div>
                ) : query.trim().length >= 2 ? (
                  searchResults.length > 0 ? (
                    <div className="p-4">
                      {searchResults.map((result, index) => {
                        const Icon = result.icon
                        return (
                          <motion.button
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                            onClick={() => handleResultClick(result)}
                            className="w-full p-4 flex items-start space-x-4 hover:bg-white/5 rounded-lg transition-colors duration-200 text-left"
                          >
                            <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5 text-primary-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-white font-medium mb-1">{result.title}</h3>
                              <p className="text-gray-400 text-sm">{result.description}</p>
                              <span className="inline-block mt-2 px-2 py-1 bg-white/10 rounded text-xs text-gray-300 capitalize">
                                {result.type}
                              </span>
                            </div>
                          </motion.button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-300">No results found for &quot;{query}&quot;</p>
                      <p className="text-gray-400 text-sm mt-2">Try different keywords or browse topics</p>
                    </div>
                  )
                ) : (
                  <div className="p-8 text-center">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300">Start typing to search</p>
                    <p className="text-gray-400 text-sm mt-2">Search experiments, chemists, and lab tests</p>
                  </div>
                )}
              </div>

              {/* Quick Links */}
              {query.trim().length < 2 && (
                <div className="p-6 border-t border-white/10">
                  <h3 className="text-white font-medium mb-4">Quick Links</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { path: '/topics', icon: BookOpen, label: 'Browse Experiments', sub: 'Explore chemistry reactions' },
                      { path: '/quizzes', icon: Brain, label: 'Run Lab Tests', sub: 'Test your compounds' },
                      { path: '/dashboard', icon: TrendingUp, label: 'Lab Dashboard', sub: 'View your reaction progress' },
                      { path: '/search', icon: Users, label: 'Find Chemists', sub: 'Bond with lab partners' },
                    ].map(({ path, icon: Icon, label, sub }) => (
                      <button
                        key={path}
                        onClick={() => { router.push(path); onClose() }}
                        className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200 text-left"
                      >
                        <Icon className="w-5 h-5 text-primary-400 mb-2" />
                        <p className="text-white text-sm font-medium">{label}</p>
                        <p className="text-gray-400 text-xs">{sub}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default SearchModal
