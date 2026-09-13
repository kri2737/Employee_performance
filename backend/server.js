require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const { verifyToken, requireRole } = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, employee_id: user.employee_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { name: user.name, role: user.role, employee_id: user.employee_id }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/manager-only', verifyToken, requireRole('manager'), (req, res) => {
  res.json({ message: `Welcome manager ${req.user.employee_id}` });
});

app.get('/profile', verifyToken, (req, res) => {
  res.json({ message: 'You are logged in', user: req.user });
});

app.get('/my-tasks', verifyToken, async (req, res) => {
  try {
    const employeeId = req.user.employee_id;

    const [rows] = await pool.query(
      'SELECT * FROM tasks WHERE employee_id = ? ORDER BY created_at DESC',
      [employeeId]
    );

    const grouped = {
      assigned: rows.filter(t => t.status === 'assigned'),
      in_progress: rows.filter(t => t.status === 'in_progress'),
      completed: rows.filter(t => t.status === 'completed'),
      approved: rows.filter(t => t.status === 'approved'),
      rejected: rows.filter(t => t.status === 'rejected')
    };

    const totalCredits = grouped.approved.reduce((sum, t) => sum + parseFloat(t.credits_earned || 0), 0);

    res.json({ tasks: grouped, totalCredits });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/my-appeals', verifyToken, async (req, res) => {
  try {
    const employeeId = req.user.employee_id;

    const [rows] = await pool.query(
      'SELECT * FROM appeals WHERE employee_id = ? ORDER BY created_at DESC',
      [employeeId]
    );

    res.json({ appeals: rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));