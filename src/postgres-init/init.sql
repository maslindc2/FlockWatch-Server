
CREATE TABLE IF NOT EXISTS flock_cases_by_state (
    id SERIAL PRIMARY KEY,
    state TEXT NOT NULL,
    state_abbreviation TEXT NOT NULL UNIQUE,
    backyard_flocks INTEGER NOT NULL,
    commercial_flocks INTEGER NOT NULL,
    birds_affected INTEGER NOT NULL,
    total_flocks INTEGER NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    last_report_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS us_summary (
    key TEXT PRIMARY KEY DEFAULT 'us-summary'
);

CREATE TABLE IF NOT EXISTS us_summary_period_summaries (
    id SERIAL PRIMARY KEY,
    period_name TEXT NOT NULL,
    total_birds_affected INTEGER NOT NULL,
    total_flocks_affected INTEGER NOT NULL,
    total_backyard_flocks_affected INTEGER NOT NULL,
    total_commercial_flocks_affected INTEGER NOT NULL,
    us_summary_key TEXT NOT NULL DEFAULT 'us-summary',
    CONSTRAINT fk_us_summary FOREIGN KEY (us_summary_key)
        REFERENCES us_summary(key)
        ON DELETE CASCADE,
    CONSTRAINT unique_period_per_summary UNIQUE (period_name, us_summary_key)
);

CREATE TABLE IF NOT EXISTS us_summary_all_time_totals (
    id SERIAL PRIMARY KEY,
    total_states_affected INTEGER NOT NULL,
    total_birds_affected INTEGER NOT NULL,
    total_flocks_affected INTEGER NOT NULL,
    total_backyard_flocks_affected INTEGER NOT NULL,
    total_commercial_flocks_affected INTEGER NOT NULL,
    us_summary_key TEXT NOT NULL DEFAULT 'us-summary',
    CONSTRAINT fk_us_summary FOREIGN KEY (us_summary_key)
        REFERENCES us_summary(key)
        ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS last_report_date (
    id SERIAL PRIMARY KEY,
    last_scraped_date DATE NOT NULL UNIQUE,
    auth_id TEXT NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_flock_state ON flock_cases_by_state(state_abbreviation);
CREATE INDEX IF NOT EXISTS idx_last_report_date ON last_report_date(auth_id);