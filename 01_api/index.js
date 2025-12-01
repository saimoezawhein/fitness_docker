const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config({ path: '.env.local' });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fitness_tracker',
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// =====================
// HEALTH CHECK
// =====================
app.get('/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ status: 'ok', db: rows[0].ok === 1 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'error', message: e.message });
  }
});

// =====================
// AUTH API
// =====================
// Register
app.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password, first_name, last_name } = req.body;
    
    // Check if user exists
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    
    // Insert new user (in production, hash password with bcrypt)
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
      [username, email, password, first_name, last_name]
    );
    
    const [newUser] = await pool.query(
      'SELECT id, username, email, first_name, last_name, created_at FROM users WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({ 
      message: 'User registered successfully',
      user: newUser[0]
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [users] = await pool.query(
      'SELECT id, username, email, password, first_name, last_name, is_active FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const user = users[0];
    
    // Check password (in production, use bcrypt.compare)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }
    
    // Update last login
    await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ 
      message: 'Login successful',
      user: userWithoutPassword
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// =====================
// USERS API
// =====================
// Get user by ID
app.get('/users/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, first_name, last_name, profile_image, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update user profile
app.put('/users/:id', async (req, res) => {
  try {
    const { first_name, last_name, profile_image } = req.body;
    const [result] = await pool.query(
      'UPDATE users SET first_name = ?, last_name = ?, profile_image = ? WHERE id = ?',
      [first_name, last_name, profile_image, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'Profile updated successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Change password
app.put('/users/:id/password', async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    
    const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [req.params.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (users[0].password !== current_password) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [new_password, req.params.id]);
    
    res.json({ message: 'Password changed successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// =====================
// CATEGORIES API
// =====================
app.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories');
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/categories/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// =====================
// EXERCISES API
// =====================
app.get('/exercises', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.*, c.name as category_name 
      FROM exercises e 
      LEFT JOIN categories c ON e.category_id = c.id
    `);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/exercises/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.*, c.name as category_name 
      FROM exercises e 
      LEFT JOIN categories c ON e.category_id = c.id 
      WHERE e.id = ?
    `, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/exercises/category/:categoryId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM exercises WHERE category_id = ?', [req.params.categoryId]);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// =====================
// WORKOUTS API (User-specific)
// =====================
// Get all workouts for a user
app.get('/workouts/user/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM workouts WHERE user_id = ? ORDER BY workout_date DESC',
      [req.params.userId]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get single workout (verify user owns it)
app.get('/workouts/:id/user/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM workouts WHERE id = ? AND user_id = ?',
      [req.params.id, req.params.userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create workout for user
app.post('/workouts', async (req, res) => {
  try {
    const { user_id, name, workout_date, duration_minutes, total_calories, notes } = req.body;
    
    // Verify user exists
    const [users] = await pool.query('SELECT id FROM users WHERE id = ?', [user_id]);
    if (users.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO workouts (user_id, name, workout_date, duration_minutes, total_calories, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, name, workout_date, duration_minutes, total_calories, notes]
    );
    
    const [newWorkout] = await pool.query('SELECT * FROM workouts WHERE id = ?', [result.insertId]);
    
    res.status(201).json({ 
      message: 'Workout created successfully',
      workout: newWorkout[0]
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update workout (verify user owns it)
app.put('/workouts/:id', async (req, res) => {
  try {
    const { user_id, name, workout_date, duration_minutes, total_calories, notes } = req.body;
    
    // Verify ownership
    const [existing] = await pool.query('SELECT id FROM workouts WHERE id = ? AND user_id = ?', [req.params.id, user_id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Workout not found or unauthorized' });
    }
    
    await pool.query(
      'UPDATE workouts SET name = ?, workout_date = ?, duration_minutes = ?, total_calories = ?, notes = ? WHERE id = ?',
      [name, workout_date, duration_minutes, total_calories, notes, req.params.id]
    );
    
    res.json({ message: 'Workout updated successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete workout (verify user owns it)
app.delete('/workouts/:id', async (req, res) => {
  try {
    const { user_id } = req.body;
    
    const [result] = await pool.query('DELETE FROM workouts WHERE id = ? AND user_id = ?', [req.params.id, user_id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Workout not found or unauthorized' });
    }
    
    res.json({ message: 'Workout deleted successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// =====================
// WORKOUT EXERCISES API
// =====================
app.get('/workout-exercises/:workoutId', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT we.*, e.name as exercise_name, e.muscle_group, e.difficulty, c.name as category_name
      FROM workout_exercises we
      LEFT JOIN exercises e ON we.exercise_id = e.id
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE we.workout_id = ?
    `, [req.params.workoutId]);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/workout-exercises', async (req, res) => {
  try {
    const { workout_id, exercise_id, sets, reps, weight_kg, duration_seconds, calories_burned, notes } = req.body;
    const [result] = await pool.query(
      'INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight_kg, duration_seconds, calories_burned, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [workout_id, exercise_id, sets, reps, weight_kg, duration_seconds, calories_burned, notes]
    );
    res.status(201).json({ id: result.insertId, message: 'Exercise added to workout' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/workout-exercises/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM workout_exercises WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Workout exercise not found' });
    }
    res.json({ message: 'Exercise removed from workout' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// =====================
// STATS API (User-specific)
// =====================
app.get('/stats/user/:userId', async (req, res) => {
  try {
    const [totalWorkouts] = await pool.query('SELECT COUNT(*) as count FROM workouts WHERE user_id = ?', [req.params.userId]);
    const [totalCalories] = await pool.query('SELECT COALESCE(SUM(total_calories), 0) as total FROM workouts WHERE user_id = ?', [req.params.userId]);
    const [totalDuration] = await pool.query('SELECT COALESCE(SUM(duration_minutes), 0) as total FROM workouts WHERE user_id = ?', [req.params.userId]);
    const [recentWorkouts] = await pool.query('SELECT * FROM workouts WHERE user_id = ? ORDER BY workout_date DESC LIMIT 5', [req.params.userId]);
    
    res.json({
      total_workouts: totalWorkouts[0].count,
      total_calories_burned: totalCalories[0].total,
      total_duration_minutes: totalDuration[0].total,
      recent_workouts: recentWorkouts
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));