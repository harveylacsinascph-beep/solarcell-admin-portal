const { initializeDatabase, executeQuery, executeInsert, createUserAccountsForEmployees } = require('./backend/database');

async function testEmployeeAccountCreation() {
  console.log('🔄 Initializing database...');
  await initializeDatabase();

  console.log('👤 Adding employee: Juan Dela Cruz...');

  // Generate barcode
  const today = new Date();
  const dateStr = today.getFullYear().toString() +
                 (today.getMonth() + 1).toString().padStart(2, '0') +
                 today.getDate().toString().padStart(2, '0');
  const barcode = 'SCPH' + dateStr + '0001';

  const employeeData = {
    barcode: barcode,
    name: 'Juan Dela Cruz',
    phone: '09123456789',
    address: 'Manila, Philippines',
    birthdate: '1990-05-15',
    position: 'Software Engineer',
    employed_date: today.toISOString().split('T')[0],
    department: 'Engineering',
    emergency_contact_name: 'Maria Dela Cruz',
    emergency_contact_phone: '09987654321'
  };

  try {
    const result = executeInsert(
      `INSERT INTO employees (barcode, name, phone, address, birthdate, position, employed_date, department, emergency_contact_name, emergency_contact_phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [employeeData.barcode, employeeData.name, employeeData.phone, employeeData.address, employeeData.birthdate, employeeData.position, employeeData.employed_date, employeeData.department, employeeData.emergency_contact_name, employeeData.emergency_contact_phone]
    );

    console.log('✅ Employee added successfully!');
    console.log('Employee ID:', result.lastID);
    console.log('Barcode:', employeeData.barcode);

    // Create user accounts (this simulates what happens in server.js)
    console.log('🔐 Creating user accounts...');
    await createUserAccountsForEmployees();

    // Check if user account was created
    console.log('🔍 Checking user account creation...');
    const users = executeQuery('SELECT id, username, password, employee_id, role FROM users WHERE username = ?', ['juan_cruz']);

    if (users.length > 0) {
      console.log('✅ SUCCESS: User account created!');
      console.log('Username:', users[0].username);
      console.log('Password:', users[0].password);
      console.log('Role:', users[0].role);
      console.log('Linked Employee ID:', users[0].employee_id);
    } else {
      console.log('❌ FAILED: User account was not created');
    }

    // List all users for verification
    console.log('\n📋 All users in system:');
    const allUsers = executeQuery('SELECT u.username, u.role, e.name as employee_name FROM users u LEFT JOIN employees e ON u.employee_id = e.id ORDER BY u.username');
    allUsers.forEach(user => {
      console.log(`- ${user.username} (${user.role}) - ${user.employee_name || 'Admin'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEmployeeAccountCreation();
