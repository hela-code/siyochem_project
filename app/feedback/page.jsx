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
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'

export default function FeedbackPage() {
  const { user, isAuthenticated, token } = useAuthStore()
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get('/api/feedback')
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
        setFeedbacks([res.data.feedback, ...feedbacks])
        setContent('')
        setShowForm(false)
      }
    } catch (err) {
      console.error('Failed to submit feedback', err)
    } finally {
      setSubmitting(false)
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

  // Generate a consistent color from the author name
  const getAvatarColor = (name) => {
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
              Feedback Wall
            </h1>
            <p className="text-gray-300">
              Share your thoughts and read feedback from fellow chemistry enthusiasts
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
                  Add Feedback
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
                  placeholder="Write your feedback here..."
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
                    {submitting ? 'Submitting...' : 'Submit Feedback'}
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

      {/* Feedback Grid / Wall */}
      {!loading && feedbacks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feedbacks.map((fb, index) => (
            <motion.div
              key={fb._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="glass-card p-6 rounded-xl card-hover"
            >
              {/* Author */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${getAvatarColor(
                    fb.authorName
                  )} rounded-full flex items-center justify-center shadow-lg`}
                >
                  <span className="text-white font-bold text-sm">
                    {fb.authorName?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {fb.authorName}
                  </p>
                  <div className="flex items-center text-gray-400 text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDate(fb.createdAt)}
                  </div>
                </div>
              </div>

              {/* Content */}
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap break-words">
                {fb.content}
              </p>
            </motion.div>
          ))}
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
            No feedback yet
          </h3>
          <p className="text-gray-300 mb-6">
            Be the first to share your feedback!
          </p>
          {isAuthenticated && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary inline-flex items-center"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Add Feedback
            </button>
          )}
        </motion.div>
      )}
    </div>
  )
}
