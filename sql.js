
/*
Execute function executes a SQL query asynchronously using 
a database (db) object.
parameters: db (database connection obj), sql (the sql query to be executed)
params allows for insert command

Since the db.exec() uses a callback (a function passed as an arg to another function),
it is wrapped in a Promise to make it work asynchronously
*/

export const execute = async (db, sql, params = []) => {
    if (params && params.length > 0){ // will call the run() command if there are params
        return new Promise((resolve, reject) => {
            db.run(sql, params, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }
    
    return new Promise((resolve, reject) => {
        db.exec(sql, (err) => {
            if (err) reject(err); // reject the promise if there's an error
            resolve(); // resolve the promise if the query executes successfully
        });
    });
};