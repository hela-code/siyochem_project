'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Tag,
  Image,
  X,
  Plus,
  ArrowLeft,
  Loader2,
  FlaskConical,
  CheckCircle,
  AlertCircle,
  Upload,
  Link2,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'

const categories = [
  { value: 'Organic Chemistry', label: 'Organic Chemistry', icon: '🧪' },
  { value: 'Inorganic Chemistry', label: 'Inorganic Chemistry', icon: '⚗️' },
  { value: 'Physical Chemistry', label: 'Physical Chemistry', icon: '🔬' },
  { value: 'Analytical Chemistry', label: 'Analytical Chemistry', icon: '📊' },
  { value: 'Biochemistry', label: 'Biochemistry', icon: '🧬' },
  { value: 'Environmental Chemistry', label: 'Environmental Chemistry', icon: '🌿' },
  { value: 'General Discussion', label: 'General Discussion', icon: '💬' },
]

export default function CreateTopic() {
  const router = useRouter()
  const { isAuthenticated, token } = useAuthStore()

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    image: '',
  })
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imageMode, setImageMode] = useState('upload') // 'upload' or 'url'
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-10 rounded-2xl text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Login Required</h2>
          <p className="text-gray-400 mb-6">You need to be logged in to create a topic.</p>
          <button onClick={() => router.push('/login')} className="btn-primary px-6 py-2">
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase()
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags([...tags, trimmed])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1))
    }
  }

  const handleFileUpload = async (file) => {
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG are allowed.')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB.')
      return
    }

    try {
      setUploading(true)
      setError('')
      const formData = new FormData()
      formData.append('file', file)

      const { data } = await axios.post('/api/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      if (data.success) {
        setForm({ ...form, image: data.url })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragActive(false)
  }

  const removeImage = () => {
    setForm({ ...form, image: '' })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.title.trim()) {
      setError('Title is required')
      return
    }
    if (!form.description.trim()) {
      setError('Description is required')
      return
    }
    if (!form.category) {
      setError('Please select a category')
      return
    }

    try {
      setSubmitting(true)
      const { data } = await axios.post(
        '/api/topics',
        {
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          tags,
          image: form.image || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/topics/${data.topic.id}`)
        }, 1500)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create topic. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-10 rounded-2xl text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Topic Created!</h2>
          <p className="text-gray-400">Redirecting to your new topic...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Create New Topic</h1>
            <p className="text-gray-400 text-sm">Start a chemistry discussion</p>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Error Banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
              >
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
                <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* Title */}
            <div className="glass-card p-6 rounded-xl">
              <label className="text-white font-medium mb-2 block">
                Topic Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Understanding Chemical Bonding"
                maxLength={200}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-lg placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
              <p className="text-gray-500 text-xs mt-2 text-right">{form.title.length}/200</p>
            </div>

            {/* Description */}
            <div className="glass-card p-6 rounded-xl">
              <label className="text-white font-medium mb-2 block">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={6}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe your topic. What would you like to discuss? What questions do you have?"
                maxLength={1000}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
              />
              <p className="text-gray-500 text-xs mt-2 text-right">{form.description.length}/1000</p>
            </div>

            {/* Tags */}
            <div className="glass-card p-6 rounded-xl">
              <label className="text-white font-medium mb-2 block">
                <Tag className="w-4 h-4 inline mr-2" />
                Tags <span className="text-gray-500 text-sm font-normal">(up to 5)</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <motion.span
                    key={tag}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-primary-500/20 text-primary-400 rounded-full text-sm"
                  >
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-white transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                ))}
              </div>
              {tags.length < 5 && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Type a tag and press Enter"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 hover:text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Cover Image */}
            <div className="glass-card p-6 rounded-xl">
              <label className="text-white font-medium mb-3 block">
                <Image className="w-4 h-4 inline mr-2" />
                Cover Image <span className="text-gray-500 text-sm font-normal">(optional)</span>
              </label>

              {/* Toggle: Upload vs URL */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                    imageMode === 'upload'
                      ? 'bg-primary-500/20 border border-primary-500/40 text-primary-400'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                    imageMode === 'url'
                      ? 'bg-primary-500/20 border border-primary-500/40 text-primary-400'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <Link2 className="w-4 h-4" />
                  Paste URL
                </button>
              </div>

              {imageMode === 'upload' ? (
                <>
                  {/* Drag & Drop Zone */}
                  {!form.image && (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                        dragActive
                          ? 'border-primary-400 bg-primary-500/10'
                          : 'border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/8'
                      }`}
                    >
                      {uploading ? (
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-10 h-10 text-primary-400 animate-spin" />
                          <p className="text-gray-300 text-sm">Uploading...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-14 h-14 bg-primary-500/10 rounded-full flex items-center justify-center">
                            <Upload className="w-7 h-7 text-primary-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {dragActive ? 'Drop your image here' : 'Click to upload or drag & drop'}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                              JPEG, PNG, GIF, WebP, SVG — Max 5MB
                            </p>
                          </div>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                        onChange={(e) => {
                          const file = e.target.files[0]
                          if (file) handleFileUpload(file)
                        }}
                        className="hidden"
                      />
                    </div>
                  )}
                </>
              ) : (
                /* URL Input */
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                />
              )}

              {/* Image Preview */}
              {form.image && (
                <div className="mt-4 relative group">
                  <div className="rounded-xl overflow-hidden border border-white/10">
                    <img
                      src={form.image}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = ''
                        e.target.alt = 'Failed to load image'
                        e.target.className = 'w-full h-48 bg-red-500/10 flex items-center justify-center'
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Image ready
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Category Selection */}
            <div className="glass-card p-6 rounded-xl">
              <label className="text-white font-medium mb-3 block">
                Category <span className="text-red-400">*</span>
              </label>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat.value })}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-3 ${
                      form.category === cat.value
                        ? 'bg-primary-500/20 border border-primary-500/40 text-primary-400'
                        : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span>{cat.label}</span>
                    {form.category === cat.value && (
                      <CheckCircle className="w-4 h-4 ml-auto text-primary-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview & Submit */}
            <div className="glass-card p-6 rounded-xl">
              <h3 className="text-white font-medium mb-4">Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Title</span>
                  <span className={`${form.title ? 'text-green-400' : 'text-gray-600'}`}>
                    {form.title ? '✓' : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Description</span>
                  <span className={`${form.description ? 'text-green-400' : 'text-gray-600'}`}>
                    {form.description ? '✓' : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Category</span>
                  <span className={`${form.category ? 'text-green-400' : 'text-gray-600'}`}>
                    {form.category ? '✓' : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tags</span>
                  <span className="text-gray-300">{tags.length}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Image</span>
                  <span className={`${form.image ? 'text-green-400' : 'text-gray-600'}`}>
                    {form.image ? '✓' : '—'}
                  </span>
                </div>
              </div>

              <div className="border-t border-white/10 mt-4 pt-4">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={submitting || !form.title || !form.description || !form.category}
                  className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-5 h-5" />
                      Create Topic
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Tips */}
            <div className="glass-card p-6 rounded-xl">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-primary-400" />
                Tips
              </h3>
              <ul className="space-y-2 text-gray-400 text-xs leading-relaxed">
                <li>• Write a clear, descriptive title</li>
                <li>• Add context in the description so others can contribute</li>
                <li>• Choose the most relevant category</li>
                <li>• Use tags to help others find your topic</li>
                <li>• Keep it focused on chemistry!</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </form>
    </div>
  )
}
