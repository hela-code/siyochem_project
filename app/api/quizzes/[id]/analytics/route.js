import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Quiz from '@/models/Quiz'
import { requireAuth } from '@/lib/auth'

// GET /api/quizzes/[id]/analytics  — teachers only
export async function GET(request, { params }) {
  const { decoded, error } = requireAuth(request)
  if (error) return error

  try {
    await connectDB()

    const quiz = await Quiz.findById(params.id).populate({
      path: 'attempts.student',
      select: 'username profile.firstName profile.lastName email',
    })

    if (!quiz) {
      return NextResponse.json(
        { success: false, message: 'Quiz not found' },
        { status: 404 }
      )
    }

    if (quiz.author.toString() !== decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Only the quiz author can view analytics' },
        { status: 403 }
      )
    }

    const averageTimeSpent =
      quiz.attempts.length > 0
        ? quiz.attempts.reduce((sum, a) => sum + a.timeSpent, 0) / quiz.attempts.length
        : 0

    const questionAnalytics = quiz.questions.map((question, index) => {
      const attemptsWithAnswer = quiz.attempts.filter((a) => a.answers[index])
      const correctAttempts = attemptsWithAnswer.filter((a) => a.answers[index].isCorrect).length
      const averageTime =
        attemptsWithAnswer.length > 0
          ? attemptsWithAnswer.reduce((sum, a) => sum + a.answers[index].timeSpent, 0) /
            attemptsWithAnswer.length
          : 0

      return {
        questionIndex: index,
        question: question.question,
        correctAttempts,
        totalAttempts: attemptsWithAnswer.length,
        correctRate: attemptsWithAnswer.length > 0
          ? (correctAttempts / attemptsWithAnswer.length) * 100
          : 0,
        averageTime,
      }
    })

    const analytics = {
      quiz: {
        title: quiz.title,
        totalAttempts: quiz.attempts.length,
        averageScore: quiz.averageScore,
        passRate: quiz.passRate,
        averageTimeSpent,
        difficulty: quiz.questions[0]?.difficulty || 'medium',
      },
      questionAnalytics,
      attempts: quiz.attempts.map((a) => ({
        student: a.student,
        submittedAt: a.submittedAt,
        score: a.score,
        percentage: a.percentage,
        passed: a.passed,
        timeSpent: a.timeSpent,
        averageTimePerQuestion: a.averageTimePerQuestion,
      })),
    }

    return NextResponse.json({ success: true, analytics })
  } catch (error) {
    console.error('Get quiz analytics error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while fetching analytics' },
      { status: 500 }
    )
  }
}
