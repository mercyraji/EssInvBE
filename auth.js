// auth.js (Database-Backed, Using ESM)

import express from 'express';
import bcrypt from 'bcrypt'; // Using bcrypt directly here for simplicity
import { isValidEmail, isValidPassword } from './validationUtils.js';
import { fetchFirst } from './fetch.js'; // Assuming fetch.js uses ESM export

const saltRounds = 10; // Or load from config

// Export the factory function using ESM 'export'
export const createAuthRoutes = (db) => {
    const router = express.Router();

    // --- Signup Route ---
    // Path will be '/auth/signup' because of how it's mounted in index.js
    router.post('/signup', async (req, res) => {
        const { email, password /* Add other fields like first_name, last_name if in DB */ } = req.body;

        // --- Input Validation ---
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format.' });
        }
        // Using default minLength of 8 from validationUtils
        if (!isValidPassword(password)) {
             return res.status(400).json({ success: false, message: `Password must be at least 8 characters long.` });
        }
        // Add validation for other fields if necessary...

        try {
            // --- Check for Duplicate Email (Case-Insensitive) using fetchFirst ---
            const checkSql = 'SELECT user_id FROM Users WHERE LOWER(email) = LOWER(?)';
            const existingUser = await fetchFirst(db, checkSql, [email]);

            if (existingUser) {
                // 409 Conflict is appropriate for duplicate resource
                return res.status(409).json({ success: false, message: 'Email address is already registered.' });
            }

            // --- Hash the Password ---
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // --- Insert New User ---
            // Adjust table/column names as needed (e.g., 'Users', 'email', 'hashed_pass')
            // Keep custom Promise wrapper for db.run here to get lastID
            const insertSql = 'INSERT INTO Users (email, hashed_pass /*, first_name, last_name */) VALUES (?, ? /*, ?, ? */)';
            const { lastID } = await new Promise((resolve, reject) => {
                 // Use function() to access 'this' context for lastID/changes
                db.run(insertSql, [email, hashedPassword /*, firstName, lastName */], function(err) {
                    if (err) {
                        console.error('[Auth] Database error inserting user:', err.message);
                        return reject(new Error('Database error inserting user.'));
                    }
                    resolve({ lastID: this.lastID, changes: this.changes });
                });
            });

             console.log(`[Auth] User created successfully with ID: ${lastID}`);
             // Send success response to frontend
            res.status(201).json({ success: true, message: 'Account created successfully.', userId: lastID }); // 201 Created

        } catch (error) {
            console.error('[Auth] Signup process error:', error.message || error);
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
            // --- Find User by Email (Case-Insensitive) using fetchFirst ---
            // Adjust table/column names ('Users', 'email', 'hashed_pass', 'user_id')
            const findSql = 'SELECT user_id, email, hashed_pass FROM Users WHERE LOWER(email) = LOWER(?)';
            const user = await fetchFirst(db, findSql, [email]);

            // --- Verify User and Password ---
            if (!user) {
                // Use a generic message for security (don't reveal if email exists)
                return res.status(401).json({ success: false, message: 'Invalid email or password.' }); // 401 Unauthorized
            }

            // Compare provided password with the stored hash
            const passwordMatch = await bcrypt.compare(password, user.hashed_pass);

            if (passwordMatch) {
                // Passwords match! Login successful.
                console.log(`[Auth] Login successful for user ID: ${user.user_id}`);
                // IMPORTANT: In a real app, generate a session token (JWT) here
                res.status(200).json({
                    success: true,
                    message: 'Login successful.',
                    user: { // Send only non-sensitive info
                        id: user.user_id,
                        email: user.email
                        // Add other safe fields like name, user_type if needed
                    }
                    // token: generatedToken // Example if using JWT
                 });
            } else {
                // Passwords don't match
                console.log(`[Auth] Login failed: Incorrect password for email ${email}`);
                return res.status(401).json({ success: false, message: 'Invalid email or password.' }); // 401 Unauthorized
            }

        } catch (error) {
            console.error('[Auth] Login process error:', error.message || error);
            res.status(500).json({ success: false, message: 'An error occurred during login. Please try again later.' });
        }
    });

    // Return the configured router instance
    return router;
};
