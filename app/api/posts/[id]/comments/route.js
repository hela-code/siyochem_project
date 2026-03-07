import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/posts/[id]/comments
export async function GET(request, { params }) {
  try {
    const sql = getSQL()

    const comments = await sql`
      SELECT c.*, u.id as author_id, u.username, u.first_name, u.last_name, u.avatar
      FROM comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.post_id = ${params.id} AND c.is_active = true
      ORDER BY c.created_at DESC
    `

    const formatted = comments.map((c) => ({
      id: c.id,
      content: c.content,
      post: c.post_id,
      isEdited: c.is_edited,
      isActive: c.is_active,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      author: {
        _id: c.author_id,
        username: c.username,
        profile: {
          firstName: c.first_name,
          lastName: c.last_name,
          avatar: c.avatar,
        },
      },
    }))

    return NextResponse.json({ success: true, comments: formatted })
  } catch (error) {
    console.error('Get comments error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while fetching comments' },
      { status: 500 }
    )
  }
}

// POST /api/posts/[id]/comments
export async function POST(request, { params }) {
  const { decoded, error } = requireAuth(request)
  if (error) return error

  try {
    const sql = getSQL()

    const body = await request.json()
    const { content } = body

    if (!content) {
      return NextResponse.json(
        { success: false, message: 'Content is required' },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO comments (content, author_id, post_id)
      VALUES (${content}, ${decoded.userId}, ${params.id})
      RETURNING *
    `
    const comment = result[0]

    // Fetch author info
    const authors = await sql`
      SELECT id, username, first_name, last_name, avatar
      FROM users WHERE id = ${decoded.userId}
    `

    const commentWithAuthor = {
      ...comment,
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
    }

    return NextResponse.json(
      { success: true, message: 'Comment added successfully', comment: commentWithAuthor },
      { status: 201 }
    )
  } catch (error) {
    console.error('Add comment error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while adding comment' },
      { status: 500 }
    )
  }
}
