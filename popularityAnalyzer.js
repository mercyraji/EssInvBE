// popularityAnalyzer.js (Using ESM export)

/**
 * Analyzes an array of order line items to determine the most popular items
 * based on the total quantity sold.
 *
 * @param {Array<Object>} orderItems - An array of order line items.
 * Each object should have at least:
 * - product_names {string}: The name of the product.
 * - total_quantity {number}: The quantity of this product for this line item.
 * @param {number} [topN=5] - The number of top popular items to return. Defaults to 5.
 * @returns {Array<Object>} An array of the top N popular items, sorted by quantity in descending order.
 * Each object in the returned array will have:
 * - name {string}: The product name.
 * - totalQuantity {number}: The total quantity sold for that product.
 * Returns an empty array if orderItems is empty or not an array.
 */
export const getPopularItems = (orderItems, topN = 5) => {
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
        console.warn("[PopularityAnalyzer] Input orderItems is empty or not an array.");
        return [];
    }

    const itemCounts = {};

    // 1. Aggregate quantities for each product
    for (const item of orderItems) {
        // Ensure item has the necessary properties and valid quantity
        if (item && typeof item.product_names === 'string' && typeof item.total_quantity === 'number' && !isNaN(item.total_quantity)) {
            const productName = item.product_names.trim();
            const quantity = item.total_quantity;

            if (productName) { // Ensure product name is not empty after trimming
                if (itemCounts[productName]) {
                    itemCounts[productName] += quantity;
                } else {
                    itemCounts[productName] = quantity;
                }
            }
        } else {
            console.warn("[PopularityAnalyzer] Skipping invalid order item:", item);
        }
    }

    // 2. Convert the aggregated counts into an array of objects
    const aggregatedItems = Object.keys(itemCounts).map(productName => {
        return {
            name: productName,
            totalQuantity: itemCounts[productName]
        };
    });

    // 3. Sort the items by totalQuantity in descending order
    aggregatedItems.sort((a, b) => b.totalQuantity - a.totalQuantity);

    // 4. Return the top N items
    return aggregatedItems.slice(0, topN);
};

// Example Usage (you can run this file directly with node if you temporarily add example data):
/*
if (import.meta.url === `file://${process.argv[1]}`) { // Check if run directly
    const exampleOrderItems = [
        { product_names: "Sona Masoori Rice", total_quantity: 2 },
        { product_names: "Maggi Noodles", total_quantity: 5 },
        { product_names: "Sona Masoori Rice", total_quantity: 1 },
        { product_names: "Parle Kream Bour", total_quantity: 10 },
        { product_names: "Maggi Noodles", total_quantity: 3 },
        { product_names: "Toor Dahl (Red Lentils)", total_quantity: 7 },
        { product_names: "Sona Masoori Rice", total_quantity: 4 },
        { product_names: "Maggi Noodles", total_quantity: 2 },
        { product_names: "Parle Kream Bour", total_quantity: 1 },
        { product_names: "Sw Masl Bana", total_quantity: 6 },
        { product_names: "Invalid Item", total_quantity: "not a number" }, // Example of invalid
        { product_names: null, total_quantity: 1 }, // Example of invalid
        { product_names: "  Maggi Noodles  ", total_quantity: 1 }, // Test trimming
    ];

    const popular = getPopularItems(exampleOrderItems, 3);
    console.log("\nTop 3 Popular Items (Example):");
    console.log(popular);

    const popularDefault = getPopularItems(exampleOrderItems);
    console.log("\nTop 5 Popular Items (Example with default N):");
    console.log(popularDefault);

    const emptyTest = getPopularItems([]);
    console.log("\nTest with empty array:");
    console.log(emptyTest);

    const invalidTest = getPopularItems("not an array");
    console.log("\nTest with invalid input:");
    console.log(invalidTest);
}
*/
