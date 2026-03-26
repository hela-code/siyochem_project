import { getSQL } from '@/lib/neon'

export async function GET() {
  try {
    const sql = getSQL()

    // Check if table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'feature_settings'
      ) as table_exists
    `

    if (!tableCheck[0]?.table_exists) {
      return Response.json({
        status: 'ERROR',
        message: 'feature_settings table does not exist',
        action: 'Run the schema.sql file in your Neon console'
      })
    }

    // Get current feature settings from database
    const features = await sql`
      SELECT * FROM feature_settings 
      ORDER BY feature_name
    `

    // Get user count
    const users = await sql`
      SELECT COUNT(*) as total_users FROM users
    `

    // Get teacher count
    const teachers = await sql`
      SELECT COUNT(*) as total_teachers FROM users WHERE role = 'teacher'
    `

    // Get student count
    const students = await sql`
      SELECT COUNT(*) as total_students FROM users WHERE role = 'student'
    `

    return Response.json({
      status: 'OK',
      database: {
        table_exists: tableCheck[0].table_exists,
        features: features.map(f => ({
          feature_name: f.feature_name,
          is_enabled: f.is_enabled,
          description: f.description,
          created_at: f.created_at,
          updated_at: f.updated_at
        })),
        users: {
          total: users[0]?.total_users || 0,
          teachers: teachers[0]?.total_teachers || 0,
          students: students[0]?.total_students || 0
        }
      },
      raw_features: features // Raw response from database
    })
  } catch (error) {
    return Response.json({
      status: 'ERROR',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
