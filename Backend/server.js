// Main Express server for the word game app

const path = require("path");
const express = require("express");
const db = require("./db/db"); // not used yet, but will be for API routes
const cookieSession = require("cookie-session");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SESSION_SECRET || "dev-secret"],
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  })
);

// Serve static files (HTML, CSS, JS) from the Frontend folder
app.use(express.static(path.join(__dirname, "..", "Frontend")));

// ---------- PAGE ROUTES ---------- //

// Landing page (game will live here)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "Frontend", "index.html"));
});

// Leaderboard page
app.get("/leaderboard", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "Frontend", "leaderboard.html"));
});

// Login page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "Frontend", "login.html"));
});

// Signup page
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "Frontend", "signup.html"));
});

// ---------- AUTH ROUTES ---------- //

// Handle sign up form submission
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send("All fields are required.");
  }

  try {
    // Check if email already exists
    const existing = await db.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);

    if (existing.rows.length > 0) {
      return res.status(400).send("Email already in use. Please log in.");
    }

    // For class demo, we are storing password as plain text.
    // *** Do NOT do this in a real production app. ***
    const result = await db.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username",
      [username, email, password]
    );

    const user = result.rows[0];

    // Save user in session
    req.session.userId = user.id;
    req.session.username = user.username;

    // Redirect to home after sign up
    res.redirect("/");
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).send("Signup failed.");
  }
});

// Handle login form submission
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password are required.");
  }

  try {
    const result = await db.query(
      "SELECT id, username, password FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).send("No user found with that email.");
    }

    const user = result.rows[0];

    // Compare plain text passwords (class demo only)
    if (user.password !== password) {
      return res.status(400).send("Incorrect password.");
    }

    // Save user in session
    req.session.userId = user.id;
    req.session.username = user.username;

    // Redirect to home or leaderboard
    res.redirect("/");
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).send("Login failed.");
  }
});

// Simple logout
app.post("/logout", (req, res) => {
  req.session = null; // clear cookie
  res.redirect("/");
});

// Who is currently logged in? (for frontend + debugging)
app.get('/api/me', (req, res) => {
  if (req.session && req.session.userId) {
    return res.json({
      loggedIn: true,
      userId: req.session.userId,
      username: req.session.username,
    });
  }

  res.json({ loggedIn: false });
});

// ---------- API ROUTES (for scores / leaderboard) ---------- //

// Get words by difficulty for the game
app.get("/api/words", async (req, res) => {
  const { difficulty } = req.query; // 'easy', 'medium', 'hard'

  try {
    let result;

    if (difficulty) {
      result = await db.query(
        "SELECT id, word, definition, difficulty FROM words WHERE difficulty = $1",
        [difficulty]
      );
    } else {
      // if no difficulty provided, return all
      result = await db.query(
        "SELECT id, word, definition, difficulty FROM words"
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching words:", err);
    res.status(500).json({ error: "Failed to fetch words" });
  }
});

// Save a score when a round of 10 questions is finished
app.post("/api/scores", async (req, res) => {
  const { correctAnswers, totalQuestions, difficulty } = req.body;

  // If user is logged in, use their id; otherwise null (Anonymous)
  const userId = req.session && req.session.userId ? req.session.userId : null;

  console.log("Saving score for userId:", userId, "difficulty:", difficulty);

  try {
    await db.query(
      "INSERT INTO scores (user_id, correct_answers, total_questions, difficulty) VALUES ($1, $2, $3, $4)",
      [userId, correctAnswers, totalQuestions, difficulty]
    );

    res.status(201).json({ message: "Score saved" });
  } catch (err) {
    console.error("Error saving score:", err);
    res.status(500).json({ error: "Failed to save score" });
  }
});

// Get leaderboard scores (optionally filtered by difficulty)
app.get("/api/leaderboard", async (req, res) => {
  const { difficulty } = req.query; // e.g. 'easy', 'medium', 'hard', or undefined

  try {
    let result;

    if (difficulty) {
      // Leaderboard for a single difficulty
      result = await db.query(
        `
        SELECT
          scores.id,
          COALESCE(users.username, 'Anonymous') AS username,
          scores.correct_answers,
          scores.total_questions,
          scores.difficulty,
          scores.created_at
        FROM scores
        LEFT JOIN users ON scores.user_id = users.id
        WHERE scores.difficulty = $1
        ORDER BY scores.correct_answers DESC, scores.created_at ASC
        LIMIT 10;
        `,
        [difficulty]
      );
    } else {
      // Overall leaderboard (all difficulties)
      result = await db.query(
        `
        SELECT
          scores.id,
          COALESCE(users.username, 'Anonymous') AS username,
          scores.correct_answers,
          scores.total_questions,
          scores.difficulty,
          scores.created_at
        FROM scores
        LEFT JOIN users ON scores.user_id = users.id
        ORDER BY scores.correct_answers DESC, scores.created_at ASC
        LIMIT 10;
        `
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// ---------- START SERVER ---------- //

app.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
});
