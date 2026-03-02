import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import { requireAuth } from '@/lib/auth'

// POST /api/posts/[id]/share
export async function POST(request, { params }) {
  const { decoded, error } = requireAuth(request)
  if (error) return error

  try {
    await connectDB()

    const body = await request.json()
    const { platform } = body

    if (!['twitter', 'facebook', 'linkedin', 'whatsapp'].includes(platform)) {
      return NextResponse.json(
        { success: false, message: 'Invalid platform' },
        { status: 400 }
      )
    }

    const post = await Post.findById(params.id)
    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      )
    }

    post.shares.push({ user: decoded.userId, platform })
    await post.save()

    return NextResponse.json({
      success: true,
      message: 'Post shared successfully',
      sharesCount: post.shares.length,
    })
  } catch (error) {
    console.error('Share post error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while sharing post' },
      { status: 500 }
    )
  }
}
