import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSQL } from '@/lib/neon'
import { signToken } from '@/lib/auth'

export async function POST(request) {
  try {
    const sql = getSQL()

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide email and password' },
        { status: 400 }
      )
    }

    // Find user
    const users = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase()}`
    const user = users[0]
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Update last login
    await sql`UPDATE users SET last_login = NOW() WHERE id = ${user.id}`

    const token = signToken({ userId: user.id, role: user.role })

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: {
          firstName: user.first_name,
          lastName: user.last_name,
          bio: user.bio,
          avatar: user.avatar,
          school: user.school,
          grade: user.grade,
        },
        stats: {
          postsCount: user.posts_count,
          likesReceived: user.likes_received,
          quizzesTaken: user.quizzes_taken,
          averageScore: user.average_score,
        },
        socialLinks: {
          twitter: user.twitter,
          linkedin: user.linkedin,
          instagram: user.instagram,
        },
        isActive: user.is_active,
        lastLogin: user.last_login,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error during login' },
      { status: 500 }
    )
  }
}
