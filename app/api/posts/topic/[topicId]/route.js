import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'

// GET /api/posts/topic/[topicId]
export async function GET(request, { params }) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const skip = (page - 1) * limit

    const [posts, total] = await Promise.all([
      Post.find({ topic: params.topicId, isActive: true })
        .populate('author', 'username profile.firstName profile.lastName profile.avatar')
        .populate('comments')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments({ topic: params.topicId, isActive: true }),
    ])

    return NextResponse.json({
      success: true,
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get posts error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while fetching posts' },
      { status: 500 }
    )
  }
}
