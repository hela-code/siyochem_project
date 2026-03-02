import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Comment from '@/models/Comment'
import Post from '@/models/Post'
import { requireAuth } from '@/lib/auth'

// GET /api/posts/[id]/comments
export async function GET(request, { params }) {
  try {
    await connectDB()

    const comments = await Comment.find({ post: params.id, isActive: true })
      .populate('author', 'username profile.firstName profile.lastName profile.avatar')
      .sort({ createdAt: -1 })

    return NextResponse.json({ success: true, comments })
  } catch (error) {
    console.error('Get comments error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while fetching comments' },
      { status: 500 }
    )
  }
}

// POST /api/posts/[id]/comments
export async function POST(request, { params }) {
  const { decoded, error } = requireAuth(request)
  if (error) return error

  try {
    await connectDB()

    const body = await request.json()
    const { content } = body

    if (!content) {
      return NextResponse.json(
        { success: false, message: 'Content is required' },
        { status: 400 }
      )
    }

    const comment = new Comment({
      content,
      author: decoded.userId,
      post: params.id,
    })

    await comment.save()
    await comment.populate('author', 'username profile.firstName profile.lastName profile.avatar')

    // Update post's comments array
    await Post.findByIdAndUpdate(params.id, { $push: { comments: comment._id } })

    return NextResponse.json(
      { success: true, message: 'Comment added successfully', comment },
      { status: 201 }
    )
  } catch (error) {
    console.error('Add comment error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while adding comment' },
      { status: 500 }
    )
  }
}
