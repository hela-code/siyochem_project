import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Quiz from '@/models/Quiz'
import User from '@/models/User'
import { requireAuth } from '@/lib/auth'

// POST /api/quizzes/[id]/attempt
export async function POST(request, { params }) {
  const { decoded, error } = requireAuth(request)
  if (error) return error

  try {
    await connectDB()

    const body = await request.json()
    const { answers, timeSpent } = body

    const quiz = await Quiz.findById(params.id)
    if (!quiz || !quiz.isPublished) {
      return NextResponse.json(
        { success: false, message: 'Quiz not found or not published' },
        { status: 404 }
      )
    }

    const userId = decoded.userId

    // Check if user has already attempted
    const existingAttempt = quiz.attempts.find(
      (attempt) => attempt.student.toString() === userId
    )
    if (existingAttempt) {
      return NextResponse.json(
        { success: false, message: 'You have already attempted this quiz' },
        { status: 400 }
      )
    }

    // Calculate score
    let correctAnswers = 0
    const processedAnswers = answers.map((answer, index) => {
      const isCorrect = answer.selectedAnswer === quiz.questions[index].correctAnswer
      if (isCorrect) correctAnswers++
      return {
        questionIndex: index,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        timeSpent: answer.timeSpent || 0,
      }
    })

    const score = correctAnswers
    const percentage = (score / quiz.questions.length) * 100
    const passed = percentage >= 60
    const averageTimePerQuestion = timeSpent / quiz.questions.length

    quiz.attempts.push({
      student: userId,
      submittedAt: new Date(),
      answers: processedAnswers,
      score,
      percentage,
      passed,
      timeSpent,
      averageTimePerQuestion,
    })

    await quiz.save()

    // Update user stats
    await User.findByIdAndUpdate(userId, {
      $inc: { 'stats.quizzesTaken': 1 },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Quiz submitted successfully',
        results: {
          score,
          percentage,
          passed,
          totalQuestions: quiz.questions.length,
          correctAnswers,
          timeSpent,
          averageTimePerQuestion,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Submit quiz error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while submitting quiz' },
      { status: 500 }
    )
  }
}
