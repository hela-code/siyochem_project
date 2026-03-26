import { getSQL } from '@/lib/neon'

/**
 * This endpoint tests the database update functionality
 * GET: See current features
 * POST: Test updating a single feature
 */

export async function GET() {
  try {
    const sql = getSQL()

    // Get current state
    const features = await sql`
      SELECT feature_name, is_enabled, updated_at 
      FROM feature_settings 
      ORDER BY feature_name
    `

    return Response.json({
      status: 'Current State',
      features: features.map(f => ({
        name: f.feature_name,
        enabled: f.is_enabled,
        last_updated: f.updated_at
      }))
    })
  } catch (error) {
    return Response.json({
      status: 'ERROR',
      message: error.message
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const sql = getSQL()
    const body = await request.json()
    const { featureName, isEnabled } = body

    if (!featureName) {
      return Response.json({
        error: 'featureName is required',
        example: { featureName: 'messages', isEnabled: false }
      }, { status: 400 })
    }

    console.log(`Testing database update: ${featureName} = ${isEnabled}`)

    // Get BEFORE state
    const beforeUpdate = await sql`
      SELECT feature_name, is_enabled, updated_at 
      FROM feature_settings 
      WHERE feature_name = ${featureName}
    `

    console.log('Before update:', beforeUpdate)

    // Do the update
    const updateResult = await sql`
      UPDATE feature_settings 
      SET is_enabled = ${Boolean(isEnabled)}, updated_at = NOW()
      WHERE feature_name = ${featureName}
      RETURNING feature_name, is_enabled, updated_at
    `

    console.log('Update result:', updateResult)

    // Get AFTER state to verify
    const afterUpdate = await sql`
      SELECT feature_name, is_enabled, updated_at 
      FROM feature_settings 
      WHERE feature_name = ${featureName}
    `

    console.log('After update:', afterUpdate)

    const success = afterUpdate[0]?.is_enabled === Boolean(isEnabled)

    return Response.json({
      status: success ? 'SUCCESS' : 'FAILED',
      before: beforeUpdate[0] ? {
        name: beforeUpdate[0].feature_name,
        enabled: beforeUpdate[0].is_enabled,
        updated: beforeUpdate[0].updated_at
      } : null,
      after: afterUpdate[0] ? {
        name: afterUpdate[0].feature_name,
        enabled: afterUpdate[0].is_enabled,
        updated: afterUpdate[0].updated_at
      } : null,
      details: {
        feature_name: featureName,
        requested_is_enabled: isEnabled,
        actual_is_enabled: afterUpdate[0]?.is_enabled,
        rows_affected: updateResult.length,
        database_updated_at: afterUpdate[0]?.updated_at
      }
    })
  } catch (error) {
    console.error('Test error:', error)
    return Response.json({
      status: 'ERROR',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
