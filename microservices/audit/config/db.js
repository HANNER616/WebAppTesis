// config/db.js
const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  throw new Error('Missing DATABASE_URL environment variable for database connection');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20, // Máximo número de conexiones en el pool
  idleTimeoutMillis: 30000, // Cierra conexiones inactivas después de 30 segundos
  connectionTimeoutMillis: 2000, // Falla si no se conecta en 2 segundos
});

// Maneja errores inesperados del pool
pool.on('error', (err, client) => {
  console.error('Error inesperado en el pool de conexiones:', err.stack);
});

//testing the connection

pool.connect()
  .then(client => {
    console.log('Connected to the database (audit service)');
    client.release(); // Libera el cliente de vuelta al pool
  })
  .catch(err => console.error('Database connection error:', err.stack));

module.exports = pool;
