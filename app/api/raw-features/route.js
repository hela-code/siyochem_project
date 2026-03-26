import { getSQL } from '@/lib/neon'

/**
 * Return raw database data without transformation
 */
export async function GET() {
  try {
    const sql = getSQL()
    
    // Query EXACTLY like /api/features/status does
    const features = await sql`
      SELECT feature_name, is_enabled, description, updated_at
      FROM feature_settings 
      ORDER BY feature_name
    `
    
    return Response.json({
      rawCount: features.length,
      rawData: features,
      asArray: features.map(f => {
        return {
          feature_name: f.feature_name,
          is_enabled: f.is_enabled,
          is_enabled_type: typeof f.is_enabled,
          is_enabled_strict_true: f.is_enabled === true,
          is_enabled_strict_false: f.is_enabled === false,
          updated_at: f.updated_at
        }
      })
    })
  } catch (error) {
    return Response.json({
      error: error.message
    }, { status: 500 })
  }
}
