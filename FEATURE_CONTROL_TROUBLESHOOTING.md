# Feature Control System - Complete Troubleshooting Guide

## Quick Check (Step 1)

Visit this URL: `http://localhost:3000/debug/features`

This will show you:
- ✅ What's in the database `feature_settings` table
- ✅ What the API is returning
- ✅ User counts by role

## Expected Database Setup

Your `feature_settings` table should have exactly 3 rows:

```
feature_name    | is_enabled | description
————————————————|————————————|————————————————————————
messages        | true       | Enable/disable messages
experiments     | true       | Enable/disable chemistry experiments  
reaction_wall   | true       | Enable/disable reaction wall
```

## How It Should Work - Step-by-Step

### Step 1: Teacher Logs In
- Teacher goes to `/teacher-settings` page
- Page loads current feature status from database via `/api/features/status` GET
- Shows 3 toggles: Messages, Experiments, Reaction Wall

### Step 2: Teacher Disables a Feature
- Teacher clicks toggle to disable (e.g., "Messages")
- Clicks "Save Settings" button
- Sends PUT request to `/api/features/status` with:
  ```json
  {
    "features": {
      "messages": false,
      "experiments": true,
      "reaction_wall": true
    }
  }
  ```

### Step 3: Database Updates
- API updates the `feature_settings` table
- `is_enabled` for "messages" becomes `false`
- `updated_at` timestamp updates

### Step 4: Student Sees the Change
- Student's navbar polls `/api/features/status` every 5 seconds
- Gets the response: `"messages": false`
- Navbar shows "Messages" as "Disabled" with grayed-out button
- If student tries to access `/messages` page, sees "FeatureRestricted" component

## Troubleshooting Checklist

### ❌ Nothing changes when I toggle and save

**Check 1: Database table exists?**
```
Visit: http://localhost:3000/api/setup/check
Should see: "status": "OK"
```

**Check 2: Can I see database features?**
```
Visit: http://localhost:3000/debug/features
Look at "Features in Database" section
Should show 3 features with is_enabled values
```

**Check 3: Did the toggle actually save?**
```
1. Open browser DevTools (F12 → Console)
2. Go to /teacher-settings
3. Toggle a feature
4. Click Save
5. Look for success/error message in console
6. Refresh /debug/features to check database
```

**Check 4: Is the API returning data?**
```
Visit: http://localhost:3000/api/features/status
Should return:
{
  "success": true,
  "features": {
    "messages": true/false,
    "experiments": true/false,
    "reaction_wall": true/false
  }
}
```

### ❌ Teacher can see restricted features but shouldn't

The navbar should **allow** teachers to see and access:
- Messages (with Settings option)
- Create Quiz (Design Experiment)
- Dashboard (Lab Analytics)

This is **correct behavior**. Teachers should be able to use these features.

### ❌ Student always sees features as disabled

**Check 1:** Is the feature actually enabled in database?
```
Visit: http://localhost:3000/debug/features
Check if is_enabled is true for the feature you want students to see
```

**Check 2:** Is the student refreshing?
The frontend polls every 5 seconds, but if cached, refresh the page (Ctrl+F5)

**Check 3:** Check the browser console for errors
```
F12 → Console tab
Look for error messages when loading features
```

### ❌ Student can see disabled features

This should NOT happen. Check:
```
1. Go to /debug/features
2. Verify the feature shows is_enabled: false
3. Student's page should fetch this every 5 seconds
4. If student still sees it, try manual refresh (Ctrl+F5)
```

## Detailed Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    TEACHER SIDE                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Teacher logs in                                         │
│     → Auth store has user.role = 'teacher'                 │
│                                                             │
│  2. Navbar loads (every 5 sec):                            │
│     GET /api/features/status                              │
│     ↓                                                      │
│     Db: SELECT * FROM feature_settings                    │
│     ↓                                                      │
│     Returns: {messages: true, experiments: true, ...}     │
│                                                             │
│  3. Teacher visits /teacher-settings                       │
│     GET /api/features/status                              │
│     ↓                                                      │
│     Shows toggles with current state                       │
│                                                             │
│  4. Teacher clicks toggle (e.g., disable messages)         │
│     Toggles: {messages: false, experiments: true, ...}     │
│     Clicks Save                                            │
│     ↓                                                      │
│     PUT /api/features/status {features: {...}}           │
│     ↓                                                      │
│     UPDATE feature_settings                               │
│     WHERE feature_name = 'messages'                        │
│     SET is_enabled = false                                │
│     ↓                                                      │
│     Toast: "Saved successfully!"                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    STUDENT SIDE                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Student logs in                                        │
│     → Auth store has user.role = 'student'               │
│                                                             │
│  2. Navbar loads (every 5 sec):                           │
│     GET /api/features/status                             │
│     ↓                                                     │
│     Db: SELECT * FROM feature_settings                   │
│     ↓                                                     │
│     Returns: {messages: false, experiments: true, ...}   │
│                                                             │
│  3. Navbar renders:                                       │
│     If messages = false → Show "Disabled" badge          │
│     If experiments = true → Show normal link             │
│                                                             │
│  4. Student clicks on "Messages"                          │
│     If disabled → Shows FeatureRestricted component      │
│     If enabled → Shows messages page                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## API Endpoints Reference

### GET /api/features/status
**Returns current feature status**
```bash
curl http://localhost:3000/api/features/status

# Response:
{
  "success": true,
  "features": {
    "messages": true,
    "experiments": false,
    "reaction_wall": true
  }
}
```

### PUT /api/features/status
**Update feature status**
```bash
curl -X PUT http://localhost:3000/api/features/status \
  -H "Content-Type: application/json" \
  -d '{"features": {"messages": false, "experiments": true, "reaction_wall": true}}'

# Response:
{
  "success": true,
  "features": {
    "messages": false,
    "experiments": true,
    "reaction_wall": true
  }
}
```

### GET /api/debug/database
**See full database status**
```bash
curl http://localhost:3000/api/debug/database

# Shows features with timestamps, user counts, etc.
```

### GET /api/setup/check
**Check if database is configured**
```bash
curl http://localhost:3000/api/setup/check

# Returns setup status and instructions if missing
```

## Debug Page URLs

| URL | Purpose |
|-----|---------|
| `/debug/features` | Visual debug dashboard showing DB and API status |
| `/test-update` | **Test database updates directly** - see BEFORE/AFTER values |
| `/api/debug/database` | JSON output of database state |
| `/api/features/status` | JSON output of current feature toggles |
| `/api/test/update-feature` | Test endpoint for database updates |
| `/api/setup/check` | Check if feature_settings table exists |

## Testing the Full Flow

### Test Database Updates Directly

Visit: `http://localhost:3000/test-update`

This page lets you:
1. See current database state
2. Select a feature
3. Choose ENABLED or DISABLED
4. Test the update
5. See BEFORE and AFTER values
6. Verify the database changed correctly

This is useful to isolate if the problem is in:
- Database connectivity
- SQL UPDATE syntax
- Feature state tracking
- Timestamp updates

**Example Test Flow:**
1. Click "Get Current State" → See all 3 features and their current state
2. Select "messages" and set to "DISABLED"
3. Click "Test Update"
4. Check if:
   - ✓ Status shows "SUCCESS"
   - ✓ BEFORE shows is_enabled was true
   - ✓ AFTER shows is_enabled is now false
   - ✓ updated_at timestamp is recent

### Scenario: Teacher disables Messages for Students

**Step 1: Terminal 1 - Student View**
```
Visit: http://localhost:3000/debug/features
Note: "messages" is_enabled: true
```

**Step 2: Terminal 2 - Teacher Actions**
```
1. Login as teacher
2. Go to /teacher-settings
3. Toggle "Lab Notes (Messages)" to OFF
4. Click Save Settings
5. Should see success toast
```

**Step 3: Check Results**
```
Terminal 1: Refresh /debug/features
Should now show: "messages" is_enabled: false

Or if student is logged in:
Navbar should show "Messages" as Disabled (within 5 seconds)
```

## Still Not Working?

1. **Clear browser cache**: Ctrl+Shift+Delete
2. **Clear localStorage**: F12 → Application → LocalStorage → Clear All
3. **Hard refresh**: Ctrl+F5
4. **Restart dev server**: npm run dev
5. **Check Neon credentials**: Your `.env.local` has correct DATABASE_URL
6. **Check server logs**: Look at terminal running `npm run dev` for errors

## File References

| File | Purpose |
|------|---------|
| `/app/api/features/status/route.js` | Main API endpoints for features (GET/PUT) |
| `/app/api/test/update-feature/route.js` | **Test endpoint for database updates** - use for debugging |
| `/app/teacher-settings/page.jsx` | Teacher UI to control features |
| `/app/test-update/page.jsx` | **Test page for database updates** - visual interface |
| `/components/layout/Navbar.jsx` | Polls and displays feature status |
| `/app/messages/page.jsx` | Checks if messages feature enabled |
| `/app/feedback/page.jsx` | Checks if reaction_wall feature enabled |
| `/app/topics/page.jsx` | Checks if experiments feature enabled |
| `/lib/schema.sql` | Database schema - feature_settings table |
| `/app/debug/features/page.jsx` | Debug dashboard |
| `/app/api/debug/database/route.js` | Database diagnostic endpoint |

