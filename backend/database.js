const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER NOT NULL REFERENCES employees(id),
        date DATE NOT NULL,
        time_in TIME,
        time_out TIME,
        worked_hours REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER NOT NULL REFERENCES employees(id),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        leave_type TEXT NOT NULL,
        reason TEXT,
        status TEXT DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS tap_logs (
        id SERIAL PRIMARY KEY,
        barcode TEXT NOT NULL,
        employee_id INTEGER REFERENCES employees(id),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        employee_id INTEGER REFERENCES employees(id),
        role TEXT DEFAULT 'employee',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS schedule_events (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        event_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables initialized');
  } catch (err) {
    console.error('❌ Error initializing database:', err);
  } finally {
    client.release();
  }
}

async function executeQuery(sql, params = []) {
  try {
    const res = await pool.query(sql, params);
    return res.rows;
  } catch (err) {
    console.error('Query error:', err);
    throw err;
  }
}

async function executeInsert(sql, params = []) {
  try {
    const res = await pool.query(sql, params);
    return { lastID: res.rows[0].id };
  } catch (err) {
    console.error('Insert error:', err);
    throw err;
  }
}

async function executeUpdate(sql, params = []) {
  try {
    const res = await pool.query(sql, params);
    return res.rowCount;
  } catch (err) {
    console.error('Update error:', err);
    throw err;
  }
}

async function createUserAccountsForEmployees() {
  try {
    console.log('🔄 Starting user account creation...');

    // Create admin account first
    console.log('👤 Checking for admin account...');
    const existingAdmin = await executeQuery('SELECT id FROM users WHERE username = $1', ['admin']);
    console.log('Admin check result:', existingAdmin.length, 'existing admin accounts');

    if (existingAdmin.length === 0) {
      console.log('📝 Creating admin account...');
      const adminResult = await executeInsert(
        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id',
        ['admin', 'admin123', 'admin']
      );
      console.log('✅ Created admin account: admin (ID:', adminResult.lastID, ')');
    } else {
      console.log('ℹ️ Admin account already exists');
    }

    // Get all employees
    console.log('👥 Getting employee list...');
    const employees = await executeQuery('SELECT id, name FROM employees');
    console.log('Found', employees.length, 'employees');

    for (const employee of employees) {
      // Create username from employee name (first_last format, lowercase)
      const nameParts = employee.name.toLowerCase().split(/\s+/);
      const username = nameParts.length >= 2 ? nameParts[0] + '_' + nameParts[nameParts.length - 1] : nameParts[0];
      console.log(`🔍 Checking user account for ${employee.name} -> ${username}`);

      // Check if user already exists
      const existingUser = await executeQuery('SELECT id FROM users WHERE username = $1', [username]);

      if (existingUser.length === 0) {
        // Create user account with password 'user123'
        console.log(`📝 Creating user account for ${employee.name}...`);
        const result = await executeInsert(
          'INSERT INTO users (username, password, employee_id, role) VALUES ($1, $2, $3, $4) RETURNING id',
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
  getDb: () => pool
};
