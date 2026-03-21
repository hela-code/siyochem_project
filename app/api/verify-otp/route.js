import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/neon'
import { signToken } from '@/lib/auth'

global.verifiedPhoneStorage = global.verifiedPhoneStorage || {}

const VERIFIED_TTL_MS = 15 * 60 * 1000

function normalizePhone(rawPhone = '') {
  const digits = String(rawPhone).replace(/\D/g, '')
  if (/^0\d{9}$/.test(digits)) return `94${digits.slice(1)}`
  if (/^94\d{9}$/.test(digits)) return digits
  return null
}

async function ensurePhoneColumn(sql) {
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)`
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE phone IS NOT NULL`
}

export async function POST(request) {
  try {
    const sql = getSQL()
    await ensurePhoneColumn(sql)

    const { phone, otp } = await request.json()
    const normalizedPhone = normalizePhone(phone)

    if (!normalizedPhone || !otp) {
      return NextResponse.json(
        { success: false, message: 'Phone and OTP are required' },
        { status: 400 }
      )
    }

    const record = global.otpStorage ? global.otpStorage[normalizedPhone] : null
    if (!record || record.otp !== otp || record.expiresAt <= Date.now()) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    delete global.otpStorage[normalizedPhone]
    global.verifiedPhoneStorage[normalizedPhone] = {
      verifiedAt: Date.now(),
      expiresAt: Date.now() + VERIFIED_TTL_MS,
    }

    const users = await sql`SELECT * FROM users WHERE phone = ${normalizedPhone} LIMIT 1`
    const user = users[0]

    if (!user) {
      return NextResponse.json(
        {
          success: true,
          requiresRegistration: true,
          phoneVerified: true,
          phone: normalizedPhone,
          message: 'Phone verified. No account found for this number.',
        },
        { status: 200 }
      )
    }

    await sql`UPDATE users SET last_login = NOW() WHERE id = ${user.id}`

    const token = signToken({ userId: user.id, role: user.role })

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profile: {
          firstName: user.first_name,
          lastName: user.last_name,
          bio: user.bio,
          avatar: user.avatar,
          school: user.school,
          grade: user.grade,
        },
        stats: {
          postsCount: user.posts_count,
          likesReceived: user.likes_received,
          quizzesTaken: user.quizzes_taken,
          averageScore: user.average_score,
        },
        socialLinks: {
          twitter: user.twitter,
          linkedin: user.linkedin,
          instagram: user.instagram,
        },
        isActive: user.is_active,
        lastLogin: user.last_login,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while verifying OTP' },
      { status: 500 }
    )
  }
}