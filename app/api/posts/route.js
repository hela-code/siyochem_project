import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import Topic from '@/models/Topic'
import User from '@/models/User'
import { requireAuth } from '@/lib/auth'

// POST /api/posts  — create a new post
export async function POST(request) {
  const { decoded, error } = requireAuth(request)
  if (error) return error

  try {
    await connectDB()

    const body = await request.json()
    const { content, topicId, images, chemicalEquations } = body

    if (!content || !topicId) {
      return NextResponse.json(
        { success: false, message: 'Content and topicId are required' },
        { status: 400 }
      )
    }

    const post = new Post({
      content,
      author: decoded.userId,
      topic: topicId,
      images: images || [],
      chemicalEquations: chemicalEquations || [],
    })

    await post.save()
    await post.populate('author', 'username profile.firstName profile.lastName profile.avatar')

    // Update topic's posts array
    await Topic.findByIdAndUpdate(topicId, { $push: { posts: post._id } })

    // Update user's posts count
    await User.findByIdAndUpdate(decoded.userId, { $inc: { 'stats.postsCount': 1 } })

    return NextResponse.json(
      { success: true, message: 'Post created successfully', post },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while creating post' },
      { status: 500 }
    )
  }
}
