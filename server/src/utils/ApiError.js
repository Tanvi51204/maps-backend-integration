/**
 * Custom Error class for handling API-specific errors.
 * Extends the built-in Error class to provide additional context like status code.
 */
 class ApiError extends Error {
    /**
     * Creates an instance of ApiError.
     * @param {number} statusCode - The HTTP status code for the error response.
     * @param {string} message - The error message (defaults to a standard message for the status code).
     * @param {Array} errors - An optional array of detailed error messages or validation errors.
     * @param {string} stack - An optional custom stack trace.
     */
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        // Call the parent constructor (Error) with the message
        super(message);

        // Assign custom properties
        this.statusCode = statusCode;
        this.data = null; // Standardize response structure, data is null for errors
        this.message = message;
        this.success = false; // Indicates failure in the standard response structure
        this.errors = errors; // Array for more detailed or validation errors

        // Capture stack trace if not provided, otherwise use the provided one
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };