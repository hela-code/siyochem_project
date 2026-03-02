'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Search as SearchIcon,
  Users,
  BookOpen,
  Brain,
  Filter,
  X,
  TrendingUp,
} from 'lucide-react'

const tabs = [
  { id: 'all', label: 'All', icon: SearchIcon },
  { id: 'topics', label: 'Topics', icon: BookOpen },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'quizzes', label: 'Quizzes', icon: Brain },
]

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'Organic Chemistry', label: 'Organic Chemistry' },
  { value: 'Inorganic Chemistry', label: 'Inorganic Chemistry' },
  { value: 'Physical Chemistry', label: 'Physical Chemistry' },
  { value: 'Analytical Chemistry', label: 'Analytical Chemistry' },
]

const mockResults = {
  topics: [
    { id: '1', title: 'Understanding Chemical Bonding', description: 'Discussion on ionic, covalent, and metallic bonds', author: 'Sarah Johnson', category: 'Physical Chemistry', stats: { likes: 45, posts: 23, views: 156 } },
  ],
  users: [
    { id: '1', title: 'Dr. Sarah Johnson', description: 'Chemistry teacher with 5+ years experience', username: 'sarahjohnson', role: 'teacher', stats: { posts: 45, followers: 234 } },
  ],
  quizzes: [
    { id: '1', title: 'Chemical Bonding Fundamentals', description: 'Test your understanding of chemical bonds', author: 'Dr. Sarah Johnson', category: 'Physical Chemistry', difficulty: 'medium', stats: { attempts: 234, averageScore: 78 } },
  ],
}

const getResultPath = (result) => {
  if (result.type === 'topic') return `/topics/${result.id}`
  if (result.type === 'user') return `/profile/${result.id}`
  if (result.type === 'quiz') return `/quizzes/${result.id}`
  return '#'
}

const IconFor = (type) => {
  if (type === 'topic') return BookOpen
  if (type === 'user') return Users
  if (type === 'quiz') return Brain
  return SearchIcon
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const getFilteredResults = () => {
    if (!query.trim()) return []
    const allResults = []
    if (activeTab === 'all' || activeTab === 'topics') allResults.push(...mockResults.topics.map((i) => ({ ...i, type: 'topic' })))
    if (activeTab === 'all' || activeTab === 'users') allResults.push(...mockResults.users.map((i) => ({ ...i, type: 'user' })))
    if (activeTab === 'all' || activeTab === 'quizzes') allResults.push(...mockResults.quizzes.map((i) => ({ ...i, type: 'quiz' })))
    return allResults.filter(
      (item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
    )
  }

  const results = getFilteredResults()

  return (
    <div className="min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Search Chemistry Hub</h1>

        {/* Search Input */}
        <div className="relative mb-6">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics, users, quizzes..."
            className="input-field pl-12 pr-12 text-lg py-4"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 flex-wrap gap-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${activeTab === id ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
              <Icon className="w-4 h-4" /><span>{label}</span>
            </button>
          ))}
        </div>

        {/* Category Filter */}
        {(activeTab === 'topics' || activeTab === 'quizzes') && (
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="input-field px-4 py-2 max-w-xs">
              {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        )}
      </motion.div>

      {/* Results */}
      <div className="space-y-6">
        {query && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">{results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;</h2>
          </div>
        )}

        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result, index) => {
              const Icon = IconFor(result.type)
              return (
                <motion.div
                  key={`${result.type}-${result.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="glass-card p-6 rounded-xl card-hover cursor-pointer"
                >
                  <Link href={getResultPath(result)}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-full capitalize">{result.type}</span>
                      <Icon className="w-5 h-5 text-primary-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{result.title}</h3>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">{result.description}</p>

                    {result.type === 'topic' && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">by {result.author}</span>
                        <div className="flex items-center space-x-2 text-gray-400">
                          <span>{result.stats.likes} likes</span>
                          <span>•</span>
                          <span>{result.stats.posts} posts</span>
                        </div>
                      </div>
                    )}

                    {result.type === 'user' && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">@{result.username}</span>
                        <span className="px-2 py-1 bg-white/10 text-primary-400 text-xs rounded-full capitalize">{result.role}</span>
                      </div>
                    )}

                    {result.type === 'quiz' && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{result.difficulty}</span>
                        <div className="flex items-center space-x-2 text-gray-400">
                          <span>{result.stats.attempts} attempts</span>
                          <span>•</span>
                          <span>{result.stats.averageScore}% avg</span>
                        </div>
                      </div>
                    )}
                  </Link>
                </motion.div>
              )
            })}
          </div>
        ) : query ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <SearchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
            <p className="text-gray-300 mb-6">Try different keywords or browse categories</p>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setActiveTab('topics')} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">Browse Topics</button>
              <button onClick={() => setActiveTab('quizzes')} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">Browse Quizzes</button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <SearchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Start searching</h3>
            <p className="text-gray-300">Enter keywords to find topics, users, or quizzes</p>
          </motion.div>
        )}
      </div>

      {/* Trending Searches */}
      {!query && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-12">
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary-400" />Trending Searches
            </h2>
            <div className="flex flex-wrap gap-2">
              {['Chemical Bonding', 'Organic Chemistry', 'Thermodynamics', 'Periodic Table', 'Reaction Mechanisms'].map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-3 py-1 bg-white/10 text-gray-300 rounded-full hover:bg-primary-500/20 hover:text-primary-400 transition-all duration-200"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
