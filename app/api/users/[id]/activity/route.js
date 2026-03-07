import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'

export const dynamic = 'force-dynamic'

// GET /api/users/[id]/activity
export async function GET(request, { params }) {
  try {
    const sql = getSQL()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const offset = (page - 1) * limit

    const [posts, topics] = await Promise.all([
      sql`
        SELECT p.*,
          t.title as topic_title, t.id as topic_uid,
          (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
          (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND is_active = true) as comments_count
        FROM posts p
        LEFT JOIN topics t ON p.topic_id = t.id
        WHERE p.author_id = ${params.id} AND p.is_active = true
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      sql`
        SELECT t.*,
          (SELECT COUNT(*) FROM topic_likes WHERE topic_id = t.id) as likes_count,
          (SELECT COUNT(*) FROM posts WHERE topic_id = t.id AND is_active = true) as posts_count
        FROM topics t
        WHERE t.author_id = ${params.id} AND t.is_active = true
        ORDER BY t.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
    ])

    const activities = [
      ...posts.map((p) => ({
        type: 'post',
        id: p.id,
        content: p.content,
        topic: p.topic_uid ? { _id: p.topic_uid, title: p.topic_title } : null,
        likesCount: parseInt(p.likes_count),
        commentsCount: parseInt(p.comments_count),
        createdAt: p.created_at,
      })),
      ...topics.map((t) => ({
        type: 'topic',
        id: t.id,
        title: t.title,
        description: t.description,
        category: t.category,
        likesCount: parseInt(t.likes_count),
        postsCount: parseInt(t.posts_count),
        views: t.views,
        createdAt: t.created_at,
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    return NextResponse.json({ success: true, activities })
  } catch (error) {
    console.error('Get user activity error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while fetching user activity' },
      { status: 500 }
    )
  }
}
