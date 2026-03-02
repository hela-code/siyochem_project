import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Topic from '@/models/Topic'

// GET /api/topics/trending
export async function GET() {
  try {
    await connectDB()

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const topics = await Topic.find({
      isActive: true,
      createdAt: { $gte: oneWeekAgo },
    })
      .populate('author', 'username profile.firstName profile.lastName profile.avatar')
      .sort({ views: -1 })
      .limit(10)

    return NextResponse.json({ success: true, topics })
  } catch (error) {
    console.error('Get trending topics error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while fetching trending topics' },
      { status: 500 }
    )
  }
}
