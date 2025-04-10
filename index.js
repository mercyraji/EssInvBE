import sqlite3 from "sqlite3";
import express from "express";
import cors from "cors";

import { createTables } from "./createTables.js";
import { insertInv, insertOrder, insertUser } from "./insert.js";
import { fetchAll, fetchFirst } from "./fetch.js";
import { insertNewItem, updateInv } from "./updateTable.js";
import { createAuthRoutes } from './auth.js'; //createuserpass functionality
import { getAllUsers } from './user_db.js'; // Importing the new function from user_db.js

const db = new sqlite3.Database("ess-inv.db");

// initializes database and insert inventory, users, and an order for a student
try {
    await createTables();  // Ensure tables are created first
    await insertInv(); // product names are unique so if you restart program, shouldn't see any dupes
    await insertUser(); // email is unique so if you restart program, shouldn't see any dupes
    await insertOrder('student@umbc.edu', 10, 10, 'GITS Veg Biryani'); // example order
    console.log("Database initialized successfully!");
} catch (error) {
    console.error("Error initializing database:", error);
}

//console.log("Node.js + SQLite");

const app = express();
app.use(cors()); // allows requests from frontend
app.use(express.json()); // parses incoming json data

// --- Routes ---

// Authentication Routes (Mounted under /auth)
console.log("Mounting authentication routes...");
const authRoutes = createAuthRoutes(db); // Create router, passing the db connection
app.use('/auth', authRoutes); // Mount under /auth prefix
console.log("Authentication routes mounted under /auth");

// retrieves all the inventory items from the inventory table and sends it to the front end
app.get("/getInventory", async (req, res) => {
    const sql = "SELECT * FROM Inventory";
    try {
        const items = await fetchAll(db, sql);
        res.json(items);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

// gets all the orders in the orders table and sends it to the front end
app.get("/getOrders", async (req, res) => {
    const sql = "SELECT * FROM Orders";
    try {
        const items = await fetchAll(db, sql);
        res.json(items);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

/*
// gets all the users in the users table and sends it to the front end
app.get("/getUsers", async (req, res) => {
    const sql = "SELECT * FROM Users";
    try {
        const items = await fetchAll(db, sql);
        res.json(items);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});
*/

// Gets all the users (Rewritten to use user_db.js)
app.get("/getUsers", (req, res) => { // 'async' keyword likely not needed now
    console.log("Executing /getUsers request (using in-memory store)...")
    try {
        // Call the function from user_db.js
        const users = getAllUsers();
        // Send the result (array of user objects without hashes)
        res.json(users);
    } catch (err) {
        // Although unlikely for in-memory access unless getAllUsers throws an error
        console.error("Error retrieving users from in-memory store:", err);
        res.status(500).json({ error: "Failed to retrieve users" });
    }
});

// adds a new item to the inventory table based on the completed add item form in frontend
app.post('/addInventoryItem', async (req, res) => {
    const {productName, weight, price, quantity} = req.body; // gets front-end form details

    // validate data sent from front-end
    if (!productName || !weight || !price || !quantity) {
        return res.status(400).json({ message: 'Missing fields in request body' });
    }

    try {
        await insertNewItem(productName, weight, price, quantity); // inserts new item
        res.status(201).json({message: "Inventory item added successfully"});
    } catch (err) {
        console.error("Error adding new item to inventory");
        res.status(500).json({message: "Failed to add new item to inventory"});
    }
});

// requires order details in the form of [{product_name: 'Name', product_quantity: #, product_total_weight: #}, ...] from frontend
// using order details, will update the inventory table based on the details & insert user's order
// updateInv() includes insertOrder()
app.post('/finalizeOrder', async (req, res) => {
    const {orderDetails, email} = req.body;
    
    if (!Array.isArray(orderDetails) || orderDetails.length === 0 || !email){
        return res.status(400).json({message: 'Invalid order details or missing email'});
    }

    try {
        await updateInv(orderDetails, email);
        res.status(200).json({message: 'Inventory updated successfully after finalized order & user order inserted'});
    } catch (err) {
        console.error("Error finalizing order: ", err);
        res.status(500).json({message: 'Failed to update inventory after student\'s finalized order'});
    }

});

// --- Basic Root Route ---
app.get('/', (req, res) => {
    res.send('Backend Server is Running');
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error("Unhandled application error:", err.stack || err.message || err);
  res.status(500).json({ success: false, message: 'An internal server error occurred!' });
});

// start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
