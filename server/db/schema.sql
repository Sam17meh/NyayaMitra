CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid text UNIQUE NOT NULL,
    name text,
    email text,
    phone text,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS chat_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message text NOT NULL,
    response text NOT NULL,
    category text,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sos_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    latitude numeric,
    longitude numeric,
    nearest_police_station text,
    sms_sent boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name text NOT NULL,
    phone text NOT NULL,
    relation text NOT NULL
);
CREATE TABLE IF NOT EXISTS legal_contexts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category text NOT NULL CHECK (
        category IN (
            'cyber_fraud',
            'harassment',
            'property',
            'employment',
            'domestic',
            'consumer'
        )
    ),
    title text NOT NULL,
    law_reference text NOT NULL,
    summary text NOT NULL,
    applicable_sections text NOT NULL,
    source_url text
);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_sos_logs_user_id ON sos_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_contexts_category ON legal_contexts(category);