import { getSQL } from '@/lib/neon'

export async function GET() {
  try {
    const sql = getSQL()

    // Check if feature_settings table exists
    const tableInfo = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'feature_settings'
      ) as exists
    `

    const tableExists = tableInfo[0]?.exists || false

    if (!tableExists) {
      return Response.json({
        status: 'ERROR',
        message: 'feature_settings table does not exist',
        action: 'Run the following SQL in your Neon console:',
        sql: `
-- Create feature_settings table
CREATE TABLE feature_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name VARCHAR(100) UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  description VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default features
INSERT INTO feature_settings (feature_name, is_enabled, description) VALUES
  ('messages', true, 'Enable/disable messages (Lab Notes)'),
  ('experiments', true, 'Enable/disable chemistry experiments'),
  ('reaction_wall', true, 'Enable/disable reaction wall');
        `
      })
    }

    // Table exists, get current status
    const features = await sql`SELECT * FROM feature_settings ORDER BY feature_name`

    return Response.json({
      status: 'OK',
      message: 'Database is properly configured',
      features: features.map(f => ({
        name: f.feature_name,
        enabled: f.is_enabled,
        description: f.description
      }))
    })
  } catch (error) {
    return Response.json({
      status: 'ERROR',
      message: error.message,
      details: error.toString()
    }, { status: 500 })
  }
}
