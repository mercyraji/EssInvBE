import sqlite3 from "sqlite3";
import { createTables } from "./createTables.js";
import { insertInv, insertOrder, insertUser } from "./insert.js";
import { fetchAll, fetchFirst } from "./fetch.js";
import { insertNewItem, updateInv } from "./updateTable.js";
import express from "express";
import cors from "cors";

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

// start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});