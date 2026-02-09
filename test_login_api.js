const fetch = require('node-fetch');

async function testLogin() {
  try {
    const response = await fetch('http://localhost:3001/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'ralph_aguas',
        password: 'user123'
      })
    });

    const data = await response.json();
    console.log('Login response:', data);

    if (data.user) {
      console.log('User data stored in localStorage would be:', JSON.stringify(data.user, null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testLogin();
