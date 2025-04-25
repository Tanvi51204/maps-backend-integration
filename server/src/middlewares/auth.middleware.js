import jwt from 'jsonwebtoken';
import { query } from '../db/index.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // 1. Get token: from cookies (priority) or Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request: No token provided");
        }

        // 2. Verify the token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // 3. Find user in DB based on decoded token's ID (_id or user_id)
        //    Ensures the user still exists and hasn't been deleted/disabled
        const userResult = await query(
            'SELECT user_id, username, email, full_name FROM users WHERE user_id = $1',
            [decodedToken?._id] // Use the field name you put in the token payload (_id or user_id)
        );

        const user = userResult.rows[0];

        if (!user) {
            // User associated with the token doesn't exist anymore
            throw new ApiError(401, "Invalid Access Token: User not found");
        }

        // 4. Attach user object (without sensitive data) to the request
        req.user = user; // Make user data available in subsequent handlers
        next(); // Proceed to the next middleware or route handler

    } catch (error) {
        // Handle specific JWT errors or generic errors
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
            throw new ApiError(401, error?.message || "Invalid or expired access token");
        }
        // Re-throw other errors to be caught by the main error handler
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});