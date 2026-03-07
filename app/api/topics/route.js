import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/topics  — list topics with pagination & filters
export async function GET(request) {
  try {
    const sql = getSQL()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const offset = (page - 1) * limit
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    let topics, countResult

    if (search && category && category !== 'all') {
      ;[topics, countResult] = await Promise.all([
        sql`
          SELECT t.*,
            u.id as author_uid, u.username, u.first_name, u.last_name, u.avatar,
            (SELECT COUNT(*) FROM posts WHERE topic_id = t.id AND is_active = true) as posts_count,
            (SELECT COUNT(*) FROM topic_likes WHERE topic_id = t.id) as likes_count
          FROM topics t
          JOIN users u ON t.author_id = u.id
          WHERE t.is_active = true AND t.category = ${category}
            AND to_tsvector('english', t.title || ' ' || t.description) @@ plainto_tsquery('english', ${search})
          ORDER BY t.is_pinned DESC, t.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `,
        sql`SELECT COUNT(*) as count FROM topics WHERE is_active = true AND category = ${category}
          AND to_tsvector('english', title || ' ' || description) @@ plainto_tsquery('english', ${search})`,
      ])
    } else if (search) {
      ;[topics, countResult] = await Promise.all([
        sql`
          SELECT t.*,
            u.id as author_uid, u.username, u.first_name, u.last_name, u.avatar,
            (SELECT COUNT(*) FROM posts WHERE topic_id = t.id AND is_active = true) as posts_count,
            (SELECT COUNT(*) FROM topic_likes WHERE topic_id = t.id) as likes_count
          FROM topics t
          JOIN users u ON t.author_id = u.id
          WHERE t.is_active = true
            AND to_tsvector('english', t.title || ' ' || t.description) @@ plainto_tsquery('english', ${search})
          ORDER BY t.is_pinned DESC, t.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `,
        sql`SELECT COUNT(*) as count FROM topics WHERE is_active = true
          AND to_tsvector('english', title || ' ' || description) @@ plainto_tsquery('english', ${search})`,
      ])
    } else if (category && category !== 'all') {
      ;[topics, countResult] = await Promise.all([
        sql`
          SELECT t.*,
            u.id as author_uid, u.username, u.first_name, u.last_name, u.avatar,
            (SELECT COUNT(*) FROM posts WHERE topic_id = t.id AND is_active = true) as posts_count,
            (SELECT COUNT(*) FROM topic_likes WHERE topic_id = t.id) as likes_count
          FROM topics t
          JOIN users u ON t.author_id = u.id
          WHERE t.is_active = true AND t.category = ${category}
          ORDER BY t.is_pinned DESC, t.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `,
        sql`SELECT COUNT(*) as count FROM topics WHERE is_active = true AND category = ${category}`,
      ])
    } else {
      ;[topics, countResult] = await Promise.all([
        sql`
          SELECT t.*,
            u.id as author_uid, u.username, u.first_name, u.last_name, u.avatar,
            (SELECT COUNT(*) FROM posts WHERE topic_id = t.id AND is_active = true) as posts_count,
            (SELECT COUNT(*) FROM topic_likes WHERE topic_id = t.id) as likes_count
          FROM topics t
          JOIN users u ON t.author_id = u.id
          WHERE t.is_active = true
          ORDER BY t.is_pinned DESC, t.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `,
        sql`SELECT COUNT(*) as count FROM topics WHERE is_active = true`,
      ])
    }

    const total = parseInt(countResult[0].count)

    const formatted = topics.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      category: t.category,
      tags: t.tags,
      image: t.image,
      views: t.views,
      isPinned: t.is_pinned,
      isActive: t.is_active,
      postsCount: parseInt(t.posts_count),
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
    }))

    return NextResponse.json({
      success: true,
      topics: formatted,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get topics error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while fetching topics' },
      { status: 500 }
    )
  }
}

// POST /api/topics  — create a new topic
export async function POST(request) {
  const { decoded, error } = requireAuth(request)
  if (error) return error

  try {
    const sql = getSQL()

    const body = await request.json()
    const { title, description, category, tags, image } = body

    if (!title || !description || !category) {
      return NextResponse.json(
        { success: false, message: 'Title, description, and category are required' },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO topics (title, description, author_id, category, tags, image)
      VALUES (${title}, ${description}, ${decoded.userId}, ${category}, ${tags || []}, ${image || null})
      RETURNING *
    `
    const topic = result[0]

    const authors = await sql`
      SELECT id, username, first_name, last_name, avatar FROM users WHERE id = ${decoded.userId}
    `

    return NextResponse.json(
      {
        success: true,
        message: 'Topic created successfully',
        topic: {
          ...topic,
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
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create topic error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while creating topic' },
      { status: 500 }
    )
  }
}
