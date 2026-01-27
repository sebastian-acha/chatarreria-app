const { Pool } = require('pg');
require('dotenv').config();

// Render y Supabase requieren SSL para conexiones externas
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;