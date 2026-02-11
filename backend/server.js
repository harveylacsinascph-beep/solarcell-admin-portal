const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { initializeDatabase, executeQuery, executeInsert, executeUpdate, createUserAccountsForEmployees } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Suppress Windows assertion errors from sql.js
process.on('uncaughtException', (err) => {
  if (!err.message.includes('Assertion failed') && !err.code?.includes('UV_HANDLE')) {
    console.error('Uncaught Exception:', err);
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// Root route - serve Auth Login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'auth-login.html'));
});

// Test route for connectivity
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running and accessible', timestamp: new Date().toISOString() });
});

// Initialize database on startup
(async () => {
  await initializeDatabase();
  await createUserAccountsForEmployees();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running at http://localhost:${PORT} and http://0.0.0.0:${PORT}`);
    console.log(`📊 Database: database.db`);
  });
})();

// ==================== EMPLOYEES ====================

app.get('/api/employees', async (req, res) => {
  try {
    const rows = await executeQuery('SELECT * FROM employees ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/employees/:id', async (req, res) => {
  try {
    const rows = await executeQuery('SELECT * FROM employees WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Employee not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const { name, phone, address, birthdate, position, employed_date, department, emergency_contact_name, emergency_contact_phone } = req.body;

    // Auto-generate unique barcode using database counter for guaranteed uniqueness
    let barcode;
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
      // Get the current count of employees to use as a base
      const countResult = await executeQuery('SELECT COUNT(*) as count FROM employees');
      const employeeCount = countResult[0].count;

      // Create barcode with format: SCPH + YYYYMMDD + sequential number
      const today = new Date();
      const dateStr = today.getFullYear().toString() +
                     (today.getMonth() + 1).toString().padStart(2, '0') +
                     today.getDate().toString().padStart(2, '0');

      // Use employee count + attempts to ensure uniqueness
      const sequenceNum = (employeeCount + attempts + 1).toString().padStart(4, '0');
      barcode = 'SCPH' + dateStr + sequenceNum;

      // Check if barcode already exists
      const existing = await executeQuery('SELECT id FROM employees WHERE barcode = $1', [barcode]);
      if (existing.length === 0) {
        break; // Unique barcode found
      }

      attempts++;
    }

    if (attempts >= maxAttempts) {
      // Ultimate fallback: use timestamp with microseconds
      const timestamp = Date.now();
      const microtime = process.hrtime.bigint().toString().slice(-6);
      barcode = 'SCPH' + timestamp.toString().slice(-8) + microtime;
    }

    console.log('Adding employee:', { barcode, name, department });

    const result = await executeInsert(
      `INSERT INTO employees (barcode, name, phone, address, birthdate, position, employed_date, department, emergency_contact_name, emergency_contact_phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [barcode, name, phone, address, birthdate, position, employed_date, department, emergency_contact_name, emergency_contact_phone]
    );
    const newEmployee = await executeQuery('SELECT * FROM employees WHERE id = $1', [result.lastID]);
    console.log('✅ Employee added successfully:', newEmployee[0].id);

    // Automatically create user account for the new employee
    await createUserAccountsForEmployees();

    res.status(201).json(newEmployee[0]);
  } catch (err) {
    console.error('❌ Error adding employee:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    const { barcode, name, phone, address, birthdate, position, employed_date, department, emergency_contact_name, emergency_contact_phone, vacation_leave, sick_leave, status } = req.body;
    await executeUpdate(
      `UPDATE employees SET barcode = $1, name = $2, phone = $3, address = $4, birthdate = $5, position = $6, employed_date = $7, department = $8, emergency_contact_name = $9, emergency_contact_phone = $10, vacation_leave = $11, sick_leave = $12, status = $13, updated_at = CURRENT_TIMESTAMP WHERE id = $14`,
      [barcode, name, phone, address, birthdate, position, employed_date, department, emergency_contact_name, emergency_contact_phone, vacation_leave, sick_leave, status, req.params.id]
    );
    const updated = await executeQuery('SELECT * FROM employees WHERE id = $1', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    await executeUpdate('DELETE FROM employees WHERE id = $1', [req.params.id]);
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ATTENDANCE ====================

app.get('/api/attendance', async (req, res) => {
  try {
    const rows = await executeQuery(`SELECT a.*, e.name, e.barcode FROM attendance a LEFT JOIN employees e ON a.employee_id = e.id ORDER BY a.created_at DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/attendance/employee/:employee_id', async (req, res) => {
  try {
    const rows = await executeQuery(`SELECT a.*, e.name, e.barcode FROM attendance a LEFT JOIN employees e ON a.employee_id = e.id WHERE a.employee_id = $1 ORDER BY a.created_at DESC`, [req.params.employee_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/attendance', async (req, res) => {
  try {
    const { employee_id, date, time_in } = req.body;
    const result = await executeInsert('INSERT INTO attendance (employee_id, date, time_in) VALUES ($1, $2, $3)', [employee_id, date, time_in]);
    res.status(201).json({ id: result.lastID, message: 'Time in recorded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/attendance/:id', async (req, res) => {
  try {
    const { time_out, worked_hours } = req.body;
    await executeUpdate('UPDATE attendance SET time_out = $1, worked_hours = $2 WHERE id = $3', [time_out, worked_hours, req.params.id]);
    const updated = await executeQuery('SELECT * FROM attendance WHERE id = $1', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/attendance/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid attendance ID' });
    }

    console.log('DELETE request for attendance ID:', id);

    // First check if the record exists
    const existing = await executeQuery('SELECT id FROM attendance WHERE id = ?', [id]);
    console.log('Existing records found:', existing.length);

    if (existing.length === 0) {
      console.log('Record not found');
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    const result = await executeUpdate('DELETE FROM attendance WHERE id = ?', [id]);
    console.log('Delete result:', result);
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (err) {
    console.error('Error deleting attendance record:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== LEAVE REQUESTS ====================

app.get('/api/leave-requests', async (req, res) => {
  try {
    const rows = await executeQuery(`SELECT l.*, e.name, e.barcode FROM leave_requests l JOIN employees e ON l.employee_id = e.id ORDER BY l.created_at DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/leave-requests', async (req, res) => {
  try {
    const { employee_id, start_date, end_date, leave_type, reason } = req.body;
    const result = await executeInsert(
      `INSERT INTO leave_requests (employee_id, start_date, end_date, leave_type, reason) VALUES ($1, $2, $3, $4, $5)`,
      [employee_id, start_date, end_date, leave_type, reason]
    );
    res.status(201).json({ id: result.lastID, message: 'Leave request submitted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/leave-requests/:id', async (req, res) => {
  try {
    const { status } = req.body;
    await executeUpdate('UPDATE leave_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, req.params.id]);
    const updated = await executeQuery('SELECT * FROM leave_requests WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== TAP LOGIN LOGS ====================

app.get('/api/tap-logs', (req, res) => {
  try {
    const rows = executeQuery(`SELECT t.*, e.name FROM tap_logs t LEFT JOIN employees e ON t.employee_id = e.id ORDER BY t.timestamp DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tap-logs', (req, res) => {
  try {
    const { barcode } = req.body;
    const employee = executeQuery('SELECT id FROM employees WHERE barcode = ?', [barcode]);
    const employee_id = employee.length > 0 ? employee[0].id : null;

    // Log the tap
    const result = executeInsert('INSERT INTO tap_logs (barcode, employee_id) VALUES (?, ?)', [barcode, employee_id]);

    let attendanceAction = null;

    // If employee found, handle attendance automatically
    if (employee_id) {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toTimeString().split(' ')[0];

      // Check if already checked in today
      const existingAttendance = executeQuery(
        'SELECT id, time_in FROM attendance WHERE employee_id = ? AND date = ? AND time_out IS NULL',
        [employee_id, today]
      );

      if (existingAttendance.length > 0) {
        // Record time out
        const timeIn = existingAttendance[0].time_in;
        const workedHours = calculateWorkedHours(timeIn, now);
        executeUpdate('UPDATE attendance SET time_out = ?, worked_hours = ? WHERE id = ?',
          [now, workedHours, existingAttendance[0].id]);
        attendanceAction = 'time_out';
      } else {
        // Record time in
        executeInsert('INSERT INTO attendance (employee_id, date, time_in) VALUES (?, ?, ?)',
          [employee_id, today, now]);
        attendanceAction = 'time_in';
      }
    }

    res.status(201).json({
      id: result.lastID,
      message: 'Tap logged',
      employee_found: employee.length > 0,
      attendance_action: attendanceAction
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tap-logs/:id', (req, res) => {
  try {
    executeUpdate('DELETE FROM tap_logs WHERE id = ?', [req.params.id]);
    res.json({ message: 'Tap log deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function calculateWorkedHours(timeIn, timeOut) {
  const [inHours, inMinutes] = timeIn.split(':').map(Number);
  const [outHours, outMinutes] = timeOut.split(':').map(Number);
  const inTotal = inHours * 60 + inMinutes;
  const outTotal = outHours * 60 + outMinutes;
  const diff = outTotal - inTotal;
  return Math.max(0, diff / 60).toFixed(2);
}

// ==================== SCHEDULE EVENTS ====================

app.get('/api/schedule-events', (req, res) => {
  try {
    const rows = executeQuery('SELECT * FROM schedule_events ORDER BY event_date DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/schedule-events', (req, res) => {
  try {
    const { title, description, event_date } = req.body;
    const result = executeInsert('INSERT INTO schedule_events (title, description, event_date) VALUES (?, ?, ?)', [title, description, event_date]);
    const newEvent = executeQuery('SELECT * FROM schedule_events WHERE id = ?', [result.lastID]);
    res.status(201).json(newEvent[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/schedule-events/:id', (req, res) => {
  try {
    executeUpdate('DELETE FROM schedule_events WHERE id = ?', [req.params.id]);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ANNOUNCEMENTS ====================

app.get('/api/announcements', async (req, res) => {
  try {
    const rows = await executeQuery('SELECT * FROM announcements ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/announcements', (req, res) => {
  try {
    const { title, content } = req.body;
    const result = executeInsert('INSERT INTO announcements (title, content) VALUES (?, ?)', [title, content]);
    res.status(201).json({ id: result.lastID, message: 'Announcement posted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/announcements/:id', (req, res) => {
  try {
    executeUpdate('DELETE FROM announcements WHERE id = ?', [req.params.id]);
    res.json({ message: 'Announcement deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== AUTHENTICATION ====================

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password });

    // Check if user exists and password matches
    const user = await executeQuery('SELECT u.*, e.name as employee_name FROM users u LEFT JOIN employees e ON u.employee_id = e.id WHERE u.username = $1 AND u.password = $2', [username, password]);
    console.log('Login query result:', user.length, 'users found');

    if (user.length === 0) {
      console.log('Login failed: Invalid credentials');
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    console.log('Login successful for user:', user[0].username);

    // Return user info (excluding password)
    const userInfo = {
      id: user[0].id,
      username: user[0].username,
      role: user[0].role,
      employee_id: user[0].employee_id,
      employee_name: user[0].employee_name
    };

    res.json({ message: 'Login successful', user: userInfo });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
