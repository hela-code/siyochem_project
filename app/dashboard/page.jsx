'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BookOpen,
  Brain,
  Award,
  Activity,
  PlusCircle,
  Clock,
  Target,
  TrendingUp,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login')
  }, [loading, isAuthenticated, router])

  const stats = [
    { label: 'Topics Created', value: '12', icon: BookOpen, color: 'from-blue-500 to-blue-600', change: '+2 this week' },
    { label: 'Quizzes Taken', value: '24', icon: Brain, color: 'from-green-500 to-green-600', change: '+5 this week' },
    { label: 'Average Score', value: '85%', icon: Award, color: 'from-purple-500 to-purple-600', change: '+3% improvement' },
    { label: 'Study Streak', value: '7 days', icon: Activity, color: 'from-orange-500 to-orange-600', change: 'Personal best!' },
  ]

  const recentActivity = [
    { type: 'quiz', title: 'Completed Organic Chemistry Quiz', description: 'Scored 18/20 (90%)', time: '2 hours ago', icon: Brain },
    { type: 'topic', title: 'Posted in Chemical Bonding Discussion', description: 'Shared insights on covalent bonds', time: '5 hours ago', icon: BookOpen },
    { type: 'achievement', title: 'Earned "Chemistry Expert" Badge', description: 'Completed 10 quizzes with 80%+ scores', time: '1 day ago', icon: Award },
  ]

  const recommendedQuizzes = [
    { title: 'Advanced Organic Chemistry', topic: 'Reaction Mechanisms', duration: '30 minutes', difficulty: 'Hard' },
    { title: 'Physical Chemistry Basics', topic: 'Thermodynamics', duration: '20 minutes', difficulty: 'Medium' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Welcome back, {user?.profile?.firstName}! 👋
        </h1>
        <p className="text-gray-300">Ready to continue your chemistry journey? Here&apos;s your learning dashboard.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-6 rounded-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-green-400 text-sm">{stat.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-gray-300 text-sm">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-primary-400" />
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200"
                  >
                    <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{activity.title}</h3>
                      <p className="text-gray-400 text-sm">{activity.description}</p>
                      <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-6"
        >
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-primary-400" />
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link href="/topics" className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200">
                <BookOpen className="w-5 h-5 text-primary-400" />
                <span className="text-white">Browse Topics</span>
              </Link>
              <Link href="/quizzes" className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200">
                <Brain className="w-5 h-5 text-primary-400" />
                <span className="text-white">Take Quiz</span>
              </Link>
              {user?.role === 'teacher' && (
                <Link href="/create-quiz" className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200">
                  <PlusCircle className="w-5 h-5 text-primary-400" />
                  <span className="text-white">Create Quiz</span>
                </Link>
              )}
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary-400" />
              Recommended Quizzes
            </h2>
            <div className="space-y-3">
              {recommendedQuizzes.map((quiz, index) => (
                <div key={index} className="p-3 bg-white/5 rounded-lg">
                  <h3 className="text-white font-medium text-sm">{quiz.title}</h3>
                  <p className="text-gray-400 text-xs">{quiz.topic}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-500 text-xs">{quiz.duration}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      quiz.difficulty === 'Hard' ? 'bg-red-500/20 text-red-400' :
                      quiz.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>{quiz.difficulty}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary-400" />
              Your Profile
            </h2>
            <Link
              href={`/profile/${user?.id}`}
              className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">
                  {user?.profile?.firstName?.[0]}{user?.profile?.lastName?.[0]}
                </span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">{user?.profile?.firstName} {user?.profile?.lastName}</p>
                <p className="text-gray-400 text-xs capitalize">{user?.role}</p>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
