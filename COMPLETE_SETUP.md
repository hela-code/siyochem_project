# Complete Feature Control System Setup

## ⚠️ CRITICAL: Must Run Setup First

**Visit:** `http://localhost:3000/api/setup/check`

If you see:
```
{
  "status": "ERROR",
  "message": "feature_settings table does not exist"
}
```

Then **STOP** and run this SQL in your Neon console:

```sql
CREATE TABLE feature_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name VARCHAR(100) UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  description VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO feature_settings (feature_name, is_enabled, description) 
VALUES
  ('messages', true, 'Enable/disable messages (Lab Notes)'),
  ('experiments', true, 'Enable/disable chemistry experiments'),
  ('reaction_wall', true, 'Enable/disable reaction wall');
```

---

## Testing Flow

### Test 1: Run Full Diagnostics (No Login Needed)

**Visit:** `http://localhost:3000/diagnostics`

This will:
1. ✓ Check if database table exists
2. ✓ Test API GET endpoint
3. ✓ Test API PUT endpoint
4. ✓ Verify database was updated

**Expected Result:** All steps should pass with ✓

---

### Test 2: Real-World Teacher Flow

**Step A: Teacher Login**
1. Open your app and login as **teacher**
2. Click on user menu → "Feature Settings"
3. You should see 3 toggles:
   - Lab Notes (Messages)
   - Design Experiment
   - Reaction Wall

**Step B: Disable a Feature**
1. Click the toggle for "Lab Notes" to turn it OFF
2. Click "Save Settings"
3. You should see **"Settings saved successfully!"** toast

**Step C: Check Database Updated**
1. Visit: `http://localhost:3000/api/features/status`
2. Should show:
   ```json
   {
     "success": true,
     "features": {
       "messages": false,
       "experiments": true,
       "reaction_wall": true
     }
   }
   ```

**Step D: Check Student View**
1. Open **new incognito window** (or different browser)
2. Login as **student**
3. Look at navbar - "Lab Notes" should show **"Disabled"** badge
4. If you click on it, should see "This feature is currently disabled"

---

## If It's NOT Working

### Problem 1: Database table doesn't exist

**Check:** `http://localhost:3000/api/setup/check`

**Solution:** Run the SQL above in Neon console

---

### Problem 2: Teacher clicks Save but nothing happens

**Check:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try saving again
4. Look for error messages

**Common issues:**
- Token missing (not logged in properly)
- Database connection failing
- Wrong feature names

---

### Problem 3: Feature is saved but student doesn't see it disabled

**Check:**
1. Student manually refresh page (Ctrl+F5)
2. Wait 5 seconds (navbar polls every 5 seconds)
3. Check browser console for errors

**Solutions:**
- Clear browser cache: Ctrl+Shift+Delete
- Clear localStorage: F12 → Application → LocalStorage → Clear All
- Hard refresh: Ctrl+F5

---

### Problem 4: API PUT returns error

**Check:** Run diagnostics at `http://localhost:3000/diagnostics`

**Look for Step 2 results** - Should say:
```
✓ API saved changes successfully
```

If it says ✗, check the error message

---

## Quick URL Reference

| URL | Use |
|-----|-----|
| `/diagnostics` | **START HERE** - Full system test |
| `/teacher-settings` | Teacher control panel |
| `/api/setup/check` | Check if setup is complete |
| `/api/features/status` | Current feature status (JSON) |
| `/api/debug/database` | Full database state (JSON) |

---

## Expected Database Schema

Your database must have this table with these exact 3 rows:

```
feature_name    | is_enabled | description
————————————————|————————————|————————————————————————
messages        | true/false | Enable/disable messages (Lab Notes)
experiments     | true/false | Enable/disable chemistry experiments
reaction_wall   | true/false | Enable/disable reaction wall
```

---

## Complete Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│ TEACHER: Click toggle at /teacher-settings                       │
│ ↓                                                                 │
│ Frontend: Call PUT /api/features/status                         │
│   {features: {messages: false, experiments: true, ...}}         │
│ ↓                                                                 │
│ API: UPDATE feature_settings SET is_enabled = false             │
│   WHERE feature_name = 'messages'                                │
│ ↓                                                                 │
│ Database: feature_settings table updated                         │
│ ↓                                                                 │
│ API returns: {success: true, features: {...}}                  │
│ ↓                                                                 │
│ Teacher sees: "Settings saved successfully!" ✓                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ STUDENT: Navbar polls every 5 seconds                            │
│ ↓                                                                 │
│ Frontend: Call GET /api/features/status                         │
│ ↓                                                                 │
│ API: SELECT * FROM feature_settings                             │
│ ↓                                                                 │
│ Database returns: {messages: false, experiments: true, ...}    │
│ ↓                                                                 │
│ API returns: {features: {messages: false, ...}}                │
│ ↓                                                                 │
│ Navbar sees messages = false                                    │
│ ↓                                                                 │
│ Navbar shows: "Messages" with "Disabled" badge ✓               │
└──────────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Setup Instructions

### 1. Verify Database Table Exists

Visit: `http://localhost:3000/api/setup/check`

Look for:
```
{
  "status": "OK",
  "message": "Database is properly configured"
}
```

**If you see ERROR:** Run SQL in Neon console (see above)

### 2. Test API GET

Visit: `http://localhost:3000/api/features/status`

Should return:
```json
{
  "success": true,
  "features": {
    "messages": true,
    "experiments": true,
    "reaction_wall": true
  }
}
```

### 3. Test Full System

Visit: `http://localhost:3000/diagnostics`

Click "Start Diagnostic" and let it run through all steps.

**Expected:** All steps show ✓

### 4. Test Teacher Interface

1. Login as teacher
2. Go to `/teacher-settings`
3. Toggle "Lab Notes" OFF
4. Click "Save Settings"
5. Should say "Settings saved successfully!"

### 5. Verify in Database

Open new incognito window:
1. Go to `http://localhost:3000/api/features/status`
2. Should now show `"messages": false`

### 6. Check Student View

1. Login as student (new window)
2. Look at navbar
3. "Lab Notes" should show "Disabled" badge

---

## If Still Not Working After All This

Check:
1. Your `.env.local` has correct `DATABASE_URL` to Neon
2. Dev server is running: `npm run dev`
3. No errors in server console (look at terminal)
4. Database table has data: `SELECT * FROM feature_settings;`

