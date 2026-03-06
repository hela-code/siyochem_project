import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
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
  Award,
  Download
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const QuizAnalytics = () => {
  const { id } = useParams()
  const [selectedTab, setSelectedTab] = useState('overview')

  // Mock analytics data - replace with actual API call
  const analytics = {
    quiz: {
      title: 'Chemical Bonding Fundamentals',
      totalAttempts: 234,
      averageScore: 78,
      passRate: 85,
      averageTimeSpent: 1450, // seconds
      difficulty: 'medium'
    },
    attempts: [
      {
        student: { name: 'John Doe', email: 'john@example.com' },
        submittedAt: '2024-01-15T10:30:00Z',
        score: 18,
        percentage: 90,
        passed: true,
        timeSpent: 1200,
        averageTimePerQuestion: 48
      },
      {
        student: { name: 'Sarah Smith', email: 'sarah@example.com' },
        submittedAt: '2024-01-15T11:45:00Z',
        score: 15,
        percentage: 75,
        passed: true,
        timeSpent: 1800,
        averageTimePerQuestion: 72
      }
    ],
    questionAnalytics: [
      {
        questionIndex: 0,
        question: 'What type of bond is formed when electrons are transferred?',
        correctAttempts: 200,
        totalAttempts: 234,
        correctRate: 85.5,
        averageTime: 45
      },
      {
        questionIndex: 1,
        question: 'Which is a characteristic of covalent bonds?',
        correctAttempts: 156,
        totalAttempts: 234,
        correctRate: 66.7,
        averageTime: 62
      }
    ],
    scoreDistribution: [
      { range: '0-20', count: 5 },
      { range: '21-40', count: 12 },
      { range: '41-60', count: 28 },
      { range: '61-80', count: 89 },
      { range: '81-100', count: 100 }
    ],
    dailyAttempts: [
      { date: '2024-01-10', attempts: 12 },
      { date: '2024-01-11', attempts: 18 },
      { date: '2024-01-12', attempts: 25 },
      { date: '2024-01-13', attempts: 22 },
      { date: '2024-01-14', attempts: 31 },
      { date: '2024-01-15', attempts: 28 }
    ]
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'questions', label: 'Question Analysis', icon: Brain },
    { id: 'attempts', label: 'Student Attempts', icon: Users },
    { id: 'trends', label: 'Trends', icon: TrendingUp }
  ]

  const COLORS = ['#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12']

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const exportData = () => {
    // Export functionality would go here
    console.log('Exporting analytics data...')
  }

  return (
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => window.history.back()}
              className="flex items-center text-gray-400 hover:text-white transition-colors mr-6"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {analytics.quiz.title} - Analytics
              </h1>
              <p className="text-gray-300">
                Detailed performance analysis and insights
              </p>
            </div>
          </div>
          
          <button
            onClick={exportData}
            className="btn-secondary flex items-center"
          >
            <Download className="w-5 h-5 mr-2" />
            Export Data
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-primary-400" />
              <span className="text-green-400 text-sm">+12%</span>
            </div>
            <p className="text-2xl font-bold text-white">{analytics.quiz.totalAttempts}</p>
            <p className="text-gray-300 text-sm">Total Attempts</p>
          </div>
          
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-8 h-8 text-primary-400" />
              <span className="text-green-400 text-sm">+5%</span>
            </div>
            <p className="text-2xl font-bold text-white">{analytics.quiz.averageScore}%</p>
            <p className="text-gray-300 text-sm">Average Score</p>
          </div>
          
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-primary-400" />
              <span className="text-green-400 text-sm">+3%</span>
            </div>
            <p className="text-2xl font-bold text-white">{analytics.quiz.passRate}%</p>
            <p className="text-gray-300 text-sm">Pass Rate</p>
          </div>
          
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-primary-400" />
              <span className="text-yellow-400 text-sm">-2m</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatTime(analytics.quiz.averageTimeSpent)}</p>
            <p className="text-gray-300 text-sm">Avg. Time</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  selectedTab === tab.id
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="glass-card p-6 rounded-xl">
          {selectedTab === 'overview' && (
            <div className="space-y-8">
              {/* Score Distribution */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Score Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="range" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#F3F4F6' }}
                    />
                    <Bar dataKey="count" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Performance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Performance Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Highest Score</span>
                      <span className="text-white font-semibold">100%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Lowest Score</span>
                      <span className="text-white font-semibold">15%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Median Score</span>
                      <span className="text-white font-semibold">82%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Standard Deviation</span>
                      <span className="text-white font-semibold">12.5%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Time Analysis</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Fastest Completion</span>
                      <span className="text-white font-semibold">{formatTime(600)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Slowest Completion</span>
                      <span className="text-white font-semibold">{formatTime(2400)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Average per Question</span>
                      <span className="text-white font-semibold">58s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'questions' && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-6">Question Performance Analysis</h3>
              <div className="space-y-4">
                {analytics.questionAnalytics.map((question, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-white font-medium mb-2">
                          Question {question.questionIndex + 1}
                        </h4>
                        <p className="text-gray-300 text-sm">{question.question}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        question.correctRate >= 80 ? 'bg-green-500/20 text-green-400' :
                        question.correctRate >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {question.correctRate.toFixed(1)}% Correct
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Correct:</span>
                        <span className="text-white ml-2">{question.correctAttempts}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Wrong:</span>
                        <span className="text-white ml-2">{question.totalAttempts - question.correctAttempts}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Total Attempts:</span>
                        <span className="text-white ml-2">{question.totalAttempts}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Avg Time:</span>
                        <span className="text-white ml-2">{question.averageTime.toFixed(1)}s</span>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="mt-3">
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            question.correctRate >= 80 ? 'bg-green-500' :
                            question.correctRate >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${question.correctRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Difficulty Assessment */}
                    <div className="mt-3 flex items-center">
                      <span className="text-gray-400 text-sm">Difficulty:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        question.correctRate >= 80 ? 'bg-green-500/20 text-green-400' :
                        question.correctRate >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {question.correctRate >= 80 ? 'Easy' :
                         question.correctRate >= 60 ? 'Medium' : 'Hard'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'attempts' && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-6">Student Attempts - Detailed Analysis</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-gray-300 pb-3">Student</th>
                      <th className="text-left text-gray-300 pb-3">Score</th>
                      <th className="text-left text-gray-300 pb-3">Percentage</th>
                      <th className="text-left text-gray-300 pb-3">Correctness</th>
                      <th className="text-left text-gray-300 pb-3">Wrongness</th>
                      <th className="text-left text-gray-300 pb-3">Time Spent</th>
                      <th className="text-left text-gray-300 pb-3">Avg Time/Question</th>
                      <th className="text-left text-gray-300 pb-3">Status</th>
                      <th className="text-left text-gray-300 pb-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.attempts.map((attempt, index) => {
                      const wrongAnswers = attempt.score ? 
                        analytics.questionAnalytics.length - attempt.score : 
                        analytics.questionAnalytics.length;
                      
                      return (
                        <tr key={index} className="border-b border-white/5">
                          <td className="py-3">
                            <div>
                              <p className="text-white font-medium">{attempt.student.name}</p>
                              <p className="text-gray-400 text-sm">{attempt.student.email}</p>
                            </div>
                          </td>
                          <td className="py-3 text-white">{attempt.score}/{analytics.questionAnalytics.length}</td>
                          <td className="py-3">
                            <span className={`font-medium ${
                              attempt.percentage >= 80 ? 'text-green-400' :
                              attempt.percentage >= 60 ? 'text-yellow-400' :
                              'text-red-400'
                            }`}>
                              {attempt.percentage}%
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                              <span className="text-white">{attempt.score} correct</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center">
                              <XCircle className="w-4 h-4 text-red-400 mr-2" />
                              <span className="text-white">{wrongAnswers} wrong</span>
                            </div>
                          </td>
                          <td className="py-3 text-white">{formatTime(attempt.timeSpent)}</td>
                          <td className="py-3 text-white">{formatTime(attempt.averageTimePerQuestion)}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              attempt.passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {attempt.passed ? 'Passed' : 'Failed'}
                            </span>
                          </td>
                          <td className="py-3 text-gray-300">
                            {new Date(attempt.submittedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedTab === 'trends' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Daily Attempts Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.dailyAttempts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#F3F4F6' }}
                    />
                    <Line type="monotone" dataKey="attempts" stroke="#f97316" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default QuizAnalytics
