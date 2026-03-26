import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// DELETE /api/admin/feedback/[id] - Delete feedback
export async function DELETE(request, { params }) {
  try {
    console.log('Delete feedback request:', { id: params.id })

    const auth = await requireAuth(request)
    if (auth.error) return auth.error
    if (!auth.decoded || auth.decoded.role !== 'teacher') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - only teachers can delete feedback' },
        { status: 403 }
      )
    }

    const sql = getSQL()
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Feedback ID is required' },
        { status: 400 }
      )
    }

    console.log('Deleting feedback from database:', id)
    const result = await sql`DELETE FROM feedbacks WHERE id = ${id}`
    console.log('Delete result:', result)

    return NextResponse.json({ 
      success: true, 
      message: 'Feedback deleted successfully',
      deleted: result.length > 0 ? 1 : 0
    })
  } catch (error) {
    console.error('Error deleting feedback:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete feedback', error: error.message },
      { status: 500 }
    )
  }
}
