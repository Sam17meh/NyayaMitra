import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

try {
  const users = await pool.query("SELECT id, firebase_uid, email, created_at FROM users ORDER BY created_at DESC LIMIT 10");
  const contexts = await pool.query("SELECT category, COUNT(*)::int AS count FROM legal_contexts GROUP BY category ORDER BY category");
  const sos = await pool.query("SELECT id, user_id, latitude, longitude, nearest_police_station, sms_sent, created_at FROM sos_logs ORDER BY created_at DESC LIMIT 10");
  console.log('USERS', JSON.stringify(users.rows, null, 2));
  console.log('LEGAL_CONTEXTS', JSON.stringify(contexts.rows, null, 2));
  console.log('SOS_LOGS', JSON.stringify(sos.rows, null, 2));
} finally {
  await pool.end();
}
