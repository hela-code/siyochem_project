import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'
import { requireAuth } from '@/lib/auth'

// POST /api/users/[id]/bond — toggle bond (like) on a profile
export async function POST(request, { params }) {
  const { decoded, error } = requireAuth(request)
  if (error) return error

  const profileId = params.id
  const userId = decoded.userId

  // Can't bond your own profile
  if (profileId === userId) {
    return NextResponse.json(
      { success: false, message: "You can't bond with your own profile" },
      { status: 400 }
    )
  }

  try {
    const sql = getSQL()

    // Check if profile user exists
    const users = await sql`SELECT id FROM users WHERE id = ${profileId}`
    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Check if already bonded
    const existing = await sql`
      SELECT id FROM profile_bonds
      WHERE profile_id = ${profileId} AND user_id = ${userId}
    `

    let bonded
    if (existing.length > 0) {
      // Unbond
      await sql`
        DELETE FROM profile_bonds
        WHERE profile_id = ${profileId} AND user_id = ${userId}
      `
      bonded = false
    } else {
      // Bond
      await sql`
        INSERT INTO profile_bonds (profile_id, user_id)
        VALUES (${profileId}, ${userId})
      `
      bonded = true
    }

    // Get updated bond count
    const countResult = await sql`
      SELECT COUNT(*) as count FROM profile_bonds WHERE profile_id = ${profileId}
    `
    const bondCount = parseInt(countResult[0].count)

    return NextResponse.json({
      success: true,
      bonded,
      bondCount,
      message: bonded ? 'Bond formed!' : 'Bond broken',
    })
  } catch (err) {
    console.error('Toggle bond error:', err)
    return NextResponse.json(
      { success: false, message: 'Server error while toggling bond' },
      { status: 500 }
    )
  }
}
