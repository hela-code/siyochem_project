import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// DELETE /api/admin/messages/[id] - Delete a message
export async function DELETE(request, { params }) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error
    if (!auth.decoded || auth.decoded.role !== 'teacher') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      )
    }

    const sql = getSQL()
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Message ID is required' },
        { status: 400 }
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
