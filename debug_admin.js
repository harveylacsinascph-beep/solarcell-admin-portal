const { initializeDatabase, executeQuery } = require('./backend/database');

async function debugAdmin() {
  try {
    await initializeDatabase();
    console.log('Database initialized');

    // Check users table
    const users = executeQuery('SELECT * FROM users');
    console.log('Users in database:', users.length);
    users.forEach(user => {
      console.log(`- ${user.username}: ${user.password} (${user.role})`);
    });

    // Check admin specifically
    const admin = executeQuery('SELECT * FROM users WHERE username = ?', ['admin']);
    console.log('Admin user:', admin.length > 0 ? admin[0] : 'Not found');

  } catch (err) {
    console.error('Error:', err);
  }
}

debugAdmin();
