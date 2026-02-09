const fetch = require('node-fetch');

async function testScan() {
  try {
    console.log('Testing barcode scanner...');

    // First, get all employees to find Harvey Lacsina
    const employeesResponse = await fetch('http://localhost:3001/api/employees');
    const employees = await employeesResponse.json();

    console.log('All employees:');
    employees.forEach(emp => {
      console.log(`${emp.id}: ${emp.name} - ${emp.barcode}`);
    });

    // Find Harvey Lacsina
    const harvey = employees.find(emp => emp.name.toLowerCase().includes('harvey'));
    if (!harvey) {
      console.log('Harvey Lacsina not found in database');
      return;
    }

    console.log(`\nFound Harvey Lacsina: ${harvey.name} with barcode: ${harvey.barcode}`);

    // Now simulate scanning his barcode
    console.log(`\nSimulating scan of barcode: ${harvey.barcode}`);
    const scanResponse = await fetch('http://localhost:3001/api/tap-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ barcode: harvey.barcode })
    });

    const scanResult = await scanResponse.json();
    console.log('Scan result:', scanResult);

    // Check the tap logs
    const logsResponse = await fetch('http://localhost:3001/api/tap-logs');
    const logs = await logsResponse.json();

    console.log('\nRecent tap logs:');
    logs.slice(0, 5).forEach(log => {
      console.log(`${log.barcode} - ${new Date(log.timestamp).toLocaleString()}`);
    });

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testScan();
