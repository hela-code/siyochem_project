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

  const featureGroups = [
    {
      section: 'Communication',
      icon: Send,
      color: 'from-blue-500 to-cyan-500',
      features: [
        {
          key: 'messages',
          name: 'Lab Notes (Messages)',
          description: 'Allow students to send you messages and communicate',
          icon: Send,
        },
      ],
    },
    {
      section: 'Experiment Management',
      icon: PlusCircle,
      color: 'from-purple-500 to-pink-500',
      features: [
        {
          key: 'experiments',
          name: 'Design Experiment',
          description: 'Allow teachers to create and manage chemistry experiments/quizzes',
          icon: PlusCircle,
        },
        {
          key: 'start_experiment',
          name: 'Start Experiment',
          description: 'Allow students to start and take lab tests',
          icon: PlusCircle,
        },
      ],
    },
    {
      section: 'Reactions & Engagement',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
      features: [
        {
          key: 'reaction_wall',
          name: 'Reaction Wall',
          description: 'Allow students to share and comment on posts',
          icon: TrendingUp,
        },
        {
          key: 'add_reaction',
          name: 'Add Reaction (Catalyze)',
          description: 'Allow students to add reactions/catalyze topics and posts',
          icon: TrendingUp,
        },
      ],
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
    <div className="min-h-screen pb-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Settings className="w-6 sm:w-7 h-6 sm:h-7 text-primary-400 shrink-0" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">Teacher Settings</h1>
          </div>

          {/* Info Box */}
          <div className="glass-card rounded-lg p-3 sm:p-4 mb-4 sm:mb-5 border border-blue-500/20 bg-blue-500/5">
            <div className="flex gap-2 sm:gap-3">
              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <p className="text-white font-medium">Toggle features to control what students can access</p>
              </div>
            </div>
          </div>

          {/* Communication Section - Full Width */}
          {featureGroups[0] && (() => {
            const group = featureGroups[0]
            const GroupIcon = group.icon
            
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-lg sm:rounded-xl overflow-hidden border border-white/10 mb-3 sm:mb-4"
              >
                <div className={`bg-gradient-to-r ${group.color} bg-opacity-10 px-4 sm:px-5 py-2 sm:py-3 border-b border-white/10`}>
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <div className={`w-7 sm:w-8 h-7 sm:h-8 rounded bg-gradient-to-r ${group.color} flex items-center justify-center shrink-0`}>
                      <GroupIcon className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-white">{group.section}</h3>
                  </div>
                </div>
                <div>
                  {group.features.map((feature, idx) => {
                    const Icon = feature.icon
                    const isEnabled = features[feature.key]
                    return (
                      <motion.div
                        key={feature.key}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`p-3 sm:p-4 flex items-center justify-between border-b border-white/10 last:border-b-0 ${
                          isEnabled ? 'bg-white/5' : 'bg-white/2'
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className={`w-7 sm:w-8 h-7 sm:h-8 rounded bg-gradient-to-r ${group.color} ${isEnabled ? 'bg-opacity-25' : 'bg-opacity-12'} flex items-center justify-center shrink-0`}>
                            <Icon className={`w-3.5 h-3.5 ${isEnabled ? 'text-white' : 'text-gray-500'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-xs sm:text-sm truncate">{feature.name}</p>
                            <p className="text-gray-400 text-xs line-clamp-1 mt-0.5">{feature.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggle(feature.key)}
                          className={`ml-2 relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${
                            isEnabled ? 'bg-green-500' : 'bg-gray-600'
                          }`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            isEnabled ? 'translate-x-3.5' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )
          })()}

          {/* 2-Column Grid for Experiments & Reactions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5">
            {featureGroups.slice(1).map((group) => {
              const GroupIcon = group.icon
              
              // For Experiment Management: hide Start Experiment if Design Experiment is disabled
              let visibleFeatures = group.features
              if (group.section === 'Experiment Management' && !features.experiments) {
                // Auto-disable start_experiment when experiments is disabled
                if (features.start_experiment) {
                  setFeatures(prev => ({ ...prev, start_experiment: false }))
                }
                // Filter out start_experiment from display
                visibleFeatures = group.features.filter(f => f.key !== 'start_experiment')
              }
              
              // For Reactions & Engagement: hide Add Reaction if Reaction Wall is disabled
              if (group.section === 'Reactions & Engagement' && !features.reaction_wall) {
                // Auto-disable add_reaction when reaction_wall is disabled
                if (features.add_reaction) {
                  setFeatures(prev => ({ ...prev, add_reaction: false }))
                }
                // Filter out add_reaction from display
                visibleFeatures = group.features.filter(f => f.key !== 'add_reaction')
              }
              
              return (
                <motion.div
                  key={group.section}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="glass-card rounded-lg sm:rounded-xl overflow-hidden border border-white/10"
                >
                  <div className={`bg-gradient-to-r ${group.color} bg-opacity-10 px-4 sm:px-5 py-2 sm:py-3 border-b border-white/10`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-7 sm:w-8 h-7 sm:h-8 rounded bg-gradient-to-r ${group.color} flex items-center justify-center shrink-0`}>
                        <GroupIcon className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                      </div>
                      <h3 className="text-xs sm:text-sm font-semibold text-white truncate">{group.section}</h3>
                    </div>
                  </div>
                  <div>
                    {visibleFeatures.map((feature, idx) => {
                      const Icon = feature.icon
                      const isEnabled = features[feature.key]
                      return (
                        <motion.div
                          key={feature.key}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`p-2.5 sm:p-3 flex flex-col gap-1.5 border-b border-white/10 last:border-b-0 ${
                            isEnabled ? 'bg-white/5' : 'bg-white/2'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`w-6 sm:w-7 h-6 sm:h-7 rounded bg-gradient-to-r ${group.color} ${isEnabled ? 'bg-opacity-25' : 'bg-opacity-12'} flex items-center justify-center shrink-0 mt-0.5`}>
                              <Icon className={`w-3 sm:w-3.5 h-3 sm:h-3.5 ${isEnabled ? 'text-white' : 'text-gray-500'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-semibold text-xs truncate">{feature.name}</p>
                              <p className="text-gray-400 text-xs line-clamp-1">{feature.description}</p>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleToggle(feature.key)}
                              className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors shrink-0 ${
                                isEnabled ? 'bg-green-500' : 'bg-gray-600'
                              }`}
                            >
                              <span className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${
                                isEnabled ? 'translate-x-3' : 'translate-x-0.5'
                              }`} />
                            </button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Summary */}
          <div className="p-3 sm:p-4 bg-gradient-to-r from-primary-500/10 to-primary-400/10 rounded-lg border border-primary-500/20 mb-3 sm:mb-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="text-gray-300 text-xs sm:text-sm">
                  <span className="font-semibold text-white">Active:</span> {Object.values(features).filter(Boolean).length}/{Object.keys(features).length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg sm:text-xl font-bold text-primary-400">
                  {Math.round((Object.values(features).filter(Boolean).length / Object.keys(features).length) * 100)}%
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex flex-col sm:flex-row gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm sm:text-base rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.back()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base rounded-lg transition-colors"
            >
              <span>Cancel</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
