import { Router } from 'express';
import {
    registerUser,
    loginUser,
    logoutUser,
    // Add refreshAccessToken controller if implementing token refresh
    // refreshAccessToken
} from '../controllers/auth.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// --- Public Routes ---
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

// --- Secured Routes ---
// These routes require the user to be logged in (valid JWT)
router.route('/logout').post(verifyJWT, logoutUser); // verifyJWT middleware runs first

// Optional: Route to refresh the access token using a refresh token
// router.route("/refresh-token").post(refreshAccessToken);

// Optional: A route to check if the user is currently logged in
// router.route("/me").get(verifyJWT, (req, res) => {
//    res.status(200).json(new ApiResponse(200, req.user, "User fetched successfully"));
// });

export default router;