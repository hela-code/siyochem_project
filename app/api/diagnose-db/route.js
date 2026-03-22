import { getSQL } from '@/lib/neon'

/**
 * Check database structure and for duplicates
 */
export async function GET() {
  try {
    const sql = getSQL()
    
    console.log('\n========== DATABASE DIAGNOSTIC ==========\n')
    
    // Get all rows with count
    console.log('All rows in feature_settings table:')
    const allRows = await sql`
      SELECT * FROM feature_settings ORDER BY feature_name
    `
    console.log(allRows)
    
    // Check for duplicates
    console.log('\nChecking for duplicate feature names:')
    const duplicates = await sql`
      SELECT feature_name, COUNT(*) as count 
      FROM feature_settings 
      GROUP BY feature_name 
      HAVING COUNT(*) > 1
    `
    console.log(duplicates)
    
    // Count total rows
    console.log('\nTotal rows:')
    const totalCount = await sql`
      SELECT COUNT(*) as total FROM feature_settings
    `
    console.log(totalCount)
    
    // Get all unique feature names
    console.log('\nUnique feature names:')
    const uniqueNames = await sql`
      SELECT DISTINCT feature_name FROM feature_settings ORDER BY feature_name
    `
    console.log(uniqueNames)
    
    return Response.json({
      allRows: allRows.map(r => ({
        id: r.id,
        feature_name: r.feature_name,
        is_enabled: r.is_enabled,
        updated_at: r.updated_at,
        created_at: r.created_at
      })),
      totalRows: allRows.length,
      duplicateCount: duplicates.length,
      hasDuplicates: duplicates.length > 0,
      uniqueFeatures: uniqueNames.map(u => u.feature_name)
    })
  } catch (error) {
    return Response.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
