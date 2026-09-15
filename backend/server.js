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
const allowedTransitions = {
  assigned: 'in_progress',
  in_progress: 'completed'
};


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

app.post('/appeals', verifyToken, async (req, res) => {
  try {
    const employeeId = req.user.employee_id;
    const { task_id, monthly_performance_id, reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Reason is required' });
    }

    if (!task_id && !monthly_performance_id) {
      return res.status(400).json({ message: 'Must provide either task_id or monthly_performance_id' });
    }

    if (task_id && monthly_performance_id) {
      return res.status(400).json({ message: 'Provide only one: task_id OR monthly_performance_id, not both' });
    }

    let appealType = 'monthly_rating';

    if (task_id) {
          const [taskRows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [task_id]);
          if (taskRows.length === 0) {
            return res.status(404).json({ message: 'Task not found' });
          }
          const task = taskRows[0];
          if (task.employee_id !== employeeId) {
            return res.status(403).json({ message: 'You can only appeal your own tasks' });
          }

          if (task.status === 'rejected') {
            appealType = 'task_rejection';
          } else if (task.status === 'approved' && task.credit_rating !== null && task.credit_rating <= 3) {
            appealType = 'task_low_credit';
          } else if (task.status === 'approved') {
            return res.status(400).json({ message: `This task's credit rating (${task.credit_rating ?? 'none'}/5) is already 4 or above and cannot be appealed` });
          } else {
            return res.status(400).json({ message: `Only rejected tasks, or approved tasks with a credit rating of 3 or below, can be appealed. This task is currently '${task.status}'` });
          }

          const [existingRows] = await pool.query(
            "SELECT id FROM appeals WHERE task_id = ? AND status = 'pending'",
            [task_id]
          );
          if (existingRows.length > 0) {
            return res.status(400).json({ message: 'There is already a pending appeal for this task' });
          }
        }

        const [result] = await pool.query(
          'INSERT INTO appeals (employee_id, task_id, monthly_performance_id, reason, status, appeal_type) VALUES (?, ?, ?, ?, ?, ?)',
          [employeeId, task_id || null, monthly_performance_id || null, reason, 'pending', appealType]
        );

        res.status(201).json({ message: 'Appeal submitted', appealId: result.insertId, appeal_type: appealType });

      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
      }
    });

app.patch('/tasks/:id/status', verifyToken, async (req, res) => {
  try {
    const employeeId = req.user.employee_id;
    const taskId = req.params.id;
    const { status } = req.body;

    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const task = rows[0];

    if (task.employee_id !== employeeId) {
      return res.status(403).json({ message: 'You can only update your own tasks' });
    }

    const expectedNextStatus = allowedTransitions[task.status];

    if (!expectedNextStatus) {
      return res.status(400).json({ message: `Task is already '${task.status}' and cannot be updated further by you` });
    }

    if (status !== expectedNextStatus) {
      return res.status(400).json({ message: `Invalid transition. From '${task.status}', you can only move to '${expectedNextStatus}'` });
    }

    if (status === 'completed') {
      await pool.query('UPDATE tasks SET status = ?, completed_at = NOW() WHERE id = ?', [status, taskId]);
    } else {
      await pool.query('UPDATE tasks SET status = ? WHERE id = ?', [status, taskId]);
    }
    res.json({ message: `Task updated to '${status}'` });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

//manager views tasks awaiting review
app.get('/team-tasks/pending-review', verifyToken, requireRole('manager', 'sm'), async (req, res) => {
  try {
    const managerId = req.user.employee_id;

    const [rows] = await pool.query(
      "SELECT * FROM tasks WHERE assigned_by = ? AND status = 'completed' ORDER BY completed_at ASC",
      [managerId]
    );

    const withTimingInfo = rows.map(task => ({
      ...task,
      is_late: task.due_date ? new Date(task.completed_at) > new Date(task.due_date) : null
    }));

    res.json({ tasks: withTimingInfo });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

//manager approves/rejects a task
app.patch('/tasks/:id/review', verifyToken, requireRole('manager', 'sm'), async (req, res) => {
  try {
    const managerId = req.user.employee_id;
    const taskId = req.params.id;
    const { decision, quality_rating, credit_rating, review_notes } = req.body;

    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ message: "decision must be 'approved' or 'rejected'" });
    }
    if (!['satisfactory', 'unsatisfactory'].includes(quality_rating)) {
      return res.status(400).json({ message: "quality_rating must be 'satisfactory' or 'unsatisfactory'" });
    }

    let creditRatingValue = null;
    if (decision === 'approved') {
      const isValidCreditRating = Number.isInteger(credit_rating) && credit_rating >= 1 && credit_rating <= 5;
      if (!isValidCreditRating) {
        return res.status(400).json({ message: 'credit_rating is required when approving and must be an integer from 1 to 5' });
      }
      creditRatingValue = credit_rating;
    }

    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    const task = rows[0];

    if (task.assigned_by !== managerId) {
      return res.status(403).json({ message: 'You can only review tasks you assigned' });
    }
    if (task.status !== 'completed') {
      return res.status(400).json({ message: `Task must be 'completed' to review, currently '${task.status}'` });
    }

    let credits = null;
    if (decision === 'approved') {
      const [perfRows] = await pool.query(
        'SELECT performance_score FROM monthly_performance WHERE employee_id = ? ORDER BY month DESC LIMIT 1',
        [task.employee_id]
      );
      const latestScore = perfRows.length > 0 ? perfRows[0].performance_score : 50;
      credits = (latestScore / 10).toFixed(2);
    }

    await pool.query(
      'UPDATE tasks SET status = ?, quality_rating = ?, credit_rating = ?, review_notes = ?, credits_earned = ? WHERE id = ?',
      [decision, quality_rating, creditRatingValue, review_notes || null, credits, taskId]
    );

    res.json({ message: `Task ${decision}`, credits_earned: credits, credit_rating: creditRatingValue });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});



// SM sees all pending appeals system-wide, with task context
app.get('/appeals/pending', verifyToken, requireRole('sm'), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT appeals.*, tasks.title AS task_title, tasks.status AS task_status,
             tasks.review_notes AS manager_review_notes, tasks.quality_rating,
             tasks.credit_rating AS current_credit_rating
      FROM appeals
      LEFT JOIN tasks ON appeals.task_id = tasks.id
      WHERE appeals.status = 'pending'
      ORDER BY appeals.created_at ASC
    `);

    res.json({ appeals: rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// SM resolves an appeal
app.patch('/appeals/:id/resolve', verifyToken, requireRole('sm'), async (req, res) => {
  try {
    const appealId = req.params.id;
    const { decision, resolution_notes, new_credit_rating } = req.body;

    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ message: "decision must be 'approved' or 'rejected'" });
    }

    const [appealRows] = await pool.query('SELECT * FROM appeals WHERE id = ?', [appealId]);
    if (appealRows.length === 0) {
      return res.status(404).json({ message: 'Appeal not found' });
    }
    const appeal = appealRows[0];

    if (appeal.status !== 'pending') {
      return res.status(400).json({ message: `Appeal already resolved as '${appeal.status}'` });
    }

    let credits = null;
    let updatedCreditRating = null;

    if (decision === 'approved' && appeal.appeal_type === 'task_low_credit' && appeal.task_id) {
      const isValidNewRating = Number.isInteger(new_credit_rating) && new_credit_rating >= 1 && new_credit_rating <= 5;
      if (!isValidNewRating) {
        return res.status(400).json({ message: 'new_credit_rating is required and must be an integer from 1 to 5' });
      }

      const [taskRows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [appeal.task_id]);
      const task = taskRows[0];

      if (new_credit_rating <= task.credit_rating) {
        return res.status(400).json({ message: `new_credit_rating (${new_credit_rating}) must be higher than the current rating (${task.credit_rating})` });
      }

      await pool.query(
        "UPDATE tasks SET credit_rating = ?, review_notes = CONCAT(COALESCE(review_notes, ''), ' | Credit rating raised on appeal') WHERE id = ?",
        [new_credit_rating, appeal.task_id]
      );
      updatedCreditRating = new_credit_rating;

    } else if (decision === 'approved' && appeal.appeal_type === 'task_rejection' && appeal.task_id) {
      const [taskRows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [appeal.task_id]);
      const task = taskRows[0];

      const [perfRows] = await pool.query(
        'SELECT performance_score FROM monthly_performance WHERE employee_id = ? ORDER BY month DESC LIMIT 1',
        [task.employee_id]
      );
      const latestScore = perfRows.length > 0 ? perfRows[0].performance_score : 50;
      credits = (latestScore / 10).toFixed(2);

      const isValidRating = Number.isInteger(new_credit_rating) && new_credit_rating >= 1 && new_credit_rating <= 5;
      updatedCreditRating = isValidRating ? new_credit_rating : 3; // default if SM doesn't specify one

      await pool.query(
        "UPDATE tasks SET status = 'approved', credits_earned = ?, credit_rating = ?, review_notes = CONCAT(COALESCE(review_notes, ''), ' | Overturned on appeal') WHERE id = ?",
        [credits, updatedCreditRating, appeal.task_id]
      );
    }
    // appeal_type === 'monthly_rating' -> no task row to update, falls through

    await pool.query(
      'UPDATE appeals SET status = ?, resolution_notes = ?, resolved_at = NOW() WHERE id = ?',
      [decision, resolution_notes || null, appealId]
    );

    res.json({ message: `Appeal ${decision}`, credits_earned: credits, credit_rating: updatedCreditRating });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));