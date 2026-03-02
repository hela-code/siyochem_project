import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Topic from '@/models/Topic'
import { requireAuth } from '@/lib/auth'

// GET /api/topics  — list topics with pagination & filters
export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const skip = (page - 1) * limit
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    let query = { isActive: true }
    if (category && category !== 'all') query.category = category
    if (search) query.$text = { $search: search }

    const [topics, total] = await Promise.all([
      Topic.find(query)
        .populate('author', 'username profile.firstName profile.lastName profile.avatar')
        .populate('posts')
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Topic.countDocuments(query),
    ])

    return NextResponse.json({
      success: true,
      topics,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get topics error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while fetching topics' },
      { status: 500 }
    )
  }
}

// POST /api/topics  — create a new topic
export async function POST(request) {
  const { decoded, error } = requireAuth(request)
  if (error) return error

  try {
    await connectDB()

    const body = await request.json()
    const { title, description, category, tags, image } = body

    if (!title || !description || !category) {
      return NextResponse.json(
        { success: false, message: 'Title, description, and category are required' },
        { status: 400 }
      )
    }

    const topic = new Topic({
      title,
      description,
      author: decoded.userId,
      category,
      tags: tags || [],
      image,
    })

    await topic.save()
    await topic.populate('author', 'username profile.firstName profile.lastName profile.avatar')

    return NextResponse.json(
      { success: true, message: 'Topic created successfully', topic },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create topic error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while creating topic' },
      { status: 500 }
    )
  }
}
