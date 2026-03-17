CREATE TABLE IF NOT EXISTS t_p66347273_project_x_initializa.grant_events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  organizer VARCHAR(255),
  description TEXT,
  deadline DATE,
  start_date DATE,
  end_date DATE,
  grant_amount VARCHAR(100),
  category VARCHAR(100),
  geography VARCHAR(255),
  target_audience TEXT,
  application_url TEXT,
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);