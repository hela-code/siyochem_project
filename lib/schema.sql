-- ============================================
-- ChemHub — Neon PostgreSQL Schema
-- Run this SQL in your Neon console to set up the database
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==================
-- USERS
-- ==================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(30) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'teacher')),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  bio VARCHAR(500),
  avatar TEXT,
  school VARCHAR(200),
  grade VARCHAR(50),
  posts_count INT DEFAULT 0,
  likes_received INT DEFAULT 0,
  quizzes_taken INT DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0,
  twitter VARCHAR(255),
  linkedin VARCHAR(255),
  instagram VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================
-- TOPICS
-- ==================
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description VARCHAR(1000) NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id),
  category VARCHAR(50) DEFAULT 'General Discussion'
    CHECK (category IN (
      'Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry',
      'Analytical Chemistry', 'Biochemistry', 'Environmental Chemistry',
      'General Discussion'
    )),
  tags TEXT[] DEFAULT '{}',
  image TEXT,
  views INT DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================
-- POSTS
-- ==================
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content VARCHAR(2000) NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id),
  topic_id UUID NOT NULL REFERENCES topics(id),
  images TEXT[] DEFAULT '{}',
  chemical_equations JSONB DEFAULT '[]',
  is_edited BOOLEAN DEFAULT FALSE,
  edit_history JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================
-- COMMENTS
-- ==================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content VARCHAR(1000) NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id),
  post_id UUID NOT NULL REFERENCES posts(id),
  is_edited BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================
-- FEEDBACKS
-- ==================
CREATE TABLE feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content VARCHAR(1000) NOT NULL,
  author_name VARCHAR(200) NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================
-- POST LIKES (junction table)
-- ==================
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- ==================
-- FEEDBACK REACTIONS (junction table)
-- ==================
CREATE TABLE feedback_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES feedbacks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(feedback_id, user_id)
);

-- ==================
-- PROFILE BONDS (like a "like" for user profiles)
-- ==================
CREATE TABLE profile_bonds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, user_id)
);

-- ==================
-- MESSAGES (direct messaging between students)
-- ==================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content VARCHAR(2000) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================
-- POST SHARES
-- ==================
CREATE TABLE post_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  platform VARCHAR(20) CHECK (platform IN ('twitter', 'facebook', 'linkedin', 'whatsapp')),
  shared_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================
-- TOPIC LIKES (junction table)
-- ==================
CREATE TABLE topic_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(topic_id, user_id)
);

-- ==================
-- COMMENT LIKES (junction table)
-- ==================
CREATE TABLE comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- ==================
-- QUIZZES
-- ==================
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description VARCHAR(1000) NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id),
  category VARCHAR(50) DEFAULT 'Mixed Topics'
    CHECK (category IN (
      'Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry',
      'Analytical Chemistry', 'Biochemistry', 'Environmental Chemistry',
      'Mixed Topics'
    )),
  duration INT NOT NULL CHECK (duration >= 5 AND duration <= 180),
  total_marks INT NOT NULL DEFAULT 0,
  passing_marks INT NOT NULL DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================
-- QUIZ QUESTIONS
-- ==================
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_index INT NOT NULL,
  question VARCHAR(500) NOT NULL,
  options TEXT[] NOT NULL,
  correct_answer INT NOT NULL CHECK (correct_answer >= 0 AND correct_answer <= 3),
  explanation VARCHAR(1000),
  difficulty VARCHAR(10) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  topic VARCHAR(200) NOT NULL,
  chemical_equation TEXT,
  image TEXT,
  UNIQUE(quiz_id, question_index)
);

-- ==================
-- QUIZ ATTEMPTS
-- ==================
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  score INT DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0,
  passed BOOLEAN DEFAULT FALSE,
  time_spent INT DEFAULT 0,
  average_time_per_question DECIMAL(10,2) DEFAULT 0,
  UNIQUE(quiz_id, student_id)
);

-- ==================
-- QUIZ ATTEMPT ANSWERS
-- ==================
CREATE TABLE quiz_attempt_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_index INT NOT NULL,
  selected_answer INT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  time_spent INT DEFAULT 0
);

-- ==================
-- INDEXES
-- ==================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_topics_author ON topics(author_id);
CREATE INDEX idx_topics_category ON topics(category);
CREATE INDEX idx_topics_created_at ON topics(created_at DESC);
CREATE INDEX idx_topics_title_search ON topics USING gin(to_tsvector('english', title || ' ' || description));

CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_topic ON posts(topic_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_content_search ON posts USING gin(to_tsvector('english', content));

CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_author ON comments(author_id);

CREATE INDEX idx_quizzes_author ON quizzes(author_id);
CREATE INDEX idx_quizzes_category ON quizzes(category);
CREATE INDEX idx_quizzes_published ON quizzes(is_published);
CREATE INDEX idx_quizzes_search ON quizzes USING gin(to_tsvector('english', title || ' ' || description));

CREATE INDEX idx_quiz_questions_quiz ON quiz_questions(quiz_id);
CREATE INDEX idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_student ON quiz_attempts(student_id);

-- ==================
-- TRIGGER: auto-update updated_at
-- ==================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_topics_updated_at BEFORE UPDATE ON topics FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_feedbacks_updated_at BEFORE UPDATE ON feedbacks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_quizzes_updated_at BEFORE UPDATE ON quizzes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
