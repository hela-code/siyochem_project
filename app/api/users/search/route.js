import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

// GET /api/users/search?q=query
export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const skip = (page - 1) * limit

    const filter = {
      isActive: true,
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { 'profile.firstName': { $regex: query, $options: 'i' } },
        { 'profile.lastName': { $regex: query, $options: 'i' } },
      ],
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('username profile.firstName profile.lastName profile.avatar profile.school role stats')
        .sort({ 'stats.postsCount': -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ])

    return NextResponse.json({
      success: true,
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Search users error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while searching users' },
      { status: 500 }
    )
  }
}
