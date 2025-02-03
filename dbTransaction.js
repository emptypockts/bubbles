import express, { application } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';
import jwt from 'jsonwebtoken';
dotenv.config();
const app = express();
const SECRET_KEY = process.env.SECRET_KEY
const allowedOrigins = ['http://localhost:3001', 'http://192.168.1.202:3001']
// app.use(cors({
//     origin: 'http://localhost:3001', // Nuxt's dev server port
//     credentials: true,
//   }));
const corsOptions = {
    origin: function (origin, callback) {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);

        } else {
            callback(new Error('not allowed by CORS'));
        }
    },
};
app.use(cors(corsOptions))
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

const generateToken = (payload) => {
    const options = {
        expiresIn: '30m',
    };
    return jwt.sign(payload, SECRET_KEY, options)
}

const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        return decoded;
    } catch (err) {
        console.error('Token verification error:', err); // Log the error for more details
        return err;
    }
};

// Inster User API

app.post('/api/insert_user', async (req, res) => {

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
            const result = await db.run(query, [record.userName, record.avatar, record.email, record.name, hashedPassword]);
            if (result.changes > 0) {

                console.log(`User ${record.userName} inserted successfully`, result.lastID);
                return res.status(200).json({
                    message: "User inserted successfully",
                });
            } else {
                console.log(`Error adding user ${record.userName}`)
                return res.status(400).json({
                    message: "Error adding user",
                });
            }

        }

    } catch (err) {
        console.error('Error trying to add the db info', err);
        return res.status(400).json({
            message: "Error adding user",
        })
    }
    finally {
        await db.close();
    }


});
// api login 
app.post('/api/login_user', async (req, res) => {
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

    const query = `
        SELECT * FROM users WHERE userName=?
        `;
    const user = await db.get(query, [sanitizeduserName])

    try {
        if (user) {
            console.log(`User ${userName} found`)
            const isMatch = await bcrypt.compare(sanitizedPassword, user.password.toString())
            if (isMatch) {
                const payload = {
                    username: userName
                }
                const token = generateToken(payload)
                console.log(`token generated ${token} is valid for 30 min`)
                console.log("Password Match");
                return res.status(200).json({
                    message: 'Access granted',
                    token: token,
                    expiresInMin: 30,
                    avatar: user.avatar
                })
            } else {
                console.log("Password not matching")
                return res.status(401).json({
                    error: 'Password mismatch'
                })
            }
        } else {

            console.log(`User ${sanitizeduserName} not found in the DB`)
            return res.status(400).json({
                error: 'user not found'
            })
        }
    } catch (err) {
        console.error('Error checking user: ', err)
    }

});
// api to verify token
app.post('/api/verify_token', async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({
            error: 'Token is not valid or is missing'
        });
    }
    try {
        const decodedToken = await verifyToken(token);
        console.log('decoded token is valid');
        return res.status(200).json({
            message: 'Token is valid',
            token: decodedToken
        });
    } catch (err) {
        console.error(err.message)
        return res.status(400).json({
            error: err.message
        })
    }
});
// get bubbles per user
app.get('/api/get_bubbles', async (req, res) => {
    const { userName, lastLoadedAt } = req.query;
    const params = [userName]
    if (!userName) {
        return res.status(400).json({
            error: 'missing username or token'
        });
    }

    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });
    let query = `
   SELECT *
   FROM bubbles
   WHERE username=?
   AND created_at >=DATETIME('now','-7 days')
    `;
    if (lastLoadedAt) {
        query += `AND created_at < ?`;
        params.push(lastLoadedAt);
    }
    query += `ORDER BY created_at DESC LIMIT 20;`;

    const bubbles = await db.all(query, params)

    try {
        if (bubbles) {
            console.log('user bubble fetch transaction successful')
            return res.status(200).json(
                bubbles
            )

        }
    } catch (err) {
        console.error(`error trying to fetch user bubbles ${err}`)
        return res.status(500).json({
            error: 'error trying to fetch bubbles'
        })
    }
})
// get last 10 bubbles for other users
app.get('/api/get_bubbles_all', async (req, res) => {
    const { userName, lastLoadedAt } = req.query;
    const params = [userName]
    if (!userName) {
        return res.status(400).json({
            error: 'missing username'
        });
    }

    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });
    let query = `
        SELECT *
        FROM bubbles
        WHERE username !=?
        AND created_at >=DATETIME ('now','-7 days')
        `;
    if (lastLoadedAt) {
        query += `AND created_at < ?`;
        params.push(lastLoadedAt);
    }
    query += `ORDER BY created_at DESC LIMIT 20`;
    const bubbles = await db.all(query, params)
    try {
        if (bubbles) {
            console.log('all bubbles fetch transaction successful')
            res.status(200).json(
                bubbles
            )
        }
    } catch (err) {
        console.error('error fetching all bubbles :', err)
        res.status(400).json({
            error: 'error fetching all bubbles'
        })
    }

})
//create a bubble
app.post('/api/create_bubble', async (req, res) => {
    const { userName, content } = req.body;
    if (!userName || !content) {
        console.error('Missing fields')
        res.status(400).json({
            error: 'Missing fields'
        });
    }

    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    })
    const query = `
    INSERT INTO bubbles (userName,content,expires_at)
    VALUES (?,?,?);
    `;
    const currentTime = new Date();
    const expiresAt = new Date(currentTime.getTime() + 2 * 60 * 1000);
    const expiresAtFormatted = expiresAt.toISOString().slice(0, 19).replace('T', ' ');
    try {
        const result = await db.run(query, [userName, content, expiresAtFormatted])
        if (result.changes < 1) {
            console.error('Error inserting bubble: ')
            return res.status(400).json({
                error: 'There was an error trying to insert the bubble'
            })
        } else {

            const bubbleId = result.lastID

            const bubbleQuery = `
        SELECT bubble_id,username, content , created_at, expires_at FROM bubbles WHERE bubble_id =?;
        `;
            const bubble = await db.get(bubbleQuery, [bubbleId]);
            console.log(`bubble inserted successfully with bubbleID ${bubbleId}`)
            return res.status(200).json({
                message: 'bubble inserted successfully',
                bubble: bubble
            })
        }

    } catch (err) {
        console.error('Error: ', err)
        return res.status(400).json({
            error: 'error trying to insert data into the database'
        })
    }

})
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0',() => {
    console.log(`Server is running on port ${PORT}`);
});


// Testing section

// const userPayload = {
//     userId : 'A3423',
//     userName : 'boo1'
// }
// const token = generateToken(userPayload);
// console.log('Generated token: ',token)

// try{
//     const decodedToken = verifyToken(token);
//     console.log ('Decoded Payload :',decodedToken);
// }catch (err){
//      console.error(err.message)
// }