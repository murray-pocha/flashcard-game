// Handles PostgreSQL connection for the whole app

const { Pool } = require('pg');
require('dotenv').config(); // loads .env from Backend/

// connection pool using environment variables
const pool = new Pool({
  user: process.env.PGUSER,        // DB username
  password: process.env.PGPASSWORD, // DB password
  host: process.env.PGHOST || 'localhost', // DB host
  database: process.env.PGDATABASE, // DB name
  port: process.env.PGPORT || 5432, // DB port
});

// test the connection once when the app starts
pool
  .connect()
  .then(client => {
    console.log('✅ Connected to PostgreSQL successfully');
    client.release();
  })
  .catch(err => {
    console.error('❌ Error connecting to PostgreSQL:', err.message);
  });

// Export a simple query helper for the rest of the app
module.exports = {
  query: (text, params) => pool.query(text, params),
};