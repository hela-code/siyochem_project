import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'
import { requireAuth } from '@/lib/auth'

// POST /api/topics/[id]/like
export async function POST(request, { params }) {
  const { decoded, error } = requireAuth(request)
  if (error) return error

  try {
    const sql = getSQL()

    const topics = await sql`SELECT id FROM topics WHERE id = ${params.id}`
    if (topics.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Topic not found' },
        { status: 404 }
      )
    }

    const userId = decoded.userId

    // Check if already liked
    const existing = await sql`
      SELECT id FROM topic_likes WHERE topic_id = ${params.id} AND user_id = ${userId}
    `

    let liked
    if (existing.length > 0) {
      await sql`DELETE FROM topic_likes WHERE topic_id = ${params.id} AND user_id = ${userId}`
      liked = false
    } else {
      await sql`INSERT INTO topic_likes (topic_id, user_id) VALUES (${params.id}, ${userId})`
      liked = true
    }

    const countResult = await sql`SELECT COUNT(*) as count FROM topic_likes WHERE topic_id = ${params.id}`

    return NextResponse.json({
      success: true,
      liked,
      likesCount: parseInt(countResult[0].count),
    })
  } catch (error) {
    console.error('Like topic error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while liking topic' },
      { status: 500 }
    )
  }
}
