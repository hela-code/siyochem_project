import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import { requireAuth } from '@/lib/auth'

// POST /api/posts/[id]/like
export async function POST(request, { params }) {
  const { decoded, error } = requireAuth(request)
  if (error) return error

  try {
    await connectDB()

    const post = await Post.findById(params.id)
    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      )
    }

    const userId = decoded.userId
    const likeIndex = post.likes.findIndex((like) => like.user.toString() === userId)

    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1)
    } else {
      post.likes.push({ user: userId })
    }

    await post.save()

    return NextResponse.json({
      success: true,
      liked: likeIndex === -1,
      likesCount: post.likes.length,
    })
  } catch (error) {
    console.error('Like post error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while liking post' },
      { status: 500 }
    )
  }
}
