'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Mail,
  Calendar,
  MapPin,
  BookOpen,
  Brain,
  Award,
  TrendingUp,
  Edit,
  Twitter,
  Linkedin,
  Instagram,
  FlaskConical,
  MessageCircle,
  ThumbsUp,
  Clock,
  ChevronRight,
  Save,
  X,
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  Link2,
  Heart,
  Camera,
  Trash2,
  Send,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'

export default function Profile() {
  const { id } = useParams()
  const router = useRouter()
  const { user: currentUser, isAuthenticated, token } = useAuthStore()

  const [user, setUser] = useState(null)
  const [activities, setActivities] = useState([])
  const [quizResults, setQuizResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [bonded, setBonded] = useState(false)
  const [bondCount, setBondCount] = useState(0)
  const [outgoingBondCount, setOutgoingBondCount] = useState(0)
  const [bonding, setBonding] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showBondList, setShowBondList] = useState(false)
  const [bondList, setBondList] = useState([])
  const [loadingBonds, setLoadingBonds] = useState(false)

  const isOwnProfile = currentUser?.id === id

  // Keep token in a ref so useEffect doesn't re-trigger when store updates
  const tokenRef = useRef(token)
  useEffect(() => { tokenRef.current = token }, [token])

  // Helper: fetch profile from API and update all state
  const refreshProfile = async () => {
    try {
      const t = tokenRef.current
      const headers = t ? { Authorization: `Bearer ${t}` } : {}
      const { data } = await axios.get(`/api/users/${id}`, { headers })
      if (data.success) {
        setUser(data.user)
        setBondCount(data.user.bondCount || 0)
        setOutgoingBondCount(data.user.outgoingBondCount || 0)
        setBonded(data.user.userBonded || false)
        setEditForm({
          firstName: data.user.profile?.firstName || '',
          lastName: data.user.profile?.lastName || '',
          bio: data.user.profile?.bio || '',
          avatar: data.user.profile?.avatar || '',
          school: data.user.profile?.school || '',
          grade: data.user.profile?.grade || '',
          twitter: data.user.socialLinks?.twitter || '',
          linkedin: data.user.socialLinks?.linkedin || '',
          instagram: data.user.socialLinks?.instagram || '',
        })
        // Keep Zustand store in sync for Navbar
        if (isOwnProfile) {
          useAuthStore.setState({ user: data.user })
        }
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err)
    }
  }

  // Fetch user profile — only on mount or when id changes
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        await refreshProfile()
      } catch (err) {
        console.error('Failed to fetch profile:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [id])

  // Fetch activity
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const { data } = await axios.get(`/api/users/${id}/activity`)
        if (data.success) setActivities(data.activities)
      } catch (err) {
        console.error('Failed to fetch activity:', err)
      }
    }
    fetchActivity()
  }, [id])

  // Fetch quiz results (own profile only)
  useEffect(() => {
    if (!isOwnProfile || !token) return
    const fetchQuizzes = async () => {
      try {
        const { data } = await axios.get(`/api/users/${id}/quizzes`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (data.success) setQuizResults(data.results)
      } catch (err) {
        console.error('Failed to fetch quiz results:', err)
      }
    }
    fetchQuizzes()
  }, [id, isOwnProfile, token])

  const handleBond = async () => {
    if (!isAuthenticated || !token) {
      router.push('/login')
      return
    }
    try {
      setBonding(true)
      const { data } = await axios.post(
        `/api/users/${id}/bond`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.success) {
        setBonded(data.bonded)
        setBondCount(data.bondCount)
      }
    } catch (err) {
      console.error('Failed to toggle bond:', err)
    } finally {
      setBonding(false)
    }
  }

  const handleSaveProfile = async () => {
    // Validate required fields
    if (!editForm.firstName?.trim() || !editForm.lastName?.trim()) {
      toast.error('First name and last name are required')
      return
    }

    try {
      setSaving(true)
      const payload = {
        profile: {
          firstName: editForm.firstName.trim(),
          lastName: editForm.lastName.trim(),
          bio: editForm.bio?.trim() || null,
          avatar: editForm.avatar || null,
          school: editForm.school?.trim() || null,
          grade: editForm.grade?.trim() || null,
        },
        socialLinks: {
          twitter: editForm.twitter?.trim() || null,
          linkedin: editForm.linkedin?.trim() || null,
          instagram: editForm.instagram?.trim() || null,
        },
      }

      const { data } = await axios.put(
        `/api/users/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        // Update local user state directly from PUT response (preserving bondCount, etc.)
        setUser((prev) => ({
          ...prev,
          ...data.user,
          bondCount: prev?.bondCount ?? data.user.bondCount,
          outgoingBondCount: prev?.outgoingBondCount ?? data.user.outgoingBondCount,
          quizCount: prev?.quizCount ?? data.user.quizCount,
          topicCount: prev?.topicCount ?? data.user.topicCount,
          userBonded: prev?.userBonded ?? data.user.userBonded,
        }))

        // Sync editForm with response so re-opening edit shows DB data
        setEditForm({
          firstName: data.user.profile?.firstName || '',
          lastName: data.user.profile?.lastName || '',
          bio: data.user.profile?.bio || '',
          avatar: data.user.profile?.avatar || '',
          school: data.user.profile?.school || '',
          grade: data.user.profile?.grade || '',
          twitter: data.user.socialLinks?.twitter || '',
          linkedin: data.user.socialLinks?.linkedin || '',
          instagram: data.user.socialLinks?.instagram || '',
        })

        setIsEditing(false)
        toast.success('Profile updated successfully!')

        // Update Zustand store for Navbar (without triggering page reload)
        if (isOwnProfile) {
          useAuthStore.setState({ user: data.user })
        }
      } else {
        toast.error(data.message || 'Failed to update profile')
      }
    } catch (err) {
      console.error('Failed to update profile:', err)
      toast.error(err?.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
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
    return formatDate(dateStr)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary-400 animate-spin" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-10 rounded-2xl text-center">
          <User className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">User Not Found</h2>
          <p className="text-gray-400 mb-6">This profile doesn&apos;t exist or has been removed.</p>
          <button onClick={() => router.push('/')} className="btn-primary px-6 py-2">
            Go to Lab
          </button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'activity', label: 'Reactions', icon: TrendingUp },
    ...(isOwnProfile ? [{ id: 'quizzes', label: 'My Experiments', icon: Brain }] : []),
    { id: 'about', label: 'About', icon: FileText },
  ]

  return (
    <div className="min-h-screen pb-12">
      {/* ==================== COVER PHOTO + PROFILE HEADER ==================== */}
      <div className="relative">
        {/* Cover Photo */}
        <div className="h-48 sm:h-64 md:h-72 bg-gradient-to-br from-primary-600 via-blue-600 to-purple-700 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="molecules" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="8" fill="white" opacity="0.3" />
                  <circle cx="60" cy="50" r="5" fill="white" opacity="0.2" />
                  <circle cx="100" cy="30" r="6" fill="white" opacity="0.25" />
                  <line x1="20" y1="20" x2="60" y2="50" stroke="white" strokeWidth="1.5" opacity="0.2" />
                  <line x1="60" y1="50" x2="100" y2="30" stroke="white" strokeWidth="1.5" opacity="0.2" />
                  <circle cx="40" cy="90" r="4" fill="white" opacity="0.15" />
                  <line x1="60" y1="50" x2="40" y2="90" stroke="white" strokeWidth="1" opacity="0.15" />
                </pattern>
              </defs>
              <rect width="800" height="300" fill="url(#molecules)" />
            </svg>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0f172a] to-transparent" />
        </div>

        {/* Profile Header Overlay */}
        <div className="container mx-auto px-4">
          <div className="relative -mt-20 sm:-mt-24 flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative z-10"
            >
              {user.profile?.avatar ? (
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-[#0f172a] shadow-2xl overflow-hidden">
                  <img src={user.profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center border-4 border-[#0f172a] shadow-2xl">
                  <span className="text-white text-5xl sm:text-6xl font-bold">
                    {user.profile?.firstName?.[0] || ''}{user.profile?.lastName?.[0] || ''}
                  </span>
                </div>
              )}
              {user.role === 'teacher' && (
                <div className="absolute bottom-2 right-2 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center border-3 border-[#0f172a] shadow-lg">
                  <FlaskConical className="w-5 h-5 text-white" />
                </div>
              )}
            </motion.div>

            {/* Name + Actions */}
            <div className="flex-1 pb-4 sm:pb-6 w-full">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl sm:text-4xl font-bold text-white"
                  >
                    {user.profile?.firstName} {user.profile?.lastName}
                  </motion.h1>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-gray-400 text-lg">@{user.username}</p>
                    <span className="px-3 py-0.5 bg-primary-500/20 text-primary-400 text-xs rounded-full capitalize font-medium">
                      {user.role}
                    </span>
                  </div>
                  {user.profile?.bio && (
                    <p className="text-gray-300 mt-2 max-w-xl text-sm leading-relaxed">{user.profile.bio}</p>
                  )}
                </div>

                {isOwnProfile ? (
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditing(!isEditing)}
                      className="btn-primary flex items-center gap-2 px-4 py-2 text-xs sm:text-sm sm:px-5 sm:py-2.5 shrink-0"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Element Card
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push('/dashboard')}
                      className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm sm:px-5 sm:py-2.5 font-semibold rounded-xl bg-white/10 border border-white/20 text-gray-300 hover:bg-white/20 hover:text-white transition-all duration-300 shrink-0"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Lab Dashboard
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push('/messages')}
                      className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm sm:px-5 sm:py-2.5 font-semibold rounded-xl bg-white/10 border border-white/20 text-gray-300 hover:bg-white/20 hover:text-white transition-all duration-300 shrink-0"
                    >
                      <Send className="w-4 h-4" />
                      Messages
                    </motion.button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleBond}
                      disabled={bonding}
                      className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 shrink-0 ${
                        bonded
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                          : 'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      <Link2 className={`w-4 h-4 ${bonding ? 'animate-spin' : ''}`} />
                      {bonding ? '...' : bonded ? 'Bonded' : 'Bond'}
                      {bondCount > 0 && (
                        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                          bonded ? 'bg-white/20' : 'bg-white/10'
                        }`}>
                          {bondCount}
                        </span>
                      )}
                    </motion.button>

                    {/* Message Button — bond only */}
                    {isAuthenticated && bonded && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push(`/messages?chat=${id}`)}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-white/10 border border-white/20 text-gray-300 hover:bg-white/20 hover:text-white transition-all duration-300 shrink-0"
                      >
                        <Send className="w-4 h-4" />
                        Message
                      </motion.button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-4">
        {/* ==================== STATS BAR ==================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-4 mb-6"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Link2, value: isOwnProfile ? (outgoingBondCount || 0) : (bondCount || 0), label: isOwnProfile ? 'My Bonds' : 'Bonds', color: 'text-cyan-400', clickable: true },
              { icon: BookOpen, value: user.stats?.postsCount || 0, label: 'Reactions', color: 'text-blue-400' },
              { icon: Brain, value: user.stats?.quizzesTaken || 0, label: 'Experiments', color: 'text-purple-400' },
              { icon: Award, value: `${user.stats?.averageScore || 0}%`, label: 'Avg Yield', color: 'text-yellow-400' },
            ].map(({ icon: Icon, value, label, color, clickable }) => (
              <div
                key={label}
                onClick={clickable ? async () => {
                  setShowBondList(true)
                  setLoadingBonds(true)
                  try {
                    const { data } = await axios.get(`/api/users/${id}/bonds${isOwnProfile ? '?direction=outgoing' : ''}`)
                    if (data.success) setBondList(data.bonds)
                  } catch (err) {
                    console.error('Failed to fetch bonds:', err)
                  } finally {
                    setLoadingBonds(false)
                  }
                } : undefined}
                className={`text-center py-2 ${clickable ? 'cursor-pointer hover:bg-white/5 rounded-lg transition-colors' : ''}`}
              >
                <Icon className={`w-6 h-6 ${color} mx-auto mb-1`} />
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-gray-400 text-xs uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ==================== TABS ==================== */}
        <div className="glass-card rounded-xl mb-6 overflow-hidden">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 whitespace-nowrap border-b-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-400 bg-primary-500/10'
                      : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ==================== EDIT PROFILE PANEL ==================== */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card rounded-xl p-6 mb-6 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Edit className="w-5 h-5 text-primary-400" />
                  Edit Element Card
                </h2>
                <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Picture Upload */}
              <div className="mb-6">
                <label className="text-gray-300 text-sm mb-2 block">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {editForm.avatar ? (
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/20">
                        <img src={editForm.avatar} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center border-2 border-white/20">
                        <span className="text-white text-2xl font-bold">
                          {editForm.firstName?.[0] || ''}{editForm.lastName?.[0] || ''}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="btn-primary flex items-center gap-2 px-4 py-2 text-sm cursor-pointer">
                      <Camera className="w-4 h-4" />
                      {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        className="hidden"
                        disabled={uploadingAvatar}
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          try {
                            setUploadingAvatar(true)
                            const formData = new FormData()
                            formData.append('file', file)
                            const { data } = await axios.post('/api/upload', formData, {
                              headers: { Authorization: `Bearer ${token}` },
                            })
                            if (data.success) {
                              setEditForm((f) => ({ ...f, avatar: data.url }))
                              // Instantly update the header avatar preview
                              setUser((prev) => ({
                                ...prev,
                                profile: { ...prev.profile, avatar: data.url },
                              }))
                            }
                          } catch (err) {
                            console.error('Failed to upload avatar:', err)
                          } finally {
                            setUploadingAvatar(false)
                            e.target.value = ''
                          }
                        }}
                      />
                    </label>
                    {editForm.avatar && (
                      <button
                        onClick={() => {
                          setEditForm((f) => ({ ...f, avatar: '' }))
                          setUser((prev) => ({
                            ...prev,
                            profile: { ...prev.profile, avatar: null },
                          }))
                        }}
                        className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 text-sm mb-1 block">First Name</label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm mb-1 block">Last Name</label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-gray-300 text-sm mb-1 block">Bio</label>
                  <textarea
                    rows={3}
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-colors resize-none"
                    placeholder="Tell people about yourself..."
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm mb-1 block">School</label>
                  <input
                    type="text"
                    value={editForm.school}
                    onChange={(e) => setEditForm({ ...editForm, school: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm mb-1 block">Grade</label>
                  <input
                    type="text"
                    value={editForm.grade}
                    onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm mb-1 block">Twitter URL</label>
                  <input
                    type="text"
                    value={editForm.twitter}
                    onChange={(e) => setEditForm({ ...editForm, twitter: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="https://twitter.com/..."
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm mb-1 block">LinkedIn URL</label>
                  <input
                    type="text"
                    value={editForm.linkedin}
                    onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm mb-1 block">Instagram URL</label>
                  <input
                    type="text"
                    value={editForm.instagram}
                    onChange={(e) => setEditForm({ ...editForm, instagram: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="https://instagram.com/..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==================== TAB CONTENT ==================== */}
        <AnimatePresence mode="wait">
          {/* ---------- OVERVIEW TAB ---------- */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left Column — Info Card */}
              <div className="space-y-6">
                {/* Intro / About */}
                <div className="glass-card p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary-400" /> Intro
                  </h3>
                  {user.profile?.bio && (
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">{user.profile.bio}</p>
                  )}
                  <div className="space-y-3 text-sm">
                    {user.profile?.school && (
                      <div className="flex items-center gap-3 text-gray-300">
                        <MapPin className="w-4 h-4 text-gray-500 shrink-0" />
                        <span>Studies at <strong className="text-white">{user.profile.school}</strong></span>
                      </div>
                    )}
                    {user.profile?.grade && (
                      <div className="flex items-center gap-3 text-gray-300">
                        <BookOpen className="w-4 h-4 text-gray-500 shrink-0" />
                        <span>Grade: <strong className="text-white">{user.profile.grade}</strong></span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-gray-300">
                      <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
                      <span>Joined {formatDate(user.createdAt)}</span>
                    </div>
                    {user.lastLogin && (
                      <div className="flex items-center gap-3 text-gray-300">
                        <Clock className="w-4 h-4 text-gray-500 shrink-0" />
                        <span>Last active {timeAgo(user.lastLogin)}</span>
                      </div>
                    )}
                  </div>

                  {/* Social Links */}
                  {(user.socialLinks?.twitter || user.socialLinks?.linkedin || user.socialLinks?.instagram) && (
                    <div className="mt-5 pt-4 border-t border-white/10">
                      <h4 className="text-sm font-medium text-gray-400 mb-3">Social Links</h4>
                      <div className="flex gap-3">
                        {user.socialLinks?.twitter && (
                          <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                            className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 transition-all">
                            <Twitter className="w-5 h-5" />
                          </a>
                        )}
                        {user.socialLinks?.linkedin && (
                          <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                            className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all">
                            <Linkedin className="w-5 h-5" />
                          </a>
                        )}
                        {user.socialLinks?.instagram && (
                          <a href={user.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                            className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-pink-400 hover:bg-pink-400/10 transition-all">
                            <Instagram className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Contributions Card */}
                <div className="glass-card p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" /> Contributions
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Topics Created</span>
                      <span className="text-white font-semibold">{user.topicCount || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Quizzes Created</span>
                      <span className="text-white font-semibold">{user.quizCount || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Member Since</span>
                      <span className="text-white font-semibold">{formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column — Recent Activity Feed */}
              <div className="lg:col-span-2 space-y-6">
                <div className="glass-card p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary-400" /> Recent Reactions
                  </h3>

                  {activities.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No reactions yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activities.slice(0, 8).map((activity, index) => (
                        <motion.div
                          key={activity.id || index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex gap-4 p-4 bg-white/5 hover:bg-white/[0.08] rounded-xl transition-colors cursor-pointer group"
                          onClick={() => {
                            if (activity.type === 'topic') router.push(`/topics/${activity.id}`)
                          }}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            activity.type === 'post' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                          }`}>
                            {activity.type === 'post' ? <MessageCircle className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                {activity.type === 'post' ? (
                                  <>
                                    <p className="text-white text-sm leading-relaxed line-clamp-2">{activity.content}</p>
                                    {activity.topic && (
                                      <p className="text-gray-500 text-xs mt-1">
                                        in <span className="text-primary-400">{activity.topic.title}</span>
                                      </p>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <p className="text-white font-medium text-sm group-hover:text-primary-400 transition-colors">{activity.title}</p>
                                    {activity.description && (
                                      <p className="text-gray-400 text-xs mt-1 line-clamp-1">{activity.description}</p>
                                    )}
                                  </>
                                )}
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 shrink-0 mt-0.5" />
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {activity.likesCount || 0}</span>
                              {activity.type === 'post' && (
                                <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {activity.commentsCount || 0}</span>
                              )}
                              {activity.type === 'topic' && (
                                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {activity.views || 0}</span>
                              )}
                              <span>{timeAgo(activity.createdAt)}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ---------- ACTIVITY TAB ---------- */}
          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-400" /> All Activity
                </h3>

                {activities.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No activity yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activities.map((activity, index) => (
                      <motion.div
                        key={activity.id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="flex gap-4 p-4 bg-white/5 hover:bg-white/[0.08] rounded-xl transition-colors cursor-pointer group"
                        onClick={() => {
                          if (activity.type === 'topic') router.push(`/topics/${activity.id}`)
                        }}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.type === 'post' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                          }`}>
                            {activity.type === 'post' ? <MessageCircle className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                          </div>
                          {index < activities.length - 1 && <div className="w-0.5 flex-1 bg-white/10 min-h-[20px]" />}
                        </div>
                        <div className="flex-1 min-w-0 pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-400 capitalize">{activity.type}</span>
                            <span className="text-xs text-gray-500">{timeAgo(activity.createdAt)}</span>
                          </div>
                          {activity.type === 'post' ? (
                            <>
                              <p className="text-white text-sm leading-relaxed">{activity.content}</p>
                              {activity.topic && (
                                <p className="text-gray-500 text-xs mt-1">
                                  in <span className="text-primary-400">{activity.topic.title}</span>
                                </p>
                              )}
                            </>
                          ) : (
                            <>
                              <p className="text-white font-medium text-sm group-hover:text-primary-400 transition-colors">{activity.title}</p>
                              {activity.description && <p className="text-gray-400 text-xs mt-1">{activity.description}</p>}
                            </>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {activity.likesCount || 0}</span>
                            {activity.type === 'post' && (
                              <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {activity.commentsCount || 0}</span>
                            )}
                            {activity.type === 'topic' && (
                              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {activity.views || 0}</span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ---------- QUIZZES TAB ---------- */}
          {activeTab === 'quizzes' && isOwnProfile && (
            <motion.div
              key="quizzes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" /> My Experiment Results
                </h3>

                {quizResults.length === 0 ? (
                  <div className="text-center py-12">
                    <Brain className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 mb-2">No experiments attempted yet</p>
                    <button onClick={() => router.push('/quizzes')} className="btn-primary text-sm px-4 py-2 mt-2">
                      Browse Lab Tests
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {quizResults.map((result, index) => (
                      <motion.div
                        key={result.quizId + '-' + index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/[0.08] transition-colors cursor-pointer"
                        onClick={() => router.push(`/quizzes/${result.quizId}`)}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                          result.passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {result.percentage}%
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">{result.title}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="capitalize">{result.category}</span>
                            <span>{result.totalQuestions} compounds</span>
                            <span>{timeAgo(result.attemptedAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {result.passed ? <CheckCircle className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                          <span className={`text-xs font-medium ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                            {result.passed ? 'Yielded' : 'No Yield'}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ---------- ABOUT TAB ---------- */}
          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Contact & Basic Info */}
              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-400" /> Contact & Basic Info
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">Full Name</p>
                      <p className="text-white text-sm">{user.profile?.firstName} {user.profile?.lastName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">Email</p>
                      <p className="text-white text-sm">{user.email}</p>
                    </div>
                  </div>
                  {user.profile?.school && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">School</p>
                        <p className="text-white text-sm">{user.profile.school}</p>
                      </div>
                    </div>
                  )}
                  {user.profile?.grade && (
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">Grade</p>
                        <p className="text-white text-sm">{user.profile.grade}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">Joined</p>
                      <p className="text-white text-sm">{formatDate(user.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FlaskConical className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">Role</p>
                      <p className="text-white text-sm capitalize">{user.role}</p>
                    </div>
                  </div>
                  {user.lastLogin && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">Last Active</p>
                        <p className="text-white text-sm">{timeAgo(user.lastLogin)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Links */}
              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-400" /> Social & Links
                </h3>
                {user.socialLinks?.twitter || user.socialLinks?.linkedin || user.socialLinks?.instagram ? (
                  <div className="space-y-3">
                    {user.socialLinks?.twitter && (
                      <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-blue-400/10 transition-colors group">
                        <Twitter className="w-5 h-5 text-blue-400" />
                        <span className="text-gray-300 group-hover:text-white text-sm">{user.socialLinks.twitter}</span>
                      </a>
                    )}
                    {user.socialLinks?.linkedin && (
                      <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-blue-500/10 transition-colors group">
                        <Linkedin className="w-5 h-5 text-blue-500" />
                        <span className="text-gray-300 group-hover:text-white text-sm">{user.socialLinks.linkedin}</span>
                      </a>
                    )}
                    {user.socialLinks?.instagram && (
                      <a href={user.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-pink-400/10 transition-colors group">
                        <Instagram className="w-5 h-5 text-pink-400" />
                        <span className="text-gray-300 group-hover:text-white text-sm">{user.socialLinks.instagram}</span>
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No social links added</p>
                  </div>
                )}
              </div>

              {/* Bio */}
              <div className="glass-card p-6 rounded-xl md:col-span-2">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-400" /> About
                </h3>
                {user.profile?.bio ? (
                  <p className="text-gray-300 leading-relaxed">{user.profile.bio}</p>
                ) : (
                  <p className="text-gray-500 text-sm italic">No bio added yet.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ==================== BOND LIST MODAL ==================== */}
      <AnimatePresence>
        {showBondList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowBondList(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card w-full max-w-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-cyan-400" />
                  {isOwnProfile ? 'My Bonds' : 'Bonds'} ({bondList.length})
                </h2>
                <button onClick={() => setShowBondList(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* List */}
              <div className="max-h-96 overflow-y-auto">
                {loadingBonds ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
                  </div>
                ) : bondList.length === 0 ? (
                  <div className="text-center py-12 px-6">
                    <Link2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No bonds yet</p>
                  </div>
                ) : (
                  bondList.map((b) => {
                    const fullName = `${b.firstName || ''} ${b.lastName || ''}`.trim() || b.username
                    const avatarColors = [
                      'from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500',
                      'from-green-500 to-emerald-500', 'from-orange-500 to-amber-500',
                      'from-red-500 to-rose-500', 'from-indigo-500 to-violet-500',
                    ]
                    let hash = 0
                    for (let i = 0; i < fullName.length; i++) hash = fullName.charCodeAt(i) + ((hash << 5) - hash)
                    const avatarColor = avatarColors[Math.abs(hash) % avatarColors.length]

                    return (
                      <div key={b.id} className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0">
                        <Link
                          href={`/profile/${b.id}`}
                          onClick={() => setShowBondList(false)}
                          className="flex items-center gap-3 flex-1 group"
                        >
                          {b.avatar ? (
                            <div className="w-11 h-11 rounded-full overflow-hidden shrink-0">
                              <img src={b.avatar} alt="" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center shrink-0`}>
                              <span className="text-white text-sm font-bold">
                                {b.firstName?.[0] || ''}{b.lastName?.[0] || 'U'}
                              </span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-white font-medium text-sm group-hover:text-primary-400 transition-colors truncate">
                              {fullName}
                            </p>
                            <p className="text-gray-500 text-xs truncate">
                              @{b.username}{b.school ? ` · ${b.school}` : ''}
                            </p>
                          </div>
                        </Link>
                        {isAuthenticated && currentUser?.id !== b.id && (
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setShowBondList(false)
                              router.push(`/messages?chat=${b.id}`)
                            }}
                            className="p-2 text-gray-400 hover:text-primary-400 hover:bg-white/5 rounded-lg transition-colors shrink-0"
                            title="Message"
                          >
                            <Send className="w-4 h-4" />
                          </motion.button>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
