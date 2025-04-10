// auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const { isValidEmail, isValidPassword } = require('./validationUtils'); // Import validation functions
const router = express.Router();

// Cost factor for bcrypt hashing
const saltRounds = 10;

// This module exports a function that takes the database connection
// and returns the configured router
module.exports = (db) => {

    // --- Signup Route ---
    // Expects { email: "...", password: "..." } in request body
    router.post('/signup', async (req, res) => {
        const { email, password /* Add other fields like first_name, last_name if needed */ } = req.body;

        // --- Input Validation ---
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format.' });
        }
        if (!isValidPassword(password)) { // Basic length check
             return res.status(400).json({ success: false, message: `Password must be at least ${8} characters long.` }); // Assuming default 8
        }
        // Add validation for other fields if necessary

        try {
            // --- Check for Duplicate Email (Case-Insensitive) ---
            const checkSql = 'SELECT user_id FROM Users WHERE LOWER(email) = LOWER(?)';
            const existingUser = await new Promise((resolve, reject) => {
                // Use db.get for checking existence (fetches max 1 row)
                db.get(checkSql, [email], (err, row) => {
                    if (err) {
                        console.error('Database error checking email:', err.message);
                        return reject(new Error('Database error checking email.')); // Generic error for promise
                    }
                    resolve(row); // Returns the row if found, otherwise undefined
                });
            });

            if (existingUser) {
                return res.status(409).json({ success: false, message: 'Email address is already registered.' }); // 409 Conflict
            }

            // --- Hash the Password ---
            // If using your custom hashPass: const hashedPassword = await hashPass(saltRounds, password);
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // --- Insert New User ---
            // Adjust table/column names as per your schema (e.g., 'Users', 'email', 'hashed_pass')
            const insertSql = 'INSERT INTO Users (email, hashed_pass /*, first_name, last_name */) VALUES (?, ? /*, ?, ? */)';
            // If using user_id PK, you might want the lastID
            const { lastID } = await new Promise((resolve, reject) => {
                 // Use function() to access 'this' context for lastID/changes
                db.run(insertSql, [email, hashedPassword /*, firstName, lastName */], function(err) {
                    if (err) {
                        console.error('Database error inserting user:', err.message);
                        return reject(new Error('Database error inserting user.'));
                    }
                     // 'this' contains properties like lastID and changes
                    resolve({ lastID: this.lastID, changes: this.changes });
                });
            });

             console.log(`User created successfully with ID: ${lastID}`);
             // Send success response to frontend
            res.status(201).json({ success: true, message: 'Account created successfully.', userId: lastID }); // 201 Created

        } catch (error) {
            console.error('Signup process error:', error.message);
            // Don't send detailed database errors to the client
            res.status(500).json({ success: false, message: 'An error occurred during signup. Please try again later.' });
        }
    });

    // --- Login Route ---
    // Expects { email: "...", password: "..." } in request body
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
            // --- Find User by Email (Case-Insensitive) ---
            // Adjust table/column names as needed ('Users', 'email', 'hashed_pass', 'user_id')
            const findSql = 'SELECT user_id, email, hashed_pass FROM Users WHERE LOWER(email) = LOWER(?)';
            const user = await new Promise((resolve, reject) => {
                db.get(findSql, [email], (err, row) => {
                    if (err) {
                         console.error('Database error finding user:', err.message);
                         return reject(new Error('Database error finding user.'));
                    }
                    resolve(row); // Row or undefined
                });
            });

            // --- Verify User and Password ---
            if (!user) {
                // User not found - Use a generic message to avoid revealing if email exists
                return res.status(401).json({ success: false, message: 'Invalid email or password.' }); // 401 Unauthorized
            }

            // Compare provided password with the stored hash
            // If using your custom checkUserPass: const passwordMatch = checkUserPass(password, user.hashed_pass);
            const passwordMatch = await bcrypt.compare(password, user.hashed_pass);

            if (passwordMatch) {
                // Passwords match! Login successful.
                console.log(`Login successful for user ID: ${user.user_id}`);
                // Send success response - You might include some non-sensitive user data
                // IMPORTANT: In a real app, you'd typically generate a session token (JWT) here
                // and send that back instead of just a success message.
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
                return res.status(401).json({ success: false, message: 'Invalid email or password.' }); // 401 Unauthorized
            }

        } catch (error) {
            console.error('Login process error:', error.message);
            res.status(500).json({ success: false, message: 'An error occurred during login. Please try again later.' });
        }
    });

    // Return the configured router instance
    return router;
};
