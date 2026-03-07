import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/messages — list conversations (inbox) + all bonded users
export async function GET(request) {
  const { decoded, error } = requireAuth(request)
  if (error) return error

  try {
    const sql = getSQL()
    const userId = decoded.userId

    // Get all unique conversations with latest message
    // Use a subquery approach that avoids DISTINCT ON issues
    const conversations = await sql`
      SELECT 
        m.id as message_id,
        m.content as last_message,
        m.created_at as last_message_at,
        m.sender_id,
        m.is_read,
        u.id as partner_id,
        u.username,
        u.first_name,
        u.last_name,
        u.avatar,
        (SELECT COUNT(*) FROM messages 
         WHERE sender_id = u.id AND receiver_id = ${userId} AND is_read = false
        ) as unread_count
      FROM messages m
      JOIN users u ON u.id = CASE 
        WHEN m.sender_id = ${userId} THEN m.receiver_id
        ELSE m.sender_id
      END
      WHERE (m.sender_id = ${userId} OR m.receiver_id = ${userId})
        AND m.id = (
          SELECT m2.id FROM messages m2
          WHERE (m2.sender_id = ${userId} AND m2.receiver_id = u.id)
             OR (m2.sender_id = u.id AND m2.receiver_id = ${userId})
          ORDER BY m2.created_at DESC
          LIMIT 1
        )
      ORDER BY m.created_at DESC
    `

    // Get ALL bonded users (both directions: I bonded them OR they bonded me)
    const allBondedUsers = await sql`
      SELECT DISTINCT u.id, u.username, u.first_name, u.last_name, u.avatar
      FROM users u
      WHERE u.id != ${userId}
        AND (
          u.id IN (SELECT profile_id FROM profile_bonds WHERE user_id = ${userId})
          OR
          u.id IN (SELECT user_id FROM profile_bonds WHERE profile_id = ${userId})
        )
      ORDER BY u.first_name ASC
    `

    // Filter out bonded users who already have conversations
    const conversationPartnerIds = conversations.map((c) => c.partner_id)
    const bondedWithoutConvo = allBondedUsers.filter((b) => !conversationPartnerIds.includes(b.id))

    return NextResponse.json({
      success: true,
      conversations: conversations.map((c) => ({
        partnerId: c.partner_id,
        username: c.username,
        firstName: c.first_name,
        lastName: c.last_name,
        avatar: c.avatar,
        lastMessage: c.last_message,
        lastMessageAt: c.last_message_at,
        isMine: c.sender_id === userId,
        isRead: c.is_read,
        unreadCount: parseInt(c.unread_count),
      })),
      bondedUsers: bondedWithoutConvo.map((b) => ({
        id: b.id,
        username: b.username,
        firstName: b.first_name,
        lastName: b.last_name,
        avatar: b.avatar,
      })),
    })
  } catch (err) {
    console.error('Get conversations error:', err)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
