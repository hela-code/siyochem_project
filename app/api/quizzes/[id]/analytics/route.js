import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/quizzes/[id]/analytics  — teachers only
export async function GET(request, { params }) {
  const { decoded, error } = requireAuth(request)
  if (error) return error

  try {
    const sql = getSQL()

    // Fetch quiz
    const quizzes = await sql`SELECT * FROM quizzes WHERE id = ${params.id}`
    if (quizzes.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Quiz not found' },
        { status: 404 }
      )
    }
    const quiz = quizzes[0]

    if (quiz.author_id !== decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Only the quiz author can view analytics' },
        { status: 403 }
      )
    }

    // Fetch questions
    const questions = await sql`
      SELECT * FROM quiz_questions WHERE quiz_id = ${params.id} ORDER BY question_index
    `

    // Fetch attempts with student info
    const attempts = await sql`
      SELECT a.*, u.username, u.first_name, u.last_name, u.email
      FROM quiz_attempts a
      JOIN users u ON a.student_id = u.id
      WHERE a.quiz_id = ${params.id}
    `

    // Fetch all answers for all attempts
    const attemptIds = attempts.map((a) => a.id)
    let allAnswers = []
    if (attemptIds.length > 0) {
      allAnswers = await sql`
        SELECT * FROM quiz_attempt_answers WHERE attempt_id = ANY(${attemptIds})
      `
    }

    // Group answers by attempt
    const answersByAttempt = {}
    for (const ans of allAnswers) {
      if (!answersByAttempt[ans.attempt_id]) answersByAttempt[ans.attempt_id] = []
      answersByAttempt[ans.attempt_id].push(ans)
    }

    const averageTimeSpent =
      attempts.length > 0
        ? attempts.reduce((sum, a) => sum + a.time_spent, 0) / attempts.length
        : 0

    const totalAttempts = attempts.length

    // Compute average score
    const averageScore =
      attempts.length > 0
        ? (attempts.reduce((sum, a) => sum + parseFloat(a.percentage), 0) / attempts.length).toFixed(2)
        : 0

    // Compute pass rate
    const passedAttempts = attempts.filter((a) => a.passed).length
    const passRate = attempts.length > 0 ? ((passedAttempts / attempts.length) * 100).toFixed(2) : 0

    const questionAnalytics = questions.map((question, index) => {
      const answersForQ = allAnswers.filter((a) => a.question_index === index)
      const correctAttempts = answersForQ.filter((a) => a.is_correct).length
      const avgTime =
        answersForQ.length > 0
          ? answersForQ.reduce((sum, a) => sum + a.time_spent, 0) / answersForQ.length
          : 0

      return {
        questionIndex: index,
        question: question.question,
        correctAttempts,
        totalAttempts: answersForQ.length,
        correctRate: answersForQ.length > 0 ? (correctAttempts / answersForQ.length) * 100 : 0,
        averageTime: avgTime,
      }
    })

    const analytics = {
      quiz: {
        title: quiz.title,
        totalAttempts,
        averageScore,
        passRate,
        averageTimeSpent,
        difficulty: questions[0]?.difficulty || 'medium',
      },
      questionAnalytics,
      attempts: attempts.map((a) => ({
        student: {
          _id: a.student_id,
          username: a.username,
          profile: { firstName: a.first_name, lastName: a.last_name },
          email: a.email,
        },
        submittedAt: a.submitted_at,
        score: a.score,
        percentage: a.percentage,
        passed: a.passed,
        timeSpent: a.time_spent,
        averageTimePerQuestion: a.average_time_per_question,
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
