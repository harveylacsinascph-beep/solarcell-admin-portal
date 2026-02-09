const { executeQuery } = require('./backend/database');

console.log('=== EMPLOYEES ===');
const employees = executeQuery('SELECT id, name, barcode FROM employees');
employees.forEach(emp => {
  console.log(`ID: ${emp.id}, Name: ${emp.name}, Barcode: ${emp.barcode}`);
});

console.log('\n=== ATTENDANCE RECORDS ===');
const attendance = executeQuery('SELECT a.id, a.employee_id, a.date, a.time_in, a.time_out, e.name, e.barcode FROM attendance a LEFT JOIN employees e ON a.employee_id = e.id ORDER BY a.created_at DESC LIMIT 10');
attendance.forEach(att => {
  console.log(`ID: ${att.id}, Employee: ${att.name}, Barcode: ${att.barcode}, Date: ${att.date}`);
});
