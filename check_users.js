const { initializeDatabase, executeQuery } = require('./backend/database');

async function checkUsers() {
  console.log('Initializing database...');
  await initializeDatabase();

  console.log('Users in database:');
  const users = executeQuery('SELECT username, password FROM users');
  users.forEach(u => {
    console.log(`Username: ${u.username}, Password: ${u.password}`);
  });

  console.log('\nTesting login query...');
  const testUser = executeQuery('SELECT u.*, e.name as employee_name FROM users u LEFT JOIN employees e ON u.employee_id = e.id WHERE u.username = ? AND u.password = ?', ['harvey_lacsina', 'user123']);
  console.log('Login test result:', testUser.length > 0 ? 'SUCCESS' : 'FAILED');
  if (testUser.length > 0) {
    console.log('User found:', testUser[0]);
  }
}

checkUsers().catch(console.error);
