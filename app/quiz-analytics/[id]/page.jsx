'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  BarChart3,
  Users,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  Brain,
  Download,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const analytics = {
  quiz: {
    title: 'Chemical Bonding Fundamentals',
    totalAttempts: 234,
    averageScore: 78,
    passRate: 85,
    averageTimeSpent: 1450,
    difficulty: 'medium',
  },
  attempts: [
    { student: { name: 'John Doe', email: 'john@example.com' }, submittedAt: '2024-01-15T10:30:00Z', score: 18, percentage: 90, passed: true, timeSpent: 1200, averageTimePerQuestion: 48 },
    { student: { name: 'Sarah Smith', email: 'sarah@example.com' }, submittedAt: '2024-01-15T11:45:00Z', score: 15, percentage: 75, passed: true, timeSpent: 1800, averageTimePerQuestion: 72 },
  ],
  questionAnalytics: [
    { questionIndex: 0, question: 'What type of bond is formed when electrons are transferred?', correctAttempts: 200, totalAttempts: 234, correctRate: 85.5, averageTime: 45 },
    { questionIndex: 1, question: 'Which is a characteristic of covalent bonds?', correctAttempts: 156, totalAttempts: 234, correctRate: 66.7, averageTime: 62 },
  ],
  scoreDistribution: [
    { range: '0-20', count: 5 },
    { range: '21-40', count: 12 },
    { range: '41-60', count: 28 },
    { range: '61-80', count: 89 },
    { range: '81-100', count: 100 },
  ],
  dailyAttempts: [
    { date: '01-10', attempts: 12 },
    { date: '01-11', attempts: 18 },
    { date: '01-12', attempts: 25 },
    { date: '01-13', attempts: 22 },
    { date: '01-14', attempts: 31 },
    { date: '01-15', attempts: 28 },
  ],
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'questions', label: 'Question Analysis', icon: Brain },
  { id: 'attempts', label: 'Student Attempts', icon: Users },
  { id: 'trends', label: 'Trends', icon: TrendingUp },
]

export default function QuizAnalytics() {
  const { id } = useParams()
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState('overview')

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="flex items-center text-gray-400 hover:text-white transition-colors mr-6">
              <ArrowLeft className="w-5 h-5 mr-2" />Back
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{analytics.quiz.title} - Analytics</h1>
              <p className="text-gray-300">Detailed reaction analysis and lab insights</p>
            </div>
          </div>
          <button className="btn-secondary flex items-center">
            <Download className="w-5 h-5 mr-2" />Export Data
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: Users, label: 'Total Attempts', value: analytics.quiz.totalAttempts, change: '+12%', color: 'text-green-400' },
            { icon: BarChart3, label: 'Average Yield', value: `${analytics.quiz.averageScore}%`, change: '+5%', color: 'text-green-400' },
            { icon: CheckCircle, label: 'Success Rate', value: `${analytics.quiz.passRate}%`, change: '+3%', color: 'text-green-400' },
            { icon: Clock, label: 'Avg. Reaction Time', value: formatTime(analytics.quiz.averageTimeSpent), change: '-2m', color: 'text-yellow-400' },
          ].map(({ icon: Icon, label, value, change, color }) => (
            <div key={label} className="glass-card p-6 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-8 h-8 text-primary-400" />
                <span className={`text-sm ${color}`}>{change}</span>
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-gray-300 text-sm">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 flex-wrap gap-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedTab(id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${selectedTab === id ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="glass-card p-6 rounded-xl">
          {selectedTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Score Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="range" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} labelStyle={{ color: '#F3F4F6' }} />
                    <Bar dataKey="count" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Performance Metrics</h3>
                  <div className="space-y-4">
                    {[['Highest Score', '100%'], ['Lowest Score', '15%'], ['Median Score', '82%'], ['Standard Deviation', '12.5%']].map(([label, value]) => (
                      <div key={label} className="flex justify-between items-center">
                        <span className="text-gray-300">{label}</span>
                        <span className="text-white font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Time Analysis</h3>
                  <div className="space-y-4">
                    {[['Fastest Completion', formatTime(600)], ['Slowest Completion', formatTime(2400)], ['Average per Question', '58s']].map(([label, value]) => (
                      <div key={label} className="flex justify-between items-center">
                        <span className="text-gray-300">{label}</span>
                        <span className="text-white font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'questions' && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-6">Question Performance Analysis</h3>
              <div className="space-y-4">
                {analytics.questionAnalytics.map((q, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-white font-medium mb-2">Question {q.questionIndex + 1}</h4>
                        <p className="text-gray-300 text-sm">{q.question}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-sm font-medium ${q.correctRate >= 80 ? 'bg-green-500/20 text-green-400' : q.correctRate >= 60 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                        {q.correctRate.toFixed(1)}% Correct
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {[['Correct', q.correctAttempts], ['Wrong', q.totalAttempts - q.correctAttempts], ['Total', q.totalAttempts], ['Avg Time', `${q.averageTime.toFixed(1)}s`]].map(([label, val]) => (
                        <div key={label}><span className="text-gray-400">{label}:</span><span className="text-white ml-2">{val}</span></div>
                      ))}
                    </div>
                    <div className="mt-3 w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div className={`h-full ${q.correctRate >= 80 ? 'bg-green-500' : q.correctRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${q.correctRate}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'attempts' && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-6">Student Attempts</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      {['Student', 'Score', '%', 'Correct', 'Wrong', 'Time', 'Status', 'Date'].map((h) => (
                        <th key={h} className="text-left text-gray-300 pb-3 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.attempts.map((attempt, index) => (
                      <tr key={index} className="border-b border-white/5">
                        <td className="py-3 pr-4">
                          <p className="text-white font-medium">{attempt.student.name}</p>
                          <p className="text-gray-400 text-sm">{attempt.student.email}</p>
                        </td>
                        <td className="py-3 pr-4 text-white">{attempt.score}/{analytics.questionAnalytics.length}</td>
                        <td className="py-3 pr-4">
                          <span className={`font-medium ${attempt.percentage >= 80 ? 'text-green-400' : attempt.percentage >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{attempt.percentage}%</span>
                        </td>
                        <td className="py-3 pr-4"><div className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-1" /><span className="text-white">{attempt.score}</span></div></td>
                        <td className="py-3 pr-4"><div className="flex items-center"><XCircle className="w-4 h-4 text-red-400 mr-1" /><span className="text-white">{analytics.questionAnalytics.length - attempt.score}</span></div></td>
                        <td className="py-3 pr-4 text-white">{formatTime(attempt.timeSpent)}</td>
                        <td className="py-3 pr-4"><span className={`px-2 py-1 rounded-full text-xs ${attempt.passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{attempt.passed ? 'Passed' : 'Failed'}</span></td>
                        <td className="py-3 pr-4 text-gray-300">{new Date(attempt.submittedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedTab === 'trends' && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Daily Attempts Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.dailyAttempts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} labelStyle={{ color: '#F3F4F6' }} />
                  <Line type="monotone" dataKey="attempts" stroke="#f97316" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
