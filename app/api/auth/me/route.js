import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const { decoded, error } = requireAuth(request)
  if (error) return error

  try {
    const sql = getSQL()

    const users = await sql`
      SELECT id, username, email, role, first_name, last_name, bio, avatar,
             school, grade, posts_count, likes_received, quizzes_taken,
             average_score, twitter, linkedin, instagram, is_active,
             last_login, created_at, updated_at
      FROM users WHERE id = ${decoded.userId}
    `
    const user = users[0]
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
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
    console.error('Auth verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
