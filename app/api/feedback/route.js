import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Feedback from '@/models/Feedback'
import User from '@/models/User'
import { requireAuth } from '@/lib/auth'

// GET /api/feedback — list all feedback
export async function GET() {
  try {
    await connectDB()

    const feedbacks = await Feedback.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ success: true, feedbacks })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}

// POST /api/feedback — create new feedback (auth required)
export async function POST(request) {
  try {
    const auth = requireAuth(request)
    if (auth.error) return auth.error

    await connectDB()

    const { content } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, message: 'Feedback content is required' },
        { status: 400 }
      )
    }

    // Look up user to get firstName
    const user = await User.findById(auth.decoded.userId).select('profile.firstName username')
    const authorName = user?.profile?.firstName || user?.username || 'Anonymous'

    const feedback = await Feedback.create({
      content: content.trim(),
      authorName,
      author: auth.decoded.userId,
    })

    return NextResponse.json({ success: true, feedback }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}
