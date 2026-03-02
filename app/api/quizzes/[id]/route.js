import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Quiz from '@/models/Quiz'
import { requireAuth, extractToken, verifyToken } from '@/lib/auth'

// GET /api/quizzes/[id]
export async function GET(request, { params }) {
  try {
    await connectDB()

    const token = extractToken(request)
    const decoded = token ? verifyToken(token) : null

    let quiz
    if (decoded) {
      quiz = await Quiz.findById(params.id).populate(
        'author',
        'username profile.firstName profile.lastName profile.avatar'
      )

      if (!quiz) {
        return NextResponse.json(
          { success: false, message: 'Quiz not found' },
          { status: 404 }
        )
      }

      // If not the author, strip correct answers
      if (quiz.author._id.toString() !== decoded.userId) {
        const quizObj = quiz.toObject()
        quizObj.questions = quizObj.questions.map((q) => ({ ...q, correctAnswer: undefined }))
        return NextResponse.json({ success: true, quiz: quizObj })
      }
    } else {
      quiz = await Quiz.findById(params.id)
        .populate('author', 'username profile.firstName profile.lastName profile.avatar')
        .select('-questions.correctAnswer')
    }

    if (!quiz) {
      return NextResponse.json(
        { success: false, message: 'Quiz not found' },
        { status: 404 }
      )
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
    await connectDB()

    const quiz = await Quiz.findById(params.id)
    if (!quiz) {
      return NextResponse.json(
        { success: false, message: 'Quiz not found' },
        { status: 404 }
      )
    }

    if (quiz.author.toString() !== decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update this quiz' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, category, duration, questions, isPublished } = body

    Object.assign(quiz, {
      ...(title && { title }),
      ...(description && { description }),
      ...(category && { category }),
      ...(duration && { duration }),
      ...(questions && { questions }),
      ...(typeof isPublished !== 'undefined' && { isPublished }),
    })

    await quiz.save()

    return NextResponse.json({ success: true, message: 'Quiz updated', quiz })
  } catch (error) {
    console.error('Update quiz error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while updating quiz' },
      { status: 500 }
    )
  }
}
