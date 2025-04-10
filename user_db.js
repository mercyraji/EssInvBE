// user_db.js (Rewritten to use corrected CreateUserpass.js)

// Import the corrected CommonJS-compatible functions
const { hashPass, checkUserPass } = require('./CreateUserpass.js');

// --- In-Memory Store ---
const usersById = {};
const usersByUsername = {};
const usersByEmail = {};
let nextUserId = 1;

// Salt rounds needed for hashPass function
const saltRounds = 10;

// --- Database Functions ---

/**
 * Adds a new user using corrected hashPass.
 */
async function addUser(username, email, plainPassword) {
    if (!username || !email || !plainPassword) {
        console.error("Error: Username, email, and password are required.");
        return null; // Or throw a validation error
    }
    // Case-insensitive checks
    if (usersByUsername[username.toLowerCase()]) {
        console.warn(`Warning: Username "${username}" already exists.`);
        return null;
    }
    if (usersByEmail[email.toLowerCase()]) {
        console.warn(`Warning: Email "${email}" already exists.`);
        return null;
    }

    try {
        // Hash the password using the imported async hashPass function
        const hashedPassword = await hashPass(saltRounds, plainPassword);

        // Create and store user if hashing was successful
        const newUser = {
            id: nextUserId,
            username: username,
            email: email,
            hashedPassword: hashedPassword, // Store the returned hash
            createdAt: new Date()
        };

        usersById[newUser.id] = newUser;
        usersByUsername[username.toLowerCase()] = newUser;
        usersByEmail[email.toLowerCase()] = newUser;
        nextUserId++;

        console.log(`User "${username}" (ID: ${newUser.id}) added successfully.`);

        const { hashedPassword: _, ...userData } = newUser;
        return userData; // Return user data without hash

    } catch (error) {
        // Catch errors thrown by hashPass or other issues
        console.error(`Error adding user "${username}":`, error.message || error);
        // Do not proceed with user creation if hashing failed
        // Optionally re-throw or return a specific error indicator
        throw new Error(`Failed to add user "${username}" due to a server error.`);
    }
}

// --- Find functions remain the same ---

async function findUserById(id) {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) return null;
    const user = usersById[userId];
    if (user) {
        const { hashedPassword, ...userData } = user;
        return userData;
    }
    return null;
}

async function findUserByUsername(username) {
    if (!username) return null;
    const user = usersByUsername[username.toLowerCase()];
     if (user) {
        const { hashedPassword, ...userData } = user;
        return userData;
    }
    return null;
}

async function findUserByEmail(email) {
    if (!email) return null;
    const user = usersByEmail[email.toLowerCase()];
     if (user) {
        const { hashedPassword, ...userData } = user;
        return userData;
    }
    return null;
}

// --- Verify functions use corrected checkUserPass ---

/**
 * Verifies password by username using corrected checkUserPass.
 */
async function verifyPasswordByUsername(username, plainPassword) {
    if (!username || !plainPassword) return false;

    const user = usersByUsername[username.toLowerCase()];
    if (!user) {
        console.log(`Verification failed: Username "${username}" not found.`);
        return false; // User not found
    }

    try {
        // Compare passwords using the imported async checkUserPass function
        const match = await checkUserPass(plainPassword, user.hashedPassword);
        return match; // Returns true or false
    } catch (error) {
        // Catch errors thrown by checkUserPass
        console.error(`Error verifying password for username "${username}":`, error.message || error);
        return false; // Return false on error
    }
}

/**
 * Verifies password by email using corrected checkUserPass.
 */
async function verifyPasswordByEmail(email, plainPassword) {
    if (!email || !plainPassword) return false;

    const user = usersByEmail[email.toLowerCase()];
    if (!user) {
         console.log(`Verification failed: Email "${email}" not found.`);
        return false; // User not found
    }

    try {
        // Compare passwords using the imported async checkUserPass function
        const match = await checkUserPass(plainPassword, user.hashedPassword);
        return match; // Returns true or false
    } catch (error) {
         // Catch errors thrown by checkUserPass
        console.error(`Error verifying password for email "${email}":`, error.message || error);
        return false; // Return false on error
    }
}

// --- Export the public functions ---
module.exports = {
    addUser,
    findUserById,
    findUserByUsername,
    findUserByEmail,
    verifyPasswordByUsername,
    verifyPasswordByEmail,
};
