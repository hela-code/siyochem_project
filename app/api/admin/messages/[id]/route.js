import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// DELETE /api/admin/messages/[id] - Delete a message
export async function DELETE(request, { params }) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error
    
    // Allow anyone (student or teacher) to delete messages
    if (!auth.decoded) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      )
    }

    const sql = getSQL()
    const { id } = params
    const userId = auth.decoded.userId

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Message ID is required' },
        { status: 400 }
      )
    }

    // Verify the user owns this message (they are the sender)
    const messageCheck = await sql`
      SELECT id, sender_id FROM messages WHERE id = ${id}
    `

    if (messageCheck.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Message not found' },
        { status: 404 }
      )
    }

    // Only allow deletion if user is the sender or a teacher
    if (messageCheck[0].sender_id !== userId && auth.decoded.role !== 'teacher') {
      return NextResponse.json(
        { success: false, message: 'You can only delete your own messages' },
        { status: 403 }
      )
    }

    const result = await sql`DELETE FROM messages WHERE id = ${id}`

    return NextResponse.json({ 
      success: true, 
      message: 'Message deleted successfully',
      deleted: result.count
    })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete message', error: error.message },
      { status: 500 }
    )
  }
}
