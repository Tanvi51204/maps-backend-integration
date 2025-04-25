import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

// Middleware Setup
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*', // Allow requests from your frontend origin
    credentials: true // Allow cookies to be sent/received
}));

app.use(express.json({ limit: '16kb' })); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true, limit: '16kb' })); // Parse URL-encoded bodies
app.use(express.static("public")); // If you have static assets in the backend (optional)
app.use(cookieParser()); // Parse cookies

// --- Routes ---
// Import routers
import authRouter from './routes/auth.routes.js';
// Import other routers as needed (e.g., floorplanRouter, roomRouter)

// Declare routes
app.use('/api/v1/auth', authRouter); // Mount auth routes under /api/v1/auth
// app.use('/api/v1/floorplans', floorplanRouter); // Example for other routes

// Basic health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', message: 'Server is running' });
});

// --- Error Handling Middleware (optional but recommended) ---
// import { errorHandler } from './middlewares/error.middleware.js';
// app.use(errorHandler);


export { app };