-- Users table
-- Stores accounts for login/signup

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,              -- unique user ID
  username TEXT NOT NULL,             -- display name
  email TEXT NOT NULL UNIQUE,         -- login email, must be unique
  password TEXT NOT NULL,             -- plain text password (demo only)
  created_at TIMESTAMP DEFAULT NOW()  -- when the account was created
);


-- Words table
-- Flash-card words + definitions + difficulty level

CREATE TABLE IF NOT EXISTS words (
  id SERIAL PRIMARY KEY,                                  -- unique word ID
  word TEXT NOT NULL,                                     -- the actual word
  definition TEXT NOT NULL,                               -- kid-friendly definition
  difficulty TEXT NOT NULL CHECK (difficulty IN           -- difficulty must be one of:
    ('easy', 'medium', 'hard')),                          
  created_at TIMESTAMP DEFAULT NOW()                      -- timestamp added
);


-- Scores table
-- Saves each gameplay session and connects score → user

CREATE TABLE IF NOT EXISTS scores (
  id SERIAL PRIMARY KEY,                                  -- unique score ID
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- link to user (delete user → delete scores)
  correct_answers INTEGER NOT NULL,                       -- how many answers were correct
  total_questions INTEGER NOT NULL,                       -- total number asked (probably 10)
  difficulty TEXT NOT NULL CHECK (difficulty IN           -- difficulty category for the round:
    ('easy', 'medium', 'hard')),                          
  created_at TIMESTAMP DEFAULT NOW()                      -- timestamp recorded
);