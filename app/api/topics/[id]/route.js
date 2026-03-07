import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/topics/[id]
export async function GET(request, { params }) {
  try {
    const sql = getSQL()

    const topics = await sql`
      SELECT t.*,
        u.id as author_uid, u.username, u.first_name, u.last_name, u.avatar,
        (SELECT COUNT(*) FROM topic_likes WHERE topic_id = t.id) as likes_count
      FROM topics t
      JOIN users u ON t.author_id = u.id
      WHERE t.id = ${params.id}
    `

    if (topics.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Topic not found' },
        { status: 404 }
      )
    }

    const t = topics[0]

    // Increment views
    await sql`UPDATE topics SET views = views + 1 WHERE id = ${params.id}`

    // Fetch posts for this topic
    const posts = await sql`
      SELECT p.*,
        u.id as author_uid, u.username, u.first_name, u.last_name, u.avatar,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND is_active = true) as comments_count
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.topic_id = ${params.id} AND p.is_active = true
      ORDER BY likes_count DESC, p.created_at DESC
    `

    const topic = {
      id: t.id,
      title: t.title,
      description: t.description,
      category: t.category,
      tags: t.tags,
      image: t.image,
      views: t.views + 1,
      isPinned: t.is_pinned,
      isActive: t.is_active,
      likesCount: parseInt(t.likes_count),
      createdAt: t.created_at,
      updatedAt: t.updated_at,
      author: {
        _id: t.author_uid,
        username: t.username,
        profile: {
          firstName: t.first_name,
          lastName: t.last_name,
          avatar: t.avatar,
        },
      },
      posts: posts.map((p) => ({
        id: p.id,
        content: p.content,
        images: p.images,
        chemicalEquations: p.chemical_equations,
        isEdited: p.is_edited,
        likesCount: parseInt(p.likes_count),
        commentsCount: parseInt(p.comments_count),
        createdAt: p.created_at,
        author: {
          _id: p.author_uid,
          username: p.username,
          profile: {
            firstName: p.first_name,
            lastName: p.last_name,
            avatar: p.avatar,
          },
        },
      })),
    }

    return NextResponse.json({ success: true, topic })
  } catch (error) {
    console.error('Get topic error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while fetching topic' },
      { status: 500 }
    )
  }
}

// PUT /api/topics/[id]
export async function PUT(request, { params }) {
  const { decoded, error } = requireAuth(request)
  if (error) return error

  try {
    const sql = getSQL()

    const topics = await sql`SELECT * FROM topics WHERE id = ${params.id}`
    if (topics.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Topic not found' },
        { status: 404 }
      )
    }

    if (topics[0].author_id !== decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update this topic' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, category, tags, image } = body

    const updated = await sql`
      UPDATE topics SET
        title = COALESCE(${title || null}, title),
        description = COALESCE(${description || null}, description),
        category = COALESCE(${category || null}, category),
        tags = COALESCE(${tags || null}, tags),
        image = COALESCE(${image || null}, image)
      WHERE id = ${params.id}
      RETURNING *
    `

    const authors = await sql`
      SELECT id, username, first_name, last_name, avatar FROM users WHERE id = ${decoded.userId}
    `

    return NextResponse.json({
      success: true,
      message: 'Topic updated',
      topic: {
        ...updated[0],
        author: authors[0]
          ? {
              _id: authors[0].id,
              username: authors[0].username,
              profile: {
                firstName: authors[0].first_name,
                lastName: authors[0].last_name,
                avatar: authors[0].avatar,
              },
            }
          : null,
      },
    })
  } catch (error) {
    console.error('Update topic error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while updating topic' },
      { status: 500 }
    )
  }
}

// DELETE is intentionally not supported — topics cannot be deleted
