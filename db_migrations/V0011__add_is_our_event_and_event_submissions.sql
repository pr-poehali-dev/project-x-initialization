ALTER TABLE grant_events ADD COLUMN IF NOT EXISTS is_our_event boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS event_project_submissions (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES grant_events(id),
    project_id INTEGER NOT NULL REFERENCES projects(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    submitted_at TIMESTAMP NOT NULL DEFAULT now(),
    expert_launched BOOLEAN NOT NULL DEFAULT false,
    UNIQUE(event_id, project_id)
);