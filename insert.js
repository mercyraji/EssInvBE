import sqlite3 from "sqlite3";
import { execute } from "./sql.js";


export const insertInv = async () => {
    const db = new sqlite3.Database("ess-inv.db");
    const sql = 'INSERT OR IGNORE INTO Inventory(product_name, weight, price, quantity, category, total_weight) VALUES(?, ?, ?, ?, ?, ?)';
    try {
        await execute(db, sql, ['Sona Masoori Rice', 20, 25, 13, 'South Asian', 260]);
        await execute(db, sql, ['Toor Dahl (Red Lentils)', 7, 1.25, 1, 'South Asian', 70]);
        await execute(db, sql, ['Black Chickpeas (Channa)', 7, 1.25, 2, 'South Asian', 70]);
        await execute(db, sql, ['Maggi Noodles', 1, 0.50, 400, 'South Asian', 400]);
        await execute(db, sql, ['Parle Kream Bour', 1, 0.49, 10, 'South Asian', 10]);
        await execute(db, sql, ['P Hid Seek Bourb', 1, 0.49, 10, 'South Asian', 10]);
        await execute(db, sql, ['Sw Masl Bana', 1, 1.99, 10, 'South Asian', 10]);
        await execute(db, sql, ['Gop Snack Pe Cho', 1, 1.29, 10, 'South Asian', 10]);
        await execute(db, sql, ['Ad Banga Mix', 1, 1.99, 10, 'South Asian', 10]);
        await execute(db, sql, ['Sw Bhel Cup', 1, 1.29, 10, 'South Asian', 10]);
        await execute(db, sql, ['Magic Mas Upma', 1, 1.29, 10, 'South Asian', 10]);
        await execute(db, sql, ['Kurkure Msl', 1, 0.89, 10, 'South Asian', 10]);
        await execute(db, sql, ['Lays Chile Limon', 1, 0.89, 10, 'South Asian', 10]);
        await execute(db, sql, ['MTR Navaratan Korma', 1, 2.99, 10, 'South Asian', 10]);
        await execute(db, sql, ['MTR Alu Muttar', 1, 2.99, 10, 'South Asian', 10]);
        await execute(db, sql, ['MTR Mutter Paneer', 1, 2.99, 10, 'South Asian', 10]);
        await execute(db, sql, ['Mixed Vegetable Curry', 1, 2.99, 10, 'South Asian', 10]);
        await execute(db, sql, ['MTR Palak Paneer', 1, 2.99, 10, 'South Asian', 10]);
        await execute(db, sql, ['MTR Shahi Paneer', 1, 2.99, 10, 'South Asian', 10]);
        await execute(db, sql, ['MTR Bhindi Masala', 1, 2.99, 10, 'South Asian', 10]);
        await execute(db, sql, ['MTR Alu Methi', 1, 2.99, 10, 'South Asian', 10]);
        await execute(db, sql, ['MTR Chana Masala', 1, 2.99, 10, 'South Asian', 10]);
        await execute(db, sql, ['MTR Kadhi Pakora', 1, 2.99, 10, 'South Asian', 10]);
        await execute(db, sql, ['GITS Paneer Tikka Masala', 1, 2.99, 10, 'South Asian', 10]);
        await execute(db, sql, ['GITS Bhindi Masala', 1, 2.99, 10, 'South Asian', 10]);
        await execute(db, sql, ['GITS Pau Bhakti', 1, 2.99, 10, 'South Asian', 10]);
        await execute(db, sql, ['GITS Paneer Makhani', 1, 2.99, 10, 'South Asian', 10]);
        await execute(db, sql, ['GITS Aloo Raswala', 1, 2.99, 10, 'South Asian', 10]);
        await execute(db, sql, ['GITS Veg Biryani', 1, 2.99, 10, 'South Asian', 10]);
        await execute(db, sql, ['5 Minute Khana Aloo Mutter', 1, 2.99, 10, 'South Asian', 10]);
        await execute(db, sql, ['5 Minute Khana Pao Bhaji', 1, 2.99, 10, 'South Asian', 10]);
    } catch (err) {
        console.log(err);
    } finally {
        db.close();
    }
};

// insertUser hardcodes the admins and students users for the sake of the project
export const insertUser = async () => {
    const db = new sqlite3.Database("ess-inv.db");
    const sql = 'INSERT INTO Users(email, display_name, role) VALUES(?, ?, ?)';
    try {
        // insert student account
        await execute(db, sql, ['mraji1@umbc.edu', 'Mercy Raji', 0]); // 0 indicates student

    } catch (err) {
        console.log(err);
    }

    try {
        // insert student account
        await execute(db, sql, ['mbainbr1@umbc.edu', 'Matthew Bainbridge', 0]); // 0 indicates student
    } catch (err) {
        console.log(err);
    }

    try {
        // insert admin account
        await execute(db, sql, ['otabugb1@umbc.edu', 'Oke Tabugbo', 1]); // 1 indicates admin
    } catch (err) {
        console.log(err);
    }

    try {
        // insert admin account
        await execute(db, sql, ['sbearam1@umbc.edu', 'Shawn Bearam', 1]); // 1 indicates admin  
    } catch (err) {
        console.log(err);
    } finally {
        db.close();
    }

};

// inserts user's order
export const insertOrder = async (email, total_weight, total_quantity, product_name, total_price, category) => {
    const db = new sqlite3.Database("ess-inv.db");
    const sql = 'INSERT INTO Orders(user_email, total_weight, total_quantity, product_name, total_price, category) VALUES(?, ?, ?, ?, ?, ?)';

        try { // insert user's order
            await execute(db, sql, [email, total_weight, total_quantity, product_name, total_price, category]);
            console.log("Order inserted successfully!");
        } catch (err) {
            console.log(err);
            console.error("Error inserting order:", err);
        } finally {
            db.close();
        }

};

// remove parameters for visit date, it is done automatically
export const addVisit = async (email, date) => {
    const db = new sqlite3.Database("ess-inv.db");
    const sql = 'INSERT INTO Visits(user_email, visit_time) VALUES(?, ?)';

    var user_email;
    if (!email){
        user_email = ''; // if user not logged in, email is blank
    } else {
        user_email = email;
    }

    try {
        await execute(db, sql, [user_email, date]);
    } catch (err) {
        console.log(err);
        console.error("Error adding visit:", err);
    } finally {
        db.close();
    }
};