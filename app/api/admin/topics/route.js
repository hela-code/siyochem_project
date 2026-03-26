import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/admin/topics
export async function GET(request) {
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
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit')) || 50
    const offset = parseInt(searchParams.get('offset')) || 0

    let topics
    if (search) {
      topics = await sql`
        SELECT t.id, t.title, t.category, u.username as author, u.email,
               t.views, t.is_pinned, t.is_active, t.created_at
        FROM topics t
        JOIN users u ON t.author_id = u.id
        WHERE t.title ILIKE ${'%' + search + '%'} OR t.category ILIKE ${'%' + search + '%'}
        ORDER BY t.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      topics = await sql`
        SELECT t.id, t.title, t.category, u.username as author, u.email,
               t.views, t.is_pinned, t.is_active, t.created_at
        FROM topics t
        JOIN users u ON t.author_id = u.id
        ORDER BY t.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    const countResult = await sql`SELECT COUNT(*) as total FROM topics`
    const total = countResult[0]?.total || 0

    return NextResponse.json({ success: true, topics, total, limit, offset })
  } catch (error) {
    console.error('Error fetching topics:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch topics', error: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/topics/[id]
export async function DELETE(request) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error
    if (!auth.decoded || auth.decoded.role !== 'teacher') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const sql = getSQL()
    const topicId = request.nextUrl.pathname.split('/').pop()

    await sql`DELETE FROM topics WHERE id = ${topicId}`

    return NextResponse.json({ success: true, message: 'Topic deleted successfully' })
  } catch (error) {
    console.error('Error deleting topic:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete topic' }, { status: 500 })
  }
}
