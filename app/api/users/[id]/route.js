import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'
import { requireAuth, extractToken, verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/users/[id]
export async function GET(request, { params }) {
  try {
    const sql = getSQL()

    const users = await sql`
      SELECT id, username, email, role, first_name, last_name, bio, avatar,
             school, grade, posts_count, likes_received, quizzes_taken,
             average_score, twitter, linkedin, instagram, is_active,
             last_login, created_at, updated_at
      FROM users WHERE id = ${params.id}
    `
    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    const u = users[0]

    const [quizCountResult, topicCountResult, bondCountResult, outgoingBondCountResult] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM quizzes WHERE author_id = ${params.id}`,
      sql`SELECT COUNT(*) as count FROM topics WHERE author_id = ${params.id}`,
      sql`SELECT COUNT(*) as count FROM profile_bonds WHERE profile_id = ${params.id}`,
      sql`SELECT COUNT(*) as count FROM profile_bonds WHERE user_id = ${params.id}`,
    ])

    // Check if the current viewer has bonded this profile
    let userBonded = false
    const token = extractToken(request)
    if (token) {
      const decoded = verifyToken(token)
      if (decoded) {
        const bondCheck = await sql`
          SELECT id FROM profile_bonds
          WHERE profile_id = ${params.id} AND user_id = ${decoded.userId}
        `
        userBonded = bondCheck.length > 0
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        profile: {
          firstName: u.first_name,
          lastName: u.last_name,
          bio: u.bio,
          avatar: u.avatar,
          school: u.school,
          grade: u.grade,
        },
        stats: {
          postsCount: u.posts_count,
          likesReceived: u.likes_received,
          quizzesTaken: u.quizzes_taken,
          averageScore: u.average_score,
        },
        socialLinks: {
          twitter: u.twitter,
          linkedin: u.linkedin,
          instagram: u.instagram,
        },
        isActive: u.is_active,
        lastLogin: u.last_login,
        createdAt: u.created_at,
        updatedAt: u.updated_at,
        quizCount: parseInt(quizCountResult[0].count),
        topicCount: parseInt(topicCountResult[0].count),
        bondCount: parseInt(bondCountResult[0].count),
        outgoingBondCount: parseInt(outgoingBondCountResult[0].count),
        userBonded,
      },
    })
  } catch (error) {
    console.error('Get user profile error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while fetching user profile' },
      { status: 500 }
    )
  }
}

// PUT /api/users/[id]
export async function PUT(request, { params }) {
  const { decoded, error } = requireAuth(request)
  if (error) return error

  if (decoded.userId !== params.id) {
    return NextResponse.json(
      { success: false, message: 'You can only update your own profile' },
      { status: 403 }
    )
  }

  try {
    const sql = getSQL()

    const body = await request.json()
    const { profile, socialLinks } = body

    console.log('[PUT /api/users] Updating user:', params.id, JSON.stringify({ profile, socialLinks }))

    // Trim strings, convert empty → null for optional fields
    const trim = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null)

    const firstName = trim(profile?.firstName)
    const lastName = trim(profile?.lastName)

    if (!firstName || !lastName) {
      return NextResponse.json(
        { success: false, message: 'First name and last name are required' },
        { status: 400 }
      )
    }

    const bio = trim(profile?.bio)
    const avatar = trim(profile?.avatar)
    const school = trim(profile?.school)
    const grade = trim(profile?.grade)
    const twitter = trim(socialLinks?.twitter)
    const linkedin = trim(socialLinks?.linkedin)
    const instagram = trim(socialLinks?.instagram)

    const updated = await sql`
      UPDATE users SET
        first_name = ${firstName},
        last_name = ${lastName},
        bio = ${bio},
        avatar = ${avatar},
        school = ${school},
        grade = ${grade},
        twitter = ${twitter},
        linkedin = ${linkedin},
        instagram = ${instagram},
        updated_at = NOW()
      WHERE id = ${params.id}
      RETURNING id, username, email, role, first_name, last_name, bio, avatar,
                school, grade, posts_count, likes_received, quizzes_taken,
                average_score, twitter, linkedin, instagram, is_active,
                last_login, created_at, updated_at
    `

    if (updated.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    const u = updated[0]
    console.log('[PUT /api/users] Updated DB row:', u.id, 'first_name:', u.first_name, 'last_name:', u.last_name, 'bio:', u.bio, 'school:', u.school)

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        profile: {
          firstName: u.first_name,
          lastName: u.last_name,
          bio: u.bio,
          avatar: u.avatar,
          school: u.school,
          grade: u.grade,
        },
        stats: {
          postsCount: u.posts_count,
          likesReceived: u.likes_received,
          quizzesTaken: u.quizzes_taken,
          averageScore: u.average_score,
        },
        socialLinks: {
          twitter: u.twitter,
          linkedin: u.linkedin,
          instagram: u.instagram,
        },
        isActive: u.is_active,
        lastLogin: u.last_login,
        createdAt: u.created_at,
        updatedAt: u.updated_at,
      },
    })
  } catch (error) {
    console.error('Update user profile error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while updating profile' },
      { status: 500 }
    )
  }
}
