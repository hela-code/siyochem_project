import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Topic from '@/models/Topic'
import { requireAuth } from '@/lib/auth'

// POST /api/topics/[id]/like
export async function POST(request, { params }) {
  const { decoded, error } = requireAuth(request)
  if (error) return error

  try {
    await connectDB()

    const topic = await Topic.findById(params.id)
    if (!topic) {
      return NextResponse.json(
        { success: false, message: 'Topic not found' },
        { status: 404 }
      )
    }

    const userId = decoded.userId
    const likeIndex = topic.likes.findIndex((like) => like.user.toString() === userId)

    if (likeIndex > -1) {
      topic.likes.splice(likeIndex, 1)
    } else {
      topic.likes.push({ user: userId })
    }

    await topic.save()

    return NextResponse.json({
      success: true,
      liked: likeIndex === -1,
      likesCount: topic.likes.length,
    })
  } catch (error) {
    console.error('Like topic error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while liking topic' },
      { status: 500 }
    )
  }
}
