// auth.js (Rewritten to use in-memory user_db.js)

import express from 'express';
// Import functions from the in-memory user store
import { addUser, findUserByEmail, verifyPasswordByEmail } from './user_db.js';
// Import validation utilities
import { isValidEmail, isValidPassword } from './validationUtils.js';

// No longer needs 'db' or 'fetchFirst' or 'bcrypt' directly

// Export the factory function (no longer needs 'db' parameter)
export const createAuthRoutes = () => {
    const router = express.Router();

    // --- Signup Route ---
    // Path will be '/auth/signup'
    // NOTE: Now expects username, email, password based on user_db.addUser requirement
    router.post('/signup', async (req, res) => {
        const { username, email, password } = req.body; // Now expecting username

        // --- Input Validation ---
        // Add check for username
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: 'Username, email and password are required.' });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format.' });
        }
        if (!isValidPassword(password)) { // Using default minLength of 8
             return res.status(400).json({ success: false, message: `Password must be at least 8 characters long.` });
        }
        // Add any other specific username validation if needed

        try {
            // --- Add user using user_db.js ---
            // addUser handles duplicate checks internally (returns null if duplicate)
            const newUser = await addUser(username, email, password);

            if (newUser) {
                // User added successfully (newUser contains user data excluding hash)
                console.log(`[Auth/InMemory] User created successfully: ${newUser.username} (ID: ${newUser.id})`);
                res.status(201).json({
                    success: true,
                    message: 'Account created successfully.',
                    // Return the non-sensitive user data received from addUser
                    user: newUser
                });
            } else {
                // addUser returned null, likely due to duplicate username/email
                // user_db.js already logs warnings for duplicates
                return res.status(409).json({ success: false, message: 'Username or email already exists.' }); // 409 Conflict
            }

        } catch (error) {
            // Catch errors potentially thrown by addUser (e.g., hashing errors if CreateUserpass throws)
            console.error('[Auth/InMemory] Signup process error:', error.message || error);
            res.status(500).json({ success: false, message: 'An error occurred during signup. Please try again later.' });
        }
    });

    // --- Login Route ---
    // Path will be '/auth/login'
    router.post('/login', async (req, res) => {
        const { email, password } = req.body;

        // --- Input Validation ---
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }
        if (!isValidEmail(email)) {
             return res.status(400).json({ success: false, message: 'Invalid email format provided.' });
        }

        try {
            // --- Verify password using user_db.js (checks email and password match) ---
            const passwordMatch = await verifyPasswordByEmail(email, password);

            if (passwordMatch) {
                // Passwords match! Find user data to return (excluding hash)
                const user = await findUserByEmail(email); // Use user_db function

                if (user) {
                     console.log(`[Auth/InMemory] Login successful for user: ${user.username} (ID: ${user.id})`);
                    // IMPORTANT: No JWT generated here yet
                    res.status(200).json({
                        success: true,
                        message: 'Login successful.',
                        user: user // Send user data retrieved from findUserByEmail
                     });
                } else {
                    // Should ideally not happen if verifyPasswordByEmail succeeded, but handle defensively
                     console.error(`[Auth/InMemory] Login error: Password verified but user ${email} not found.`);
                     res.status(500).json({ success: false, message: 'Login failed due to an internal error.' });
                }

            } else {
                // verifyPasswordByEmail returned false (wrong email/password)
                // user_db.js already logs attempts for non-existent users or wrong passwords
                console.log(`[Auth/InMemory] Login failed: Invalid credentials for email ${email}`);
                return res.status(401).json({ success: false, message: 'Invalid email or password.' }); // 401 Unauthorized
            }

        } catch (error) {
            // Catch errors potentially thrown by verifyPasswordByEmail or findUserByEmail
            console.error('[Auth/InMemory] Login process error:', error.message || error);
            res.status(500).json({ success: false, message: 'An error occurred during login. Please try again later.' });
        }
    });

    // Return the configured router instance
    return router;
};
