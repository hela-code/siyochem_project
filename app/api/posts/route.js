import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'
import { requireAuth } from '@/lib/auth'

// POST /api/posts  — create a new post
export async function POST(request) {
  const { decoded, error } = requireAuth(request)
  if (error) return error

  try {
    const sql = getSQL()

    const body = await request.json()
    const { content, topicId, images, chemicalEquations } = body

    if (!content || !topicId) {
      return NextResponse.json(
        { success: false, message: 'Content and topicId are required' },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO posts (content, author_id, topic_id, images, chemical_equations)
      VALUES (
        ${content},
        ${decoded.userId},
        ${topicId},
        ${images || []},
        ${JSON.stringify(chemicalEquations || [])}
      )
      RETURNING *
    `
    const post = result[0]

    // Fetch author info
    const authors = await sql`
      SELECT id, username, first_name, last_name, avatar
      FROM users WHERE id = ${decoded.userId}
    `

    // Update user's posts count
    await sql`UPDATE users SET posts_count = posts_count + 1 WHERE id = ${decoded.userId}`

    const postWithAuthor = {
      ...post,
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
      { success: true, message: 'Post created successfully', post: postWithAuthor },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while creating post' },
      { status: 500 }
    )
  }
}
