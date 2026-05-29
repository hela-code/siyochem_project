# Chem Hub

Chem Hub is a Next.js 14 chemistry learning platform for A/L students in Sri Lanka. It combines social learning, chemistry experiments, quizzes, direct messaging, feedback, teacher controls, and a rich set of diagnostics tools for validating the database and feature-flag workflow.

## What the app does

Chem Hub is built around four core experiences:

- Learn and discuss chemistry through topics, posts, comments, reactions, and shared resources.
- Run lab tests and quizzes, then review analytics and performance.
- Exchange direct messages and feedback between students and teachers.
- Let teachers control feature availability globally from a single settings screen.

## Tech Stack

- Next.js 14 App Router
- React 18
- Tailwind CSS
- Framer Motion
- Axios
- Zustand for auth state
- react-hot-toast for notifications
- Neon PostgreSQL via `@neondatabase/serverless`
- Optional legacy MongoDB helper files are present in `lib/mongodb.js` and `models/`, but the active API layer in `app/api/` is wired to Neon SQL through `lib/neon.js`

## Scripts

```bash
npm install
npm run dev
npm run build
npm start
npm run lint
```

## Local Setup

1. Install dependencies.
2. Create a `.env.local` file with your database connection string.
3. Run the schema in your Neon database.
4. Start the dev server.
5. Open the setup and diagnostics pages to confirm everything is wired correctly.

### Environment Variables

The app expects at least:

```bash
DATABASE_URL=your_neon_postgres_connection_string
```

Some legacy helpers also reference:

```bash
MONGODB_URI=your_mongodb_connection_string
```

If you are only using the current Neon-backed APIs, `DATABASE_URL` is the important value.

## Database Setup

Run the SQL in `lib/schema.sql` inside your Neon SQL editor.

That schema creates these tables:

- `users`
- `feature_settings`
- `topics`
- `posts`
- `comments`
- `feedbacks`
- `post_likes`
- `feedback_reactions`
- `profile_bonds`
- `messages`
- `post_shares`
- `topic_likes`
- `comment_likes`
- `quizzes`
- `quiz_questions`
- `quiz_attempts`
- `quiz_attempt_answers`

### Default feature flags

The feature-control system depends on the `feature_settings` table. The default rows are:

- `messages`
- `experiments`
- `start_experiment`
- `add_reaction`
- `reaction_wall`

These settings drive teacher controls and student visibility across the UI.

## Core Product Areas

### Public and auth flows

- Landing page with platform overview and call-to-action buttons.
- Register and login flows.
- Auth state persistence through Zustand.
- Automatic auth rehydration on refresh.

### Chemistry learning

- Topics and topic detail pages.
- Posts under topics.
- Likes, comments, shares, and trending topics.
- Reaction wall / feedback posting.
- Chemistry-focused homepage sections and category coverage.

### Quizzes and experiments

- Quiz list and quiz detail pages.
- Quiz attempt flow.
- Quiz analytics.
- Create quiz flow.
- Create topic flow.
- Teacher and student dashboards for activity review.

### Messaging and community

- Direct messages.
- User profiles.
- Bonding and reaction-based engagement.
- Search.

### Teacher feature control

- Global feature toggles controlled from `/teacher-settings`.
- Students see disabled states when teachers turn off a feature.
- The navbar reads feature status from `/api/features/status`.

### Diagnostics and test tools

The repository includes several debug and validation pages plus API routes to check database health, save flows, and feature toggles.

## Pages and Routes

### Public pages

- `/` - Home / landing page
- `/login` - Login page
- `/register` - Registration page
- `/search` - Search page

### Learning and community pages

- `/topics` - Topic list
- `/topics/[id]` - Topic detail
- `/quizzes` - Quiz list
- `/quizzes/[id]` - Quiz detail
- `/reaction` - Reaction wall view
- `/feedback` - Feedback page
- `/messages` - Messages inbox and conversations
- `/profile/[id]` - User profile page
- `/quiz-analytics/[id]` - Quiz analytics view
- `/create-topic` - Create topic page
- `/create-quiz` - Create quiz page

### Dashboard and admin pages

- `/dashboard` - Main dashboard
- `/dashboard/[type]` - Dashboard subviews
- `/admin` - Admin overview page
- `/teacher-settings` - Teacher feature control panel
- `/teacher-settings-debug` - Debug view for settings behavior
- `/feature-control` - Feature control helper page
- `/feature-guide` - Feature control guidance page

### Diagnostics and test pages

- `/diagnostics` - Main diagnostics page
- `/debug/features` - Feature debug dashboard
- `/debug-save` - Save debugging page
- `/e2e-test` - End-to-end test page
- `/exact-workflow-test` - Workflow validation page
- `/quick-test` - Quick test page
- `/simple-save-test` - Simple save test page
- `/teacher-save-test` - Teacher save test page
- `/test-database` - Database test page
- `/test-save-fix` - Save fix validation page
- `/test-teacher-student` - Teacher/student flow test page
- `/test-update` - Update test page

## API Reference

### Authentication

- `GET /api/auth/me` - Current authenticated user
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/seed` - Seed sample auth data

### Users

- `GET /api/users/[id]` - User profile and stats
- `PUT /api/users/[id]` - Update profile
- `GET /api/users/search` - Search users
- `GET /api/users/[id]/activity` - User activity summary
- `GET /api/users/[id]/quizzes` - Quizzes taken by a user
- `GET /api/users/[id]/bonds` - Profile bonds list
- `POST /api/users/[id]/bond` - Create a bond
- `GET /api/users/[id]/permissions` - User permissions
- `GET /api/users/[id]/bond` - Bond lookup helper

### Topics

- `GET /api/topics` - List topics
- `POST /api/topics` - Create topic
- `GET /api/topics/[id]` - Topic detail
- `PUT /api/topics/[id]` - Update topic
- `DELETE /api/topics/[id]` - Delete topic
- `GET /api/topics/trending` - Trending topics
- `POST /api/topics/[id]/like` - Like a topic

### Posts

- `GET /api/posts` - List posts
- `POST /api/posts` - Create post
- `GET /api/posts/[id]` - Post detail
- `PUT /api/posts/[id]` - Update post
- `DELETE /api/posts/[id]` - Delete post
- `GET /api/posts/topic/[topicId]` - Posts for a topic
- `POST /api/posts/[id]/comments` - Add comment
- `POST /api/posts/[id]/like` - Like post
- `POST /api/posts/[id]/share` - Share post

### Messages

- `GET /api/messages` - Message conversations
- `POST /api/messages` - Create message
- `GET /api/messages/[userId]` - Messages with a specific user

### Feedback and reaction wall

- `GET /api/feedback` - List feedback entries
- `POST /api/feedback` - Create feedback entry
- `POST /api/feedback/react` - React to feedback

### Quizzes

- `GET /api/quizzes` - List quizzes
- `POST /api/quizzes` - Create quiz
- `GET /api/quizzes/[id]` - Quiz detail
- `PUT /api/quizzes/[id]` - Update quiz
- `DELETE /api/quizzes/[id]` - Delete quiz
- `POST /api/quizzes/[id]/attempt` - Start or submit quiz attempt
- `GET /api/quizzes/[id]/analytics` - Quiz analytics

### Admin APIs

- `GET /api/admin/users` - Admin user list
- `GET /api/admin/users/[id]` - Admin user detail/update
- `GET /api/admin/topics` - Admin topic list
- `GET /api/admin/topics/[id]` - Admin topic detail/update
- `GET /api/admin/posts` - Admin post list
- `GET /api/admin/posts/[id]` - Admin post detail/update
- `GET /api/admin/feedback` - Admin feedback list
- `GET /api/admin/feedback/[id]` - Admin feedback detail/update
- `GET /api/admin/messages` - Admin messages list
- `GET /api/admin/messages/[id]` - Admin message detail/update
- `GET /api/admin/reactions` - Admin reaction list
- `GET /api/admin/reactions/[id]` - Admin reaction detail/update

### Feature control and diagnostics

- `GET /api/features/status` - Read global feature state
- `PUT /api/features/status` - Update global feature state
- `GET /api/setup/check` - Verify database setup
- `GET /api/debug/features` - Feature state debug output
- `GET /api/debug/database` - Database debug output
- `GET /api/database-diagnostic` - Database diagnostic page API
- `GET /api/diagnose-connection` - Connection diagnostics
- `GET /api/diagnose-db` - Database diagnostics
- `GET /api/inspect-database` - Inspect database contents
- `GET /api/raw-database-check` - Raw database check
- `GET /api/raw-features` - Raw feature data
- `GET /api/neon-test` - Neon integration test
- `GET /api/client-test` - Direct client test
- `POST /api/simulate-teacher-save` - Simulate teacher save flow
- `POST /api/test-db-update` - Test DB update flow
- `POST /api/test-reaction-wall` - Test reaction wall flow
- `POST /api/test-save-workflow` - Test save workflow
- `POST /api/test/update-feature` - Update feature test endpoint

### Upload

- `POST /api/upload` - Upload files

## Feature Control Flow

1. Teacher logs in.
2. Teacher opens `/teacher-settings`.
3. The page loads the current values from `/api/features/status`.
4. Teacher toggles features such as Messages, Design Experiment, Start Experiment, Add Reaction, or Reaction Wall.
5. Teacher clicks Save.
6. The API updates `feature_settings` in Neon.
7. Students see the updated availability in the navbar and feature-restricted pages.

### Student-facing behavior

- Disabled features appear grayed out in the navbar.
- Disabled items show a `Disabled` badge.
- Hovering shows a message that the feature is currently disabled.
- Restricted content uses the `FeatureRestricted` UI pattern.

## Authentication Behavior

The auth store in `stores/authStore.js` handles:

- Login
- Register
- Logout
- Auth rehydration from storage
- Loading the current user with `/api/auth/me`
- Updating profiles
- Tracking the active chat ID

## UI and Layout

The global app shell uses:

- A gradient chemistry-themed background
- A sticky navbar
- A shared footer
- Toast notifications
- Scroll-to-top behavior
- Framer Motion animations for transitions and cards

## Troubleshooting

### Database not initialized

Visit `/api/setup/check`. If the table is missing, run `lib/schema.sql` in Neon.

### Teacher settings do not save

Check:

- The user is logged in as a teacher
- `DATABASE_URL` is correct
- The feature name exists in `feature_settings`
- Browser console errors

### Student does not see disabled state

Check:

- The feature value in `/api/features/status`
- Browser refresh or cache
- Whether the navbar loaded the latest auth state

### API debugging

Useful pages:

- `/diagnostics`
- `/debug/features`
- `/test-database`
- `/test-update`
- `/teacher-settings-debug`
- `/feature-guide`

Useful endpoints:

- `/api/setup/check`
- `/api/features/status`
- `/api/debug/database`
- `/api/debug/features`
- `/api/diagnose-connection`
- `/api/diagnose-db`

## Project Structure

- `app/` - App Router pages and API routes
- `components/` - Shared UI and layout components
- `hooks/` - Custom hooks
- `lib/` - Database helpers and schema
- `models/` - Legacy MongoDB/Mongoose models
- `stores/` - Zustand stores

## Notes

- The project title in metadata is "Chem Hub - Chemistry Learning Platform".
- The codebase contains both Neon SQL helpers and legacy MongoDB files, but the current app flow is centered on Neon-backed routes.
- Feature flags are a first-class part of the app and should be kept in sync between the database, teacher UI, and navbar.
