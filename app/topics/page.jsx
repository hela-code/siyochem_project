'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  BookOpen,
  PlusCircle,
  Search,
  Filter,
  FlaskConical,
  MessageCircle,
  Eye,
  TrendingUp,
  User,
  Loader2,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'

const categories = [
  { value: 'all', label: 'All Topics' },
  { value: 'Organic Chemistry', label: 'Organic Chemistry' },
  { value: 'Inorganic Chemistry', label: 'Inorganic Chemistry' },
  { value: 'Physical Chemistry', label: 'Physical Chemistry' },
  { value: 'Analytical Chemistry', label: 'Analytical Chemistry' },
  { value: 'Biochemistry', label: 'Biochemistry' },
  { value: 'Environmental Chemistry', label: 'Environmental Chemistry' },
  { value: 'General Discussion', label: 'General Discussion' },
]

export default function Topics() {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({ page, limit: 12 })
        if (selectedCategory !== 'all') params.append('category', selectedCategory)
        if (searchTerm.trim()) params.append('search', searchTerm.trim())

        const { data } = await axios.get(`/api/topics?${params.toString()}`)
        if (data.success) {
          setTopics(data.topics)
          setPagination(data.pagination)
        }
      } catch (err) {
        console.error('Failed to fetch topics:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTopics()
  }, [page, selectedCategory, searchTerm])

  const timeAgo = (dateStr) => {
    if (!dateStr) return ''
    const now = new Date()
    const date = new Date(dateStr)
    const mins = Math.floor((now - date) / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Chemistry Experiments</h1>
            <p className="text-gray-300">Join experiments and share knowledge with fellow chemistry enthusiasts</p>
          </div>
          {isAuthenticated && (
            <Link href="/create-topic" className="btn-primary mt-4 md:mt-0 inline-flex items-center">
              <PlusCircle className="w-5 h-5 mr-2" />
              Start Experiment
            </Link>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search experiments..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
              className="input-field pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1) }}
              className="input-field pl-10 appearance-none"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="glass-card p-6 rounded-xl card-hover cursor-pointer"
              >
                <Link href={`/topics/${topic.id}`}>
                  <div className="flex items-center justify-between mb-3">
                    {topic.isPinned && (
                      <span className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-full flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Pinned
                      </span>
                    )}
                    <span className="text-gray-500 text-xs ml-auto">{timeAgo(topic.createdAt)}</span>
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2">{topic.title}</h3>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">{topic.description}</p>

                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-white/10 text-primary-400 text-xs rounded-full mb-2">
                      {topic.category}
                    </span>
                    {topic.tags && topic.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {topic.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded">#{tag}</span>
                        ))}
                        {topic.tags.length > 2 && (
                          <span className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded">+{topic.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center mb-4 pb-4 border-b border-white/10">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-xs font-bold">
                        {topic.author?.profile?.firstName?.[0] || ''}{topic.author?.profile?.lastName?.[0] || ''}
                      </span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">
                        {topic.author?.profile?.firstName} {topic.author?.profile?.lastName}
                      </p>
                      <p className="text-gray-500 text-xs">@{topic.author?.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-gray-400 text-sm">
                    <span className="flex items-center"><FlaskConical className="w-4 h-4 mr-1" />{topic.likesCount || 0}</span>
                    <span className="flex items-center"><MessageCircle className="w-4 h-4 mr-1" />{topic.postsCount || 0}</span>
                    <span className="flex items-center"><Eye className="w-4 h-4 mr-1" />{topic.views || 0}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 glass-card rounded-lg text-sm text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-gray-400 text-sm px-4">
                Page {page} of {pagination.pages}
              </span>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 glass-card rounded-lg text-sm text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}

          {topics.length === 0 && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No experiments found</h3>
              <p className="text-gray-300 mb-6">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Be the first to start a reaction!'}
              </p>
              {isAuthenticated && !searchTerm && selectedCategory === 'all' && (
                <Link href="/create-topic" className="btn-primary inline-flex items-center">
                  <PlusCircle className="w-5 h-5 mr-2" /> Start First Experiment
                </Link>
              )}
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
