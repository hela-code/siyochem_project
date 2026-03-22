# Feature Settings Setup & Troubleshooting Guide

## Checking Database Setup

1. **Check if your database is configured correctly** by visiting:
   ```
   http://localhost:3000/api/setup/check
   ```

2. **If you see an error**, the `feature_settings` table needs to be created.

## Setting Up the Database

If the check endpoint shows the table doesn't exist, follow these steps:

### Option 1: Run the Full Schema
1. Go to your Neon Console: https://console.neon.tech/
2. Navigate to your database > SQL Editor
3. Copy the SQL from `/lib/schema.sql`
4. Paste and execute it in the Neon console

### Option 2: Quick Setup (Just the Features Table)
If you don't want to run the full schema, run just this SQL:

```sql
-- Create feature_settings table
CREATE TABLE IF NOT EXISTS feature_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name VARCHAR(100) UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  description VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default features
INSERT INTO feature_settings (feature_name, is_enabled, description) 
VALUES
  ('messages', true, 'Enable/disable messages (Lab Notes)'),
  ('experiments', true, 'Enable/disable chemistry experiments'),
  ('reaction_wall', true, 'Enable/disable reaction wall')
ON CONFLICT (feature_name) DO NOTHING;
```

## How Feature Settings Work

- **Teachers** can visit `/teacher-settings` to toggle features on/off
- **All students** see the same feature availability based on global settings
- Changes take effect immediately after saving

## Testing

1. Open browser dev tools (F12) → Console tab
2. Go to Teacher Settings page
3. Toggle a feature and click Save
4. Check the console for detailed error messages if it fails
5. Visit `/api/setup/check` to verify the current state

## Common Issues

### Error: "feature_settings table not found"
→ Run the SQL setup above in your Neon console

### Error: "Feature 'xxx' not found in database"
→ The feature name doesn't match. Make sure you have:
- `messages`
- `experiments`  
- `reaction_wall`

### Error: "Invalid request body"
→ The frontend isn't sending the request correctly. Check browser console for details.

### No error but features don't update
→ Check database directly in Neon console:
```sql
SELECT * FROM feature_settings;
```
