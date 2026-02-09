const { initializeDatabase, executeQuery } = require('./backend/database');

async function checkEmployees() {
  await initializeDatabase();

  console.log('Checking employees in database...');
  const employees = executeQuery('SELECT id, name FROM employees ORDER BY name');

  console.log(`Found ${employees.length} employees:`);
  employees.forEach(emp => {
    console.log(`- ID: ${emp.id}, Name: ${emp.name}`);
  });

  // Check if Merit Cruz exists
  const merit = employees.find(emp => emp.name.toLowerCase() === 'merit cruz');
  if (merit) {
    console.log(`\n✅ Found Merit Cruz (ID: ${merit.id})`);
  } else {
    console.log('\n❌ Merit Cruz not found in employees table');
  }
}

checkEmployees();
