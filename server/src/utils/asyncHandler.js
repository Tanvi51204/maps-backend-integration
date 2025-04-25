/**
 * Wraps an asynchronous request handler function to catch errors and pass them to Express's next() middleware.
 * This avoids the need for explicit try-catch blocks in every async controller/middleware.
 *
 * @param {Function} requestHandler - The asynchronous function to wrap (typically an Express route handler).
 * @returns {Function} An Express route handler function that catches errors.
 */
 const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        // Ensure the requestHandler returns a promise and catch any potential rejection (error)
        Promise.resolve(requestHandler(req, res, next))
               .catch((err) => next(err)); // Pass the error to the next middleware (usually the error handler)
    };
};


// --- Alternative using try-catch (does the same thing) ---
// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next);
//     } catch (error) {
//         // Send error to the error handling middleware
//         next(error);
//         // Optionally, you could format the error here, but it's better done in a dedicated error middleware
//         // res.status(error.code || 500).json({
//         //     success: false,
//         //     message: error.message
//         // });
//     }
// }


export { asyncHandler };