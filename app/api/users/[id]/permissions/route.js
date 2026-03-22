import { getSQL } from '@/lib/neon'

export async function PUT(request, { params }) {
  try {
    const sql = getSQL()
    const { id } = params
    const { teacherPermissions } = await request.json()

    // Get user to verify they're a teacher
    const user = await sql`SELECT role FROM users WHERE id = ${id}`

    if (!user || user.length === 0 || user[0].role !== 'teacher') {
      return Response.json(
        { success: false, message: 'Only teachers can update permissions' },
        { status: 403 }
      )
    }

    // Update teacher permissions
    const updated = await sql`
      UPDATE users
      SET
        can_message_students = ${teacherPermissions.canMessageStudents ?? true},
        can_create_experiments = ${teacherPermissions.canCreateExperiments ?? true},
        can_view_analytics = ${teacherPermissions.canViewAnalytics ?? true},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING 
        id,
        can_message_students,
        can_create_experiments,
        can_view_analytics
    `

    if (!updated || updated.length === 0) {
      return Response.json(
        { success: false, message: 'Failed to update permissions' },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      message: 'Permissions updated successfully',
      user: {
        id: updated[0].id,
        teacherPermissions: {
          canMessageStudents: updated[0].can_message_students,
          canCreateExperiments: updated[0].can_create_experiments,
          canViewAnalytics: updated[0].can_view_analytics,
        },
      },
    })
  } catch (error) {
    console.error('Error updating permissions:', error)
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}
