import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/messages/[userId] — get messages with a specific user
export async function GET(request, { params }) {
  const { decoded, error } = requireAuth(request)
  if (error) return error

  try {
    const sql = getSQL()
    const currentUserId = decoded.userId
    const partnerId = params.userId

    // Mark messages from partner as read
    await sql`
      UPDATE messages SET is_read = true
      WHERE sender_id = ${partnerId} AND receiver_id = ${currentUserId} AND is_read = false
    `

    // Get all messages between the two users
    const messages = await sql`
      SELECT m.*, 
        u.username as sender_username,
        u.first_name as sender_first_name,
        u.last_name as sender_last_name,
        u.avatar as sender_avatar
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE (m.sender_id = ${currentUserId} AND m.receiver_id = ${partnerId})
         OR (m.sender_id = ${partnerId} AND m.receiver_id = ${currentUserId})
      ORDER BY m.created_at ASC
    `

    // Get partner info
    const partner = await sql`
      SELECT id, username, first_name, last_name, avatar
      FROM users WHERE id = ${partnerId}
    `

    if (partner.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    const p = partner[0]

    return NextResponse.json({
      success: true,
      partner: {
        id: p.id,
        username: p.username,
        firstName: p.first_name,
        lastName: p.last_name,
        avatar: p.avatar,
      },
      messages: messages.map((m) => ({
        id: m.id,
        content: m.content,
        senderId: m.sender_id,
        receiverId: m.receiver_id,
        isRead: m.is_read,
        createdAt: m.created_at,
        isMine: m.sender_id === currentUserId,
        sender: {
          username: m.sender_username,
          firstName: m.sender_first_name,
          lastName: m.sender_last_name,
          avatar: m.sender_avatar,
        },
      })),
    })
  } catch (err) {
    console.error('Get messages error:', err)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}

// POST /api/messages/[userId] — send a message
export async function POST(request, { params }) {
  const { decoded, error } = requireAuth(request)
  if (error) return error

  try {
    const sql = getSQL()
    const senderId = decoded.userId
    const receiverId = params.userId

    if (senderId === receiverId) {
      return NextResponse.json(
        { success: false, message: 'Cannot message yourself' },
        { status: 400 }
      )
    }

    // Check receiver exists
    const receiver = await sql`SELECT id FROM users WHERE id = ${receiverId}`
    if (receiver.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Check bond exists (either direction)
    const bondCheck = await sql`
      SELECT id FROM profile_bonds
      WHERE (profile_id = ${receiverId} AND user_id = ${senderId})
         OR (profile_id = ${senderId} AND user_id = ${receiverId})
      LIMIT 1
    `
    if (bondCheck.length === 0) {
      return NextResponse.json(
        { success: false, message: 'You can only message bonded users' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { content } = body

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, message: 'Message content is required' },
        { status: 400 }
      )
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { success: false, message: 'Message is too long (max 2000 characters)' },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO messages (sender_id, receiver_id, content)
      VALUES (${senderId}, ${receiverId}, ${content.trim()})
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      message: {
        id: result[0].id,
        content: result[0].content,
        senderId: result[0].sender_id,
        receiverId: result[0].receiver_id,
        isRead: result[0].is_read,
        createdAt: result[0].created_at,
        isMine: true,
      },
    })
  } catch (err) {
    console.error('Send message error:', err)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
