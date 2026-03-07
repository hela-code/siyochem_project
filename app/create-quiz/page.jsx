'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Trash2, Save, Brain, Clock, BookOpen } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'

const categories = ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Analytical Chemistry', 'Biochemistry', 'Environmental Chemistry', 'Mixed Topics']
const difficulties = ['easy', 'medium', 'hard']

export default function CreateQuiz() {
  const router = useRouter()
  const { user, isAuthenticated, loading, token } = useAuthStore()
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    category: 'Physical Chemistry',
    duration: 30,
    questions: [
      { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '', difficulty: 'medium', topic: '' },
    ],
  })

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'teacher')) {
      toast.error('Only teachers can create quizzes')
      router.push('/quizzes')
    }
  }, [loading, isAuthenticated, user, router])

  const addQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [...quizData.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '', difficulty: 'medium', topic: '' }],
    })
  }

  const removeQuestion = (index) => {
    if (quizData.questions.length > 1) {
      setQuizData({ ...quizData, questions: quizData.questions.filter((_, i) => i !== index) })
    }
  }

  const updateQuestion = (index, field, value) => {
    const updated = [...quizData.questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuizData({ ...quizData, questions: updated })
  }

  const updateOption = (qi, oi, value) => {
    const updated = [...quizData.questions]
    updated[qi].options[oi] = value
    setQuizData({ ...quizData, questions: updated })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!quizData.title.trim() || !quizData.description.trim()) {
      toast.error('Please fill in all required fields')
      return
    }
    for (let i = 0; i < quizData.questions.length; i++) {
      const q = quizData.questions[i]
      if (!q.question.trim()) { toast.error(`Question ${i + 1} is empty`); return }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) { toast.error(`Question ${i + 1}, Option ${j + 1} is empty`); return }
      }
    }
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(quizData),
      })
      if (res.ok) {
        toast.success('Quiz created successfully!')
        router.push('/quizzes')
      } else {
        const data = await res.json()
        toast.error(data.message || 'Failed to create quiz')
      }
    } catch {
      toast.error('Failed to create quiz')
    }
  }

  return (
    <div className="min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.push('/quizzes')} className="flex items-center text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />Back to Quizzes
          </button>
          <h1 className="text-3xl font-bold text-white">Create New Quiz</h1>
          <button onClick={handleSubmit} className="btn-primary flex items-center">
            <Save className="w-5 h-5 mr-2" />Save Quiz
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Quiz Info */}
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-primary-400" />Quiz Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Quiz Title *</label>
                <input type="text" value={quizData.title} onChange={(e) => setQuizData({ ...quizData, title: e.target.value })} className="input-field" placeholder="Enter quiz title" required />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Category</label>
                <select value={quizData.category} onChange={(e) => setQuizData({ ...quizData, category: e.target.value })} className="input-field">
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-gray-300 text-sm font-medium mb-2">Description *</label>
              <textarea value={quizData.description} onChange={(e) => setQuizData({ ...quizData, description: e.target.value })} className="input-field resize-none" rows={3} placeholder="Describe what this quiz covers..." required />
            </div>
            <div className="mt-6">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <Clock className="w-4 h-4 inline mr-1" />Duration (minutes)
              </label>
              <input type="number" value={quizData.duration} onChange={(e) => setQuizData({ ...quizData, duration: parseInt(e.target.value) || 0 })} className="input-field" min="5" max="180" />
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-primary-400" />Questions ({quizData.questions.length})
              </h2>
              <button type="button" onClick={addQuestion} className="btn-secondary flex items-center">
                <Plus className="w-4 h-4 mr-2" />Add Question
              </button>
            </div>

            {quizData.questions.map((question, qi) => (
              <div key={qi} className="glass-card p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Question {qi + 1}</h3>
                  {quizData.questions.length > 1 && (
                    <button type="button" onClick={() => removeQuestion(qi)} className="text-red-400 hover:text-red-300 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">Question *</label>
                  <textarea value={question.question} onChange={(e) => updateQuestion(qi, 'question', e.target.value)} className="input-field resize-none" rows={2} placeholder="Enter your question..." required />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">Options *</label>
                  <div className="space-y-2">
                    {question.options.map((option, oi) => (
                      <div key={oi} className="flex items-center space-x-3">
                        <input type="radio" name={`correct-${qi}`} checked={question.correctAnswer === oi} onChange={() => updateQuestion(qi, 'correctAnswer', oi)} className="w-4 h-4 text-primary-500" />
                        <input type="text" value={option} onChange={(e) => updateOption(qi, oi, e.target.value)} className="input-field flex-1" placeholder={`Option ${oi + 1}`} required />
                        {question.correctAnswer === oi && <span className="text-green-400 text-sm">Correct</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Topic</label>
                    <input type="text" value={question.topic} onChange={(e) => updateQuestion(qi, 'topic', e.target.value)} className="input-field" placeholder="e.g., Chemical Bonding" />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Difficulty</label>
                    <select value={question.difficulty} onChange={(e) => updateQuestion(qi, 'difficulty', e.target.value)} className="input-field">
                      {difficulties.map((d) => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">Explanation (Optional)</label>
                  <textarea value={question.explanation} onChange={(e) => updateQuestion(qi, 'explanation', e.target.value)} className="input-field resize-none" rows={2} placeholder="Explain the correct answer..." />
                </div>
              </div>
            ))}
          </div>
        </form>
      </motion.div>
    </div>
  )
}
