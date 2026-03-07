import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'
import { requireAuth, extractToken, verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/feedback — list all feedback with reaction counts
export async function GET(request) {
  try {
    const sql = getSQL()

    // Check if user is logged in to get their reactions
    const token = extractToken(request)
    const decoded = token ? verifyToken(token) : null

    const feedbacks = await sql`
      SELECT f.*,
        (SELECT COUNT(*) FROM feedback_reactions WHERE feedback_id = f.id) as reaction_count
      FROM feedbacks f
      WHERE f.is_active = true
      ORDER BY f.created_at DESC
    `

    // If user is logged in, get their reactions
    let userReactions = []
    if (decoded) {
      userReactions = await sql`
        SELECT feedback_id FROM feedback_reactions WHERE user_id = ${decoded.userId}
      `
    }
    const userReactedSet = new Set(userReactions.map((r) => r.feedback_id))

    const formatted = feedbacks.map((fb) => ({
      ...fb,
      reaction_count: parseInt(fb.reaction_count),
      user_reacted: userReactedSet.has(fb.id),
    }))

    return NextResponse.json({ success: true, feedbacks: formatted })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}

// POST /api/feedback — create new feedback (auth required)
export async function POST(request) {
  try {
    const auth = requireAuth(request)
    if (auth.error) return auth.error

    const sql = getSQL()
    const { content } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, message: 'Feedback content is required' },
        { status: 400 }
      )
    }

    // Look up user to get firstName
    const users = await sql`
      SELECT first_name, username FROM users WHERE id = ${auth.decoded.userId}
    `
    const user = users[0]
    const authorName = user?.first_name || user?.username || 'Anonymous'

    const result = await sql`
      INSERT INTO feedbacks (content, author_name, author_id)
      VALUES (${content.trim()}, ${authorName}, ${auth.decoded.userId})
      RETURNING *
    `

    return NextResponse.json({ success: true, feedback: result[0] }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}
