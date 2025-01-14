import express, { application } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import sqlite3 from 'sqlite3';


dotenv.config();
const app = express();
app.use(bodyParser.json());
const db = new sqlite3.Database('bubbles.db')
const hashPassword = async (password) => {
  const saltRounds = 10;
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log(hashedPassword)
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
  const { username, avatar, email, name, password } = req.body;
  if (!username || !avatar || !email || !name || !password) {
    return res.status(400).json({
      error: 'All fields requred',
    });
  }
  const records = [];
  try {
    const hashedPassword = await hashPassword(password)
    records.push({ username, avatar, email, name, hashedPassword })



    const ssh = new Client();
    const configuration = {
      username: process.env.SSH_USERNAME,
      password: process.env.SSH_PASSWORD,
      hostname: process.env.SSH_IPADDRESS
    };
    let insertCommand = `sqlite3 bubbles.db <<EOF\n`;

    records.forEach(record => {
      insertCommand += `INSERT INTO users (username,avatar,email,name,password) VALUES\n("${record.sanitizedUserName}","${record.sanitizedAvatar}","${record.sanitizedEmail}","${record.sanitizedName}","${record.hashedPassword}");\n`;
    });
    insertCommand += `.quit\nEOF`;
    ssh.on('ready', () => {
      console.log('SSH connection Establshed')
      ssh.exec(insertCommand, (err, stream) => {
        if (err) throw err;
        let output = '';
        stream.on('close', (code, signal) => {
          console.log(`Command executed with code: ${code}`)
          console.log(`Output: ${output}`)
          ssh.end();
          if (output !== '') {
            res.status(400).json(
              {
                message: `User ${username} caused an insertion issue`,
                ssh_output: output
              })
          } else {
            res.status(201).json(
              {
                message: `User ${username} inserted successfully`,
                ssh_output: output
              });
          }
        }).on('data', (data) => {
          output += data.toString()
        }).stderr.on('data', (data) => {
          console.log(`STDERR: ${data}`);
        });
      });
    })
      .on('error', (err) => {
        console.error("Error reported: ", err);
      })
      .connect(configuration);
  } catch (err) {
    console.error('Error trying to hash password: ', err);
    res.status(500).json(
      {
        error: 'Error hashing passowrd'
      });
  }
})

// Get User API

app.post('/get_user', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({
      error: 'All fields required'
    });
  }
  const credentials = [];
  credentials.push({ username, password });
  const ssh = new Client();
  const configuration = {
    username: process.env.SSH_USERNAME,
    password: process.env.SSH_PASSWORD,
    hostname: process.env.SSH_IPADDRESS
  }
  const sanitizeduserName = sanitizeInput(username);
  const sanitizedPassword = sanitizeInput(password);
  let insertCommand = `sqlite3 bubbles.db<<EOF\n`;
  insertCommand += `SELECT * FROM users WHERE username='${sanitizeduserName}';\n`
  insertCommand += `.quit\nEOF`
  ssh.on('ready', () => {
    console.log('Connection Established\n');
    ssh.exec(insertCommand, (err, stream) => {
      if (err) throw err;
      let output = '';
      stream.on('close', async (code) => {
        console.log(`Command executed with code: ${code}`)
        console.log(`Output: ${output}`);
        ssh.end();
        const outputArray = output.trim().split('|');
        const storedPassword = outputArray[outputArray.length - 1];
        try{
        const isMatch = await bcrypt.compare(sanitizedPassword,storedPassword);
        if (isMatch) {
          console.log('Password is correct')
          res.status(200).json({
            message: `Access to user ${sanitizeduserName} granted\n`,
            ssh_output: output
          })

        } else {
          console.log(`credentials for user ${sanitizeduserName} are not valid.\n`)
          res.status(401).json({
            error: 'Invalid credntials'
          })
        }
        }catch(err){
          console.log("Error comparing passwords ",err)
        }
        
          

      }).on('data', (data) => {
        output += data.toString();
      }).stderr.on('data', (data) => {
        console.log(`STDERR: ${data}`)
      })
    }).on('error', (err) => {
      console.error('Error reported:', err);
    })
  }).connect(configuration)

})


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

