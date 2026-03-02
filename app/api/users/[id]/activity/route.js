import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import Topic from '@/models/Topic'

// GET /api/users/[id]/activity
export async function GET(request, { params }) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const skip = (page - 1) * limit

    const [posts, topics] = await Promise.all([
      Post.find({ author: params.id, isActive: true })
        .populate('topic', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Topic.find({ author: params.id, isActive: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ])

    const activities = [
      ...posts.map((post) => ({
        type: 'post',
        id: post._id,
        content: post.content,
        topic: post.topic,
        likesCount: post.likes.length,
        commentsCount: post.comments.length,
        createdAt: post.createdAt,
      })),
      ...topics.map((topic) => ({
        type: 'topic',
        id: topic._id,
        title: topic.title,
        description: topic.description,
        category: topic.category,
        likesCount: topic.likes.length,
        postsCount: topic.posts.length,
        views: topic.views,
        createdAt: topic.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    return NextResponse.json({ success: true, activities })
  } catch (error) {
    console.error('Get user activity error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while fetching user activity' },
      { status: 500 }
    )
  }
}
