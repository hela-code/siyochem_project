'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import axios from 'axios'
import {
  Brain,
  PlusCircle,
  Search,
  Filter,
  Clock,
  Users,
  Award,
  BarChart3,
  Play,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'Organic Chemistry', label: 'Organic Chemistry' },
  { value: 'Inorganic Chemistry', label: 'Inorganic Chemistry' },
  { value: 'Physical Chemistry', label: 'Physical Chemistry' },
  { value: 'Analytical Chemistry', label: 'Analytical Chemistry' },
  { value: 'Biochemistry', label: 'Biochemistry' },
  { value: 'Environmental Chemistry', label: 'Environmental Chemistry' },
  { value: 'Mixed Topics', label: 'Mixed Topics' },
]

const difficultyColor = (d) => {
  if (d === 'easy') return 'bg-green-500/20 text-green-400'
  if (d === 'medium') return 'bg-yellow-500/20 text-yellow-400'
  if (d === 'hard') return 'bg-red-500/20 text-red-400'
  return 'bg-gray-500/20 text-gray-400'
}

const formatTimeAgo = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  const diffHrs = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHrs < 24) return `${diffHrs}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return date.toLocaleDateString()
}

export default function Quizzes() {
  const { user } = useAuthStore()
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', '12')
      if (selectedCategory !== 'all') params.set('category', selectedCategory)

      const res = await axios.get(`/api/quizzes?${params.toString()}`)
      if (res.data.success) {
        setQuizzes(res.data.quizzes)
        setPagination(res.data.pagination)
      }
    } catch (err) {
      console.error('Failed to fetch quizzes:', err)
      setError('Failed to load quizzes. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [page, selectedCategory])

  useEffect(() => {
    fetchQuizzes()
  }, [fetchQuizzes])

  // Reset to page 1 when category changes
  useEffect(() => {
    setPage(1)
  }, [selectedCategory])

  // Client-side search filter on already-fetched quizzes
  const filtered = quizzes.filter((q) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      q.title.toLowerCase().includes(term) ||
      q.description.toLowerCase().includes(term) ||
      q.category?.toLowerCase().includes(term)
    )
  })

  // Determine dominant difficulty from questions
  const getQuizDifficulty = (quiz) => {
    if (!quiz.questions || quiz.questions.length === 0) return 'medium'
    const counts = { easy: 0, medium: 0, hard: 0 }
    quiz.questions.forEach((q) => {
      if (counts[q.difficulty] !== undefined) counts[q.difficulty]++
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
  }

  if (loading && quizzes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Preparing the lab...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Chemistry Lab Tests</h1>
            <p className="text-gray-300">
              Test your compounds and track your reaction progress
              {pagination.total > 0 && (
                <span className="text-gray-500 ml-2">({pagination.total} lab tests)</span>
              )}
            </p>
          </div>
          {user?.role === 'teacher' && (
            <Link href="/create-quiz" className="btn-primary mt-4 md:mt-0 inline-flex items-center">
              <PlusCircle className="w-5 h-5 mr-2" /> Design Experiment
            </Link>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search lab tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field pl-10 appearance-none"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-300">{error}</p>
          <button onClick={fetchQuizzes} className="ml-auto text-red-400 hover:text-red-300 text-sm underline">
            Retry
          </button>
        </motion.div>
      )}

      {loading && quizzes.length > 0 && (
        <div className="flex items-center justify-center py-4 mb-4">
          <Loader2 className="w-5 h-5 text-primary-400 animate-spin mr-2" />
          <span className="text-gray-400 text-sm">Refreshing...</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((quiz, index) => {
          const difficulty = getQuizDifficulty(quiz)
          const questionCount = quiz.questions?.length || 0
          const authorName = quiz.author?.profile
            ? `${quiz.author.profile.firstName || ''} ${quiz.author.profile.lastName || ''}`.trim() || quiz.author.username
            : quiz.author?.username || 'Unknown'

          return (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              whileHover={{ y: -5 }}
              className="glass-card p-6 rounded-xl card-hover"
            >
              <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2">{quiz.title}</h3>
              <p className="text-gray-300 text-sm line-clamp-3 mb-3">{quiz.description}</p>

              <div className="flex items-center space-x-2 mb-3">
                <span className="px-3 py-1 bg-white/10 text-primary-400 text-xs rounded-full">{quiz.category}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${difficultyColor(difficulty)}`}>{difficulty}</span>
              </div>

              <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white text-xs font-bold">
                  {authorName.charAt(0).toUpperCase()}
                </div>
                <span>{authorName}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="bg-white/5 rounded-lg p-2">
                  <Clock className="w-4 h-4 text-primary-400 mx-auto mb-1" />
                  <p className="text-white text-xs font-medium">{quiz.duration}m</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <Brain className="w-4 h-4 text-primary-400 mx-auto mb-1" />
                  <p className="text-white text-xs font-medium">{questionCount}Q</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <Users className="w-4 h-4 text-primary-400 mx-auto mb-1" />
                  <p className="text-white text-xs font-medium">{quiz.totalAttempts}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                <div className="flex items-center space-x-1">
                  <Award className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">Pass: {quiz.passingMarks}/{quiz.totalMarks}</span>
                </div>
                <span className="text-gray-500 text-xs">{formatTimeAgo(quiz.createdAt)}</span>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/quizzes/${quiz.id}`}
                  className="flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center text-sm btn-primary py-2"
                >
                  <Play className="w-4 h-4 mr-2" />Start Experiment
                </Link>
                {user?.role === 'teacher' && (
                  <Link
                    href={`/quiz-analytics/${quiz.id}`}
                    className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {filtered.length === 0 && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No lab tests found</h3>
          <p className="text-gray-300">
            {searchTerm
              ? 'Try adjusting your search criteria'
              : 'No lab tests available yet. Check back later!'}
          </p>
          {user?.role === 'teacher' && (
            <Link href="/create-quiz" className="btn-primary mt-6 inline-flex items-center">
              <PlusCircle className="w-5 h-5 mr-2" /> Design First Experiment
            </Link>
          )}
        </motion.div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className={`p-2 rounded-lg transition-colors ${
              page <= 1
                ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pagination.pages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => (
                <React.Fragment key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="text-gray-500 px-1">...</span>
                  )}
                  <button
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      p === page
                        ? 'bg-primary-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {p}
                  </button>
                </React.Fragment>
              ))}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page >= pagination.pages}
            className={`p-2 rounded-lg transition-colors ${
              page >= pagination.pages
                ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}
