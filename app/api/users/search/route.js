import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'

export const dynamic = 'force-dynamic'

// GET /api/users/search?q=query
export async function GET(request) {
  try {
    const sql = getSQL()

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const offset = (page - 1) * limit

    const searchPattern = `%${query}%`

    const [users, countResult] = await Promise.all([
      sql`
        SELECT id, username, first_name, last_name, avatar, school, role,
               posts_count, likes_received, quizzes_taken, average_score
        FROM users
        WHERE is_active = true AND (
          username ILIKE ${searchPattern}
          OR first_name ILIKE ${searchPattern}
          OR last_name ILIKE ${searchPattern}
        )
        ORDER BY posts_count DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      sql`
        SELECT COUNT(*) as count FROM users
        WHERE is_active = true AND (
          username ILIKE ${searchPattern}
          OR first_name ILIKE ${searchPattern}
          OR last_name ILIKE ${searchPattern}
        )
      `,
    ])

    const total = parseInt(countResult[0].count)

    const formatted = users.map((u) => ({
      _id: u.id,
      username: u.username,
      profile: {
        firstName: u.first_name,
        lastName: u.last_name,
        avatar: u.avatar,
        school: u.school,
      },
      role: u.role,
      stats: {
        postsCount: u.posts_count,
        likesReceived: u.likes_received,
        quizzesTaken: u.quizzes_taken,
        averageScore: u.average_score,
      },
    }))

    return NextResponse.json({
      success: true,
      users: formatted,
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
