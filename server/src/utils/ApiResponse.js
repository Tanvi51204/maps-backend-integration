/**
 * Standardized API Response class for successful requests.
 */
 class ApiResponse {
    /**
     * Creates an instance of ApiResponse.
     * @param {number} statusCode - The HTTP status code for the success response.
     * @param {any} data - The data payload to be included in the response.
     * @param {string} message - A descriptive message for the response (defaults to "Success").
     */
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.data = data; // The actual data being sent back
        this.message = message;
        this.success = statusCode < 400; // Determine success based on status code (typically < 400)
    }
}

export { ApiResponse };