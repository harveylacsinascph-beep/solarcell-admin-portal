const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
let db = null;

// Suppress Node.js warnings about assertion failures
process.on('uncaughtException', (err) => {
  if (!err.message.includes('Assertion failed')) {
    throw err;
  }
});

// Initialize database
async function initializeDatabase() {
  const SQL = await initSqlJs();
  
  // Try to load existing database
  let filebuffer;
  try {
    filebuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(filebuffer);
  } catch (err) {
    // Create new database
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barcode TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      birthdate DATE,
      position TEXT,
      employed_date DATE,
      department TEXT,
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      vacation_leave INTEGER DEFAULT 0,
      sick_leave INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      date DATE NOT NULL,
      time_in TIME,
      time_out TIME,
      worked_hours REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS leave_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      leave_type TEXT NOT NULL,
      reason TEXT,
      status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tap_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barcode TEXT NOT NULL,
      employee_id INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS schedule_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      event_date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      employee_id INTEGER,
      role TEXT DEFAULT 'employee',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    )
  `);

  saveDatabase();
  console.log('✅ Database initialized');
}

function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

function executeQuery(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const result = [];
    while (stmt.step()) {
      result.push(stmt.getAsObject());
    }
    stmt.free();
    return result;
  } catch (err) {
    throw err;
  }
}

function executeInsert(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    stmt.step();
    stmt.free();
    const result = db.exec('SELECT last_insert_rowid() as id');
    saveDatabase();
    return { lastID: result[0].values[0][0] };
  } catch (err) {
    throw err;
  }
}

function executeUpdate(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    stmt.step();
    stmt.free();
    saveDatabase();
    return { changes: db.getRowsModified() };
  } catch (err) {
    throw err;
  }
}

async function createUserAccountsForEmployees() {
  try {
    console.log('🔄 Starting user account creation...');

    // Create admin account first
    console.log('👤 Checking for admin account...');
    const existingAdmin = executeQuery('SELECT id FROM users WHERE username = ?', ['admin']);
    console.log('Admin check result:', existingAdmin.length, 'existing admin accounts');

    if (existingAdmin.length === 0) {
      console.log('📝 Creating admin account...');
      const adminResult = executeInsert(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        ['admin', 'admin123', 'admin']
      );
      console.log('✅ Created admin account: admin (ID:', adminResult.lastID, ')');
    } else {
      console.log('ℹ️ Admin account already exists');
    }

    // Get all employees
    console.log('👥 Getting employee list...');
    const employees = executeQuery('SELECT id, name FROM employees');
    console.log('Found', employees.length, 'employees');

    for (const employee of employees) {
      // Create username from employee name (first_last format, lowercase)
      const nameParts = employee.name.toLowerCase().split(/\s+/);
      const username = nameParts.length >= 2 ? nameParts[0] + '_' + nameParts[nameParts.length - 1] : nameParts[0];
      console.log(`🔍 Checking user account for ${employee.name} -> ${username}`);

      // Check if user already exists
      const existingUser = executeQuery('SELECT id FROM users WHERE username = ?', [username]);

      if (existingUser.length === 0) {
        // Create user account with password 'user123'
        console.log(`📝 Creating user account for ${employee.name}...`);
        const result = executeInsert(
          'INSERT INTO users (username, password, employee_id, role) VALUES (?, ?, ?, ?)',
          [username, 'user123', employee.id, 'employee']
        );
        console.log(`✅ Created user account for ${employee.name}: ${username} (ID: ${result.lastID})`);
      } else {
        console.log(`ℹ️ User account for ${employee.name} already exists`);
      }
    }

    console.log('✅ User accounts creation completed');
  } catch (err) {
    console.error('❌ Error creating user accounts:', err.message);
    console.error('Stack trace:', err.stack);
  }
}

module.exports = {
  initializeDatabase,
  executeQuery,
  executeInsert,
  executeUpdate,
  createUserAccountsForEmployees,
  getDb: () => db
};
