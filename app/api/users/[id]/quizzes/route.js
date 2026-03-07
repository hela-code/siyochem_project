import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/users/[id]/quizzes
export async function GET(request, { params }) {
  const { decoded, error } = requireAuth(request)
  if (error) return error

  try {
    const sql = getSQL()

    const requestingUser = await sql`SELECT id, role FROM users WHERE id = ${decoded.userId}`
    if (decoded.userId !== params.id && requestingUser[0]?.role !== 'teacher') {
      return NextResponse.json(
        { success: false, message: 'You can only view your own quiz results' },
        { status: 403 }
      )
    }

    // Find all quizzes where this student has an attempt
    const attempts = await sql`
      SELECT a.*,
        q.id as quiz_id, q.title, q.description, q.category, q.duration, q.created_at as quiz_created_at,
        u.id as author_uid, u.username, u.first_name, u.last_name,
        (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as total_questions
      FROM quiz_attempts a
      JOIN quizzes q ON a.quiz_id = q.id
      JOIN users u ON q.author_id = u.id
      WHERE a.student_id = ${params.id} AND q.is_published = true
    `

    const userResults = attempts.map((a) => ({
      quizId: a.quiz_id,
      title: a.title,
      description: a.description,
      category: a.category,
      duration: a.duration,
      totalQuestions: parseInt(a.total_questions),
      author: {
        _id: a.author_uid,
        username: a.username,
        profile: {
          firstName: a.first_name,
          lastName: a.last_name,
        },
      },
      attemptedAt: a.submitted_at,
      score: a.score,
      percentage: a.percentage,
      passed: a.passed,
      timeSpent: a.time_spent,
      averageTimePerQuestion: a.average_time_per_question,
    }))

    return NextResponse.json({ success: true, results: userResults })
  } catch (error) {
    console.error('Get user quiz results error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while fetching quiz results' },
      { status: 500 }
    )
  }
}
