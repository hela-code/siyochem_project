import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/admin/reactions
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

    let reactions
    if (search) {
      reactions = await sql`
        SELECT f.id, f.content, f.author_name, u.username, u.email,
               f.is_active, f.created_at
        FROM feedbacks f
        JOIN users u ON f.author_id = u.id
        WHERE f.content ILIKE ${'%' + search + '%'} OR f.author_name ILIKE ${'%' + search + '%'}
        ORDER BY f.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      reactions = await sql`
        SELECT f.id, f.content, f.author_name, u.username, u.email,
               f.is_active, f.created_at
        FROM feedbacks f
        JOIN users u ON f.author_id = u.id
        ORDER BY f.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    const countResult = await sql`SELECT COUNT(*) as total FROM feedbacks`
    const total = countResult[0]?.total || 0

    return NextResponse.json({ success: true, reactions, total, limit, offset })
  } catch (error) {
    console.error('Error fetching reactions:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch reactions' }, { status: 500 })
  }
}
