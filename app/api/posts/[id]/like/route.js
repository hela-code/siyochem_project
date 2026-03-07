import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'
import { requireAuth } from '@/lib/auth'

// POST /api/posts/[id]/like
export async function POST(request, { params }) {
  const { decoded, error } = requireAuth(request)
  if (error) return error

  try {
    const sql = getSQL()

    // Check post exists
    const posts = await sql`SELECT id FROM posts WHERE id = ${params.id}`
    if (posts.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      )
    }

    const userId = decoded.userId

    // Check if already liked
    const existing = await sql`
      SELECT id FROM post_likes WHERE post_id = ${params.id} AND user_id = ${userId}
    `

    let liked
    if (existing.length > 0) {
      // Unlike
      await sql`DELETE FROM post_likes WHERE post_id = ${params.id} AND user_id = ${userId}`
      liked = false
    } else {
      // Like
      await sql`INSERT INTO post_likes (post_id, user_id) VALUES (${params.id}, ${userId})`
      liked = true
    }

    const countResult = await sql`SELECT COUNT(*) as count FROM post_likes WHERE post_id = ${params.id}`

    return NextResponse.json({
      success: true,
      liked,
      likesCount: parseInt(countResult[0].count),
    })
  } catch (error) {
    console.error('Like post error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while liking post' },
      { status: 500 }
    )
  }
}
