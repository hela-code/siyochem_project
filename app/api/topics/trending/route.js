import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'

export const dynamic = 'force-dynamic'

// GET /api/topics/trending
export async function GET() {
  try {
    const sql = getSQL()

    const topics = await sql`
      SELECT t.*,
        u.id as author_uid, u.username, u.first_name, u.last_name, u.avatar,
        (SELECT COUNT(*) FROM topic_likes WHERE topic_id = t.id) as likes_count,
        (SELECT COUNT(*) FROM posts WHERE topic_id = t.id AND is_active = true) as posts_count
      FROM topics t
      JOIN users u ON t.author_id = u.id
      WHERE t.is_active = true AND t.created_at >= NOW() - INTERVAL '7 days'
      ORDER BY t.views DESC
      LIMIT 10
    `

    const formatted = topics.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      category: t.category,
      tags: t.tags,
      image: t.image,
      views: t.views,
      isPinned: t.is_pinned,
      likesCount: parseInt(t.likes_count),
      postsCount: parseInt(t.posts_count),
      createdAt: t.created_at,
      author: {
        _id: t.author_uid,
        username: t.username,
        profile: {
          firstName: t.first_name,
          lastName: t.last_name,
          avatar: t.avatar,
        },
      },
    }))

    return NextResponse.json({ success: true, topics: formatted })
  } catch (error) {
    console.error('Get trending topics error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while fetching trending topics' },
      { status: 500 }
    )
  }
}
