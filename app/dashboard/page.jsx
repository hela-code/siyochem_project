'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Users,
  MessageCircle,
  BookOpen,
  ChevronRight,
  MessageSquare,
  Clock,
  Award,
  TrendingUp,
  Zap,
  X,
  Loader2,
} from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'

export default function Dashboard() {
  const { user, isAuthenticated, loading, token } = useAuthStore()
  const router = useRouter()

  // Teacher counts
  const [counts, setCounts] = useState({
    users: 0,
    topics: 0,
    posts: 0,
    feedbacks: 0,
    messages: 0,
  })

  // Student stats
  const [studentStats, setStudentStats] = useState({
    topicsCreated: 0,
    postsCount: 0,
    quizzesTaken: 0,
    averageScore: 0,
    messagesCount: 0,
  })

  const [loadingCounts, setLoadingCounts] = useState(false)

  // Detail view state
  const [selectedCard, setSelectedCard] = useState(null)
  const [detailedData, setDetailedData] = useState([])
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login')
  }, [loading, isAuthenticated, router])

  // Fetch counts on mount
  useEffect(() => {
    if (!token || !user) return
    user.role === 'teacher' ? fetchTeacherCounts() : fetchStudentStats()
  }, [token, user])

  const fetchTeacherCounts = async () => {
    if (!token) return
    const headers = { Authorization: `Bearer ${token}` }
    setLoadingCounts(true)

    try {
      const [usersRes, topicsRes, postsRes, feedbackRes, messagesRes] = await Promise.all([
        axios.get('/api/admin/users?limit=1', { headers }).catch(() => ({ data: { total: 0 } })),
        axios.get('/api/admin/topics?limit=1', { headers }).catch(() => ({ data: { total: 0 } })),
        axios.get('/api/admin/posts?limit=1', { headers }).catch(() => ({ data: { total: 0 } })),
        axios.get('/api/admin/feedback?limit=1', { headers }).catch(() => ({ data: { total: 0 } })),
        axios.get('/api/admin/messages?limit=1', { headers }).catch(() => ({ data: { total: 0 } })),
      ])

      setCounts({
        users: usersRes.data.total || 0,
        topics: topicsRes.data.total || 0,
        posts: postsRes.data.total || 0,
        feedbacks: feedbackRes.data.total || 0,
        messages: messagesRes.data.total || 0,
      })
    } catch (error) {
      console.error('Error fetching counts:', error)
    } finally {
      setLoadingCounts(false)
    }
  }

  const fetchStudentStats = async () => {
    if (!token || !user?.id) return
    const headers = { Authorization: `Bearer ${token}` }
    setLoadingCounts(true)

    try {
      // Fetch user profile with stats
      const userRes = await axios.get(`/api/users/${user.id}`, { headers }).catch(() => ({ 
        data: { user: {
          stats: {
            postsCount: 0,
            quizzesTaken: 0,
            averageScore: 0
          },
          topicCount: 0
        }}
      }))

      const userStats = userRes.data?.user?.stats || {}
      const userTopicCount = userRes.data?.user?.topicCount || 0

      // Fetch messages count
      const messagesRes = await axios.get('/api/messages', { headers }).catch(() => ({ 
        data: { conversations: [] } 
      }))

      const messagesCount = messagesRes.data?.conversations?.length || 0

      setStudentStats({
        topicsCreated: userTopicCount,
        postsCount: userStats.postsCount || 0,
        quizzesTaken: userStats.quizzesTaken || 0,
        averageScore: userStats.averageScore || 0,
        messagesCount: messagesCount,
      })
    } catch (error) {
      console.error('Error fetching student stats:', error)
      // Fallback to user object data
      setStudentStats({
        topicsCreated: user.topicsCreated || 0,
        postsCount: user.posts_count || 0,
        quizzesTaken: user.quizzes_taken || 0,
        averageScore: user.average_score || 0,
        messagesCount: user.messages_count || 0,
      })
    } finally {
      setLoadingCounts(false)
    }
  }

  // Fetch detailed data when a card is selected
  const handleCardClick = async (cardId) => {
    setSelectedCard(cardId)
    setLoadingDetails(true)
    setDetailedData([])

    try {
      const headers = { Authorization: `Bearer ${token}` }

      if (user?.role === 'teacher') {
        // Teacher dashboard - fetch admin data
        let response
        switch (cardId) {
          case 'users':
            response = await axios.get('/api/admin/users?limit=10', { headers })
            setDetailedData(response.data.users || [])
            break
          case 'topics':
            response = await axios.get('/api/admin/topics?limit=10', { headers })
            setDetailedData(response.data.topics || [])
            break
          case 'posts':
            response = await axios.get('/api/admin/posts?limit=10', { headers })
            setDetailedData(response.data.posts || [])
            break
          case 'feedback':
            response = await axios.get('/api/admin/feedback?limit=10', { headers })
            setDetailedData(response.data.feedbacks || [])
            break
          case 'messages':
            response = await axios.get('/api/admin/messages?limit=10', { headers })
            setDetailedData(response.data.messages || [])
            break
          default:
            break
        }
      } else {
        // Student dashboard - fetch user-specific data
        let response
        switch (cardId) {
          case 'experiments_created':
            response = await axios.get(`/api/topics?author=${user?.id}&limit=10`, { headers })
            setDetailedData(response.data.topics || response.data.data || [])
            break
          case 'reactions_posted':
            response = await axios.get(`/api/posts`, { headers })
            // Filter by current user since API might not support author filter
            const userPosts = (response.data.posts || response.data.data || []).filter(p => p.author?.id === user?.id || p.author_id === user?.id)
            setDetailedData(userPosts.slice(0, 10))
            break
          case 'lab_tests':
            response = await axios.get(`/api/users/${user?.id}/quizzes?limit=10`, { headers })
            setDetailedData(response.data.quizzes || response.data.data || [])
            break
          case 'messages_inbox':
            response = await axios.get('/api/messages', { headers })
            setDetailedData(response.data.conversations || response.data.messages || response.data.data || [])
            break
          case 'average_yield':
            response = await axios.get(`/api/users/${user?.id}/quizzes?limit=10`, { headers })
            setDetailedData(response.data.quizzes || response.data.data || [])
            break
          default:
            break
        }
      }
    } catch (error) {
      console.error('Error fetching detailed data:', error)
      setDetailedData([])
    } finally {
      setLoadingDetails(false)
    }
  }
  const teacherCards = [
    {
      id: 'users',
      title: 'Chemists',
      icon: Users,
      count: counts.users,
      href: '/dashboard/users',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
    },
    {
      id: 'topics',
      title: 'Experiments',
      icon: BookOpen,
      count: counts.topics,
      href: '/dashboard/topics',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      iconColor: 'text-green-400',
    },
    {
      id: 'posts',
      title: 'Reactions',
      icon: MessageCircle,
      count: counts.posts,
      href: '/dashboard/posts',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400',
    },
    {
      id: 'feedback',
      title: 'Reaction Wall',
      icon: MessageSquare,
      count: counts.feedbacks,
      href: '/dashboard/feedback',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      iconColor: 'text-orange-400',
    },
    {
      id: 'messages',
      title: 'Element Card',
      icon: Clock,
      count: counts.messages,
      href: '/dashboard/messages',
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      iconColor: 'text-cyan-400',
    },
  ]

  // Grid cards configuration - STUDENT ONLY
  const studentCards = [
    {
      id: 'experiments_created',
      title: 'Experiments Created',
      icon: BookOpen,
      count: studentStats.topicsCreated || 0,
      href: '/topics?filter=my',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      iconColor: 'text-green-400',
      subtitle: 'Topics created'
    },
    {
      id: 'reactions_posted',
      title: 'Reactions Posted',
      icon: MessageCircle,
      count: studentStats.postsCount || 0,
      href: '/posts?filter=my',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400',
      subtitle: 'Posts shared'
    },
    {
      id: 'lab_tests',
      title: 'Lab Tests Taken',
      icon: Award,
      count: studentStats.quizzesTaken || 0,
      href: '/quizzes?filter=completed',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
      subtitle: 'Tests completed'
    },
    {
      id: 'average_yield',
      title: 'Average Yield',
      icon: TrendingUp,
      count: `${Math.round(studentStats.averageScore)}%`,
      href: '/quizzes?filter=results',
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      iconColor: 'text-yellow-400',
      subtitle: 'Average test score'
    },
    {
      id: 'messages_inbox',
      title: 'Messages Inbox',
      icon: MessageSquare,
      count: studentStats.messagesCount || 0,
      href: '/messages',
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      iconColor: 'text-cyan-400',
      subtitle: 'Inbox messages'
    },
  ]

  if (loading || loadingCounts) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // STUDENT DASHBOARD
  if (user?.role === 'student') {
    return (
      <div className="min-h-screen pb-12 px-4 md:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome back, {user?.profile?.firstName}! 👋
          </h1>
          <p className="text-gray-300">Your chemistry learning dashboard</p>
        </motion.div>

        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-xl border border-primary-500/30 mb-8"
        >
          <div className="flex items-center gap-4">
            <Zap className="w-8 h-8 text-primary-400 shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-white">Keep Learning!</h2>
              <p className="text-gray-300 text-sm">Continue exploring experiments, take lab tests, and share your reactions with the community.</p>
            </div>
          </div>
        </motion.div>

        {/* Student Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 rounded-xl border border-cyan-500/30 bg-cyan-500/5 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                {user?.profile?.firstName?.charAt(0)}{user?.profile?.lastName?.charAt(0)}
              </div>
              <div>
                <p className="text-xs text-gray-400">Student Name</p>
                <h3 className="text-lg font-semibold text-white">{user?.profile?.firstName} {user?.profile?.lastName}</h3>
                <p className="text-sm text-gray-300">{user?.profile?.school || 'School'}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1">Grade / Class</p>
              <p className="text-white font-semibold text-lg">{user?.profile?.grade || 'N/A'}</p>
              <p className="text-sm text-gray-300">Student ID: {user?.id?.substring(0, 8)}...</p>
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-400">Member Since</p>
                <p className="text-white font-semibold">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
              <Link href={`/profile/${user?.id}`}>
                <button className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors mt-2 font-semibold">
                  View Full Profile →
                </button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Student Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          {studentCards.map((card, index) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <button
                  onClick={() => handleCardClick(card.id)}
                  className={`w-full glass-card p-6 rounded-xl border ${card.borderColor} ${card.bgColor} cursor-pointer h-full flex flex-col items-center justify-center text-center hover:shadow-lg transition-all duration-300`}
                >
                  {/* Icon */}
                  <div className={`p-3 rounded-lg ${card.bgColor} mb-4`}>
                    <Icon className={`w-8 h-8 ${card.iconColor}`} />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>

                  {/* Count Badge */}
                  <div className={`text-2xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent mb-2`}>
                    {card.count}
                  </div>

                  {/* Subtitle */}
                  <p className="text-xs text-gray-400 mb-3">{card.subtitle}</p>

                  {/* View Details Link */}
                  <div className="flex items-center gap-1 text-sm text-gray-300 hover:text-white transition-colors mt-auto">
                    <span>View</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              </motion.div>
            )
          })}
        </div>

        {/* Quick Links Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/topics">
              <div className="glass-card p-6 rounded-xl border border-green-500/30 bg-green-500/5 hover:bg-green-500/10 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <BookOpen className="w-8 h-8 text-green-400" />
                  <div>
                    <h3 className="font-semibold text-white">Browse Experiments</h3>
                    <p className="text-sm text-gray-300">Explore chemistry experiments</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/quizzes">
              <div className="glass-card p-6 rounded-xl border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <Award className="w-8 h-8 text-blue-400" />
                  <div>
                    <h3 className="font-semibold text-white">Take Lab Tests</h3>
                    <p className="text-sm text-gray-300">Test your compounds</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedCard && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCard(null)}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-card rounded-xl max-w-4xl w-full max-h-96 overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                  <h2 className="text-2xl font-bold text-white capitalize">
                    {selectedCard.replace(/_/g, ' ')}
                  </h2>
                  <button
                    onClick={() => setSelectedCard(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {loadingDetails ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
                    </div>
                  ) : detailedData.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <p>No data available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {detailedData.map((item, idx) => (
                        <div key={item.id || idx} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Display different fields for student cards */}
                            {selectedCard === 'experiments_created' && (
                              <>
                                <div className="md:col-span-2">
                                  <p className="text-xs text-gray-400">Title</p>
                                  <p className="text-white font-semibold">{item.title || 'No title'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Category</p>
                                  <p className="text-white font-semibold">{item.category || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Reactions Count</p>
                                  <p className="text-white font-semibold">{item.posts_count || 0}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Created</p>
                                  <p className="text-white font-semibold">{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}</p>
                                </div>
                              </>
                            )}
                            {selectedCard === 'reactions_posted' && (
                              <>
                                <div className="md:col-span-2">
                                  <p className="text-xs text-gray-400">Content</p>
                                  <p className="text-white font-semibold line-clamp-3">{item.content || 'No content'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Topic</p>
                                  <p className="text-white font-semibold">{item.topic_title || item.topic || 'Unknown'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Posted</p>
                                  <p className="text-white font-semibold">{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}</p>
                                </div>
                              </>
                            )}
                            {selectedCard === 'lab_tests' && (
                              <>
                                <div className="md:col-span-2">
                                  <p className="text-xs text-gray-400">Test Title</p>
                                  <p className="text-white font-semibold">{item.title || 'No title'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Category</p>
                                  <p className="text-white font-semibold">{item.category || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Duration (mins)</p>
                                  <p className="text-white font-semibold">{item.duration || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Total Attempts</p>
                                  <p className="text-white font-semibold">{item.totalAttempts || 0}</p>
                                </div>
                              </>
                            )}
                            {selectedCard === 'average_yield' && (
                              <>
                                <div className="md:col-span-2">
                                  <p className="text-xs text-gray-400">Test Title</p>
                                  <p className="text-white font-semibold">{item.title || 'No title'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Category</p>
                                  <p className="text-white font-semibold">{item.category || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Total Marks</p>
                                  <p className="text-white font-semibold">{item.totalMarks || 0}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Passing Marks</p>
                                  <p className="text-white font-semibold">{item.passingMarks || 0}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Total Attempts</p>
                                  <p className="text-white font-semibold">{item.totalAttempts || 0}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Created</p>
                                  <p className="text-white font-semibold">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</p>
                                </div>
                              </>
                            )}
                            {selectedCard === 'messages_inbox' && (
                              <>
                                <div className="md:col-span-2">
                                  <p className="text-xs text-gray-400">Conversation with</p>
                                  <p className="text-white font-semibold">{item.username || item.partner?.username || 'Unknown User'}</p>
                                </div>
                                <div className="md:col-span-2">
                                  <p className="text-xs text-gray-400">Last Message</p>
                                  <p className="text-white font-semibold line-clamp-2">{item.last_message || 'No messages'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Unread Count</p>
                                  <p className="text-white font-semibold">{item.unread_count || 0}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Last Activity</p>
                                  <p className="text-white font-semibold">{item.last_message_at ? new Date(item.last_message_at).toLocaleDateString() : 'N/A'}</p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
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

  // TEACHER DASHBOARD
  return (
    <div className="min-h-screen pb-12 px-4 md:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Welcome back, {user?.profile?.firstName}! 👋
        </h1>
        <p className="text-gray-300">Lab Administration Dashboard</p>
      </motion.div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        {teacherCards.map((card, index) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <button
                onClick={() => handleCardClick(card.id)}
                className={`w-full glass-card p-6 rounded-xl border ${card.borderColor} ${card.bgColor} cursor-pointer h-full flex flex-col items-center justify-center text-center hover:shadow-lg transition-all duration-300`}
              >
                {/* Icon */}
                <div className={`p-3 rounded-lg ${card.bgColor} mb-4`}>
                  <Icon className={`w-8 h-8 ${card.iconColor}`} />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>

                {/* Count Badge */}
                <div className={`text-2xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent mb-3`}>
                  {card.count}
                </div>

                {/* View Details Link */}
                <div className="flex items-center gap-1 text-sm text-gray-300 hover:text-white transition-colors mt-auto">
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCard(null)}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-xl max-w-4xl w-full max-h-96 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                <h2 className="text-2xl font-bold text-white capitalize">
                  {selectedCard.replace(/_/g, ' ')}
                </h2>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {loadingDetails ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
                  </div>
                ) : detailedData.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <p>No data available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {detailedData.map((item, idx) => (
                      <div key={item.id || idx} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Display different fields based on card type */}
                          {selectedCard === 'users' && (
                            <>
                              <div>
                                <p className="text-xs text-gray-400">Username</p>
                                <p className="text-white font-semibold">{item.username}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Email</p>
                                <p className="text-white font-semibold">{item.email}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Role</p>
                                <p className="text-white font-semibold capitalize">{item.role}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">School</p>
                                <p className="text-white font-semibold">{item.school || 'N/A'}</p>
                              </div>
                            </>
                          )}
                          {selectedCard === 'topics' && (
                            <>
                              <div className="md:col-span-2">
                                <p className="text-xs text-gray-400">Title</p>
                                <p className="text-white font-semibold">{item.title}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Author</p>
                                <p className="text-white font-semibold">{item.author}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Category</p>
                                <p className="text-white font-semibold">{item.category}</p>
                              </div>
                            </>
                          )}
                          {selectedCard === 'posts' && (
                            <>
                              <div className="md:col-span-2">
                                <p className="text-xs text-gray-400">Content</p>
                                <p className="text-white font-semibold truncate">{item.content}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Author</p>
                                <p className="text-white font-semibold">{item.author}</p>
                              </div>
                            </>
                          )}
                          {selectedCard === 'feedback' && (
                            <>
                              <div className="md:col-span-2">
                                <p className="text-xs text-gray-400">Feedback</p>
                                <p className="text-white font-semibold">{item.content}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Author</p>
                                <p className="text-white font-semibold">{item.author_name}</p>
                              </div>
                            </>
                          )}
                          {selectedCard === 'messages' && (
                            <>
                              <div className="md:col-span-2">
                                <p className="text-xs text-gray-400">Message</p>
                                <p className="text-white font-semibold truncate">{item.content}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">From</p>
                                <p className="text-white font-semibold">{item.from}</p>
                              </div>
                            </>
                          )}
                          {/* Student dashboard items */}
                          {selectedCard === 'experiments_created' && (
                            <>
                              <div className="md:col-span-2">
                                <p className="text-xs text-gray-400">Title</p>
                                <p className="text-white font-semibold">{item.title}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Category</p>
                                <p className="text-white font-semibold">{item.category}</p>
                              </div>
                            </>
                          )}
                          {selectedCard === 'reactions_posted' && (
                            <>
                              <div className="md:col-span-2">
                                <p className="text-xs text-gray-400">Content</p>
                                <p className="text-white font-semibold">{item.content}</p>
                              </div>
                            </>
                          )}
                          {selectedCard === 'lab_tests' && (
                            <>
                              <div>
                                <p className="text-xs text-gray-400">Test</p>
                                <p className="text-white font-semibold">{item.title}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Score</p>
                                <p className="text-white font-semibold">{item.score || 'N/A'}</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
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
