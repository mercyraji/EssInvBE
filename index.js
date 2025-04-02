import sqlite3 from "sqlite3";
import { createTables } from "./createTables.js";
import { insertInv, insertOrder, insertUser } from "./insert.js";
import { fetchAll, fetchFirst } from "./fetch.js";
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


app.get("/getInventory", async (req, res) => {
    const sql = "SELECT * FROM Inventory";
    try {
        const items = await fetchAll(db, sql);
        res.json(items);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

app.get("/getOrders", async (req, res) => {
    const sql = "SELECT * FROM Orders";
    try {
        const items = await fetchAll(db, sql);
        res.json(items);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

app.get("/getUsers", async (req, res) => {
    const sql = "SELECT * FROM Users";
    try {
        const items = await fetchAll(db, sql);
        res.json(items);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});


// start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});