import bcrypt from 'bcrypt'

// create salt for hash function and hash user pass
//const studentPass = 'student1234';

export async function hashPass(saltRounds, userPass){
    const salt = await bcrypt.genSalt(saltRounds);

    bcrypt.hash(userPass, salt, (err, hash) => {
        if (err) {
            // error occured, end func, hash unsuccessful
            console.log(err);
            return -1; // failed to hash
        }

        // hashing was successful
        console.log("Hashed password: ", hash);
        return hash;
    });

}


// for checking if password from log in matches password in user table
export function checkUserPass(userInput, storedPass){

    bcrypt.compare(userInput, storedPass, (err, result) => {
        if (err) {
            console.log(err);
            console.error('Error comparing passwords: ', err);
        }

        if (result) {
            // passwords match, authentication successful
            console.log('Passwords match!');
            return true;
        } else {
            // passwords don't match, authentication failed
            console.log('Passwords don\'t match');
            return false;
        }
    });
}


