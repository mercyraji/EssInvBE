// validationUtils.js (Using ESM export)

/**
 * Basic email format validation.
 * @param {string} email - The email string to validate.
 * @returns {boolean} True if the email format is considered valid, false otherwise.
 */
export const isValidEmail = (email) => { // Use export
    if (!email || typeof email !== 'string') {
        return false;
    }
    // Basic regex for email format - can be more complex if needed
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Checks if a password meets basic criteria (e.g., minimum length).
 * Add more complex rules as needed (uppercase, numbers, symbols).
 * @param {string} password - The password string to validate.
 * @param {number} minLength - The minimum required length. Default 8.
 * @returns {boolean} True if the password meets the criteria, false otherwise.
 */
export const isValidPassword = (password, minLength = 8) => { // Use export
    return password && typeof password === 'string' && password.length >= minLength;
};
