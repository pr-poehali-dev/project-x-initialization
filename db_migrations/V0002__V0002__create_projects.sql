CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  problem TEXT,
  target_audience TEXT,
  goal TEXT,
  expected_results TEXT,
  budget VARCHAR(100),
  grant_fund VARCHAR(255),
  deadline DATE,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
