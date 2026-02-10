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

    // Add sample employees if none exist
    const existingEmployees = await client.query('SELECT COUNT(*) as count FROM employees');
    if (existingEmployees.rows[0].count == 0) {
      console.log('📝 Adding sample employees...');

      const sampleEmployees = [
        {
          barcode: 'SCPH20240101001',
          name: 'John Doe',
          phone: '+63 912 345 6789',
          address: '123 Main St, Manila',
          birthdate: '1990-01-15',
          position: 'Software Developer',
          employed_date: '2024-01-01',
          department: 'IT',
          emergency_contact_name: 'Jane Doe',
          emergency_contact_phone: '+63 912 345 6790'
        },
        {
          barcode: 'SCPH20240101002',
          name: 'Maria Santos',
          phone: '+63 917 123 4567',
          address: '456 Oak Ave, Quezon City',
          birthdate: '1988-03-22',
          position: 'HR Manager',
          employed_date: '2023-06-15',
          department: 'Human Resources',
          emergency_contact_name: 'Pedro Santos',
          emergency_contact_phone: '+63 917 123 4568'
        },
        {
          barcode: 'SCPH20240101003',
          name: 'Carlos Reyes',
          phone: '+63 918 987 6543',
          address: '789 Pine Rd, Cebu',
          birthdate: '1992-07-10',
          position: 'Accountant',
          employed_date: '2024-02-01',
          department: 'Finance',
          emergency_contact_name: 'Rosa Reyes',
          emergency_contact_phone: '+63 918 987 6544'
        }
      ];

      for (const emp of sampleEmployees) {
        await client.query(
          `INSERT INTO employees (barcode, name, phone, address, birthdate, position, employed_date, department, emergency_contact_name, emergency_contact_phone)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [emp.barcode, emp.name, emp.phone, emp.address, emp.birthdate, emp.position, emp.employed_date, emp.department, emp.emergency_contact_name, emp.emergency_contact_phone]
        );
        console.log(`✅ Added sample employee: ${emp.name}`);
      }
    }

    // Add sample announcements if none exist
    const existingAnnouncements = await client.query('SELECT COUNT(*) as count FROM announcements');
    if (existingAnnouncements.rows[0].count == 0) {
      console.log('📝 Adding sample announcements...');

      const sampleAnnouncements = [
        {
          title: 'Welcome to SolarCell PH',
          content: 'Welcome to our new employee management system! We are excited to have you on board.'
        },
        {
          title: 'System Maintenance Notice',
          content: 'The system will undergo maintenance this weekend. Please save your work before logging out.'
        },
        {
          title: 'New Attendance Policy',
          content: 'Please ensure you clock in and out properly using the tap login system or manual entry.'
        }
      ];

      for (const ann of sampleAnnouncements) {
        await client.query(
          'INSERT INTO announcements (title, content) VALUES ($1, $2)',
          [ann.title, ann.content]
        );
        console.log(`✅ Added sample announcement: ${ann.title}`);
      }
    }

    // Add sample leave requests if none exist
    const existingLeaves = await client.query('SELECT COUNT(*) as count FROM leave_requests');
    if (existingLeaves.rows[0].count == 0) {
      console.log('📝 Adding sample leave requests...');

      const sampleLeaves = [
        {
          employee_id: 1,
          start_date: '2024-01-15',
          end_date: '2024-01-16',
          leave_type: 'Vacation',
          reason: 'Family vacation'
        },
        {
          employee_id: 2,
          start_date: '2024-01-20',
          end_date: '2024-01-22',
          leave_type: 'Sick',
          reason: 'Medical appointment'
        },
        {
          employee_id: 3,
          start_date: '2024-01-25',
          end_date: '2024-01-25',
          leave_type: 'Personal',
          reason: 'Personal matters'
        }
      ];

      for (const leave of sampleLeaves) {
        await client.query(
          'INSERT INTO leave_requests (employee_id, start_date, end_date, leave_type, reason) VALUES ($1, $2, $3, $4, $5)',
          [leave.employee_id, leave.start_date, leave.end_date, leave.leave_type, leave.reason]
        );
        console.log(`✅ Added sample leave request for employee ${leave.employee_id}`);
      }
    }

    // Add sample attendance data if none exist
    const existingAttendance = await client.query('SELECT COUNT(*) as count FROM attendance');
    if (existingAttendance.rows[0].count == 0) {
      console.log('📝 Adding sample attendance data...');

      const today = new Date().toISOString().split('T')[0];
      const sampleAttendance = [
        {
          employee_id: 1,
          date: today,
          time_in: '08:00:00',
          time_out: '17:00:00',
          worked_hours: 8.0
        },
        {
          employee_id: 2,
          date: today,
          time_in: '08:30:00',
          time_out: null,
          worked_hours: null
        }
      ];

      for (const att of sampleAttendance) {
        await client.query(
          'INSERT INTO attendance (employee_id, date, time_in, time_out, worked_hours) VALUES ($1, $2, $3, $4, $5)',
          [att.employee_id, att.date, att.time_in, att.time_out, att.worked_hours]
        );
        console.log(`✅ Added sample attendance for employee ${att.employee_id}`);
      }
    }
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

    // Add sample employees if none exist
    const existingEmployees = await executeQuery('SELECT COUNT(*) as count FROM employees');
    if (existingEmployees[0].count == 0) {
      console.log('📝 Adding sample employees...');

      const sampleEmployees = [
        {
          barcode: 'SCPH20240101001',
          name: 'John Doe',
          phone: '+63 912 345 6789',
          address: '123 Main St, Manila',
          birthdate: '1990-01-15',
          position: 'Software Developer',
          employed_date: '2024-01-01',
          department: 'IT',
          emergency_contact_name: 'Jane Doe',
          emergency_contact_phone: '+63 912 345 6790'
        },
        {
          barcode: 'SCPH20240101002',
          name: 'Maria Santos',
          phone: '+63 917 123 4567',
          address: '456 Oak Ave, Quezon City',
          birthdate: '1988-03-22',
          position: 'HR Manager',
          employed_date: '2023-06-15',
          department: 'Human Resources',
          emergency_contact_name: 'Pedro Santos',
          emergency_contact_phone: '+63 917 123 4568'
        },
        {
          barcode: 'SCPH20240101003',
          name: 'Carlos Reyes',
          phone: '+63 918 987 6543',
          address: '789 Pine Rd, Cebu',
          birthdate: '1992-07-10',
          position: 'Accountant',
          employed_date: '2024-02-01',
          department: 'Finance',
          emergency_contact_name: 'Rosa Reyes',
          emergency_contact_phone: '+63 918 987 6544'
        }
      ];

      for (const emp of sampleEmployees) {
        await executeInsert(
          `INSERT INTO employees (barcode, name, phone, address, birthdate, position, employed_date, department, emergency_contact_name, emergency_contact_phone)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [emp.barcode, emp.name, emp.phone, emp.address, emp.birthdate, emp.position, emp.employed_date, emp.department, emp.emergency_contact_name, emp.emergency_contact_phone]
        );
        console.log(`✅ Added sample employee: ${emp.name}`);
      }
    }

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
