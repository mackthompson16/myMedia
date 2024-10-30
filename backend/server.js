const express = require('express');
const cors = require('cors');
const app = express();
const db= require('./db');

app.use(cors());
app.use(express.json());

app.get('/api/users/:userId/getCommitments', async (req, res) => {
  const userId = Number(req.params.userId);
 
  try {
    const commitments = await getUserCommitments({userId});
    res.json({ commitments });
  } catch (error) {
    console.error('Error fetching commitments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/users/:userId/addCommitment', async (req, res) => {
  const userId = Number(req.params.userId);
  const { name, startTime, endTime, days, dates } = req.body;
  console.log
  try {
    
    await db.run('BEGIN TRANSACTION');

    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

     await db.run(
      `INSERT INTO commitments (userId, name, startTime, endTime, days, dates) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, name, startTime, endTime, JSON.stringify(days), JSON.stringify(dates)]
    );

    await db.run('COMMIT');

    res.json({ message: 'Commitment added successfully'});

  } catch (error) {
    console.error('Failed to add commitment', error);
    
    await db.run('ROLLBACK');

    res.status(500).json({ message: 'Internal server error' });
  }
});





async function getUserById(userId) {
  return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM users WHERE id = ?`, [userId], (err, row) => {
          if (err) {
              reject(err); // Reject the Promise if there's an error
          } else {
              resolve(row); // Resolve with the row if found
          }
      });
  });
}

async function getUserCommitments({userId}) {
  console.log('attempting to fetch commitments: ', userId)
  return new Promise((resolve, reject) => {
     db.all(`SELECT * FROM commitments WHERE userId = ?`, [userId], (err, rows) => {
    if (err) {
        reject(err);
    } else {
        console.log('Fetched commitments:', rows); // Log commitments to verify structure
        resolve(rows);
    }
});
  });
}


app.post('/api/create-account', async (req, res) => {
  const { username, password, email } = req.body;

  // Check if all required fields are provided
  if (!username || !password || !email) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    // Wrap the account creation in a Promise
    const result = await new Promise(async (resolve, reject) => {
      // Insert new user into the database
      db.run(`INSERT INTO users (username, password, email) VALUES (?, ?, ?)`,
        [username, password, email], async function (err) {
          if (err) {
            return reject({ success: false, message: 'Error creating account' });
          }

          const newUserId = this.lastID;  // `this.lastID` refers to the ID of the newly inserted user
          
          try {
            // Wait for getUserById to complete before resolving
            const newUser = await getUserById(newUserId);
            resolve({ success: true, user: newUser });
          } catch (error) {
            reject({ success: false, message: 'Failed to retrieve user information' });
          }
        }
      );
    });

    res.json(result);
  } catch (err) {
    console.error('Error creating account: ', err);
    res.status(500).json(err);
  }
});


app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Call the login function and wait for the result
    const result = await new Promise((resolve, reject) => {
      db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
        if (err || !row) {
          return reject({ success: false, error: 'username' });  // Handle username not found
        } else if (row.password !== password) {
          return reject({ success: false, error: 'password' });  // Handle incorrect password
        } else {
          resolve({ success: true, user: row });  // Successfully log in
        }
      });
    });

    // Log the user data on the server
    console.log('New Log In: ', result.user);
    // Send user data to frontend
    res.json(result);
  } catch (err) {
    console.error('Error during login: ', err);
    // Return the error response to the frontend
    res.status(400).json(err);
  }
});
app.delete('/api/removeCommitment/:userId/:commitmentId', async (req, res) => {
  const { userId, commitmentId } = req.params;
  console.log(userId, ', ', commitmentId);
  try {
      const result = await db.run('DELETE FROM commitments WHERE id = ? AND userId = ?', [commitmentId, userId]);
      if (result.changes === 0) {
          return res.status(404).json({ error: 'Commitment not found' });
      }
      res.json({ message: 'Commitment removed successfully' });
  } catch (error) {
      console.error('Error removing commitment:', error);
      res.status(500).json({ error: 'Failed to remove commitment' });
  }
});




app.listen(5000, () => {
  console.log('Server is running on port 5000');
});