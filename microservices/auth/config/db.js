// config/db.js
const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  throw new Error('Missing DATABASE_URL environment variable for database connection');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Neon necesita SSL pero permite conexiones sin certificados locales
  }
});

//testing the connection

pool.connect()
    .then(() => console.log('Connected to the database'))
    .catch(err => console.error('Database connection error:', err.stack));

    

module.exports = pool;
