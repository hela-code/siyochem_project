import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/quizzes
export async function GET(request) {
  try {
    const sql = getSQL()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const offset = (page - 1) * limit
    const category = searchParams.get('category')

    // Build conditions dynamically
    let quizzes, countResult
    if (category && category !== 'all') {
      ;[quizzes, countResult] = await Promise.all([
        sql`
          SELECT q.*,
            u.id as author_uid, u.username, u.first_name, u.last_name, u.avatar,
            (SELECT COUNT(*) FROM quiz_attempts WHERE quiz_id = q.id) as total_attempts
          FROM quizzes q
          JOIN users u ON q.author_id = u.id
          WHERE q.is_published = true AND q.is_active = true AND q.category = ${category}
          ORDER BY q.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `,
        sql`SELECT COUNT(*) as count FROM quizzes WHERE is_published = true AND is_active = true AND category = ${category}`,
      ])
    } else {
      ;[quizzes, countResult] = await Promise.all([
        sql`
          SELECT q.*,
            u.id as author_uid, u.username, u.first_name, u.last_name, u.avatar,
            (SELECT COUNT(*) FROM quiz_attempts WHERE quiz_id = q.id) as total_attempts
          FROM quizzes q
          JOIN users u ON q.author_id = u.id
          WHERE q.is_published = true AND q.is_active = true
          ORDER BY q.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `,
        sql`SELECT COUNT(*) as count FROM quizzes WHERE is_published = true AND is_active = true`,
      ])
    }

    const total = parseInt(countResult[0].count)

    // Fetch questions (without correct_answer) for each quiz
    const quizIds = quizzes.map((q) => q.id)
    let questionsMap = {}
    if (quizIds.length > 0) {
      const questions = await sql`
        SELECT quiz_id, question_index, question, options, difficulty, topic, chemical_equation, image
        FROM quiz_questions WHERE quiz_id = ANY(${quizIds})
        ORDER BY question_index
      `
      for (const q of questions) {
        if (!questionsMap[q.quiz_id]) questionsMap[q.quiz_id] = []
        questionsMap[q.quiz_id].push(q)
      }
    }

    const formatted = quizzes.map((q) => ({
      id: q.id,
      title: q.title,
      description: q.description,
      category: q.category,
      duration: q.duration,
      totalMarks: q.total_marks,
      passingMarks: q.passing_marks,
      isPublished: q.is_published,
      totalAttempts: parseInt(q.total_attempts),
      createdAt: q.created_at,
      updatedAt: q.updated_at,
      questions: (questionsMap[q.id] || []).map((qq) => ({
        question: qq.question,
        options: qq.options,
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
    }))

    return NextResponse.json({
      success: true,
      quizzes: formatted,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get quizzes error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while fetching quizzes' },
      { status: 500 }
    )
  }
}

// POST /api/quizzes  — create quiz (teachers only)
export async function POST(request) {
  const { decoded, error } = requireAuth(request)
  if (error) return error

  try {
    const sql = getSQL()

    // Check if user is a teacher
    const users = await sql`SELECT id, role FROM users WHERE id = ${decoded.userId}`
    if (!users[0] || users[0].role !== 'teacher') {
      return NextResponse.json(
        { success: false, message: 'Only teachers can create quizzes' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, duration, category, questions } = body

    if (!title || !description || !duration || !category || !questions?.length) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (
        !q.question ||
        !q.options ||
        q.options.length !== 4 ||
        typeof q.correctAnswer !== 'number' ||
        q.correctAnswer < 0 ||
        q.correctAnswer > 3
      ) {
        return NextResponse.json(
          { success: false, message: `Invalid question at index ${i}` },
          { status: 400 }
        )
      }
    }

    const totalMarks = questions.length
    const passingMarks = Math.ceil(questions.length * 0.6)

    // Insert quiz
    const result = await sql`
      INSERT INTO quizzes (title, description, author_id, category, duration, total_marks, passing_marks, is_published)
      VALUES (${title}, ${description}, ${decoded.userId}, ${category}, ${duration}, ${totalMarks}, ${passingMarks}, true)
      RETURNING *
    `
    const quiz = result[0]

    // Insert questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      await sql`
        INSERT INTO quiz_questions (quiz_id, question_index, question, options, correct_answer, explanation, difficulty, topic, chemical_equation, image)
        VALUES (
          ${quiz.id}, ${i}, ${q.question}, ${q.options}, ${q.correctAnswer},
          ${q.explanation || null}, ${q.difficulty || 'medium'}, ${q.topic || category},
          ${q.chemicalEquation || null}, ${q.image || null}
        )
      `
    }

    // Fetch author info
    const authors = await sql`
      SELECT id, username, first_name, last_name, avatar FROM users WHERE id = ${decoded.userId}
    `

    return NextResponse.json(
      {
        success: true,
        message: 'Quiz created successfully',
        quiz: {
          ...quiz,
          author: authors[0]
            ? {
                _id: authors[0].id,
                username: authors[0].username,
                profile: {
                  firstName: authors[0].first_name,
                  lastName: authors[0].last_name,
                  avatar: authors[0].avatar,
                },
              }
            : null,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create quiz error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while creating quiz' },
      { status: 500 }
    )
  }
}
