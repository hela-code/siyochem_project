'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Users,
  MessageCircle,
  BookOpen,
  MessageSquare,
  Clock,
  Search,
  ArrowLeft,
  Loader2,
  Trash2,
  AlertCircle,
  Heart,
  MessageCircle as MessageIcon,
  User,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'

const iconMap = {
  users: Users,
  topics: BookOpen,
  posts: MessageCircle,
  feedback: MessageSquare,
  messages: Clock,
}

const colorMap = {
  users: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', icon: 'text-blue-400' },
  topics: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', icon: 'text-green-400' },
  posts: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', icon: 'text-purple-400' },
  feedback: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', icon: 'text-orange-400' },
  messages: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', icon: 'text-cyan-400' },
}

const titleMap = {
  users: 'Chemists',
  topics: 'Experiments',
  posts: 'Reactions',
  feedback: 'Reaction Wall',
  messages: 'Element Card',
}

export default function DetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated, loading, token } = useAuthStore()
  const type = params.type

  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [search, setSearch] = useState('')
  const [pageLoading, setPageLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login')
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (!token || !user || !type) return
    fetchData()
  }, [token, user, type])

  // Filter data based on search
  useEffect(() => {
    if (!search.trim()) {
      setFilteredData(data)
      return
    }

    const searchLower = search.toLowerCase()
    const filtered = data.filter((item) => {
      // Search across all fields
      return JSON.stringify(item).toLowerCase().includes(searchLower)
    })
    setFilteredData(filtered)
  }, [search, data])

  const fetchData = async () => {
    if (!token || !type) return
    setPageLoading(true)

    try {
      const headers = { Authorization: `Bearer ${token}` }
      const response = await axios.get(`/api/admin/${type}?limit=100`, { headers })

      // Map type to correct API response key
      const keyMap = {
        users: 'users',
        topics: 'topics',
        posts: 'posts',
        feedback: 'feedbacks', // API returns 'feedbacks' not 'feedback'
        messages: 'messages',
      }
      const dataKey = keyMap[type] || type
      const itemsArray = response.data[dataKey] || response.data.data || []

      setData(Array.isArray(itemsArray) ? itemsArray : [])
      setFilteredData(Array.isArray(itemsArray) ? itemsArray : [])
      setTotal(response.data.total || itemsArray.length)
    } catch (error) {
      console.error(`Error fetching ${type}:`, error)
      setData([])
      setFilteredData([])
    } finally {
      setPageLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm || !deleteConfirm.id) {
      console.error('No item selected for deletion')
      return
    }
    setDeleting(true)

    try {
      const headers = { Authorization: `Bearer ${token}` }
      const deleteUrl = `/api/admin/${type}/${deleteConfirm.id}`
      
      console.log('Attempting delete:', {
        type,
        id: deleteConfirm.id,
        url: deleteUrl,
        hasToken: !!token
      })

      const response = await axios.delete(deleteUrl, { headers })

      console.log('Delete response:', response.data)

      // Check if delete was successful
      if (!response.data || !response.data.success) {
        const errorMsg = response.data?.message || `Failed to delete ${type}`
        throw new Error(errorMsg)
      }

      console.log(`Successfully deleted ${type}:`, deleteConfirm.id)

      // Remove from state
      const updatedData = data.filter((item) => item.id !== deleteConfirm.id)
      setData(updatedData)

      // Update filtered data
      const updatedFiltered = filteredData.filter((item) => item.id !== deleteConfirm.id)
      setFilteredData(updatedFiltered)

      // Update total
      setTotal((prev) => Math.max(0, prev - 1))

      // Show success message
      alert(`Item deleted successfully!`)

      // Close modal
      setDeleteConfirm(null)
    } catch (error) {
      console.error(`Error deleting ${type}:`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      
      const errorMsg = 
        error.response?.data?.message || 
        error.message || 
        `Failed to delete ${type}`
      
      alert(`Error: ${errorMsg}`)
    } finally {
      setDeleting(false)
    }
  }

  const renderTable = () => {
    if (pageLoading) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
        </div>
      )
    }

    if (filteredData.length === 0) {
      return (
        <div className="text-center py-12 text-gray-400">
          {search ? `No ${type} found matching "${search}"` : `No ${type} found`}
        </div>
      )
    }

    // Users table
    if (type === 'users') {
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left font-semibold text-white">Username</th>
                <th className="px-4 py-3 text-left font-semibold text-white">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-white">Role</th>
                <th className="px-4 py-3 text-left font-semibold text-white">School</th>
                <th className="px-4 py-3 text-left font-semibold text-white">Joined</th>
                <th className="px-4 py-3 text-center font-semibold text-white">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((u) => (
                <tr key={u.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-white">{u.username}</td>
                  <td className="px-4 py-3 text-gray-300">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        u.role === 'teacher' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{u.school || 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-300">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setDeleteConfirm({ id: u.id, name: u.username })}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-xs font-semibold transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    // Topics table
    if (type === 'topics') {
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left font-semibold text-white">Title</th>
                <th className="px-4 py-3 text-left font-semibold text-white">Author</th>
                <th className="px-4 py-3 text-left font-semibold text-white">Category</th>
                <th className="px-4 py-3 text-left font-semibold text-white">Views</th>
                <th className="px-4 py-3 text-left font-semibold text-white">Created</th>
                <th className="px-4 py-3 text-center font-semibold text-white">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((t) => (
                <tr key={t.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-white truncate max-w-xs">{t.title}</td>
                  <td className="px-4 py-3 text-gray-300">{t.author}</td>
                  <td className="px-4 py-3 text-gray-300">{t.category}</td>
                  <td className="px-4 py-3 text-gray-300">{t.views || 0}</td>
                  <td className="px-4 py-3 text-gray-300">{new Date(t.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setDeleteConfirm({ id: t.id, name: t.title })}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-xs font-semibold transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    // Posts table
    if (type === 'posts') {
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left font-semibold text-white">Content</th>
                <th className="px-4 py-3 text-left font-semibold text-white">Author</th>
                <th className="px-4 py-3 text-left font-semibold text-white">Topic</th>
                <th className="px-4 py-3 text-left font-semibold text-white">Created</th>
                <th className="px-4 py-3 text-center font-semibold text-white">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((p) => (
                <tr key={p.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-white truncate max-w-xs">{p.content}</td>
                  <td className="px-4 py-3 text-gray-300">{p.author}</td>
                  <td className="px-4 py-3 text-gray-300 truncate max-w-xs">{p.topic}</td>
                  <td className="px-4 py-3 text-gray-300">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setDeleteConfirm({ id: p.id, name: p.content })}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-xs font-semibold transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    // Feedback Reaction Wall
    if (type === 'feedback') {
      return (
        <div className="space-y-4">
          {filteredData.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              {search ? `No feedback found matching "${search}"` : 'No feedback yet'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredData.map((f, index) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card p-5 rounded-xl border border-orange-500/30 hover:border-orange-500/60 transition-all hover:shadow-lg hover:-translate-y-1 group relative"
                >
                  {/* Delete Button - Corner */}
                  <button
                    onClick={() => setDeleteConfirm({ id: f.id, name: f.content })}
                    className="absolute top-3 right-3 p-2 bg-red-500/20 text-red-400 hover:bg-red-500/40 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                    title="Delete feedback"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Author Info */}
                  <div className="flex items-start gap-3 mb-4 pb-4 border-b border-white/10">
                    <div className="p-2 rounded-lg bg-orange-500/20">
                      <User className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate">
                        {f.author_name || f.username || 'Anonymous'}
                      </h4>
                      <p className="text-xs text-gray-400 truncate">{f.email}</p>
                    </div>
                  </div>

                  {/* Feedback Content */}
                  <div className="mb-4">
                    <p className="text-gray-100 text-sm leading-relaxed line-clamp-4">
                      {f.content}
                    </p>
                  </div>

                  {/* Footer - Date & Reaction */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="text-xs text-gray-400">
                      {new Date(f.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-orange-400 fill-orange-400" />
                      <span className="text-xs text-orange-400 font-semibold">Feedback</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )
    }

    // Messages table
    if (type === 'messages') {
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left font-semibold text-white">Content</th>
                <th className="px-4 py-3 text-left font-semibold text-white">From</th>
                <th className="px-4 py-3 text-left font-semibold text-white">To</th>
                <th className="px-4 py-3 text-left font-semibold text-white">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-white">Sent</th>
                <th className="px-4 py-3 text-center font-semibold text-white">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((m) => (
                <tr key={m.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-white truncate max-w-xs">{m.content}</td>
                  <td className="px-4 py-3 text-gray-300">{m.sender}</td>
                  <td className="px-4 py-3 text-gray-300">{m.receiver}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded font-semibold ${
                        m.is_read ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                      }`}
                    >
                      {m.is_read ? 'Read' : 'Unread'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{new Date(m.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setDeleteConfirm({ id: m.id, name: m.content })}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-xs font-semibold transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
  }

  if (loading || !type) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const Icon = iconMap[type] || Users
  const colors = colorMap[type] || colorMap.users
  const title = titleMap[type] || type

  return (
    <div className="min-h-screen pb-8 px-4 md:px-6">
      {/* Header with Back Button */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${colors.bg}`}>
            <Icon className={`w-8 h-8 ${colors.icon}`} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">{title}</h1>
            <p className={`${colors.text}`}>Showing {filteredData.length} of {total} items</p>
          </div>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${title.toLowerCase()}...`}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
          />
        </div>
      </motion.div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`glass-card p-6 rounded-xl border ${colors.border}`}
      >
        {renderTable()}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => !deleting && setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 rounded-xl border border-red-500/30 max-w-md w-full mx-4"
            >
              {/* Warning Icon */}
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-lg bg-red-500/10">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white text-center mb-2">Delete {title}?</h3>

              {/* Message */}
              <p className="text-gray-300 text-center mb-2">
                Are you sure you want to delete this item? This action cannot be undone.
              </p>

              {/* Item Info */}
              <p className="text-gray-400 text-center text-sm mb-6 p-3 bg-white/5 rounded border border-white/10">
                <span className="text-gray-300 font-semibold">{deleteConfirm.name}</span>
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-gray-500/20 text-gray-300 hover:bg-gray-500/30 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
