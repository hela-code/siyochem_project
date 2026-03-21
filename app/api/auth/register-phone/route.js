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

async function generateUniqueUsername(sql, firstName, lastName, phone) {
  const base = `${firstName}${lastName}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 20) || 'student'

  const phoneSuffix = phone.slice(-4)
  let attempt = `${base}${phoneSuffix}`.slice(0, 30)
  let counter = 1

  while (true) {
    const existing = await sql`SELECT id FROM users WHERE LOWER(username) = ${attempt.toLowerCase()} LIMIT 1`
    if (existing.length === 0) return attempt

    const suffix = String(counter)
    attempt = `${base}${phoneSuffix}${suffix}`.slice(0, 30)
    counter += 1
  }
}

export async function POST(request) {
  try {
    const sql = getSQL()
    await ensurePhoneColumn(sql)

    const body = await request.json()
    const { phone, email, firstName, lastName, school, grade } = body

    const normalizedPhone = normalizePhone(phone)
    const normalizedEmail = String(email || '').trim().toLowerCase()
    const verifiedRecord = global.verifiedPhoneStorage[normalizedPhone]

    if (!normalizedPhone || !normalizedEmail || !firstName || !lastName) {
      return NextResponse.json(
        {
          success: false,
          message: 'Phone number, email, first name, and last name are required',
        },
        { status: 400 }
      )
    }

    if (!verifiedRecord || verifiedRecord.expiresAt <= Date.now()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Phone number must be verified before registration',
        },
        { status: 400 }
      )
    }

    const existingByPhone = await sql`SELECT id FROM users WHERE phone = ${normalizedPhone} LIMIT 1`
    if (existingByPhone.length > 0) {
      return NextResponse.json(
        { success: false, message: 'An account already exists for this phone number' },
        { status: 400 }
      )
    }

    const existingByEmail = await sql`SELECT id FROM users WHERE LOWER(email) = ${normalizedEmail} LIMIT 1`
    if (existingByEmail.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Email is already in use' },
        { status: 400 }
      )
    }

    const username = await generateUniqueUsername(sql, firstName, lastName, normalizedPhone)

    const randomPassword = crypto.randomUUID()
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(randomPassword, salt)

    const newUsers = await sql`
      INSERT INTO users (username, email, password, role, first_name, last_name, school, grade, phone)
      VALUES (
        ${username},
        ${normalizedEmail},
        ${hashedPassword},
        ${'student'},
        ${firstName.trim()},
        ${lastName.trim()},
        ${school || null},
        ${grade || null},
        ${normalizedPhone}
      )
      RETURNING id, username, email, phone, role, first_name, last_name, school, grade, created_at, updated_at
    `

    const user = newUsers[0]
    delete global.verifiedPhoneStorage[normalizedPhone]
    const token = signToken({ userId: user.id, role: user.role })

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful',
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
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Phone registration error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error during phone registration' },
      { status: 500 }
    )
  }
}
