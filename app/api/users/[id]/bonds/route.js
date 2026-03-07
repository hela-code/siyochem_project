import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'

export const dynamic = 'force-dynamic'

// GET /api/users/[id]/bonds — get bond list
// ?direction=outgoing  → users this person has bonded (for own profile: "My Bonds")
// ?direction=incoming  → users who bonded this profile (default)
export async function GET(request, { params }) {
  try {
    const sql = getSQL()
    const { searchParams } = new URL(request.url)
    const direction = searchParams.get('direction') || 'incoming'

    let bonds

    if (direction === 'outgoing') {
      // Users that this person has bonded (profile_id = the bonded user, user_id = this person)
      bonds = await sql`
        SELECT 
          pb.created_at as bonded_at,
          u.id, u.username, u.first_name, u.last_name, u.avatar, u.role, u.school
        FROM profile_bonds pb
        JOIN users u ON u.id = pb.profile_id
        WHERE pb.user_id = ${params.id}
        ORDER BY pb.created_at DESC
      `
    } else {
      // Users who bonded this profile (default — incoming)
      bonds = await sql`
        SELECT 
          pb.created_at as bonded_at,
          u.id, u.username, u.first_name, u.last_name, u.avatar, u.role, u.school
        FROM profile_bonds pb
        JOIN users u ON u.id = pb.user_id
        WHERE pb.profile_id = ${params.id}
        ORDER BY pb.created_at DESC
      `
    }

    return NextResponse.json({
      success: true,
      bonds: bonds.map((b) => ({
        id: b.id,
        username: b.username,
        firstName: b.first_name,
        lastName: b.last_name,
        avatar: b.avatar,
        role: b.role,
        school: b.school,
        bondedAt: b.bonded_at,
      })),
    })
  } catch (err) {
    console.error('Get bonds error:', err)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
