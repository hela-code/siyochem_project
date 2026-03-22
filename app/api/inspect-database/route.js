import { getSQL } from '@/lib/neon'

/**
 * Raw database inspection
 */
export async function GET() {
  try {
    const sql = getSQL()
    
    console.log('\n========== RAW DATABASE INSPECTION ==========\n')

    // Get EVERYTHING from feature_settings - all columns, all rows
    console.log('Querying ALL rows in feature_settings table:')
    const allRows = await sql`
      SELECT * FROM feature_settings
    `
    
    console.log('Total rows:', allRows.length)
    console.log('Raw data:')
    console.log(allRows)

    // Get row count
    console.log('\nChecking row count:')
    const count = await sql`
      SELECT COUNT(*) as total, COUNT(DISTINCT feature_name) as unique_features
      FROM feature_settings
    `
    console.log(count)

    // Check for duplicates
    console.log('\nChecking for duplicate feature_names:')
    const duplicates = await sql`
      SELECT feature_name, COUNT(*) as count
      FROM feature_settings
      GROUP BY feature_name
      ORDER BY count DESC
    `
    console.log(duplicates)

    // Check if there are rows with NULL values
    console.log('\nChecking for NULL values:')
    const nullCheck = await sql`
      SELECT 
        COUNT(CASE WHEN id IS NULL THEN 1 END) as null_ids,
        COUNT(CASE WHEN feature_name IS NULL THEN 1 END) as null_names,
        COUNT(CASE WHEN is_enabled IS NULL THEN 1 END) as null_enabled
      FROM feature_settings
    `
    console.log(nullCheck)

    // Order by different columns
    console.log('\nOrdered by creation date:')
    const byDate = await sql`
      SELECT feature_name, is_enabled, created_at, updated_at
      FROM feature_settings
      ORDER BY created_at
    `
    console.log(byDate)

    // Final list
    console.log('\nOrdered by feature_name:')
    const byName = await sql`
      SELECT feature_name, is_enabled, updated_at
      FROM feature_settings
      ORDER BY feature_name
    `
    console.log(byName)

    return Response.json({
      success: true,
      totalRows: allRows.length,
      allRows: allRows.map(r => ({
        id: r.id,
        feature_name: r.feature_name,
        is_enabled: r.is_enabled,
        created_at: r.created_at,
        updated_at: r.updated_at
      })),
      stats: count[0],
      duplicateCheck: duplicates,
      nullCheck: nullCheck[0],
      orderedByName: byName.map(r => ({
        name: r.feature_name,
        enabled: r.is_enabled,
        updated: r.updated_at
      }))
    })

  } catch (error) {
    console.error('Error:', error.message)
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
