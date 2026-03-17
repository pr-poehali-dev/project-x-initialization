ALTER TABLE projects ADD COLUMN IF NOT EXISTS scale VARCHAR(50);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS geography VARCHAR(500);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS experience TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS prospects TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS results_events_count INTEGER;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS results_deadline DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS results_participants_count INTEGER;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS results_publications_count INTEGER;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS results_views_count INTEGER;

CREATE TABLE IF NOT EXISTS project_team_members (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    sort_order INTEGER NOT NULL DEFAULT 0,
    full_name VARCHAR(500),
    role VARCHAR(500),
    competencies TEXT,
    resume_url TEXT,
    resume_filename VARCHAR(500),
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_tasks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    sort_order INTEGER NOT NULL DEFAULT 0,
    task_name TEXT,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_events (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES project_tasks(id),
    sort_order INTEGER NOT NULL DEFAULT 0,
    event_name VARCHAR(500),
    deadline DATE,
    event_description TEXT,
    unique_participants INTEGER,
    repeat_participants INTEGER,
    publications_count INTEGER,
    views_count INTEGER,
    extra_info TEXT,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_media (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    sort_order INTEGER NOT NULL DEFAULT 0,
    resource_name VARCHAR(500),
    publication_month VARCHAR(20),
    planned_views INTEGER,
    resource_links TEXT,
    format_reason TEXT,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_expenses (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    sort_order INTEGER NOT NULL DEFAULT 0,
    category VARCHAR(100),
    item_name VARCHAR(500),
    justification TEXT,
    price NUMERIC(14,2),
    quantity NUMERIC(14,2),
    created_at TIMESTAMP DEFAULT now()
);
