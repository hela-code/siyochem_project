'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import axios from 'axios'
import {
  Clock,
  Brain,
  Play,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Award,
  BarChart3,
  Users,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'

export default function QuizDetail() {
  const { id } = useParams()
  const router = useRouter()
  const { user, token } = useAuthStore()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [results, setResults] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const timerRef = useRef(null)

  const fetchQuiz = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const headers = {}
      const storedToken = token || localStorage.getItem('token')
      if (storedToken) headers.Authorization = `Bearer ${storedToken}`

      const res = await axios.get(`/api/quizzes/${id}`, { headers })
      if (res.data.success) {
        setQuiz(res.data.quiz)
        setTimeLeft(res.data.quiz.duration * 60)
      }
    } catch (err) {
      console.error('Failed to fetch quiz:', err)
      if (err.response?.status === 404) {
        setError('Quiz not found')
      } else {
        setError('Failed to load quiz. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [id, token])

  useEffect(() => {
    fetchQuiz()
  }, [fetchQuiz])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleStartQuiz = () => {
    if (!user) {
      router.push('/login')
      return
    }
    setQuizStarted(true)
    setStartTime(Date.now())
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleSubmitQuiz(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleAnswerSelect = (qi, ai) => {
    const updated = [...answers]
    updated[qi] = ai
    setAnswers(updated)
  }

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      handleSubmitQuiz(false)
    }
  }

  const handleSubmitQuiz = async (timedOut = false) => {
    if (timerRef.current) clearInterval(timerRef.current)
    setSubmitting(true)

    const timeSpent = Math.round((Date.now() - startTime) / 1000)
    const storedToken = token || localStorage.getItem('token')

    // Build answers payload
    const answersPayload = quiz.questions.map((_, index) => ({
      selectedAnswer: answers[index] !== undefined ? answers[index] : -1,
      timeSpent: Math.round(timeSpent / quiz.questions.length),
    }))

    try {
      const res = await axios.post(
        `/api/quizzes/${id}/attempt`,
        { answers: answersPayload, timeSpent },
        { headers: { Authorization: `Bearer ${storedToken}` } }
      )

      if (res.data.success) {
        setResults(res.data.results)
        setQuizCompleted(true)
      }
    } catch (err) {
      console.error('Failed to submit quiz:', err)
      // If already attempted, show local results
      if (err.response?.status === 400) {
        // Calculate local results as fallback
        setResults({
          totalQuestions: quiz.questions.length,
          correctAnswers: 0,
          score: 0,
          percentage: 0,
          passed: false,
          timeSpent,
          message: err.response.data?.message || 'You have already attempted this quiz',
        })
        setQuizCompleted(true)
      } else {
        setError('Failed to submit quiz. Your answers were not saved.')
        setQuizCompleted(true)
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading quiz...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Oops!</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => router.push('/quizzes')} className="btn-secondary">
              Back to Quizzes
            </button>
            <button onClick={fetchQuiz} className="btn-primary flex items-center">
              <RefreshCw className="w-4 h-4 mr-2" />Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!quiz) return null

  const authorName = quiz.author?.profile
    ? `${quiz.author.profile.firstName || ''} ${quiz.author.profile.lastName || ''}`.trim() || quiz.author.username
    : quiz.author?.username || 'Unknown'

  // Submitting state
  if (submitting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Submitting your answers...</p>
        </div>
      </div>
    )
  }

  // Pre-quiz info screen
  if (!quizStarted && !quizCompleted) {
    return (
      <div className="min-h-screen">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <button onClick={() => router.push('/quizzes')} className="flex items-center text-gray-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-5 h-5 mr-2" />Back to Quizzes
          </button>

          <div className="glass-card p-8 rounded-xl mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-4">{quiz.title}</h1>
                <p className="text-gray-300 text-lg">{quiz.description}</p>
              </div>
              <div className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-500/20 text-primary-400">
                {quiz.category}
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6 text-gray-400">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-bold">
                {authorName.charAt(0).toUpperCase()}
              </div>
              <span>by {authorName}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { icon: Clock, label: 'Duration', value: `${quiz.duration} min` },
                { icon: Brain, label: 'Questions', value: quiz.questions.length },
                { icon: Award, label: 'Pass Mark', value: `${quiz.passingMarks}/${quiz.totalMarks}` },
                { icon: BarChart3, label: 'Total Marks', value: quiz.totalMarks },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white/5 rounded-lg p-4 text-center">
                  <Icon className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                  <p className="text-white font-semibold">{value}</p>
                  <p className="text-gray-400 text-sm">{label}</p>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-3">Instructions</h3>
              <ul className="space-y-2 text-gray-300">
                {[
                  `You have ${quiz.duration} minutes to complete the quiz`,
                  'Each question has only one correct answer',
                  'You can navigate between questions before submitting',
                  `You need ${quiz.passingMarks} out of ${quiz.totalMarks} to pass (60%)`,
                  'You can only attempt this quiz once',
                  'Make sure you have a stable internet connection',
                ].map((item) => (
                  <li key={item} className="flex items-start">
                    <span className="text-primary-400 mr-2">•</span>{item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-4">
              <button onClick={handleStartQuiz} className="btn-primary flex-1 py-4 text-lg flex items-center justify-center">
                <Play className="w-6 h-6 mr-3" />Start Quiz
              </button>
              {user?.role === 'teacher' && (
                <Link href={`/quiz-analytics/${id}`} className="px-6 py-4 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />Analytics
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Quiz in progress
  if (quizStarted && !quizCompleted) {
    const question = quiz.questions[currentQuestion]
    const isTimeWarning = timeLeft < 60

    return (
      <div className="min-h-screen">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto">
          <div className="glass-card p-6 rounded-xl mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <span className="text-gray-400">Question {currentQuestion + 1} of {quiz.questions.length}</span>
                <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all" style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }} />
                </div>
              </div>
              <div className={`flex items-center space-x-2 ${isTimeWarning ? 'text-red-400 animate-pulse' : 'text-gray-300'}`}>
                <Clock className="w-5 h-5" />
                <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* Question navigation dots */}
            <div className="flex flex-wrap gap-2">
              {quiz.questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQuestion(i)}
                  className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                    i === currentQuestion
                      ? 'bg-primary-500 text-white'
                      : answers[i] !== undefined
                        ? 'bg-green-500/30 text-green-400 border border-green-500/50'
                        : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-8 rounded-xl">
            {question.topic && (
              <span className="inline-block px-3 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-full mb-4">
                {question.topic}
              </span>
            )}

            <h2 className="text-2xl font-bold text-white mb-6">{question.question}</h2>

            {question.chemicalEquation && (
              <div className="bg-white/5 rounded-lg p-4 mb-6 font-mono text-center text-lg text-primary-300">
                {question.chemicalEquation}
              </div>
            )}

            {question.image && (
              <div className="mb-6 rounded-lg overflow-hidden">
                <img src={question.image} alt="Question" className="max-w-full h-auto mx-auto" />
              </div>
            )}

            <div className="space-y-4 mb-8">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQuestion, index)}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    answers[currentQuestion] === index
                      ? 'border-primary-500 bg-primary-500/20 text-white'
                      : 'border-white/20 bg-white/5 text-gray-300 hover:border-primary-500 hover:bg-primary-500/10'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${answers[currentQuestion] === index ? 'border-primary-500 bg-primary-500' : 'border-gray-400'}`}>
                      {answers[currentQuestion] === index && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className="text-lg">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${currentQuestion === 0 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-secondary-700 text-white hover:bg-secondary-600'}`}
              >Previous</button>
              <button
                onClick={handleNextQuestion}
                disabled={answers[currentQuestion] === undefined}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center ${answers[currentQuestion] === undefined ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'btn-primary'}`}
              >
                {currentQuestion === quiz.questions.length - 1 ? 'Submit Quiz' : 'Next'}
                {currentQuestion === quiz.questions.length - 1 && <CheckCircle className="w-5 h-5 ml-2" />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Quiz completed — results
  if (quizCompleted && results) {
    const passed = results.passed
    const percentage = Math.round(results.percentage)

    return (
      <div className="min-h-screen">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto">
          <div className="glass-card p-8 rounded-xl text-center">
            {results.message ? (
              <>
                <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white mb-4">{results.message}</h1>
                <button onClick={() => router.push('/quizzes')} className="btn-primary mt-4">
                  Back to Quizzes
                </button>
              </>
            ) : (
              <>
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${passed ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {passed ? <CheckCircle className="w-12 h-12 text-green-400" /> : <XCircle className="w-12 h-12 text-red-400" />}
                </div>

                <h1 className="text-3xl font-bold text-white mb-2">{passed ? 'Congratulations!' : 'Quiz Completed'}</h1>
                <p className="text-gray-300 text-lg mb-8">{passed ? "You've successfully passed the quiz!" : 'Keep practicing and try again!'}</p>

                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/5 rounded-lg p-6">
                    <p className="text-3xl font-bold text-white mb-2">{results.correctAnswers}/{results.totalQuestions}</p>
                    <p className="text-gray-400">Correct Answers</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-6">
                    <p className={`text-3xl font-bold mb-2 ${passed ? 'text-green-400' : 'text-red-400'}`}>{percentage}%</p>
                    <p className="text-gray-400">Score</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-6">
                    <p className="text-3xl font-bold text-white mb-2">{formatTime(results.timeSpent)}</p>
                    <p className="text-gray-400">Time Taken</p>
                  </div>
                </div>

                {passed && (
                  <div className="flex items-center justify-center mb-8">
                    <Award className="w-6 h-6 text-yellow-400 mr-2" />
                    <span className="text-yellow-400 font-medium">Chemistry Expert Badge Earned!</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button onClick={() => router.push('/quizzes')} className="btn-secondary">Back to Quizzes</button>
                  <button onClick={() => router.push('/dashboard')} className="btn-primary">View Dashboard</button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    )
  }

  return null
}
