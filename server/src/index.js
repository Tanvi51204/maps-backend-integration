import dotenv from 'dotenv';
import pool from './db/index.js'; // Import the pool to initiate connection check
import { app } from './app.js';

dotenv.config({
    path: './.env'
});

const PORT = process.env.PORT || 3000;

pool.query('SELECT NOW()')
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running at: http://localhost:${PORT}`);
        });
    })
    .catch(error => {
        console.error('Failed to connect to the database:', error);
        process.exit(1);
    });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  // Close server & exit process
  // Consider more graceful shutdown logic here
  process.exit(1);
});