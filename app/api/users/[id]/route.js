import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Quiz from '@/models/Quiz'
import Topic from '@/models/Topic'
import { requireAuth } from '@/lib/auth'

// GET /api/users/[id]
export async function GET(request, { params }) {
  try {
    await connectDB()

    const user = await User.findById(params.id).select('-password')
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    const [quizCount, topicCount] = await Promise.all([
      Quiz.countDocuments({ author: user._id }),
      Topic.countDocuments({ author: user._id }),
    ])

    return NextResponse.json({
      success: true,
      user: { ...user.toObject(), quizCount, topicCount },
    })
  } catch (error) {
    console.error('Get user profile error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while fetching user profile' },
      { status: 500 }
    )
  }
}

// PUT /api/users/[id]
export async function PUT(request, { params }) {
  const { decoded, error } = requireAuth(request)
  if (error) return error

  if (decoded.userId !== params.id) {
    return NextResponse.json(
      { success: false, message: 'You can only update your own profile' },
      { status: 403 }
    )
  }

  try {
    await connectDB()

    const body = await request.json()
    const { profile, socialLinks } = body

    const updateData = {}
    if (profile) updateData.profile = profile
    if (socialLinks) updateData.socialLinks = socialLinks

    const user = await User.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password')

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user,
    })
  } catch (error) {
    console.error('Update user profile error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while updating profile' },
      { status: 500 }
    )
  }
}
