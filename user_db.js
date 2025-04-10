// user_db.js (In-Memory Version, Using ESM)

// Assumes corrected CreateUserpass.js also uses ESM and works correctly
import { hashPass, checkUserPass } from './CreateUserpass.js';

// --- In-Memory Store ---
const usersById = {};
const usersByUsername = {};
const usersByEmail = {};
let nextUserId = 1;

// Salt rounds needed for hashPass function (if CreateUserpass requires it)
const saltRounds = 10;

// --- Database Functions ---

/**
 * Adds a new user using hashPass.
 */
export async function addUser(username, email, plainPassword) { // Use export
    if (!username || !email || !plainPassword) {
        console.error("Error: Username, email, and password are required.");
        return null;
    }
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

        console.log(`[user_db] User "${username}" (ID: ${newUser.id}) added successfully.`);

        const { hashedPassword: _, ...userData } = newUser;
        return userData; // Return user data without hash

    } catch (error) {
        console.error(`[user_db] Error adding user "${username}":`, error.message || error);
        throw new Error(`Failed to add user "${username}" due to a server error.`);
    }
}

/**
 * Finds a user by their ID.
 */
export async function findUserById(id) { // Use export
    const userId = parseInt(id, 10);
    if (isNaN(userId)) return null;
    const user = usersById[userId];
    if (user) {
        const { hashedPassword, ...userData } = user;
        return userData;
    }
    return null;
}

/**
 * Finds a user by their username (case-insensitive).
 */
export async function findUserByUsername(username) { // Use export
    if (!username) return null;
    const user = usersByUsername[username.toLowerCase()];
     if (user) {
        const { hashedPassword, ...userData } = user;
        return userData;
    }
    return null;
}

/**
 * Finds a user by their email (case-insensitive).
 */
export async function findUserByEmail(email) { // Use export
    if (!email) return null;
    const user = usersByEmail[email.toLowerCase()];
     if (user) {
        const { hashedPassword, ...userData } = user;
        return userData;
    }
    return null;
}

/**
 * Verifies password by username using checkUserPass.
 */
export async function verifyPasswordByUsername(username, plainPassword) { // Use export
    if (!username || !plainPassword) return false;
    const user = usersByUsername[username.toLowerCase()];
    if (!user) {
        console.log(`[user_db] Verification failed: Username "${username}" not found.`);
        return false;
    }
    try {
        const match = await checkUserPass(plainPassword, user.hashedPassword);
        return match;
    } catch (error) {
        console.error(`[user_db] Error verifying password for username "${username}":`, error.message || error);
        return false;
    }
}

/**
 * Verifies password by email using checkUserPass.
 */
export async function verifyPasswordByEmail(email, plainPassword) { // Use export
    if (!email || !plainPassword) return false;
    const user = usersByEmail[email.toLowerCase()];
    if (!user) {
         console.log(`[user_db] Verification failed: Email "${email}" not found.`);
        return false;
    }
    try {
        const match = await checkUserPass(plainPassword, user.hashedPassword);
        return match;
    } catch (error) {
        console.error(`[user_db] Error verifying password for email "${email}":`, error.message || error);
        return false;
    }
}
