import { neon } from '@neondatabase/serverless'

/**
 * Diagnostic endpoint to test database connection
 */
export async function GET() {
  try {
    const DATABASE_URL = process.env.DATABASE_URL

    console.log('\n========== DATABASE CONNECTION TEST ==========')
    console.log('Environment check:')
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('DATABASE_URL exists:', !!DATABASE_URL)
    if (DATABASE_URL) {
      console.log('DATABASE_URL (first 50 chars):', DATABASE_URL.substring(0, 50) + '...')
    }

    if (!DATABASE_URL) {
      return Response.json({
        success: false,
        error: 'DATABASE_URL environment variable is not set',
        location: '.env.local',
        action: 'Please set DATABASE_URL in your .env.local file'
      }, { status: 500 })
    }

    console.log('\nAttempting to create SQL connection...')
    const sql = neon(DATABASE_URL)
    console.log('✓ SQL client created')

    console.log('\nAttempting simple query...')
    const result = await sql`SELECT 1 as test`
    console.log('✓ Query executed:', result)

    console.log('\nAttempting to query feature_settings table...')
    const features = await sql`SELECT * FROM feature_settings LIMIT 1`
    console.log('✓ Feature settings query successful:', features)

    return Response.json({
      success: true,
      message: 'Database connection is working!',
      connectionTest: 'PASSED',
      timestamp: new Date().toISOString(),
      features: features
    })

  } catch (error) {
    console.error('\n✗ DATABASE CONNECTION ERROR')
    console.error('Error message:', error.message)
    console.error('Error type:', error.constructor.name)
    console.error('Error stack:', error.stack)

    // Determine the specific issue
    let diagnosis = 'Unknown error'
    let solution = 'Check your database connection'

    if (error.message.includes('fetch failed')) {
      diagnosis = 'Network connection failed - Cannot reach Neon database server'
      solution = 'Check: 1) Internet connection, 2) Neon server status, 3) VPN settings'
    } else if (error.message.includes('ECONNREFUSED')) {
      diagnosis = 'Connection refused - Server is not responding'
      solution = 'Check if Neon server is running and DATABASE_URL is correct'
    } else if (error.message.includes('ssl')) {
      diagnosis = 'SSL/TLS certificate error'
      solution = 'Ensure sslmode=require is in DATABASE_URL'
    } else if (error.message.includes('ETIMEDOUT')) {
      diagnosis = 'Connection timeout - Server is not responding in time'
      solution = 'Check network latency and Neon server status'
    }

    return Response.json({
      success: false,
      error: error.message,
      errorType: error.constructor.name,
      diagnosis,
      solution,
      timestamp: new Date().toISOString(),
      action: 'Please check the diagnosis above and fix the issue'
    }, { status: 500 })
  }
}
