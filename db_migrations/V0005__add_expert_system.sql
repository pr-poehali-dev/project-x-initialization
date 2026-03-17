CREATE TABLE IF NOT EXISTS experts (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  specialization VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expert_sessions (
  id SERIAL PRIMARY KEY,
  expert_id INTEGER NOT NULL REFERENCES experts(id),
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expert_assignments (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id),
  expert_id INTEGER NOT NULL REFERENCES experts(id),
  status VARCHAR(50) DEFAULT 'pending',
  assigned_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  UNIQUE(project_id, expert_id)
);

CREATE TABLE IF NOT EXISTS expert_reviews (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER NOT NULL REFERENCES expert_assignments(id),
  section VARCHAR(100) NOT NULL,
  feedback TEXT,
  score INTEGER CHECK (score >= 1 AND score <= 10),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(assignment_id, section)
);

ALTER TABLE projects ADD COLUMN IF NOT EXISTS expert_status VARCHAR(50) DEFAULT NULL;
