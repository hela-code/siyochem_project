'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  MessageCircle,
  Share2,
  Send,
  User,
  Eye,
  ArrowLeft,
  Loader2,
  FlaskConical,
  Clock,
  Tag,
  Pencil,
  X,
  Check,
  Save,
  Image as ImageIcon,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'

export default function TopicDetail() {
  const { id } = useParams()
  const router = useRouter()
  const { user: currentUser, isAuthenticated, token } = useAuthStore()

  const [topic, setTopic] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [newPost, setNewPost] = useState('')
  const [posting, setPosting] = useState(false)
  const [topicLiked, setTopicLiked] = useState(false)
  const [topicLikesCount, setTopicLikesCount] = useState(0)
  const [postLikes, setPostLikes] = useState({}) // { postId: { liked, count } }
  const [sortedPosts, setSortedPosts] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ title: '', description: '', category: '', tags: '', image: '' })
  const [saving, setSaving] = useState(false)

  // Fetch topic + posts
  useEffect(() => {
    const fetchTopic = async () => {
      try {
        setLoading(true)
        const { data } = await axios.get(`/api/topics/${id}`)
        if (data.success) {
          setTopic(data.topic)
          setPosts(data.topic.posts || [])
          setTopicLikesCount(data.topic.likesCount || 0)

          // Initialize post likes state
          const likesMap = {}
          ;(data.topic.posts || []).forEach((p) => {
            likesMap[p.id] = { liked: false, count: p.likesCount || 0 }
          })
          setPostLikes(likesMap)

          // Sort posts by catalyze count (most first)
          const sorted = [...(data.topic.posts || [])].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
          setSortedPosts(sorted)
        }
      } catch (err) {
        console.error('Failed to fetch topic:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTopic()
  }, [id])

  // Handle topic like
  const handleTopicLike = async () => {
    if (!isAuthenticated || !token) {
      router.push('/login')
      return
    }
    try {
      const { data } = await axios.post(
        `/api/topics/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.success) {
        setTopicLiked(data.liked)
        setTopicLikesCount(data.likesCount)
      }
    } catch (err) {
      console.error('Failed to like topic:', err)
    }
  }

  // Handle post like
  const handlePostLike = async (postId) => {
    if (!isAuthenticated || !token) {
      router.push('/login')
      return
    }
    try {
      const { data } = await axios.post(
        `/api/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.success) {
        setPostLikes((prev) => {
          const updated = { ...prev, [postId]: { liked: data.liked, count: data.likesCount } }
          // Re-sort posts by catalyze count
          setSortedPosts((prevPosts) =>
            [...prevPosts].sort((a, b) => {
              const countA = updated[a.id]?.count ?? a.likesCount ?? 0
              const countB = updated[b.id]?.count ?? b.likesCount ?? 0
              return countB - countA
            })
          )
          return updated
        })
      }
    } catch (err) {
      console.error('Failed to catalyze post:', err)
    }
  }

  // Handle create post
  const handlePostSubmit = async (e) => {
    e.preventDefault()
    if (!newPost.trim() || !isAuthenticated || !token) return

    try {
      setPosting(true)
      const { data } = await axios.post(
        '/api/posts',
        { content: newPost.trim(), topicId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.success) {
        const createdPost = {
          id: data.post.id,
          content: data.post.content,
          likesCount: 0,
          commentsCount: 0,
          createdAt: data.post.created_at || new Date().toISOString(),
          author: data.post.author || {
            _id: currentUser?.id,
            username: currentUser?.username,
            profile: {
              firstName: currentUser?.profile?.firstName || currentUser?.first_name || '',
              lastName: currentUser?.profile?.lastName || currentUser?.last_name || '',
            },
          },
        }
        setPosts((prev) => [createdPost, ...prev])
        setSortedPosts((prev) => [...prev, createdPost].sort((a, b) => {
          const countA = postLikes[a.id]?.count ?? a.likesCount ?? 0
          const countB = postLikes[b.id]?.count ?? b.likesCount ?? 0
          return countB - countA
        }))
        setPostLikes((prev) => ({
          ...prev,
          [createdPost.id]: { liked: false, count: 0 },
        }))
        setNewPost('')
      }
    } catch (err) {
      console.error('Failed to create post:', err)
    } finally {
      setPosting(false)
    }
  }

  const isAuthor = isAuthenticated && currentUser?.id === topic?.author?._id

  const startEditing = () => {
    setEditForm({
      title: topic.title || '',
      description: topic.description || '',
      category: topic.category || '',
      tags: (topic.tags || []).join(', '),
      image: topic.image || '',
    })
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditForm({ title: '', description: '', category: '', tags: '', image: '' })
  }

  const handleSaveEdit = async () => {
    if (!editForm.title.trim()) return
    try {
      setSaving(true)
      const payload = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        category: editForm.category.trim(),
        tags: editForm.tags ? editForm.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        image: editForm.image.trim() || null,
      }
      const { data } = await axios.put(`/api/topics/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (data.success) {
        setTopic((prev) => ({
          ...prev,
          title: payload.title,
          description: payload.description,
          category: payload.category,
          tags: payload.tags,
          image: payload.image,
        }))
        setIsEditing(false)
      }
    } catch (err) {
      console.error('Failed to update topic:', err)
    } finally {
      setSaving(false)
    }
  }

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
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const getAvatarColor = (name = 'U') => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-amber-500',
      'from-red-500 to-rose-500',
      'from-indigo-500 to-violet-500',
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return colors[Math.abs(hash) % colors.length]
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary-400 animate-spin" />
          <p className="text-gray-400">Loading topic...</p>
        </div>
      </div>
    )
  }

  // Not found
  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-10 rounded-2xl text-center max-w-md">
          <FlaskConical className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Topic Not Found</h2>
          <p className="text-gray-400 mb-6">This topic doesn&apos;t exist or has been removed.</p>
          <button onClick={() => router.push('/topics')} className="btn-primary px-6 py-2">
            Browse Topics
          </button>
        </div>
      </div>
    )
  }

  const authorName = `${topic.author?.profile?.firstName || ''} ${topic.author?.profile?.lastName || ''}`.trim() || topic.author?.username || 'Unknown'

  return (
    <div className="min-h-screen pb-12">
      {/* Back button */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <button
          onClick={() => router.push('/topics')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Topics
        </button>
      </motion.div>

      {/* Topic Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 sm:p-8 rounded-xl mb-6">
        {/* Pinned + Category + Edit button */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {topic.isPinned && (
            <span className="px-3 py-1 bg-primary-500/20 text-primary-400 text-sm rounded-full flex items-center gap-1">
              📌 Pinned
            </span>
          )}
          {!isEditing ? (
            <span className="px-3 py-1 bg-white/10 text-primary-400 text-sm rounded-full">
              {topic.category}
            </span>
          ) : null}
          {isAuthor && !isEditing && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={startEditing}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all border border-white/10"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </motion.button>
          )}
        </div>

        {isEditing ? (
          /* ---- Edit Mode ---- */
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Title</label>
              <input
                value={editForm.title}
                onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
            {/* Description */}
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                rows={4}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
              />
            </div>
            {/* Category */}
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Category</label>
              <select
                value={editForm.category}
                onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-colors"
              >
                <option value="General Chemistry">General Chemistry</option>
                <option value="Organic Chemistry">Organic Chemistry</option>
                <option value="Inorganic Chemistry">Inorganic Chemistry</option>
                <option value="Physical Chemistry">Physical Chemistry</option>
                <option value="Biochemistry">Biochemistry</option>
                <option value="Analytical Chemistry">Analytical Chemistry</option>
                <option value="Environmental Chemistry">Environmental Chemistry</option>
                <option value="Industrial Chemistry">Industrial Chemistry</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {/* Tags */}
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Tags (comma separated)</label>
              <input
                value={editForm.tags}
                onChange={(e) => setEditForm((f) => ({ ...f, tags: e.target.value }))}
                placeholder="e.g. reactions, bonds, organic"
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
            {/* Image URL */}
            <div>
              <label className="text-sm text-gray-400 mb-1 block flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5" /> Cover Image URL
              </label>
              <input
                value={editForm.image}
                onChange={(e) => setEditForm((f) => ({ ...f, image: e.target.value }))}
                placeholder="https://... or /uploads/..."
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
              {editForm.image && (
                <div className="mt-2 rounded-xl overflow-hidden border border-white/10 max-w-xs">
                  <img src={editForm.image} alt="Preview" className="w-full h-32 object-cover" />
                </div>
              )}
            </div>
            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveEdit}
                disabled={saving || !editForm.title.trim()}
                className="btn-primary flex items-center gap-2 px-5 py-2 disabled:opacity-50"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4" /> Save Changes</>
                )}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={cancelEditing}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all border border-white/10"
              >
                <X className="w-4 h-4" /> Cancel
              </motion.button>
            </div>
          </div>
        ) : (
          /* ---- Display Mode ---- */
          <>
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{topic.title}</h1>

            {/* Description */}
            <p className="text-gray-300 text-lg mb-6 leading-relaxed">{topic.description}</p>

            {/* Cover Image */}
            {topic.image && (
              <div className="rounded-xl overflow-hidden border border-white/10 mb-6 max-w-xs">
                <img src={topic.image} alt={topic.title} className="w-full h-40 object-cover" />
              </div>
            )}

            {/* Tags */}
            {topic.tags && topic.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {topic.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 px-3 py-1.5 bg-white/5 text-gray-400 text-sm rounded-lg border border-white/10">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </>
        )}

        {/* Author + Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-white/10">
          <Link href={`/profile/${topic.author?._id}`} className="flex items-center gap-3 group">
            <div className={`w-11 h-11 bg-gradient-to-br ${getAvatarColor(authorName)} rounded-full flex items-center justify-center`}>
              <span className="text-white text-sm font-bold">
                {topic.author?.profile?.firstName?.[0] || ''}{topic.author?.profile?.lastName?.[0] || 'U'}
              </span>
            </div>
            <div>
              <p className="text-white font-medium group-hover:text-primary-400 transition-colors">
                {authorName}
              </p>
              <p className="text-gray-500 text-sm flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo(topic.createdAt)}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleTopicLike}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${
                topicLiked
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-gray-400 hover:text-emerald-400 hover:bg-white/5'
              }`}
            >
              <FlaskConical className={`w-5 h-5 transition-transform ${topicLiked ? 'scale-110' : ''}`} />
              <span className="text-sm font-medium">{topicLiked ? 'Catalyzed' : 'Catalyze'}</span>
              {topicLikesCount > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  topicLiked ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-gray-400'
                }`}>
                  {topicLikesCount}
                </span>
              )}
            </motion.button>

            <div className="flex items-center gap-1.5 text-gray-400">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">{posts.length}</span>
            </div>

            <div className="flex items-center gap-1.5 text-gray-400">
              <Eye className="w-5 h-5" />
              <span className="text-sm">{topic.views || 0}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Create Post */}
      {isAuthenticated ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-xl mb-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Send className="w-5 h-5 text-primary-400" />
            Join the Discussion
          </h2>
          <form onSubmit={handlePostSubmit}>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share your thoughts, ask questions, or provide insights..."
              className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
              rows={4}
            />
            <div className="flex justify-between items-center mt-3">
              <p className="text-gray-500 text-xs">{newPost.length}/2000</p>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!newPost.trim() || posting}
                className="btn-primary flex items-center gap-2 px-5 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {posting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Post
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-xl mb-6 text-center"
        >
          <p className="text-gray-400 mb-3">Login to join the discussion</p>
          <button onClick={() => router.push('/login')} className="btn-primary px-6 py-2">
            Login
          </button>
        </motion.div>
      )}

      {/* Posts List */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary-400" />
          Discussion ({sortedPosts.length} {sortedPosts.length === 1 ? 'post' : 'posts'})
        </h2>

        {sortedPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-10 rounded-xl text-center"
          >
            <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No posts yet. Be the first to contribute!</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {sortedPosts.map((post, index) => {
                const postAuthorName = `${post.author?.profile?.firstName || ''} ${post.author?.profile?.lastName || ''}`.trim() || post.author?.username || 'Unknown'
                const likeState = postLikes[post.id] || { liked: false, count: post.likesCount || 0 }

                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card p-6 rounded-xl"
                  >
                    {/* Post Author */}
                    <div className="flex items-center gap-3 mb-4">
                      <Link href={`/profile/${post.author?._id}`}>
                        <div className={`w-10 h-10 bg-gradient-to-br ${getAvatarColor(postAuthorName)} rounded-full flex items-center justify-center`}>
                          <span className="text-white text-xs font-bold">
                            {post.author?.profile?.firstName?.[0] || ''}{post.author?.profile?.lastName?.[0] || 'U'}
                          </span>
                        </div>
                      </Link>
                      <div>
                        <Link href={`/profile/${post.author?._id}`} className="text-white font-medium hover:text-primary-400 transition-colors text-sm">
                          {postAuthorName}
                        </Link>
                        <p className="text-gray-500 text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeAgo(post.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="text-gray-300 mb-4 whitespace-pre-wrap leading-relaxed">
                      {post.content}
                    </div>

                    {/* Post Actions */}
                    <div className="flex items-center gap-6 pt-3 border-t border-white/10">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handlePostLike(post.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${
                          likeState.liked
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : 'text-gray-400 hover:text-emerald-400 hover:bg-white/5'
                        }`}
                      >
                        <FlaskConical className={`w-4 h-4 transition-transform ${likeState.liked ? 'scale-110' : ''}`} />
                        <span className="text-sm font-medium">
                          {likeState.liked ? 'Catalyzed' : 'Catalyze'}
                        </span>
                        {likeState.count > 0 && (
                          <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                            likeState.liked ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-gray-400'
                          }`}>
                            {likeState.count}
                          </span>
                        )}
                      </motion.button>

                      <div className="flex items-center gap-1.5 text-gray-400">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">{post.commentsCount || 0}</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
