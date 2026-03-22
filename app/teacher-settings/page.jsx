'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Send,
  PlusCircle,
  TrendingUp,
  Settings,
  Save,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function TeacherSettings() {
  const router = useRouter()
  const { user, token, loading: authLoading } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [features, setFeatures] = useState({
    messages: true,
    experiments: true,
    start_experiment: true,
    add_reaction: true,
    reaction_wall: true,
  })

  // Redirect if not teacher
  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push('/login')
      if (user?.role !== 'teacher') router.push('/')
    }
  }, [authLoading, user, router])

  // Load current global feature settings
  useEffect(() => {
    const loadFeatures = async () => {
      try {
        setLoading(true)
        const { data } = await axios.get('/api/features/status')
        if (data.features) {
          setFeatures(data.features)
        }
      } catch (error) {
        toast.error('Failed to load feature settings')
        console.error('Error loading features:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      loadFeatures()
    }
  }, [authLoading, user])

  const handleToggle = (key) => {
    setFeatures((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      console.log('=== TEACHER SETTINGS: SAVE STARTED ===')
      console.log('Current features to save:', features)
      console.log('Token available:', !!token)
      
      const payload = { features }
      console.log('Request payload:', JSON.stringify(payload, null, 2))
      
      const { data: responseData } = await axios.put('/api/features/status', payload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('PUT Response received:', responseData)

      if (responseData.success) {
        console.log('✓ Save successful! Response features:', responseData.features)
        toast.success('Settings saved successfully!')
        // Update local state with server's response
        setFeatures(responseData.features)
      } else {
        console.error('✗ Save returned success=false:', responseData.message)
        toast.error(responseData.message || 'Failed to save settings')
      }
    } catch (error) {
      console.error('=== TEACHER SETTINGS: SAVE ERROR ===')
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      })
      const message = error.response?.data?.message || error.message || 'Failed to save settings'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const featureList = [
    {
      key: 'messages',
      name: 'Lab Notes (Messages)',
      description: 'Allow students to send you messages and communicate',
      icon: Send,
    },
    {
      key: 'experiments',
      name: 'Design Experiment',
      description: 'Create and manage chemistry experiments/quizzes',
      icon: PlusCircle,
    },
    {
      key: 'start_experiment',
      name: 'Start Experiment',
      description: 'Allow students to start and take lab tests',
      icon: PlusCircle,
    },
    {
      key: 'add_reaction',
      name: 'Add Reaction (Catalyze)',
      description: 'Allow students to add reactions/catalyze topics and posts',
      icon: TrendingUp,
    },
    {
      key: 'reaction_wall',
      name: 'Reaction Wall',
      description: 'Allow students to share and comment on posts',
      icon: TrendingUp,
    },
  ]

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-8">
      <div className="max-w-2xl mx-auto p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Settings className="w-8 h-8 text-primary-400" />
            <h1 className="text-3xl font-bold text-white">Teacher Settings</h1>
          </div>

          {/* Info Box */}
          <div className="glass-card rounded-2xl p-6 mb-6 border border-blue-500/20 bg-blue-500/5">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium">Control Student Features</p>
                <p className="text-gray-400 text-sm mt-1">
                  Toggle features to enable or disable them for all students. Changes take effect immediately.
                </p>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="glass-card rounded-2xl overflow-hidden">
            {featureList.map((feature, idx) => {
              const Icon = feature.icon
              const isEnabled = features[feature.key]

              return (
                <motion.div
                  key={feature.key}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-6 flex items-center justify-between border-b border-white/10 last:border-b-0 ${
                    isEnabled ? 'bg-white/5' : 'bg-white/2'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-primary-500/20 flex items-center justify-center shrink-0">
                      <Icon className={`w-6 h-6 ${isEnabled ? 'text-primary-400' : 'text-gray-500'}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{feature.name}</p>
                      <p className="text-gray-400 text-sm">{feature.description}</p>
                      <p className={`text-xs font-semibold mt-2 ${isEnabled ? 'text-green-400' : 'text-red-400'}`}>
                        {isEnabled ? '✓ ENABLED FOR STUDENTS' : '✗ DISABLED FOR STUDENTS'}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => handleToggle(feature.key)}
                    className={`ml-4 relative inline-flex h-8 w-14 items-center rounded-full transition-colors shrink-0 ${
                      isEnabled ? 'bg-primary-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        isEnabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </motion.div>
              )
            })}
          </div>

          {/* Summary */}
          <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-gray-300 text-sm">
              <span className="font-medium text-white">Enabled features:</span>{' '}
              {Object.values(features).filter(Boolean).length} of {featureList.length}
            </p>
          </div>

          {/* Save Button */}
          <div className="flex gap-3 mt-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Settings</span>
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors"
            >
              <span>Cancel</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
