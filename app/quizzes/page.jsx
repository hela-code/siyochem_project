'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Brain,
  PlusCircle,
  Search,
  Filter,
  Clock,
  Users,
  Award,
  BarChart3,
  Play,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

const mockQuizzes = [
  {
    id: '1',
    title: 'Chemical Bonding Fundamentals',
    description: 'Test your understanding of ionic, covalent, and metallic bonds. Perfect for A/L students preparing for exams.',
    author: { name: 'Dr. Sarah Johnson' },
    category: 'Physical Chemistry',
    difficulty: 'medium',
    duration: 30,
    questions: 25,
    attempts: 234,
    averageScore: 78,
    tags: ['bonding', 'basics', 'exam-prep'],
    createdAt: '2 days ago',
    userAttempt: null,
  },
  {
    id: '2',
    title: 'Advanced Organic Reaction Mechanisms',
    description: 'Challenge yourself with complex organic reactions including SN1, SN2, E1, and E2 mechanisms.',
    author: { name: 'Prof. Michael Chen' },
    category: 'Organic Chemistry',
    difficulty: 'hard',
    duration: 45,
    questions: 30,
    attempts: 156,
    averageScore: 65,
    tags: ['organic', 'mechanisms', 'advanced'],
    createdAt: '1 week ago',
    userAttempt: { score: 22, percentage: 73, passed: true },
  },
  {
    id: '3',
    title: 'Periodic Table and Elements',
    description: 'Comprehensive quiz on periodic trends, element properties, and periodic table organization.',
    author: { name: 'Ms. Emily Davis' },
    category: 'Inorganic Chemistry',
    difficulty: 'easy',
    duration: 20,
    questions: 20,
    attempts: 412,
    averageScore: 85,
    tags: ['periodic-table', 'elements', 'basics'],
    createdAt: '3 days ago',
    userAttempt: null,
  },
]

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'Organic Chemistry', label: 'Organic Chemistry' },
  { value: 'Inorganic Chemistry', label: 'Inorganic Chemistry' },
  { value: 'Physical Chemistry', label: 'Physical Chemistry' },
  { value: 'Analytical Chemistry', label: 'Analytical Chemistry' },
  { value: 'Biochemistry', label: 'Biochemistry' },
]

const difficulties = [
  { value: 'all', label: 'All Levels' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

const difficultyColor = (d) => {
  if (d === 'easy') return 'bg-green-500/20 text-green-400'
  if (d === 'medium') return 'bg-yellow-500/20 text-yellow-400'
  if (d === 'hard') return 'bg-red-500/20 text-red-400'
  return 'bg-gray-500/20 text-gray-400'
}

export default function Quizzes() {
  const { user } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')

  const filtered = mockQuizzes.filter((q) => {
    const matchSearch =
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCat = selectedCategory === 'all' || q.category === selectedCategory
    const matchDiff = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty
    return matchSearch && matchCat && matchDiff
  })

  return (
    <div className="min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Chemistry Quizzes</h1>
            <p className="text-gray-300">Test your knowledge and track your progress</p>
          </div>
          {user?.role === 'teacher' && (
            <Link href="/create-quiz" className="btn-primary mt-4 md:mt-0 inline-flex items-center">
              <PlusCircle className="w-5 h-5 mr-2" /> Create Quiz
            </Link>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field pl-10 appearance-none"
            >
              {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="input-field pl-10 appearance-none"
            >
              {difficulties.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((quiz, index) => (
          <motion.div
            key={quiz.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="glass-card p-6 rounded-xl card-hover"
          >
            <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2">{quiz.title}</h3>
            <p className="text-gray-300 text-sm line-clamp-3 mb-3">{quiz.description}</p>

            <div className="flex items-center space-x-2 mb-3">
              <span className="px-3 py-1 bg-white/10 text-primary-400 text-xs rounded-full">{quiz.category}</span>
              <span className={`px-2 py-1 text-xs rounded-full ${difficultyColor(quiz.difficulty)}`}>{quiz.difficulty}</span>
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {quiz.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded">#{tag}</span>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
              <div className="bg-white/5 rounded-lg p-2">
                <Clock className="w-4 h-4 text-primary-400 mx-auto mb-1" />
                <p className="text-white text-xs font-medium">{quiz.duration}m</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <Brain className="w-4 h-4 text-primary-400 mx-auto mb-1" />
                <p className="text-white text-xs font-medium">{quiz.questions}Q</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <Users className="w-4 h-4 text-primary-400 mx-auto mb-1" />
                <p className="text-white text-xs font-medium">{quiz.attempts}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
              <div className="flex items-center space-x-1">
                <BarChart3 className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm">Avg: {quiz.averageScore}%</span>
              </div>
              <span className="text-gray-500 text-xs">{quiz.createdAt}</span>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/quizzes/${quiz.id}`}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center text-sm ${
                  quiz.userAttempt ? 'bg-secondary-700 text-white hover:bg-secondary-600' : 'btn-primary py-2'
                }`}
              >
                {quiz.userAttempt ? (
                  <><Award className="w-4 h-4 mr-2" />View Results ({quiz.userAttempt.percentage}%)</>
                ) : (
                  <><Play className="w-4 h-4 mr-2" />Start Quiz</>
                )}
              </Link>
              {user?.role === 'teacher' && (
                <Link
                  href={`/quiz-analytics/${quiz.id}`}
                  className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center"
                >
                  <BarChart3 className="w-4 h-4" />
                </Link>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No quizzes found</h3>
          <p className="text-gray-300">Try adjusting your search or filter criteria</p>
        </motion.div>
      )}
    </div>
  )
}
