import sqlite3 from "sqlite3";
import { execute } from "./sql.js";
import { fetchFirst } from "./fetch.js"
import { insertOrder } from "./insert.js";

// update the inventory table in the db after the admin adds an item
export const insertNewItem = async (productName, weight, price, quantity) => {
    const db = new sqlite3.Database("ess-inv.db");
    const sql = 'INSERT INTO Inventory(product_name, weight, price, quantity, total_weight) VALUES(?, ?, ?, ?, ?)';
    try {
        // converts details from front-end form into corresponding data types for the inventory table
        const product_name = String(productName);
        const weight_int = Number(weight);
        const price_int = Number(price);
        const quantity_int = Number(quantity);
        
        // insert new item
        await execute(db, sql, [product_name, weight_int, price_int, quantity_int, weight_int*quantity_int]);
    } catch (err){
        console.log(err);
    } finally {
        db.close();
    }
};


// update the inventory table in the db after student finalizes order
export const updateInv = async (orderDetails, email) => {
    const db = new sqlite3.Database("ess-inv.db");
    const getQuantitySql = 'SELECT quantity from Inventory WHERE product_name = ?';
    const updateInvSql = `UPDATE Inventory
    SET quantity = quantity - ?, total_weight = total_weight - ? WHERE product_name = ?`;

    try {

        // check if any of the items in the order are valid to deduct from the inventory
        // if and only if the product's quantity isn't > what's available in the inventory
        // if one of the order items are invalid, it will not proceed to update inv
        for (const item of orderDetails) {
            const {product_name, product_quantity, product_total_weight} = item;
            const row = await fetchFirst(db, getQuantitySql, [product_name]);
            if (!row || row.quantity < product_quantity) {
                console.error(`Not enough quantity for ${product_name} to remove from inventory`);
                throw new Error(`Not enough quantity for ${product_name} to remove from inventory`);
            }
        }
    
    
        // if everything in the order is able to be deducted from the inventory,
        // update inventory table based on order details 
        for (const item of orderDetails){
            const {product_name, product_quantity, product_total_weight} = item;

            // reduce inventory item's quantity and total weight ONLY 
            // if the product quantity & total weight in the table is >= the order's product's quantity & total weight
            await execute(db, updateInvSql, [product_quantity, product_total_weight, product_name]);
            console.log(`Inventory updated for ${product_name}`);

            // insert order to the corresponding user
            await insertOrder(email, product_total_weight, product_quantity, product_name);
            console.log(`Inserted user's order for ${product_name}`);
        }
        console.log("Inventory updated successfully (using student's finalized order)!");
    } catch (err) {
        console.log(err);
        console.error("Error updating inventory from student's finalized order", err);
    } finally {
        db.close();
    }
};