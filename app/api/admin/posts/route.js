import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/admin/posts
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

    let posts
    if (search) {
      posts = await sql`
        SELECT p.id, p.content, u.username as author, t.title as topic,
               p.is_active, p.created_at
        FROM posts p
        JOIN users u ON p.author_id = u.id
        JOIN topics t ON p.topic_id = t.id
        WHERE p.content ILIKE ${'%' + search + '%'} OR u.username ILIKE ${'%' + search + '%'}
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      posts = await sql`
        SELECT p.id, p.content, u.username as author, t.title as topic,
               p.is_active, p.created_at
        FROM posts p
        JOIN users u ON p.author_id = u.id
        JOIN topics t ON p.topic_id = t.id
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    const countResult = await sql`SELECT COUNT(*) as total FROM posts`
    const total = countResult[0]?.total || 0

    return NextResponse.json({ success: true, posts, total, limit, offset })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch posts' }, { status: 500 })
  }
}

// DELETE /api/admin/posts/[id]
export async function DELETE(request) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error
    if (!auth.decoded || auth.decoded.role !== 'teacher') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const sql = getSQL()
    const postId = request.nextUrl.pathname.split('/').pop()

    await sql`DELETE FROM posts WHERE id = ${postId}`

    return NextResponse.json({ success: true, message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete post' }, { status: 500 })
  }
}
