const http = require('http');

const testLogin = (username, password) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ username, password });
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(data);
    req.end();
  });
};

async function runTests() {
  console.log('Testing admin login...');
  try {
    const result = await testLogin('admin', 'admin123');
    console.log('Status:', result.status);
    console.log('Response:', result.body);
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\nTesting john_does login...');
  try {
    const result = await testLogin('john_does', 'user123');
    console.log('Status:', result.status);
    console.log('Response:', result.body);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

runTests();
