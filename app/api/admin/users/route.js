import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/admin/users - List all users
export async function GET(request) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error
    if (!auth.decoded || auth.decoded.role !== 'teacher') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Only teachers can access admin features.' },
        { status: 403 }
      )
    }

    const sql = getSQL()
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit')) || 50
    const offset = parseInt(searchParams.get('offset')) || 0

    let users
    if (search) {
      users = await sql`
        SELECT id, username, email, role, first_name, last_name, school, grade, 
               is_active, created_at, posts_count, quizzes_taken
        FROM users
        WHERE username ILIKE ${'%' + search + '%'} 
           OR email ILIKE ${'%' + search + '%'}
           OR first_name ILIKE ${'%' + search + '%'}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      users = await sql`
        SELECT id, username, email, role, first_name, last_name, school, grade,
               is_active, created_at, posts_count, quizzes_taken
        FROM users
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    const countResult = await sql`SELECT COUNT(*) as total FROM users`
    const total = countResult[0]?.total || 0

    return NextResponse.json({
      success: true,
      users,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users', error: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - Delete a user
export async function DELETE(request) {
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
    const userId = request.nextUrl.pathname.split('/').pop()

    await sql`DELETE FROM users WHERE id = ${userId}`

    return NextResponse.json({ success: true, message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
