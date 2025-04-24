import sqlite3 from "sqlite3";
import { execute } from "./sql.js";
import { fetchFirst } from "./fetch.js"
import { insertOrder } from "./insert.js";

// update the inventory table in the db after the admin adds an item
export const insertNewItem = async (productName, weight, price, quantity, category) => {
    const db = new sqlite3.Database("ess-inv.db");
    const sql = 'INSERT INTO Inventory(product_name, weight, price, quantity, category, total_weight) VALUES(?, ?, ?, ?, ?, ?)';
    try {
        // converts details from front-end form into corresponding data types for the inventory table
        const product_name = String(productName);
        const weight_int = Number(weight);
        const price_int = Number(price);
        const quantity_int = Number(quantity);
        const category_name = String(category);
        
        // insert new item
        await execute(db, sql, [product_name, weight_int, price_int, quantity_int, category_name, weight_int*quantity_int]);
    } catch (err){
        console.log(err);
    } finally {
        db.close();
    }
};


// update the inventory table in the db after student finalizes order
export const updateInv = async (orderDetails, email) => {
    const db = new sqlite3.Database("ess-inv.db");
    const getQuantitySql = 'SELECT quantity FROM Inventory WHERE product_name = ?';
    const updateInvSql = `UPDATE Inventory
    SET quantity = quantity - ?, total_weight = total_weight - ? WHERE product_name = ?`;

    try {

        // check if any of the items in the order are valid to deduct from the inventory
        // if and only if the product's quantity isn't > what's available in the inventory
        // if one of the order items are invalid, it will not proceed to update inv
        for (const item of orderDetails) {
            const {product_name, product_quantity, product_total_weight, product_total_price, product_category} = item;
            const row = await fetchFirst(db, getQuantitySql, [product_name]);
            if (!row || row.quantity < product_quantity) {
                console.error(`Not enough quantity for ${product_name} to remove from inventory`);
                throw new Error(`Not enough quantity for ${product_name} to remove from inventory`);
            }
        }
    
    
        // if everything in the order is able to be deducted from the inventory,
        // update inventory table based on order details 
        for (const item of orderDetails){
            const {product_name, product_quantity, product_total_weight, product_total_price, product_category} = item;

            // reduce inventory item's quantity and total weight ONLY 
            // if the product quantity & total weight in the table is >= the order's product's quantity & total weight
            await execute(db, updateInvSql, [product_quantity, product_total_weight, product_name]);
            console.log(`Inventory updated for ${product_name}`);

            // insert order to the corresponding user
            await insertOrder(email, product_total_weight, product_quantity, product_name, product_total_price, product_category);
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

// This function is used when the admin is updating an item that's currently in the inventory
// we only allow admin to update the price and quantity
export const updateCurrItem = async (product_name, price, quantity) => {
    const db = new sqlite3.Database("ess-inv.db");
    const getWeightSql = "SELECT weight FROM Inventory WHERE product_name = ?";
    const updateInvSql = 'UPDATE Inventory SET price = ?, quantity = ?, total_weight = ? WHERE product_name = ?';
    
    try {
        // get the current weight to use for updating the total weight with the new quantity
        const row = await fetchFirst(db, getWeightSql, [product_name]);

        if (row){
            // converts details from front-end form into corresponding data types for the inventory table
            const productName = String(product_name);
            const weight_int = Number(row.weight);
            const price_int = Number(price);
            const quantity_int = Number(quantity);
            const total_weight = weight_int * quantity_int;

            try {   
                await execute(db, updateInvSql, [price_int, quantity_int, total_weight, productName]);
                console.log("Successfully updateed item: ", productName);
            } catch (err) {
                console.log(err);
                console.error("Error updating current item", err);
            }
        }
    } catch (err) {
        console.log(err);
        console.error("Error fetching weight:", err);
    } finally {
        db.close();
    }

};


// allows admin to remove an item (one at a time) from the inventory
export const deleteItem = async(product_name) => {
    const db = new sqlite3.Database("ess-inv.db");
    const deleteSql = "DELETE FROM Inventory WHERE product_name = ?";

    // convert product_name from frontend into string for backend
    const productName = String(product_name);

    try {
        await execute(db, deleteSql, [productName]);
    } catch (err) {
        console.log(err);
        console.error("Error deleting item:", err);
    } finally {
        db.close();
    }
};