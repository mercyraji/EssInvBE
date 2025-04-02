
// given the db file, sql command, and any extra parameters [params not needed for fetchAll]
// retrieve all the items in a specified table
export const fetchAll = async (db, sql, params) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
};

// given the db file, sql command, and any extra parameters such as email, total_weight,
// fetch the first instance of an item from a table in the db that satisfies the sql command & any given params
export const fetchFirst = async (db, sql, params) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                console.error("Error fetching data:",err);
                reject(err);
            } else {
                console.log("Fetched row: ", row);
                resolve(row);
            }
            
        });
    });
};