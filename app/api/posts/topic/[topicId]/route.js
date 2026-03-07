import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'

export const dynamic = 'force-dynamic'

// GET /api/posts/topic/[topicId]
export async function GET(request, { params }) {
  try {
    const sql = getSQL()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const offset = (page - 1) * limit

    const [posts, countResult] = await Promise.all([
      sql`
        SELECT p.*,
          u.id as author_uid, u.username, u.first_name, u.last_name, u.avatar,
          (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
          (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND is_active = true) as comments_count,
          (SELECT COUNT(*) FROM post_shares WHERE post_id = p.id) as shares_count
        FROM posts p
        JOIN users u ON p.author_id = u.id
        WHERE p.topic_id = ${params.topicId} AND p.is_active = true
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      sql`SELECT COUNT(*) as count FROM posts WHERE topic_id = ${params.topicId} AND is_active = true`,
    ])

    const total = parseInt(countResult[0].count)

    const formatted = posts.map((p) => ({
      id: p.id,
      content: p.content,
      topic: p.topic_id,
      images: p.images,
      chemicalEquations: p.chemical_equations,
      isEdited: p.is_edited,
      isActive: p.is_active,
      likesCount: parseInt(p.likes_count),
      commentsCount: parseInt(p.comments_count),
      sharesCount: parseInt(p.shares_count),
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      author: {
        _id: p.author_uid,
        username: p.username,
        profile: {
          firstName: p.first_name,
          lastName: p.last_name,
          avatar: p.avatar,
        },
      },
    }))

    return NextResponse.json({
      success: true,
      posts: formatted,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get posts error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while fetching posts' },
      { status: 500 }
    )
  }
}
