import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Quiz from '@/models/Quiz'
import User from '@/models/User'
import { requireAuth } from '@/lib/auth'

// GET /api/quizzes
export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const skip = (page - 1) * limit
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')

    let query = { isPublished: true, isActive: true }
    if (category && category !== 'all') query.category = category
    if (difficulty) query['questions.difficulty'] = difficulty

    const [quizzes, total] = await Promise.all([
      Quiz.find(query)
        .populate('author', 'username profile.firstName profile.lastName profile.avatar')
        .select('-questions.correctAnswer -attempts')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Quiz.countDocuments(query),
    ])

    return NextResponse.json({
      success: true,
      quizzes,
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
    await connectDB()

    // Check if user is a teacher
    const user = await User.findById(decoded.userId)
    if (!user || user.role !== 'teacher') {
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

    const quiz = new Quiz({
      title,
      description,
      author: decoded.userId,
      questions,
      category,
      duration,
      totalMarks: questions.length,
      passingMarks: Math.ceil(questions.length * 0.6),
    })

    await quiz.save()
    await quiz.populate('author', 'username profile.firstName profile.lastName profile.avatar')

    return NextResponse.json(
      { success: true, message: 'Quiz created successfully', quiz },
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
