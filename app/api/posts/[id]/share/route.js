import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'
import { requireAuth } from '@/lib/auth'

// POST /api/posts/[id]/share
export async function POST(request, { params }) {
  const { decoded, error } = requireAuth(request)
  if (error) return error

  try {
    const sql = getSQL()

    const body = await request.json()
    const { platform } = body

    if (!['twitter', 'facebook', 'linkedin', 'whatsapp'].includes(platform)) {
      return NextResponse.json(
        { success: false, message: 'Invalid platform' },
        { status: 400 }
      )
    }

    const posts = await sql`SELECT id FROM posts WHERE id = ${params.id}`
    if (posts.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      )
    }

    await sql`
      INSERT INTO post_shares (post_id, user_id, platform)
      VALUES (${params.id}, ${decoded.userId}, ${platform})
    `

    const countResult = await sql`SELECT COUNT(*) as count FROM post_shares WHERE post_id = ${params.id}`

    return NextResponse.json({
      success: true,
      message: 'Post shared successfully',
      sharesCount: parseInt(countResult[0].count),
    })
  } catch (error) {
    console.error('Share post error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while sharing post' },
      { status: 500 }
    )
  }
}
