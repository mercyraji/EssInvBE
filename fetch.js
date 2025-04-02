

export const fetchAll = async (db, sql, params) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
};

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