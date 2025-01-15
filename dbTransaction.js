import express, { application } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

dotenv.config();
const app = express();
app.use(bodyParser.json());
const db = new sqlite3.Database('bubbles.db')
const dbPath = process.env.DB_PATH
const hashPassword = async (password) => {
    const saltRounds = 10;
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (err) {
        console.error('Error hashing password:', err);
        throw err;
    }
};
const sanitizeInput = (input) => {
    return input.replace(/[^a-zA-Z0-9_@:/]/g, '');
};


// Inster User API

app.post('/insert_user', async (req, res) => {
    const { userName, avatar, email, name, password } = req.body;
    if (!userName || !avatar || !email || !name || !password) {
        return res.status(400).json({
            error: 'All fields requred',
        });
    }
    const records = [];
    records.push({ userName, avatar, email, name, password })
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database,
    });
    try {
        for (const record of records) {
            const hashedPassword = await hashPassword(record.password);
            const query = `
    INSERT INTO users (userName,avatar,email,name,password)
    VALUES (?,?,?,?,?);
    `;
            const result =await db.run(query, [record.userName, record.avatar, record.email, record.name, hashedPassword]);
            if (result.changes>0){

            console.log(`User ${record.userName} inserted successfully`,result.lastID);
            return res.status(200).json({
                message: "User inserted successfully",
            });
            }else{
            console.log(`Error adding user ${record.userName}`)   
            return res.status(400).json({
                message: "Error adding user",
            }); 
            }

        }

    } catch (err) {
        console.error('Error trying to add the db info', err);
        return res.status(400).json({
            message: "Error adding user",    })
        }
    finally {
        await db.close();
    }


});


// Get User API

app.post('/get_user', async (req, res) => {
    const { userName, password } = req.body;
    if (!userName || !password) {
        return res.status(400).json({
            error: 'All fields required'
        });
    }

    const sanitizeduserName = sanitizeInput(userName);
    const sanitizedPassword = sanitizeInput(password);
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database,
    });
    
        const query =`
        SELECT * FROM users WHERE userName=?
        `;
        const user = await db.get(query,[sanitizeduserName])
    
    try{
            if (user){
                console.log(`User ${userName} found`)
                console.log('user.password type:', typeof user.password);  // Should print 'string'
                const isMatch = await bcrypt.compare(sanitizedPassword,user.password.toString())
                    if (isMatch){
                        console.log("Password Match");
                        return res.status(200).json({
                            message:'Access granted'
                        })
                    }else{
                        console.log("Password not matching")
                        return res.status(401).json({
                            error:'Password mismatch'
                        })
                    }
            }else{

                console.log(`User ${sanitizeduserName} not found in the DB`)
                return res.status(400).json({
                    error:'user not found'
                })
            }
    } catch (err){
        console.error('Error checking user: ',err)
    }

});

    
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

