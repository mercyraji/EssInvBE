import sqlite3 from "sqlite3";
import { hashPass } from "./createUserPass.js";
import { execute } from "./sql.js";
import { fetchFirst } from "./fetch.js";

export const insertInv = async () => {
    const db = new sqlite3.Database("ess-inv.db");
    const sql = 'INSERT INTO Inventory(product_name, weight, price, quantity, total_weight) VALUES(?, ?, ?, ?, ?)';
    try {
        await execute(db, sql, ['Sona Masoori Rice', 20, 25, 13, 260]);
        await execute(db, sql, ['Toor Dahl (Red Lentils)', 7, 1.25, 1, 70]);
        await execute(db, sql, ['Black Chickpeas (Channa)', 7, 1.25, 2, 70]);
        await execute(db, sql, ['Maggi Noodles', 1, 0.50, 400, 400]);
        await execute(db, sql, ['Parle Kream Bour', 1, 0.49, 10, 10]);
        await execute(db, sql, ['P Hid Seek Bourb', 1, 0.49, 10, 10]);
        await execute(db, sql, ['Sw Masl Bana', 1, 1.99, 10, 10]);
        await execute(db, sql, ['Gop Snack Pe Cho', 1, 1.29, 10, 10]);
        await execute(db, sql, ['Ad Banga Mix', 1, 1.99, 10, 10]);
        await execute(db, sql, ['Sw Bhel Cup', 1, 1.29, 10, 10]);
        await execute(db, sql, ['Magic Mas Upma', 1, 1.29, 10, 10]);
        await execute(db, sql, ['Kurkure Msl', 1, 0.89, 10, 10]);
        await execute(db, sql, ['Lays Chile Limon', 1, 0.89, 10, 10]);
        await execute(db, sql, ['MTR Navaratan Korma', 1, 2.99, 10, 10]);
        await execute(db, sql, ['MTR Alu Muttar', 1, 2.99, 10, 10]);
        await execute(db, sql, ['MTR Mutter Paneer', 1, 2.99, 10, 10]);
        await execute(db, sql, ['Mixed Vegetable Curry', 1, 2.99, 10, 10]);
        await execute(db, sql, ['MTR Palak Paneer', 1, 2.99, 10, 10]);
        await execute(db, sql, ['MTR Shahi Paneer', 1, 2.99, 10, 10]);
        await execute(db, sql, ['MTR Bhindi Masala', 1, 2.99, 10, 10]);
        await execute(db, sql, ['MTR Alu Methi', 1, 2.99, 10, 10]);
        await execute(db, sql, ['MTR Chana Masala', 1, 2.99, 10, 10]);
        await execute(db, sql, ['MTR Kadhi Pakora', 1, 2.99, 10, 10]);
        await execute(db, sql, ['GITS Paneer Tikka Masala', 1, 2.99, 10, 10]);
        await execute(db, sql, ['GITS Bhindi Masala', 1, 2.99, 10, 10]);
        await execute(db, sql, ['GITS Pau Bhakti', 1, 2.99, 10, 10]);
        await execute(db, sql, ['GITS Paneer Makhani', 1, 2.99, 10, 10]);
        await execute(db, sql, ['GITS Aloo Raswala', 1, 2.99, 10, 10]);
        await execute(db, sql, ['GITS Veg Biryani', 1, 2.99, 10, 10]);
        await execute(db, sql, ['5 Minute Khana Aloo Mutter', 1, 2.99, 10, 10]);
        await execute(db, sql, ['5 Minute Khana Pao Bhaji', 1, 2.99, 10, 10]);
    } catch (err) {
        console.log(err);
    } finally {
        db.close();
    }
};

export const insertUser = async () => {
    const db = new sqlite3.Database("ess-inv.db");
    const sql = 'INSERT INTO Users(first_name, last_name, email, hashed_pass, user_type) VALUES(?, ?, ?, ?, ?)';
    try {
        // insert student account
        const studentPass = hashPass(10, 'student1234');
        if (studentPass != -1){ // hash was successful
            await execute(db, sql, ['Steve', 'Student', 'student@umbc.edu', studentPass, 0]); // 0 indicates student
        }    
    } catch (err) {
        console.log(err);
    }

    try {
        // insert admin account
        const adminPass = hashPass(10, 'admin1234');
        if (adminPass != -1){ // hash was successful
            await execute(db, sql, ['Amanda', 'Admin', 'admin@umbc.edu', adminPass, 1]); // 1 indicates admin
        }    
    } catch (err) {
        console.log(err);
    } finally {
        db.close();
    }

};

export const insertOrder = async (email, total_weight, total_quantity, product_names) => {
    const db = new sqlite3.Database("ess-inv.db");
    const sql = 'INSERT INTO Orders(user_id, total_weight, total_quantity, product_names) VALUES(?, ?, ?, ?)';
    const fetchsql = 'SELECT user_id FROM Users WHERE LOWER(email) = LOWER(?)';
    try {
        // get user id based on email from user table
        console.log(`Fetching user_id for email: ${email}`);
        const row = await fetchFirst(db, fetchsql, [email]);

        if (row) { // successfully got corresponding row w/ user data
            console.log(`User found: ${row.user_id}, inserting order...`);
            try { // insert user's order
                await execute(db, sql, [row.user_id, total_weight, total_quantity, product_names]);
                console.log("Order inserted successfully!");
            } catch (err) {
                console.log(err);
                console.error("Error inserting order:", err);
            }
        } else { // failed to retrieve row
            console.log("failed to get user");
        }     
    } catch (err) {
        console.log(err);
        console.error("Error fetching user:", err);
    } finally {
        db.close();
    }
};