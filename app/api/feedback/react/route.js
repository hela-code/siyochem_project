import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'
import { requireAuth } from '@/lib/auth'

// POST /api/feedback/react — toggle reaction (catalyze) on a feedback
export async function POST(request) {
  const { decoded, error } = requireAuth(request)
  if (error) return error

  try {
    const sql = getSQL()
    const { feedbackId } = await request.json()

    if (!feedbackId) {
      return NextResponse.json(
        { success: false, message: 'Feedback ID is required' },
        { status: 400 }
      )
    }

    // Check if feedback exists
    const feedbacks = await sql`
      SELECT id FROM feedbacks WHERE id = ${feedbackId} AND is_active = true
    `
    if (feedbacks.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Feedback not found' },
        { status: 404 }
      )
    }

    // Check if already reacted
    const existing = await sql`
      SELECT id FROM feedback_reactions WHERE feedback_id = ${feedbackId} AND user_id = ${decoded.userId}
    `

    let reacted
    if (existing.length > 0) {
      // Remove reaction
      await sql`
        DELETE FROM feedback_reactions WHERE feedback_id = ${feedbackId} AND user_id = ${decoded.userId}
      `
      reacted = false
    } else {
      // Add reaction
      await sql`
        INSERT INTO feedback_reactions (feedback_id, user_id) VALUES (${feedbackId}, ${decoded.userId})
      `
      reacted = true
    }

    // Get updated count
    const countResult = await sql`
      SELECT COUNT(*) as count FROM feedback_reactions WHERE feedback_id = ${feedbackId}
    `
    const reactionCount = parseInt(countResult[0].count)

    return NextResponse.json({
      success: true,
      reacted,
      reactionCount,
    })
  } catch (error) {
    console.error('Feedback react error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
