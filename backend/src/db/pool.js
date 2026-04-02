/**
 * Database connection pool using pg library.
 * Connects via DATABASE_URL (supports Neon, Supabase, Railway, etc.)
 */
const { Pool } = require('pg');

// Fail fast if DATABASE_URL is missing
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Startup connection test
pool.query('SELECT NOW()')
  .then(() => {
    console.log('✅ Connected to PostgreSQL (cloud)');
  })
  .catch((err) => {
    console.error('❌ Failed to connect to PostgreSQL:', err.message);
    process.exit(1);
  });

// Handle unexpected errors on idle clients
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client:', err.message);
  process.exit(-1);
});

module.exports = pool;
