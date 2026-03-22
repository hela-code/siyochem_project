import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/admin/messages
export async function GET(request) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error
    if (!auth.decoded || auth.decoded.role !== 'teacher') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const sql = getSQL()
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit')) || 50
    const offset = parseInt(searchParams.get('offset')) || 0

    let messages
    if (search) {
      messages = await sql`
        SELECT m.id, m.content, u1.username as sender, u2.username as receiver,
               m.is_read, m.created_at
        FROM messages m
        JOIN users u1 ON m.sender_id = u1.id
        JOIN users u2 ON m.receiver_id = u2.id
        WHERE m.content ILIKE ${'%' + search + '%'} OR u1.username ILIKE ${'%' + search + '%'}
        ORDER BY m.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      messages = await sql`
        SELECT m.id, m.content, u1.username as sender, u2.username as receiver,
               m.is_read, m.created_at
        FROM messages m
        JOIN users u1 ON m.sender_id = u1.id
        JOIN users u2 ON m.receiver_id = u2.id
        ORDER BY m.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    const countResult = await sql`SELECT COUNT(*) as total FROM messages`
    const total = countResult[0]?.total || 0

    return NextResponse.json({ success: true, messages, total, limit, offset })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch messages' }, { status: 500 })
  }
}

// DELETE /api/admin/messages/[id]
export async function DELETE(request) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error
    if (!auth.decoded || auth.decoded.role !== 'teacher') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const sql = getSQL()
    const messageId = request.nextUrl.pathname.split('/').pop()

    await sql`DELETE FROM messages WHERE id = ${messageId}`

    return NextResponse.json({ success: true, message: 'Message deleted successfully' })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete message' }, { status: 500 })
  }
}
