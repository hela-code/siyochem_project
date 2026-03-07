'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  PlusCircle,
  Send,
  X,
  User,
  Clock,
  FlaskConical,
  Flame,
  Trophy,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'
import Link from 'next/link'

export default function FeedbackPage() {
  const { user, isAuthenticated, token } = useAuthStore()
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reactingId, setReactingId] = useState(null)

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  const fetchFeedbacks = async () => {
    try {
      const headers = {}
      const storedToken = token || localStorage.getItem('token')
      if (storedToken) headers.Authorization = `Bearer ${storedToken}`

      const res = await axios.get('/api/feedback', { headers })
      if (res.data.success) {
        setFeedbacks(res.data.feedbacks)
      }
    } catch (err) {
      console.error('Failed to fetch feedback', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() || submitting) return

    setSubmitting(true)
    try {
      const res = await axios.post(
        '/api/feedback',
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data.success) {
        setFeedbacks([{ ...res.data.feedback, reaction_count: 0, user_reacted: false }, ...feedbacks])
        setContent('')
        setShowForm(false)
      }
    } catch (err) {
      console.error('Failed to submit feedback', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReact = async (feedbackId) => {
    if (!isAuthenticated || reactingId) return
    setReactingId(feedbackId)

    try {
      const res = await axios.post(
        '/api/feedback/react',
        { feedbackId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data.success) {
        setFeedbacks((prev) =>
          prev.map((fb) =>
            (fb.id || fb._id) === feedbackId
              ? { ...fb, reaction_count: res.data.reactionCount, user_reacted: res.data.reacted }
              : fb
          )
        )
      }
    } catch (err) {
      console.error('Failed to react', err)
    } finally {
      setReactingId(null)
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const getAvatarColor = (name = 'Unknown') => {
    const colors = [
      'from-primary-500 to-primary-600',
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-red-500 to-red-600',
      'from-yellow-500 to-yellow-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  // Find the top catalyzed feedback
  const topFeedback =
    feedbacks.length > 0
      ? feedbacks.reduce((top, fb) => ((fb.reaction_count || 0) > (top.reaction_count || 0) ? fb : top), feedbacks[0])
      : null
  const hasTopFeedback = topFeedback && (topFeedback.reaction_count || 0) > 0

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Reaction Wall
            </h1>
            <p className="text-gray-300">
              Share your reactions and read feedback from fellow lab partners
            </p>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary mt-4 md:mt-0 inline-flex items-center"
            >
              {showForm ? (
                <>
                  <X className="w-5 h-5 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Add Reaction
                </>
              )}
            </button>
          )}
        </div>

        {/* Add Feedback Form */}
        <AnimatePresence>
          {showForm && isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <form
                onSubmit={handleSubmit}
                className="glass-card p-6 rounded-xl mb-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user?.profile?.firstName?.[0] || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {user?.profile?.firstName || 'User'}
                    </p>
                    <p className="text-gray-400 text-xs">Posting as</p>
                  </div>
                </div>

                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your reaction here..."
                  rows={4}
                  maxLength={1000}
                  className="input-field resize-none mb-4"
                />

                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">
                    {content.length}/1000
                  </span>
                  <button
                    type="submit"
                    disabled={!content.trim() || submitting}
                    className="btn-primary inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {submitting ? 'Reacting...' : 'Submit Reaction'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Top Catalyzed Feedback */}
      {!loading && hasTopFeedback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-semibold text-yellow-400">Most Catalyzed Feedback</h2>
          </div>
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/30 via-orange-500/30 to-yellow-500/30 rounded-xl blur-sm" />
            <div className="relative glass-card p-6 rounded-xl border border-yellow-500/30">
              <div className="flex items-center gap-3 mb-4">
                <Link href={`/profile/${topFeedback.author_id}`}>
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${getAvatarColor(
                      topFeedback.author_name || topFeedback.authorName
                    )} rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:ring-2 hover:ring-yellow-400 transition-all`}
                  >
                    <span className="text-white font-bold">
                      {(topFeedback.author_name || topFeedback.authorName)?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${topFeedback.author_id}`} className="text-white font-semibold hover:text-yellow-400 transition-colors block text-lg">
                    {topFeedback.author_name || topFeedback.authorName}
                  </Link>
                  <div className="flex items-center text-gray-400 text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDate(topFeedback.created_at || topFeedback.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-full border border-yellow-500/30">
                  <FlaskConical className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 font-bold text-lg">{topFeedback.reaction_count}</span>
                </div>
              </div>
              <p className="text-gray-200 leading-relaxed whitespace-pre-wrap break-words text-base">
                {topFeedback.content}
              </p>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => handleReact(topFeedback.id || topFeedback._id)}
                  disabled={!isAuthenticated || reactingId === (topFeedback.id || topFeedback._id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    topFeedback.user_reacted
                      ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/50 shadow-lg shadow-yellow-500/10'
                      : 'bg-white/5 text-gray-400 hover:bg-yellow-500/20 hover:text-yellow-400 border border-white/10 hover:border-yellow-500/30'
                  } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <FlaskConical className={`w-4 h-4 ${topFeedback.user_reacted ? 'animate-pulse' : ''}`} />
                  {topFeedback.user_reacted ? 'Catalyzed!' : 'Catalyze'}
                </button>
                <span className="text-gray-500 text-xs flex items-center gap-1">
                  <Flame className="w-3 h-3 text-yellow-500" /> Top reaction
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Feedback Grid / Wall */}
      {!loading && feedbacks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feedbacks.map((fb, index) => {
            const fbId = fb.id || fb._id
            const isTop = hasTopFeedback && fbId === (topFeedback.id || topFeedback._id)

            return (
              <motion.div
                key={fbId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`glass-card p-6 rounded-xl card-hover ${isTop ? 'ring-1 ring-yellow-500/30' : ''}`}
              >
                {/* Top badge */}
                {isTop && (
                  <div className="flex items-center gap-1 mb-3 text-yellow-400 text-xs font-medium">
                    <Trophy className="w-3 h-3" />
                    <span>Most Catalyzed</span>
                  </div>
                )}

                {/* Author */}
                <div className="flex items-center gap-3 mb-4">
                  <Link href={`/profile/${fb.author_id}`}>
                    <div
                      className={`w-10 h-10 bg-gradient-to-br ${getAvatarColor(
                        fb.author_name || fb.authorName
                      )} rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:ring-2 hover:ring-primary-400 transition-all`}
                    >
                      <span className="text-white font-bold text-sm">
                        {(fb.author_name || fb.authorName)?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/profile/${fb.author_id}`} className="text-white font-medium truncate hover:text-primary-400 transition-colors block">
                      {fb.author_name || fb.authorName}
                    </Link>
                    <div className="flex items-center text-gray-400 text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDate(fb.created_at || fb.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap break-words mb-4">
                  {fb.content}
                </p>

                {/* Catalyze Button */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => handleReact(fbId)}
                    disabled={!isAuthenticated || reactingId === fbId}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                      fb.user_reacted
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-white/5 text-gray-400 hover:bg-emerald-500/15 hover:text-emerald-400 border border-white/10 hover:border-emerald-500/30'
                    } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <FlaskConical className={`w-3.5 h-3.5 ${reactingId === fbId ? 'animate-spin' : fb.user_reacted ? 'animate-pulse' : ''}`} />
                    {fb.user_reacted ? 'Catalyzed!' : 'Catalyze'}
                  </button>
                  {(fb.reaction_count || 0) > 0 && (
                    <span className="text-gray-500 text-xs flex items-center gap-1">
                      <FlaskConical className="w-3 h-3 text-emerald-500" />
                      {fb.reaction_count} {fb.reaction_count === 1 ? 'reaction' : 'reactions'}
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && feedbacks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No reactions yet
          </h3>
          <p className="text-gray-300 mb-6">
            Be the first to share your reaction!
          </p>
          {isAuthenticated && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary inline-flex items-center"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Add Reaction
            </button>
          )}
        </motion.div>
      )}
    </div>
  )
}
