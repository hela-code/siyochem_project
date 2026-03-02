import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Quiz from '@/models/Quiz'
import User from '@/models/User'
import { requireAuth } from '@/lib/auth'

// GET /api/users/[id]/quizzes
export async function GET(request, { params }) {
  const { decoded, error } = requireAuth(request)
  if (error) return error

  try {
    await connectDB()

    const requestingUser = await User.findById(decoded.userId)
    if (decoded.userId !== params.id && requestingUser?.role !== 'teacher') {
      return NextResponse.json(
        { success: false, message: 'You can only view your own quiz results' },
        { status: 403 }
      )
    }

    const quizzes = await Quiz.find({
      'attempts.student': params.id,
      isPublished: true,
    })
      .populate('author', 'username profile.firstName profile.lastName')
      .select('title description category duration questions attempts createdAt')

    const userResults = quizzes.map((quiz) => {
      const userAttempt = quiz.attempts.find((a) => a.student.toString() === params.id)
      return {
        quizId: quiz._id,
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        duration: quiz.duration,
        totalQuestions: quiz.questions.length,
        author: quiz.author,
        attemptedAt: userAttempt?.submittedAt,
        score: userAttempt?.score,
        percentage: userAttempt?.percentage,
        passed: userAttempt?.passed,
        timeSpent: userAttempt?.timeSpent,
        averageTimePerQuestion: userAttempt?.averageTimePerQuestion,
      }
    })

    return NextResponse.json({ success: true, results: userResults })
  } catch (error) {
    console.error('Get user quiz results error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while fetching quiz results' },
      { status: 500 }
    )
  }
}
