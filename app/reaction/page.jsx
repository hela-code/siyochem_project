'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
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
  AlertCircle,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import FeatureRestricted from '@/components/ui/FeatureRestricted'
import axios from 'axios'
import Link from 'next/link'

export default function ReactionPage() {
  const router = useRouter()
  const { user, isAuthenticated, token, loading: authLoading } = useAuthStore()
  const [reactions, setReactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reactingId, setReactingId] = useState(null)
  const [featuresLoading, setFeaturesLoading] = useState(true)
  const [featureEnabled, setFeatureEnabled] = useState(true)
  const [addReactionEnabled, setAddReactionEnabled] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated, router])

  // Check if add_reaction feature is enabled - refetch periodically
  useEffect(() => {
    const checkFeature = async () => {
      try {
        setFeaturesLoading(true)
        const { data } = await axios.get('/api/features/status')
        setFeatureEnabled(data.features?.reaction_wall ?? true)
        // Check if add_reaction feature is enabled
        const canAddReaction = data.features?.add_reaction ?? true
        setAddReactionEnabled(canAddReaction)
        console.log('Reaction page - features:', { reaction_wall: data.features?.reaction_wall, add_reaction: canAddReaction })
      } catch (error) {
        console.error('Error checking feature status:', error)
        setFeatureEnabled(true) // Default to enabled on error
        setAddReactionEnabled(true)
      } finally {
        setFeaturesLoading(false)
      }
    }

    if (!authLoading && isAuthenticated) {
      checkFeature()
      
      // Refetch every 5 seconds to stay in sync
      const interval = setInterval(checkFeature, 5000)
      return () => clearInterval(interval)
    }
  }, [authLoading, isAuthenticated])

  // Fetch reactions
  useEffect(() => {
    fetchReactions()
  }, [])

  // Show restricted message for students if feature is disabled
  if (!authLoading && isAuthenticated && user?.role === 'student' && !featureEnabled) {
    return <FeatureRestricted feature="Reaction Wall" />
  }

  const fetchReactions = async () => {
    try {
      const headers = {}
      const storedToken = token || localStorage.getItem('token')
      if (storedToken) headers.Authorization = `Bearer ${storedToken}`

      const res = await axios.get('/api/reactions', { headers })
      if (res.data.success) {
        setReactions(res.data.reactions)
      }
    } catch (err) {
      console.error('Failed to fetch reactions', err)
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
        '/api/reactions',
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data.success) {
        setReactions([{ ...res.data.reaction, reaction_count: 0, user_reacted: false }, ...reactions])
        setContent('')
        setShowForm(false)
      }
    } catch (err) {
      console.error('Failed to submit reaction', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReact = async (reactionId) => {
    if (!isAuthenticated || reactingId) return
    setReactingId(reactionId)

    try {
      const res = await axios.post(
        '/api/reactions/react',
        { reactionId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data.success) {
        setReactions((prev) =>
          prev.map((r) =>
            (r.id || r._id) === reactionId
              ? { ...r, reaction_count: res.data.reactionCount, user_reacted: res.data.reacted }
              : r
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

  // Find the top catalyzed reaction
  const topReaction =
    reactions.length > 0
      ? reactions.reduce((top, r) => ((r.reaction_count || 0) > (top.reaction_count || 0) ? r : top), reactions[0])
      : null
  const hasTopReaction = topReaction && (topReaction.reaction_count || 0) > 0

  return (
    <div className="min-h-screen">
      {/* Add Reaction disabled warning for students */}
      {!authLoading && isAuthenticated && user?.role === 'student' && !addReactionEnabled && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-orange-300 font-medium">Reactions Currently Disabled</p>
            <p className="text-orange-200/70 text-sm">You can view past reactions but cannot add new ones right now. Check back later!</p>
          </div>
        </motion.div>
      )}

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
          {isAuthenticated && (!addReactionEnabled && user?.role === 'student' ? null : (
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
          ))}
        </div>

        {/* Add Reaction Form */}
        <AnimatePresence>
          {showForm && isAuthenticated && (!(user?.role === 'student' && !addReactionEnabled)) && (
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

      {/* Top Catalyzed Reaction */}
      {!loading && hasTopReaction && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-semibold text-yellow-400">Most Catalyzed Reaction</h2>
          </div>
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/30 via-orange-500/30 to-yellow-500/30 rounded-xl blur-sm" />
            <div className="relative glass-card p-6 rounded-xl border border-yellow-500/30">
              <div className="flex items-center gap-3 mb-4">
                <Link href={`/profile/${topReaction.author_id}`}>
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${getAvatarColor(
                      topReaction.author_name || topReaction.authorName
                    )} rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:ring-2 hover:ring-yellow-400 transition-all`}
                  >
                    <span className="text-white font-bold">
                      {(topReaction.author_name || topReaction.authorName)?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${topReaction.author_id}`} className="text-white font-semibold hover:text-yellow-400 transition-colors block text-lg">
                    {topReaction.author_name || topReaction.authorName}
                  </Link>
                  <div className="flex items-center text-gray-400 text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDate(topReaction.created_at || topReaction.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-full border border-yellow-500/30">
                  <FlaskConical className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 font-bold text-lg">{topReaction.reaction_count}</span>
                </div>
              </div>
              <p className="text-gray-200 leading-relaxed whitespace-pre-wrap break-words text-base">
                {topReaction.content}
              </p>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => handleReact(topReaction.id || topReaction._id)}
                  disabled={!isAuthenticated || reactingId === (topReaction.id || topReaction._id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    topReaction.user_reacted
                      ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/50 shadow-lg shadow-yellow-500/10'
                      : 'bg-white/5 text-gray-400 hover:bg-yellow-500/20 hover:text-yellow-400 border border-white/10 hover:border-yellow-500/30'
                  } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <FlaskConical className={`w-4 h-4 ${topReaction.user_reacted ? 'animate-pulse' : ''}`} />
                  {topReaction.user_reacted ? 'Catalyzed!' : 'Catalyze'}
                </button>
                <span className="text-gray-500 text-xs flex items-center gap-1">
                  <Flame className="w-3 h-3 text-yellow-500" /> Top reaction
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Reaction Grid / Wall */}
      {!loading && reactions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reactions.map((r, index) => {
            const rId = r.id || r._id
            const isTop = hasTopReaction && rId === (topReaction.id || topReaction._id)

            return (
              <motion.div
                key={rId}
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
                  <Link href={`/profile/${r.author_id}`}>
                    <div
                      className={`w-10 h-10 bg-gradient-to-br ${getAvatarColor(
                        r.author_name || r.authorName
                      )} rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:ring-2 hover:ring-primary-400 transition-all`}
                    >
                      <span className="text-white font-bold text-sm">
                        {(r.author_name || r.authorName)?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/profile/${r.author_id}`} className="text-white font-medium truncate hover:text-primary-400 transition-colors block">
                      {r.author_name || r.authorName}
                    </Link>
                    <div className="flex items-center text-gray-400 text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDate(r.created_at || r.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap break-words mb-4">
                  {r.content}
                </p>

                {/* Catalyze Button */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => handleReact(rId)}
                    disabled={!isAuthenticated || reactingId === rId}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                      r.user_reacted
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-white/5 text-gray-400 hover:bg-emerald-500/15 hover:text-emerald-400 border border-white/10 hover:border-emerald-500/30'
                    } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <FlaskConical className={`w-3.5 h-3.5 ${reactingId === rId ? 'animate-spin' : r.user_reacted ? 'animate-pulse' : ''}`} />
                    {r.user_reacted ? 'Catalyzed!' : 'Catalyze'}
                  </button>
                  {(r.reaction_count || 0) > 0 && (
                    <span className="text-gray-500 text-xs flex items-center gap-1">
                      <FlaskConical className="w-3 h-3 text-emerald-500" />
                      {r.reaction_count} {r.reaction_count === 1 ? 'reaction' : 'reactions'}
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && reactions.length === 0 && (
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
