import sqlite3 from "sqlite3";
import { execute } from "./sql.js";

// creates all the tables for inventory, users, and orders
export const createTables = async () => {
    const db = new sqlite3.Database("ess-inv.db");
    try {
        await execute(db,
            `CREATE TABLE IF NOT EXISTS Inventory (
            product_id INTEGER PRIMARY KEY, 
            product_name TEXT UNIQUE NOT NULL,
            weight INTEGER NOT NULL,
            price REAL NOT NULL,
            quantity INTEGER NOT NULL,
            category TEXT NOT NULL,
            total_weight INTEGER NOT NULL)`
        );
        
    } catch (error){
        console.log(error);
    }

    try {
        await execute(db,
            `CREATE TABLE IF NOT EXISTS Users (
            user_id INTEGER PRIMARY KEY,
            email TEXT UNIQUE NOT NULL, 
            display_name TEXT,
            role INTEGER NOT NULL)`
        );
        
    } catch (error){
        console.log(error);
    }

    try {
        await execute(db,
            `CREATE TABLE IF NOT EXISTS Orders (
            order_id INTEGER PRIMARY KEY, 
            user_email INTEGER NOT NULL,
            total_weight INTEGER NOT NULL,
            total_quantity INTEGER NOT NULL,
            product_name TEXT NOT NULL,
            total_price INTEGER NOT NULL,
            category TEXT NOT NULL,
            order_date TEXT DEFAULT (datetime('now', 'localtime')),
            FOREIGN KEY (user_email) REFERENCES Users(email)
            )`
        );
        
    } catch (error){
        console.log(error);
    }

    try {
        await execute(db,
            `CREATE TABLE IF NOT EXISTS Visits (
            visit_id INTEGER PRIMARY KEY, 
            user_email TEXT,
            visit_time TEXT DEFAULT (datetime('now', 'localtime')),
            FOREIGN KEY (user_email) REFERENCES Users(email)
            )`
        );
        
    } catch (error){
        console.log(error);
    }

    db.close();
};

