import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'
import { requireAuth, extractToken, verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/quizzes/[id]
export async function GET(request, { params }) {
  try {
    const sql = getSQL()

    const token = extractToken(request)
    const decoded = token ? verifyToken(token) : null

    // Fetch quiz
    const quizzes = await sql`
      SELECT q.*, u.id as author_uid, u.username, u.first_name, u.last_name, u.avatar
      FROM quizzes q
      JOIN users u ON q.author_id = u.id
      WHERE q.id = ${params.id}
    `

    if (quizzes.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Quiz not found' },
        { status: 404 }
      )
    }

    const q = quizzes[0]
    const isAuthor = decoded && q.author_id === decoded.userId

    // Fetch questions — include correctAnswer only if author
    let questions
    if (isAuthor) {
      questions = await sql`
        SELECT * FROM quiz_questions WHERE quiz_id = ${params.id} ORDER BY question_index
      `
    } else {
      questions = await sql`
        SELECT question_index, question, options, difficulty, topic, chemical_equation, image, explanation
        FROM quiz_questions WHERE quiz_id = ${params.id} ORDER BY question_index
      `
    }

    const quiz = {
      id: q.id,
      title: q.title,
      description: q.description,
      category: q.category,
      duration: q.duration,
      totalMarks: q.total_marks,
      passingMarks: q.passing_marks,
      isPublished: q.is_published,
      isActive: q.is_active,
      createdAt: q.created_at,
      updatedAt: q.updated_at,
      questions: questions.map((qq) => ({
        question: qq.question,
        options: qq.options,
        ...(isAuthor ? { correctAnswer: qq.correct_answer } : {}),
        explanation: qq.explanation,
        difficulty: qq.difficulty,
        topic: qq.topic,
        chemicalEquation: qq.chemical_equation,
        image: qq.image,
      })),
      author: {
        _id: q.author_uid,
        username: q.username,
        profile: {
          firstName: q.first_name,
          lastName: q.last_name,
          avatar: q.avatar,
        },
      },
    }

    return NextResponse.json({ success: true, quiz })
  } catch (error) {
    console.error('Get quiz error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while fetching quiz' },
      { status: 500 }
    )
  }
}

// PUT /api/quizzes/[id]  — update quiz (author only)
export async function PUT(request, { params }) {
  const { decoded, error } = requireAuth(request)
  if (error) return error

  try {
    const sql = getSQL()

    const quizzes = await sql`SELECT * FROM quizzes WHERE id = ${params.id}`
    if (quizzes.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Quiz not found' },
        { status: 404 }
      )
    }

    if (quizzes[0].author_id !== decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update this quiz' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, category, duration, questions, isPublished } = body

    // Update quiz fields
    const updated = await sql`
      UPDATE quizzes SET
        title = COALESCE(${title || null}, title),
        description = COALESCE(${description || null}, description),
        category = COALESCE(${category || null}, category),
        duration = COALESCE(${duration || null}, duration),
        is_published = COALESCE(${typeof isPublished !== 'undefined' ? isPublished : null}, is_published)
      WHERE id = ${params.id}
      RETURNING *
    `

    // If questions updated, replace them
    if (questions && questions.length > 0) {
      await sql`DELETE FROM quiz_questions WHERE quiz_id = ${params.id}`
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        await sql`
          INSERT INTO quiz_questions (quiz_id, question_index, question, options, correct_answer, explanation, difficulty, topic, chemical_equation, image)
          VALUES (
            ${params.id}, ${i}, ${q.question}, ${q.options}, ${q.correctAnswer},
            ${q.explanation || null}, ${q.difficulty || 'medium'}, ${q.topic || category || 'Mixed Topics'},
            ${q.chemicalEquation || null}, ${q.image || null}
          )
        `
      }
    }

    return NextResponse.json({ success: true, message: 'Quiz updated', quiz: updated[0] })
  } catch (error) {
    console.error('Update quiz error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while updating quiz' },
      { status: 500 }
    )
  }
}
