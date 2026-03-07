import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSQL } from '@/lib/neon'

export async function POST() {
  try {
    const sql = getSQL()

    const demoAccounts = [
      {
        username: 'demostudent',
        email: 'student@example.com',
        password: 'password123',
        role: 'student',
        firstName: 'Demo',
        lastName: 'Student',
        school: 'Demo School',
        grade: 'A/L',
      },
      {
        username: 'demoteacher',
        email: 'teacher@example.com',
        password: 'password123',
        role: 'teacher',
        firstName: 'Demo',
        lastName: 'Teacher',
        school: 'Demo School',
        grade: null,
      },
    ]

    const results = []

    for (const account of demoAccounts) {
      // Check if account already exists
      const existing = await sql`
        SELECT id FROM users WHERE LOWER(email) = ${account.email.toLowerCase()} LIMIT 1
      `
      if (existing.length > 0) {
        results.push({ email: account.email, status: 'already exists' })
        continue
      }

      const salt = await bcrypt.genSalt(12)
      const hashedPassword = await bcrypt.hash(account.password, salt)

      await sql`
        INSERT INTO users (username, email, password, role, first_name, last_name, school, grade)
        VALUES (${account.username}, ${account.email}, ${hashedPassword}, ${account.role}, ${account.firstName}, ${account.lastName}, ${account.school}, ${account.grade})
      `
      results.push({ email: account.email, status: 'created' })
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to seed demo accounts' },
      { status: 500 }
    )
  }
}
