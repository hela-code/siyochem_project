'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Users,
  BookOpen,
  MessageCircle,
  Trash2,
  Search,
  Loader2,
  X,
  Eye,
  ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const router = useRouter()
  const { user, token, loading: authLoading } = useAuthStore()

  // Data states
  const [users, setUsers] = useState([])
  const [topics, setTopics] = useState([])
  const [posts, setPosts] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [messages, setMessages] = useState([])

  // Search states
  const [searchUsers, setSearchUsers] = useState('')
  const [searchTopics, setSearchTopics] = useState('')
  const [searchPosts, setSearchPosts] = useState('')
  const [searchFeedback, setSearchFeedback] = useState('')
  const [searchMessages, setSearchMessages] = useState('')

  // Loading states
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingTopics, setLoadingTopics] = useState(false)
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [loadingFeedback, setLoadingFeedback] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)

  // Counts
  const [counts, setCounts] = useState({
    users: 0,
    topics: 0,
    posts: 0,
    feedbacks: 0,
    messages: 0,
  })

  // Selected detail modal
  const [selectedType, setSelectedType] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Redirect if not teacher
  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push('/login')
      if (user?.role !== 'teacher') router.push('/')
    }
  }, [authLoading, user, router])

  // Fetch all data
  useEffect(() => {
    if (!token) return
    fetchAllData()
  }, [token])

  // Fetch data on search change
  useEffect(() => {
    if (!token) return
    fetchUsers()
  }, [searchUsers, token])

  useEffect(() => {
    if (!token) return
    fetchTopics()
  }, [searchTopics, token])

  useEffect(() => {
    if (!token) return
    fetchPosts()
  }, [searchPosts, token])

  useEffect(() => {
    if (!token) return
    fetchFeedbacks()
  }, [searchFeedback, token])

  useEffect(() => {
    if (!token) return
    fetchMessages()
  }, [searchMessages, token])

  const fetchAllData = async () => {
    if (!token) return
    const headers = { Authorization: `Bearer ${token}` }

    try {
      const [usersRes, topicsRes, postsRes, feedbackRes, messagesRes] = await Promise.all([
        axios.get('/api/admin/users?limit=100', { headers }).catch(() => ({ data: { users: [], total: 0 } })),
        axios.get('/api/admin/topics?limit=100', { headers }).catch(() => ({ data: { topics: [], total: 0 } })),
        axios.get('/api/admin/posts?limit=100', { headers }).catch(() => ({ data: { posts: [], total: 0 } })),
        axios.get('/api/admin/feedback?limit=100', { headers }).catch(() => ({ data: { feedbacks: [], total: 0 } })),
        axios.get('/api/admin/messages?limit=100', { headers }).catch(() => ({ data: { messages: [], total: 0 } })),
      ])

      setUsers(usersRes.data.users || [])
      setTopics(topicsRes.data.topics || [])
      setPosts(postsRes.data.posts || [])
      setFeedbacks(feedbackRes.data.feedbacks || [])
      setMessages(messagesRes.data.messages || [])

      setCounts({
        users: usersRes.data.total || 0,
        topics: topicsRes.data.total || 0,
        posts: postsRes.data.total || 0,
        feedbacks: feedbackRes.data.total || 0,
        messages: messagesRes.data.total || 0,
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const fetchUsers = async () => {
    if (!token) return
    try {
      setLoadingUsers(true)
      const { data } = await axios.get('/api/admin/users', {
        params: { search: searchUsers, limit: 100 },
        headers: { Authorization: `Bearer ${token}` },
      })
      setUsers(data.users || [])
      setCounts(prev => ({ ...prev, users: data.total || 0 }))
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchTopics = async () => {
    if (!token) return
    try {
      setLoadingTopics(true)
      const { data } = await axios.get('/api/admin/topics', {
        params: { search: searchTopics, limit: 100 },
        headers: { Authorization: `Bearer ${token}` },
      })
      setTopics(data.topics || [])
      setCounts(prev => ({ ...prev, topics: data.total || 0 }))
    } catch (error) {
      console.error('Error fetching topics:', error)
    } finally {
      setLoadingTopics(false)
    }
  }

  const fetchPosts = async () => {
    if (!token) return
    try {
      setLoadingPosts(true)
      const { data } = await axios.get('/api/admin/posts', {
        params: { search: searchPosts, limit: 100 },
        headers: { Authorization: `Bearer ${token}` },
      })
      setPosts(data.posts || [])
      setCounts(prev => ({ ...prev, posts: data.total || 0 }))
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoadingPosts(false)
    }
  }

  const fetchFeedbacks = async () => {
    if (!token) return
    try {
      setLoadingFeedback(true)
      const { data } = await axios.get('/api/admin/feedback', {
        params: { search: searchFeedback, limit: 100 },
        headers: { Authorization: `Bearer ${token}` },
      })
      setFeedbacks(data.feedbacks || [])
      setCounts(prev => ({ ...prev, feedbacks: data.total || 0 }))
    } catch (error) {
      console.error('Error fetching feedback:', error)
    } finally {
      setLoadingFeedback(false)
    }
  }

  const fetchMessages = async () => {
    if (!token) return
    try {
      setLoadingMessages(true)
      const { data } = await axios.get('/api/admin/messages', {
        params: { search: searchMessages, limit: 100 },
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessages(data.messages || [])
      setCounts(prev => ({ ...prev, messages: data.total || 0 }))
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoadingMessages(false)
    }
  }

  const gridCards = [
    {
      id: 'users',
      title: 'Users',
      icon: Users,
      count: counts.users,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-500/10',
      borderColor: 'border-primary-500/30',
      iconColor: 'text-primary-400',
    },
    {
      id: 'topics',
      title: 'Topics',
      icon: BookOpen,
      count: counts.topics,
      color: 'from-primary-600 to-primary-700',
      bgColor: 'bg-primary-600/10',
      borderColor: 'border-primary-600/30',
      iconColor: 'text-primary-300',
    },
    {
      id: 'posts',
      title: 'Posts',
      icon: MessageCircle,
      count: counts.posts,
      color: 'from-accent-500 to-accent-600',
      bgColor: 'bg-accent-500/10',
      borderColor: 'border-accent-500/30',
      iconColor: 'text-accent-400',
    },
    {
      id: 'feedback',
      title: 'Feedback',
      icon: MessageCircle,
      count: counts.feedbacks,
      color: 'from-tertiary-500 to-tertiary-600',
      bgColor: 'bg-tertiary-500/10',
      borderColor: 'border-tertiary-500/30',
      iconColor: 'text-tertiary-400',
    },
    {
      id: 'messages',
      title: 'Messages',
      icon: MessageCircle,
      count: counts.messages,
      color: 'from-primary-600 to-primary-700',
      bgColor: 'bg-primary-600/10',
      borderColor: 'border-primary-600/30',
      iconColor: 'text-primary-300',
    },
  ]

  if (authLoading) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/40 border-b border-white/10">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm">Click any card to view detailed data</p>
        </div>
      </div>

      {/* Grid Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {gridCards.map((card, idx) => {
            const Icon = card.icon
            return (
              <motion.button
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedType(card.id)}
                className={`relative overflow-hidden rounded-xl border transition-all duration-300 hover:scale-105 text-left ${card.borderColor} ${card.bgColor} backdrop-blur-sm`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Icon className={`w-8 h-8 ${card.iconColor}`} />
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
                  <p className={`text-3xl font-bold ${card.iconColor}`}>{card.count}</p>
                  <p className="text-gray-400 text-xs mt-2">Click to view details</p>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedType(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/10 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  {selectedType === 'users' && <Users className="w-6 h-6 text-blue-400" />}
                  {selectedType === 'topics' && <BookOpen className="w-6 h-6 text-green-400" />}
                  {selectedType === 'posts' && <MessageCircle className="w-6 h-6 text-purple-400" />}
                  {selectedType === 'feedback' && <MessageCircle className="w-6 h-6 text-orange-400" />}
                  {selectedType === 'messages' && <MessageCircle className="w-6 h-6 text-cyan-400" />}
                  <h2 className="text-xl font-bold text-white capitalize">{selectedType} Details</h2>
                </div>
                <button
                  onClick={() => setSelectedType(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-4 border-b border-white/10 bg-slate-800/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  {selectedType === 'users' && (
                    <input
                      type="text"
                      value={searchUsers}
                      onChange={(e) => setSearchUsers(e.target.value)}
                      placeholder="Search users..."
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
                    />
                  )}
                  {selectedType === 'topics' && (
                    <input
                      type="text"
                      value={searchTopics}
                      onChange={(e) => setSearchTopics(e.target.value)}
                      placeholder="Search topics..."
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
                    />
                  )}
                  {selectedType === 'posts' && (
                    <input
                      type="text"
                      value={searchPosts}
                      onChange={(e) => setSearchPosts(e.target.value)}
                      placeholder="Search posts..."
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
                    />
                  )}
                  {selectedType === 'feedback' && (
                    <input
                      type="text"
                      value={searchFeedback}
                      onChange={(e) => setSearchFeedback(e.target.value)}
                      placeholder="Search feedback..."
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
                    />
                  )}
                  {selectedType === 'messages' && (
                    <input
                      type="text"
                      value={searchMessages}
                      onChange={(e) => setSearchMessages(e.target.value)}
                      placeholder="Search messages..."
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
                    />
                  )}
                </div>
              </div>

              {/* Table Content */}
              <div className="flex-1 overflow-auto">
                {selectedType === 'users' && (
                  <div className="p-4">
                    {loadingUsers ? (
                      <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                              <th className="px-4 py-3 text-left font-semibold text-white">Username</th>
                              <th className="px-4 py-3 text-left font-semibold text-white">Email</th>
                              <th className="px-4 py-3 text-left font-semibold text-white">Role</th>
                              <th className="px-4 py-3 text-left font-semibold text-white">School</th>
                              <th className="px-4 py-3 text-left font-semibold text-white">Joined</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.length === 0 ? (
                              <tr>
                                <td colSpan="5" className="px-4 py-6 text-center text-gray-400">
                                  No users found
                                </td>
                              </tr>
                            ) : (
                              users.map((u) => (
                                <tr key={u.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                  <td className="px-4 py-3 text-white">{u.username}</td>
                                  <td className="px-4 py-3 text-gray-300">{u.email}</td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${u.role === 'teacher' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'}`}>
                                      {u.role}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-gray-300">{u.school || 'N/A'}</td>
                                  <td className="px-4 py-3 text-gray-300">{new Date(u.created_at).toLocaleDateString()}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {selectedType === 'topics' && (
                  <div className="p-4">
                    {loadingTopics ? (
                      <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                              <th className="px-4 py-3 text-left font-semibold text-white">Title</th>
                              <th className="px-4 py-3 text-left font-semibold text-white">Author</th>
                              <th className="px-4 py-3 text-left font-semibold text-white">Category</th>
                              <th className="px-4 py-3 text-left font-semibold text-white">Views</th>
                              <th className="px-4 py-3 text-left font-semibold text-white">Created</th>
                            </tr>
                          </thead>
                          <tbody>
                            {topics.length === 0 ? (
                              <tr>
                                <td colSpan="5" className="px-4 py-6 text-center text-gray-400">
                                  No topics found
                                </td>
                              </tr>
                            ) : (
                              topics.map((t) => (
                                <tr key={t.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                  <td className="px-4 py-3 text-white truncate max-w-xs">{t.title}</td>
                                  <td className="px-4 py-3 text-gray-300">{t.author}</td>
                                  <td className="px-4 py-3 text-gray-300">{t.category}</td>
                                  <td className="px-4 py-3 text-gray-300">{t.views || 0}</td>
                                  <td className="px-4 py-3 text-gray-300">{new Date(t.created_at).toLocaleDateString()}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {selectedType === 'posts' && (
                  <div className="p-4">
                    {loadingPosts ? (
                      <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                              <th className="px-4 py-3 text-left font-semibold text-white">Content</th>
                              <th className="px-4 py-3 text-left font-semibold text-white">Author</th>
                              <th className="px-4 py-3 text-left font-semibold text-white">Topic</th>
                              <th className="px-4 py-3 text-left font-semibold text-white">Created</th>
                            </tr>
                          </thead>
                          <tbody>
                            {posts.length === 0 ? (
                              <tr>
                                <td colSpan="4" className="px-4 py-6 text-center text-gray-400">
                                  No posts found
                                </td>
                              </tr>
                            ) : (
                              posts.map((p) => (
                                <tr key={p.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                  <td className="px-4 py-3 text-white truncate max-w-xs">{p.content}</td>
                                  <td className="px-4 py-3 text-gray-300">{p.author}</td>
                                  <td className="px-4 py-3 text-gray-300 truncate max-w-xs">{p.topic}</td>
                                  <td className="px-4 py-3 text-gray-300">{new Date(p.created_at).toLocaleDateString()}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {selectedType === 'feedback' && (
                  <div className="p-4">
                    {loadingFeedback ? (
                      <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                              <th className="px-4 py-3 text-left font-semibold text-white">Content</th>
                              <th className="px-4 py-3 text-left font-semibold text-white">Author</th>
                              <th className="px-4 py-3 text-left font-semibold text-white">Email</th>
                              <th className="px-4 py-3 text-left font-semibold text-white">Created</th>
                            </tr>
                          </thead>
                          <tbody>
                            {feedbacks.length === 0 ? (
                              <tr>
                                <td colSpan="4" className="px-4 py-6 text-center text-gray-400">
                                  No feedback found
                                </td>
                              </tr>
                            ) : (
                              feedbacks.map((f) => (
                                <tr key={f.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                  <td className="px-4 py-3 text-white truncate max-w-xs">{f.content}</td>
                                  <td className="px-4 py-3 text-gray-300">{f.author_name || f.username}</td>
                                  <td className="px-4 py-3 text-gray-300">{f.email}</td>
                                  <td className="px-4 py-3 text-gray-300">{new Date(f.created_at).toLocaleDateString()}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {selectedType === 'messages' && (
                  <div className="p-4">
                    {loadingMessages ? (
                      <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                              <th className="px-4 py-3 text-left font-semibold text-white">Content</th>
                              <th className="px-4 py-3 text-left font-semibold text-white">From</th>
                              <th className="px-4 py-3 text-left font-semibold text-white">To</th>
                              <th className="px-4 py-3 text-left font-semibold text-white">Status</th>
                              <th className="px-4 py-3 text-left font-semibold text-white">Sent</th>
                            </tr>
                          </thead>
                          <tbody>
                            {messages.length === 0 ? (
                              <tr>
                                <td colSpan="5" className="px-4 py-6 text-center text-gray-400">
                                  No messages found
                                </td>
                              </tr>
                            ) : (
                              messages.map((m) => (
                                <tr key={m.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                  <td className="px-4 py-3 text-white truncate max-w-xs">{m.content}</td>
                                  <td className="px-4 py-3 text-gray-300">{m.sender}</td>
                                  <td className="px-4 py-3 text-gray-300">{m.receiver}</td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-1 text-xs rounded font-semibold ${m.is_read ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                      {m.is_read ? 'Read' : 'Unread'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-gray-300">{new Date(m.created_at).toLocaleDateString()}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
