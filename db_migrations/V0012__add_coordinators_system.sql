CREATE TABLE coordinators (
    id SERIAL PRIMARY KEY,
    expert_id INTEGER NOT NULL REFERENCES experts(id),
    level VARCHAR(20) NOT NULL CHECK (level IN ('local', 'municipal', 'regional', 'district')),
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),
    UNIQUE(expert_id)
);

CREATE TABLE admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id INTEGER,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN coordinator_id INTEGER REFERENCES coordinators(id);

CREATE TABLE project_bank (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    coordinator_id INTEGER NOT NULL REFERENCES coordinators(id),
    added_by INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'in_bank',
    added_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(project_id)
);

ALTER TABLE grant_events ADD COLUMN coordinator_id INTEGER REFERENCES coordinators(id);

CREATE TABLE coordinator_appeals (
    id SERIAL PRIMARY KEY,
    coordinator_id INTEGER NOT NULL REFERENCES coordinators(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(500),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
    response TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
