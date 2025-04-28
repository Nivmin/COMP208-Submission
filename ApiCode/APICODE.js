  const express = require("express");
  const mariadb = require('mariadb');
  const exec = require('child_process').exec;
  const app = express();
  app.use(express.json());

  // Create a connection pool
  const pool = mariadb.createPool({
    host: "satabase.cdye8u0kwtv8.us-east-1.rds.amazonaws.com", 
    user: "admin",
    password: "AuraRd..2",
    database: "DatbaseMain",
    connectionLimit: 5 
  });

  // Test connection using pool
  pool.getConnection()
    .then(conn => {
      console.log("Connected to MariaDB!");
      conn.release(); 
    })
    .catch(err => {
      console.error("Connection failed:", err);
      process.exit(1); 
    });
//

// userfood for a older design of the design
  app.get("/UserFood", (req, res) => {
    pool.query("SELECT * FROM UserFood NATURAL JOIN FoodSet")
      .then(results => {
        res.json(results);
      })
      .catch(err => {
        res.status(500).json({ error: err.message });
      });
  });

// code to check all the users /for testing
  app.get("/User", (req, res) => {
    pool.query("SELECT * FROM Authentication")
      .then(results => {
        res.json(results);
      })
      .catch(err => {
        res.status(500).json({ error: err.message });
      });
  });

// main login function 
  app.post("/Login", (req, res) => {
    const { username, password } = req.body;

    pool.query("SELECT * FROM Authentication WHERE UserN= ?", [username])
      .then(results => {
         //if the first result is the correct one
        const user = results[0];
        if (results.length === 0) {
          return res.json({ message: "User not Found!" });
        }
        const userId = user.UserID;
         // If password is stored in plain text for simplicity yet to be imlemented
        if (user.PassW == password) {
          return res.json({ message: "Success ", userId });
        } else {
          return res.json({ message: "Login Failed!" });s
        }
      })
      .catch(err => {
        res.status(500).json({ error: "Database error" });
      });
  });
// uses UserID to get the user details
  app.post("/GetUser", (req, res) => {
    const { userID } = req.body;

    pool.query("SELECT * FROM User WHERE UserID = ?", [userID])
      .then(results => {
        // if the first result is the correct one
        const user = results[0]; 
        if (results.length === 0) {
          return res.json({ message: "User not Found!" });
        }

        if (userID === user.UserID) {
          return res.json({ message: "Successful!", user });
        } else {
          return res.json({ error: "Failed" });
        }
      })
      .catch(err => {
        res.status(500).json({ error: "Database error" });
      });
  });


  // addes a new user to the database does 3 queriers first one to add the user to the user table
  // second one to get the userID of the user that was just added and the last one to add the user to the authentication table
  app.post("/AddUser", (req, res) => {
    const { forename, surname, email, dob, username, password } = req.body;

    if (!forename || !surname || !email || !dob || !username || !password) {
      return res.json({ message: "Missing user details or login credentials" });
    }

    let userId; // ✅ Declare it at the top

    // Insert into User table
    const insertUserQuery = "INSERT INTO User (Forename, Surname, Email, DOB) VALUES (?, ?, ?, ?)";
    pool.query(insertUserQuery, [forename, surname, email, dob])
      .then(result => {
        const getUserIdQuery = "SELECT UserID FROM User WHERE Forename = ? AND Surname = ? AND Email = ? AND DOB = ? ORDER BY UserID DESC LIMIT 1";
        return pool.query(getUserIdQuery, [forename, surname, email, dob]);
      })
      .then(results => {
        if (results.length === 0) {
          return res.json({ message: "User not found after insert" });
        }

        userId = results[0].UserID;

  
        const insertAuthQuery = "INSERT INTO Authentication (UserN, PassW, UserID) VALUES (?, ?, ?)";
        return pool.query(insertAuthQuery, [username, password ,userId]);
      })
      .then(() => {
        res.json({
          message: "User account created successfully!",
          user: { userId, forename, surname, email, username }
        });
      })
      .catch(err => {
        console.error("Error during user creation:", err);
        res.json({ error: err.message });
      });
  });

// api to test the code
  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  // function to call the python script to get the recipes , other ingredients and the recipe name 
  // uses child prorcess tp run the python script 

  app.post('/Suggest', (req, res) => {
    const { ingredients } = req.body;
    
    if (!ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({ 
        recipes: [],
        error: "Invalid format." 
      });
    }
    
    // Create process for the Python script
    const { spawn } = require('child_process');
    const python = spawn('python3', ['recipeFinder.py']);
    
    let dataString = '';
    
    // Collect data from script
    python.stdout.on('data', (data) => {
      dataString += data.toString();
    });
    
    // Handle errors
    python.stderr.on('data', (data) => {
      console.error(`Python Error: ${data}`);
    });
    
    // When the script closes
    python.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ 
          recipes: [],
          error: "Failed to process" 
        });
      }
      
      try {
        // Parse the Python script output
        const result = JSON.parse(dataString);
        
        // Return the data in the exact format expected by the frontend
        res.json({
          recipes: result.recipes || []
        });
      } catch (err) {
        console.error("Error parsing :", err);
        res.status(500).json({ 
          recipes: [],
          error: "Error parsing " 
        });
      }
    });
    

    python.stdin.write(JSON.stringify({ ingredients }));
    python.stdin.end();
  });

// function to update the points on the leaderboard table 
// uses the userID and the points to update the points for the user and the date of the last login



  app.post('/update-points', (req, res) => {
    const { UserID, Points } = req.body;

    if (!UserID || !Points) {
      return res.status(400).json({ error: "UserID and Points are required" });
    }

    const today = new Date().toISOString().split('T')[0]; 

    pool.query("SELECT * FROM UserPoints WHERE UserID = ?", [UserID])
      .then(results => {
        if (results.length > 0) {
          const user = results[0];
          
          // Handle case where Login might be null
          const loginDate = user.Login ? new Date(user.Login).toISOString().split('T')[0] : null;
  // if the user has already logged in today then it will not update the points
          if (loginDate === today) {
            res.json({ message: "Points have already been updated today." });
          } else {
            return pool.query("UPDATE UserPoints SET Points = Points + ?, Login = ? WHERE UserID = ?", 
                            [Points, today, UserID])
              .then(() => {
                  // if the user has not logged in today then it will update the points and the date of the last login
                res.json({ message: "User points updated successfully for today!" });
              });
          }
        } else {
            // if the user does not exist then it will create a new user in the UserPoints table
          return pool.query("INSERT INTO UserPoints (UserID, Points, Login) VALUES (?, ?, ?)", 
                          [UserID, Points, today])
            .then(() => {
              res.json({ message: "User points added successfully!" });
            });
        }
      })
      .catch(err => {
        console.error("Error updating points:", err);
        res.status(500).json({ error: err.message });
      });
  });


  // leaderboard function to get the leaderboard from the database

  app.get("/leaderboard", (req, res) => {
    // query to get the leaderboard from the database
    pool.query(`
      SELECT u.UserID, u.Forename, u.Surname, COALESCE(up.Points, 0) AS Points
      FROM User u
      LEFT JOIN UserPoints up ON u.UserID = up.UserID
      ORDER BY Points DESC;
    `)
    .then((results) => {
      // format the results to make it simpler on the frontend
      const leaderboard = results.map((result) => ({
        name: `${result.Forename} ${result.Surname}`,
        points: result.Points
      }));

      res.json(leaderboard);
    })
    .catch((err) => {
      console.error("Error in leaderboard query:", err);
      res.status(500).json({ error: err.message });
    });
  });

  app.listen(3000, '0.0.0.0', () => {
    console.log('API is running on http://0.0.0.0:3000');
  });
