import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSQL } from '@/lib/neon'
import { signToken } from '@/lib/auth'

global.verifiedPhoneStorage = global.verifiedPhoneStorage || {}

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

    const body = await request.json()
    const { username, email, password, phone, firstName, lastName, school, grade } = body
    const role = 'student'
    const normalizedPhone = normalizePhone(phone)
    const verifiedRecord = global.verifiedPhoneStorage[normalizedPhone]

    // Validate required fields
    if (!username || !email || !password || !normalizedPhone || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, message: 'Please provide all required fields' },
        { status: 400 }
      )
    }

    if (username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { success: false, message: 'Username must be between 3 and 30 characters' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    if (!normalizedPhone) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid Sri Lankan mobile number' },
        { status: 400 }
      )
    }

    if (!verifiedRecord || verifiedRecord.expiresAt <= Date.now()) {
      return NextResponse.json(
        { success: false, message: 'Please verify phone number before registration' },
        { status: 400 }
      )
    }

    // Check if user already exists (case-insensitive email check)
    const existing = await sql`
      SELECT id FROM users
      WHERE LOWER(email) = ${email.toLowerCase()}
         OR LOWER(username) = ${username.toLowerCase()}
         OR phone = ${normalizedPhone}
      LIMIT 1
    `
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: 'User with this email or username already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create new user (store email lowercased for consistency)
    const newUsers = await sql`
      INSERT INTO users (username, email, password, phone, role, first_name, last_name, school, grade)
      VALUES (${username}, ${email.toLowerCase()}, ${hashedPassword}, ${normalizedPhone}, ${role}, ${firstName}, ${lastName}, ${school || null}, ${grade || null})
      RETURNING id, username, email, phone, role, first_name, last_name, school, grade
    `
    const user = newUsers[0]
    delete global.verifiedPhoneStorage[normalizedPhone]

    const token = signToken({ userId: user.id, role: user.role })

    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
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
            school: user.school,
            grade: user.grade,
          },
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error during registration' },
      { status: 500 }
    )
  }
}
