'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
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
} from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'

export default function QuizDetail() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(1800)

  const quiz = {
    id,
    title: 'Chemical Bonding Fundamentals',
    description: 'Test your understanding of ionic, covalent, and metallic bonds.',
    author: { name: 'Dr. Sarah Johnson' },
    category: 'Physical Chemistry',
    difficulty: 'medium',
    duration: 30,
    questions: [
      {
        question: 'What type of bond is formed when electrons are transferred from one atom to another?',
        options: ['Covalent bond', 'Ionic bond', 'Metallic bond', 'Hydrogen bond'],
        correctAnswer: 1,
      },
      {
        question: 'Which of the following is a characteristic of covalent bonds?',
        options: ['Electron transfer', 'High electrical conductivity', 'Electron sharing', 'Formation of ions'],
        correctAnswer: 2,
      },
      {
        question: 'In metallic bonds, valence electrons are:',
        options: ['Tightly bound to individual atoms', 'Shared between specific atoms', 'Delocalized throughout the metal lattice', 'Transferred to non-metal atoms'],
        correctAnswer: 2,
      },
    ],
    stats: { attempts: 234, averageScore: 78 },
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleStartQuiz = () => {
    setQuizStarted(true)
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timer); setQuizCompleted(true); return 0 }
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
      setQuizCompleted(true)
    }
  }

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
              <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
                quiz.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                quiz.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
              }`}>{quiz.difficulty}</div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { icon: Clock, label: 'Duration', value: `${quiz.duration} min` },
                { icon: Brain, label: 'Questions', value: quiz.questions.length },
                { icon: Users, label: 'Attempts', value: quiz.stats.attempts },
                { icon: BarChart3, label: 'Avg Score', value: `${quiz.stats.averageScore}%` },
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
                <Link href={`/quiz-analytics/${id}`} className="btn-secondary flex items-center px-6">
                  <BarChart3 className="w-5 h-5 mr-2" />View Analytics
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  if (quizStarted && !quizCompleted) {
    const question = quiz.questions[currentQuestion]
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
              <div className="flex items-center space-x-2 text-red-400">
                <Clock className="w-5 h-5" />
                <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 rounded-xl">
            <h2 className="text-2xl font-bold text-white mb-6">{question.question}</h2>
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
                {currentQuestion === quiz.questions.length - 1 ? 'Submit' : 'Next'}
                {currentQuestion === quiz.questions.length - 1 && <CheckCircle className="w-5 h-5 ml-2" />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  if (quizCompleted) {
    const correctAnswers = answers.reduce((count, ans, i) => ans === quiz.questions[i]?.correctAnswer ? count + 1 : count, 0)
    const percentage = Math.round((correctAnswers / quiz.questions.length) * 100)
    const passed = percentage >= 60

    return (
      <div className="min-h-screen">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto">
          <div className="glass-card p-8 rounded-xl text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${passed ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {passed ? <CheckCircle className="w-12 h-12 text-green-400" /> : <XCircle className="w-12 h-12 text-red-400" />}
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">{passed ? 'Congratulations!' : 'Quiz Completed'}</h1>
            <p className="text-gray-300 text-lg mb-8">{passed ? "You've successfully passed the quiz!" : 'Keep practicing and try again!'}</p>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white/5 rounded-lg p-6">
                <p className="text-3xl font-bold text-white mb-2">{correctAnswers}/{quiz.questions.length}</p>
                <p className="text-gray-400">Correct Answers</p>
              </div>
              <div className="bg-white/5 rounded-lg p-6">
                <p className="text-3xl font-bold text-white mb-2">{percentage}%</p>
                <p className="text-gray-400">Score</p>
              </div>
              <div className="bg-white/5 rounded-lg p-6">
                <p className="text-3xl font-bold text-white mb-2">{formatTime(1800 - timeLeft)}</p>
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
              <button onClick={() => { setQuizCompleted(false); setQuizStarted(false); setCurrentQuestion(0); setAnswers([]); setTimeLeft(1800) }} className="btn-primary">Retake Quiz</button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }
}
