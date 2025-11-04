/**
 * 📝 Logging utilities for Quiz Crafter
 */

/**
 * Log a message with an emoji prefix
 * @param {string} emoji - The emoji to display
 * @param {string} message - The message to log
 */
export const log = (emoji, message) => console.log(`${emoji} ${message}`);

/**
 * Log an error with detailed information
 * @param {string} message - Error message context
 * @param {Error|Object} error - The error object
 */
export const logError = (message, error) => {
    console.error(`❌ ${message}`);

    if (error?.response?.data) {
        console.error(error.response.data);
    } else if (error?.message) {
        console.error(error.message);
    } else {
        console.dir(error, { depth: null });
    }
};

/**
 * Log success message
 * @param {string} message - Success message
 */
export const logSuccess = (message) => log("✅", message);

/**
 * Log info message
 * @param {string} message - Info message
 */
export const logInfo = (message) => log("ℹ️", message);

/**
 * Log warning message
 * @param {string} message - Warning message
 */
export const logWarning = (message) => log("⚠️", message);
