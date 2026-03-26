import { Client } from '@neondatabase/serverless'

/**
 * Test using Client directly instead of neon() function
 */
export async function GET() {
  try {
    console.log('\n===== USING CLIENT DIRECTLY =====\n')

    const client = new Client({
      connectionString: process.env.DATABASE_URL
    })

    console.log('Connecting...')
    await client.connect()
    console.log('Connected!')

    // Test 1: SELECT before
    console.log('\nTest 1: SELECT before update')
    const before = await client.query(
      `SELECT feature_name, is_enabled FROM feature_settings WHERE feature_name = 'reaction_wall'`
    )
    console.log('Before:', before.rows)

    // Test 2: UPDATE
    console.log('\nTest 2: Execute UPDATE')
    const update = await client.query(
      `UPDATE feature_settings 
       SET is_enabled = true, updated_at = NOW() 
       WHERE feature_name = 'reaction_wall'
       RETURNING feature_name, is_enabled`
    )
    console.log('UPDATE returned:', update.rows)
    console.log('UPDATE rowCount:', update.rowCount)

    // Test 3: SELECT after on SAME connection
    console.log('\nTest 3: SELECT after on same connection')
    const after = await client.query(
      `SELECT feature_name, is_enabled FROM feature_settings WHERE feature_name = 'reaction_wall'`
    )
    console.log('After:', after.rows)

    // Test 4: End connection and create new one
    await client.end()

    console.log('\nTest 4: SELECT after on NEW connection')
    const client2 = new Client({
      connectionString: process.env.DATABASE_URL
    })
    await client2.connect()

    const afterNew = await client2.query(
      `SELECT feature_name, is_enabled FROM feature_settings WHERE feature_name = 'reaction_wall'`
    )
    console.log('After (new connection):', afterNew.rows)
    await client2.end()

    return Response.json({
      beforeUpdate: before.rows,
      updateReturning: update.rows,
      updateRowCount: update.rowCount,
      afterSameConnection: after.rows,
      afterNewConnection: afterNew.rows
    })
  } catch (err) {
    console.error('Client test error:', err)
    return Response.json({ error: err.message, stack: err.stack }, { status: 500 })
  }
}
