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

    // Get all messages for this user
    const allMessages = await sql`
      SELECT id, content, created_at, sender_id, receiver_id, is_read
      FROM messages
      WHERE sender_id = ${userId} OR receiver_id = ${userId}
      ORDER BY created_at DESC
    `

    // Group conversations by partner and get latest message
    const conversationMap = new Map()
    for (const msg of allMessages) {
      const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, msg)
      }
    }

    // Get user details for each conversation partner
    const conversations = []
    for (const [partnerId, msg] of conversationMap) {
      const partner = await sql`SELECT id, username, first_name, last_name, avatar FROM users WHERE id = ${partnerId}`
      if (partner.length > 0) {
        // Count unread messages from this partner
        const unreadCount = allMessages.filter(
          m => m.sender_id === partnerId && m.receiver_id === userId && !m.is_read
        ).length

        conversations.push({
          partner_id: partnerId,
          username: partner[0].username,
          first_name: partner[0].first_name,
          last_name: partner[0].last_name,
          avatar: partner[0].avatar,
          last_message: msg.content,
          last_message_at: msg.created_at,
          sender_id: msg.sender_id,
          unread_count: unreadCount,
        })
      }
    }

    // Sort by latest message date
    conversations.sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at))

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
        isRead: false,
        unreadCount: c.unread_count,
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
