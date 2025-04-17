import express, { application } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { GoogleGenerativeAI } from '@google/generative-ai';
dotenv.config();
const app = express();
const SECRET_KEY = process.env.SECRET_KEY
const allowedOrigins = ['http://localhost:3001', 'http://192.168.1.202:3001', 'https://bubbles.dahoncho.com']
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
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    next();
});
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
//api get others avatar
app.get('/api/other_avatar', async (req, res) => {
    const { userName } = req.query;
    if (!userName) {
        res.status(400).json({
            error: 'missing username'
        });
    };
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });
    let query = `
    SELECT avatar from users where username=?
    `;
    const avatar = await db.get(query, userName)
    if (avatar) {
        return res.status(200).json(
            avatar
        )
    }
    else {
        return res.status(500).json({
            error: 'error trying to fetch avatar'
        })
    }
})
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
        return res.status(200).json({
            message: 'Token is valid',
            token: decodedToken
        });
    } catch (err) {
        console.error('error token', err.message)
        return res.status(400).json({
            error: err.message
        })
    }
});
// get bubbles per user
app.get('/api/get_bubbles', async (req, res) => {
    const { userName, lastLoadedAt, token, group_id } = req.query;
    const params = [userName]
    if (!userName || !token || !group_id) {
        return res.status(400).json({
            error: 'missing username or token or group_id'
        });
    }
    const decodedToken = await verifyToken(token);
    if (decodedToken) {
        console.log('Token is valid')
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });
        let query = `
   SELECT *
   FROM bubbles
   WHERE username=?
    `;
        if (group_id === 'null') {
            query += `AND group_id IS NULL
        `;
        } else if (group_id) {
            query += `AND group_id = ?
        `;
            params.push(group_id);
        }
        if (lastLoadedAt) {
            console.log('last loaded at for my bubbles: ', decodeURIComponent(lastLoadedAt))
            query += `AND created_at < ?`;
            params.push(decodeURIComponent(lastLoadedAt));
        }
        query += `ORDER BY created_at DESC LIMIT 10;`;
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
    }
    else {
        console.error('error token', err.message)
        return res.status(400).json({
            error: err.message
        })
    }
})
// get bubbles all
app.get('/api/get_bubbles_all', async (req, res) => {
    const { userName, allLastLoadedAt, token, group_id } = req.query;
    const params = [userName]
    if (!userName || !token || !group_id) {
        return res.status(400).json({
            error: 'missing username or token or group_id'
        });
    }
    const decodedToken = await verifyToken(token);
    if (decodedToken) {
        console.log('Token is valid')
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });
        let query = `
        SELECT *
        FROM bubbles
        WHERE username !=?
        `;
        if (group_id === 'null') {
            query += `AND group_id is NULL
        `
        } else if (group_id) {
            query += `AND group_id=?
        `
            params.push(group_id);
        }
        if (allLastLoadedAt) {
            console.log('last loaded value for all bubbles but mine:', decodeURIComponent(allLastLoadedAt))
            query += `AND created_at < ?`;
            params.push(decodeURIComponent(allLastLoadedAt));
        }
        query += `ORDER BY created_at DESC LIMIT 10`;
        console.log(query)
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
    }
    else {
        console.error('error token', err.message)
        return res.status(400).json({
            error: err.message
        })
    }
})
//create group_id
app.post('/api/create_group_id',async(req,res)=>{
    const {userName,token,name}=req.body;
    if (!userName|| !token|| !name){
        console.error('missing fields')
        return res.status(400).json({
            error:'missing fields'
        });
    }
    const decodeToken = await verifyToken(token);
    if (decodeToken){
        console.log('token is valid');
        const db = await open({
            filename:dbPath,
            driver:sqlite3.Database
        })
        const query =`INSERT INTO groups(userName,name)
        VALUES(?,?);
        `;
        try{
            const result = await db.run(query,[userName,name])
            if (result.changes<1){
                console.error('error trying to insert the group')
                return res.status(400).json({
                    error:'error inserting the group'
                })
            }else{
                const group_id = result.lastID
                console.log(`group id for group ${name} is ${group_id}`)
                const adminGroupQuery =` INSERT INTO user_groups (userName,group_id)
                VALUES (?,?)
                `;
                const adminGroupQueryResult = await db.run(adminGroupQuery,[userName,group_id])
                if (adminGroupQueryResult<1){
                    console.error('error trying to insert the group_id and username')
                    return res.status(400).json({
                        error:'error inserting the userName and the group'
                    })
                }
                else{
                    console.log('group_id and userName inserted')
                    return res.status(200).json({
                        message:'group_id and userName inserted'
                    })
                }
            }
        }catch(err){
            console.error('error: ',err)
            return res.status(400).json({
                error:'an error occurred trying to insert the group into the db'
            })
        }
    }else{
        console.error('error in the token validation',err.message)
        return res.status(400).json({
            error:'error in the token validation'
        })
    }
})
//create a bubble
app.post('/api/create_bubble', async (req, res) => {
    const { userName, content, token, group_id } = req.body;
    if (!userName || !content || !token) {
        console.error('Missing fields')
        return res.status(400).json({
            error: 'missing fields'
        });
    }
    const decodedToken = await verifyToken(token);
    if (decodedToken) {
        console.log('Token is valid')
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        })
        const query = `
    INSERT INTO bubbles (userName,content,expires_at,group_id)
    VALUES (?,?,?,?);
    `;
        const currentTime = new Date();
        const expiresAt = new Date(currentTime.getTime() + 2 * 60 * 1000);
        const expiresAtFormatted = expiresAt.toISOString().slice(0, 19).replace('T', ' ');
        try {
            const result = await db.run(query, [userName, content, expiresAtFormatted, group_id])
            if (result.changes < 1) {
                console.error('Error inserting bubble: ')
                return res.status(400).json({
                    error: 'There was an error trying to insert the bubble'
                })
            } else {
                const bubbleId = result.lastID
                const bubbleQuery = `
        SELECT bubble_id,username, content , created_at, expires_at,group_id FROM bubbles WHERE bubble_id =?;
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
    }
    else {
        console.error('error token', err.message)
        return res.status(400).json({
            error: err.message
        })
    }
})
//delete bubble
app.post('/api/delete_bubble', async (req, res) => {
    const { userName, bubbleId, token } = req.body;
    if (!userName || !bubbleId || !token) {
        console.error('missing fields')
        return res.status(400).json({
            error: 'missing fields'
        })
    }
    const decodedToken = await verifyToken(token);
    if (decodedToken) {
        console.log('Token is valid')
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        })
        const query =
            `
DELETE FROM bubbles WHERE bubble_id=? AND username =?
`;
        const response = await db.run(query, [bubbleId, userName])
        if (response.changes === 0) {
            console.log('error deleting the bubble:', response.stmt['Statement'])
            return res.status(404).json({
                error: `error deleting bubble: ${response.stmt['Statement']}`
            })
        } else {
            console.log('bubble deleted')
            return res.status(200).json({
                message: 'bubble deleted'
            })
        }
        db.close();
    }
    else {
        console.error('error token', err.message)
        return res.status(400).json({
            error: err.message
        })
    }
})
//connect ai
app.post('/api/ai_riddle', async (req, res) => {
    const { query } = req.body;
    const params = [query]
    if (!query) {
        console.log('query to ai: ', query)
        return res.status(400).json({
            error: 'missing query'
        });
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
            temperature: 0.9,
            topP: 0.9
        }
    });
    const prompt = query;
    const randomElement = Math.random().toString(36).substring(7);
    const dynamicQuery = `${randomElement} ${prompt}`
    const result = await model.generateContent(dynamicQuery);
    console.log('query to ai: ', dynamicQuery)
    const riddle = result.response.text()
    console.log(result.response.text());
    return res.status(200).json({
        riddle: riddle
    })
})
//run the backend on port 3000
app.listen(3000, () => {
    console.log(`Server is running on port ${3000}`);
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