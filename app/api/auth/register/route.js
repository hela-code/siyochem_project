import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSQL } from '@/lib/neon'
import { signToken } from '@/lib/auth'

export async function POST(request) {
  try {
    const sql = getSQL()

    const body = await request.json()
    const { username, email, password, role, firstName, lastName, school, grade } = body

    // Validate required fields
    if (!username || !email || !password || !role || !firstName || !lastName) {
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

    if (!['student', 'teacher'].includes(role)) {
      return NextResponse.json(
        { success: false, message: 'Role must be student or teacher' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email} OR username = ${username} LIMIT 1
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

    // Create new user
    const newUsers = await sql`
      INSERT INTO users (username, email, password, role, first_name, last_name, school, grade)
      VALUES (${username}, ${email}, ${hashedPassword}, ${role}, ${firstName}, ${lastName}, ${school || null}, ${grade || null})
      RETURNING id, username, email, role, first_name, last_name, school, grade
    `
    const user = newUsers[0]

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
