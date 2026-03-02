import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Topic from '@/models/Topic'
import { requireAuth } from '@/lib/auth'

// GET /api/topics/[id]
export async function GET(request, { params }) {
  try {
    await connectDB()

    const topic = await Topic.findById(params.id)
      .populate('author', 'username profile.firstName profile.lastName profile.avatar')
      .populate({
        path: 'posts',
        populate: {
          path: 'author',
          select: 'username profile.firstName profile.lastName profile.avatar',
        },
      })

    if (!topic) {
      return NextResponse.json(
        { success: false, message: 'Topic not found' },
        { status: 404 }
      )
    }

    // Increment views
    topic.views += 1
    await topic.save()

    return NextResponse.json({ success: true, topic })
  } catch (error) {
    console.error('Get topic error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while fetching topic' },
      { status: 500 }
    )
  }
}

// PUT /api/topics/[id]
export async function PUT(request, { params }) {
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

    if (topic.author.toString() !== decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update this topic' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, category, tags, image } = body

    Object.assign(topic, {
      ...(title && { title }),
      ...(description && { description }),
      ...(category && { category }),
      ...(tags && { tags }),
      ...(image && { image }),
    })

    await topic.save()
    await topic.populate('author', 'username profile.firstName profile.lastName profile.avatar')

    return NextResponse.json({ success: true, message: 'Topic updated', topic })
  } catch (error) {
    console.error('Update topic error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while updating topic' },
      { status: 500 }
    )
  }
}

// DELETE /api/topics/[id]
export async function DELETE(request, { params }) {
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

    if (topic.author.toString() !== decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete this topic' },
        { status: 403 }
      )
    }

    topic.isActive = false
    await topic.save()

    return NextResponse.json({ success: true, message: 'Topic deleted' })
  } catch (error) {
    console.error('Delete topic error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while deleting topic' },
      { status: 500 }
    )
  }
}
