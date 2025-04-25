import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/index.js'; // Your DB query function
import { asyncHandler } from '../utils/asyncHandler.js'; // Error handling wrapper
import { ApiError } from '../utils/ApiError.js';       // Custom error class
import { ApiResponse } from '../utils/ApiResponse.js'; // Standard response class

// --- Define the required domain ---
const REQUIRED_EMAIL_DOMAIN = "@igdtuw.ac.in"; // Make it lowercase for case-insensitive comparison

// --- Helper Function to Generate Tokens ---
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        // Fetch user details needed for the token payload (example)
        const userResult = await query('SELECT user_id, email, username FROM users WHERE user_id = $1', [userId]);
        if (userResult.rows.length === 0) {
            throw new ApiError(500, "User not found after token generation request");
        }
        const user = userResult.rows[0];

        // Create Access Token
        const accessToken = jwt.sign(
            {
                _id: user.user_id, // Use standard _id or your primary key name
                email: user.email,
                username: user.username,
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        );

        // Create Refresh Token (longer expiry)
        const refreshToken = jwt.sign(
            {
                _id: user.user_id,
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
        );

        // **Important Security Step**: Store the HASHED refresh token in the DB
        // You might want to hash it before storing, or store it directly if your security model allows
        // Let's assume for now we store it directly for simplicity, but hashing is better.
        await query('UPDATE users SET refresh_token = $1 WHERE user_id = $2', [refreshToken, userId]);


        return { accessToken, refreshToken };

    } catch (error) {
        // Log the detailed error if needed
        console.error("Token Generation Error:", error);
        throw new ApiError(500, "Something went wrong while generating refresh and access tokens");
    }
};


// --- Controller for User Registration ---
const registerUser = asyncHandler(async (req, res) => {
    // 1. Get user details from request body
    const { username, email, password, fullName } = req.body;

    // 2. Validate input (Basic - add more robust validation as needed)
    if ([username, email, password].some((field) => !field || field?.trim() === "")) {
        throw new ApiError(400, "Username, email, and password are required");
    }

    if (!email || typeof email !== 'string' || !email.toLowerCase().endsWith(REQUIRED_EMAIL_DOMAIN)) {
        throw new ApiError(
            400, // Bad Request status
            `Registration is restricted to users with a valid '${REQUIRED_EMAIL_DOMAIN}' email address.`
        );
    }

    // 3. Check if user already exists (username or email)
    const emailCheckQuery = 'SELECT user_id FROM users WHERE email = $1';
    const existingUserResult = await query(emailCheckQuery, [email.toLowerCase()]); // Check lowercase email

    if (existingUserResult.rows.length > 0) {
        // Throw error specifically about the email being taken
        throw new ApiError(409, "An account with this email address already exists"); // 409 Conflict
    }

    // 4. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Insert user into database
    const insertQuery = `
        INSERT INTO users (username, email, password_hash, full_name)
        VALUES ($1, $2, $3, $4)
        RETURNING user_id, username, email, full_name, created_at; -- Return non-sensitive data
    `;
    const newUserResult = await query(insertQuery, [username, email, hashedPassword, fullName]);

    if (newUserResult.rows.length === 0) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    const createdUser = newUserResult.rows[0];

    // 6. Return response
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

// --- Controller for User Login (Email Only) ---
const loginUser = asyncHandler(async (req, res) => {
    // 1. Get credentials - Expect 'email' specifically now
    const { email, password } = req.body;

    // 2. Validate required input fields
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    // 3. Optional but recommended: Validate email format/domain early
    //    This prevents unnecessary DB queries for clearly invalid inputs.
    //    Use a generic error message to avoid revealing whether an email
    //    exists outside the allowed domain.
    if (typeof email !== 'string' || !email.toLowerCase().endsWith(REQUIRED_EMAIL_DOMAIN)) {
         throw new ApiError(401, "Invalid user credentials");
        // Alternative, more specific error (less secure as it confirms domain requirement):
        // throw new ApiError(400, `Login is restricted to users with a valid '${REQUIRED_EMAIL_DOMAIN}' email address.`);
    }

    // 4. Find user in database BY EMAIL ONLY (case-insensitive)
    const findUserQuery = `
        SELECT user_id, username, email, password_hash, full_name
        FROM users
        WHERE email = $1;
    `;
    const userResult = await query(findUserQuery, [email.toLowerCase()]); // Use lowercase for consistent matching

    // 5. Check if user exists
    if (userResult.rows.length === 0) {
        // Throw a generic 401 Unauthorized error.
        // Avoid confirming whether the email exists or not for security.
        throw new ApiError(401, "Invalid user credentials");
    }

    const user = userResult.rows[0];

    // 6. Compare provided password with stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
        // Again, generic error
        throw new ApiError(401, "Invalid user credentials");
    }

    // 7. Passwords match - Generate Access and Refresh Tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user.user_id);

    // 8. Prepare user data to send back (exclude sensitive info)
    const loggedInUser = { ...user };
    delete loggedInUser.password_hash; // Remove password hash

    // 9. Set cookies (HttpOnly for security)
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    };

    // 10. Send tokens in cookies and user data in response body
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken }, // Consider if you still need to send tokens in body
                "User logged in successfully"
            )
        );
});

// --- Controller for User Logout ---
const logoutUser = asyncHandler(async (req, res) => {
    // The verifyJWT middleware should have added req.user
    const userId = req.user?._id; // Get user ID from the verified token payload

    if (!userId) {
        throw new ApiError(400, "User ID not found in request after verification");
    }

    // 1. Clear the refresh token from the database for this user
    await query(
        'UPDATE users SET refresh_token = NULL WHERE user_id = $1',
        [userId]
    );

    // 2. Clear the cookies on the client side
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});


export {
    registerUser,
    loginUser,
    logoutUser,
    // refreshAccessToken // export if implemented
};