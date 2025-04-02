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
            total_weight INTEGER NOT NULL)`
        );
        
    } catch (error){
        console.log(error);
    }

    try {
        await execute(db,
            `CREATE TABLE IF NOT EXISTS Users (
            user_id INTEGER PRIMARY KEY, 
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email  TEXT UNIQUE NOT NULL,
            hashed_pass TEXT NOT NULL,
            user_type INTEGER NOT NULL)`
        );
        
    } catch (error){
        console.log(error);
    }

    try {
        await execute(db,
            `CREATE TABLE IF NOT EXISTS Orders (
            order_id INTEGER PRIMARY KEY, 
            user_id INTEGER NOT NULL,
            total_weight INTEGER NOT NULL,
            total_quantity INTEGER NOT NULL,
            product_names TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES Users(user_id)
            )`
        );
        
    } catch (error){
        console.log(error);
    }

    db.close();
};

