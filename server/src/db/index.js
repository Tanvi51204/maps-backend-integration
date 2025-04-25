import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' }); // Ensure .env is loaded

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Optional: Add SSL configuration if required for your DB connection
    // ssl: {
    //   rejectUnauthorized: false // Adjust based on your SSL setup
    // }
});

pool.on('connect', () => {
    console.log('PostgreSQL connected successfully!');
});

pool.on('error', (err) => {
    console.error('PostgreSQL connection error:', err.stack);
    process.exit(-1); // Exit if DB connection fails
});

export const query = (text, params) => pool.query(text, params);

export default pool; // Export the pool if needed elsewhere directly