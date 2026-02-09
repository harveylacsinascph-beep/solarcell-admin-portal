const { executeQuery } = require('./backend/database');

console.log('Employee Login Credentials:');
console.log('===========================');

const employees = executeQuery('SELECT e.name, u.username FROM employees e LEFT JOIN users u ON e.id = u.employee_id');

employees.forEach(emp => {
  console.log(`Name: ${emp.name}`);
  console.log(`Username: ${emp.username || 'Not created'}`);
  console.log(`Password: user123`);
  console.log('---');
});
