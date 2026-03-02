import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET

/**
 * Signs a JWT token for a user
 */
export function signToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}

/**
 * Verifies and decodes a JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

/**
 * Extracts the Bearer token from the Authorization header
 */
export function extractToken(request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.slice(7)
}

/**
 * Middleware helper: verifies auth from request and returns decoded payload.
 * Returns NextResponse error if auth fails.
 */
export function requireAuth(request) {
  const token = extractToken(request)
  if (!token) {
    return {
      error: NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      ),
    }
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return {
      error: NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      ),
    }
  }

  return { decoded }
}
