const { Pool } = require('pg');
// Asegúrate de que dotenv esté cargado al inicio de tu index.js o aquí
require('dotenv').config(); 

const isLocalOrVPS = process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Solo activa SSL si NO es localhost (para QA/Vercel)
  ssl: isLocalOrVPS ? false : {
    rejectUnauthorized: false
  }
});

module.exports = pool;