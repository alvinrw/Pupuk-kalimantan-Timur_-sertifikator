const axios = require('axios');

async function test() {
  try {
    const loginRes = await axios.post('http://localhost:3005/api/v1/auth/login', {
      username: 'muhfi_admin',
      password: 'admin123'
    });
    console.log('LOGIN 3005 OK:', loginRes.data);
    const token = loginRes.data.access_token;
    
    const usersRes = await axios.get('http://localhost:3005/api/v1/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('USERS 3005 OK:', usersRes.data);
  } catch (err) {
    console.error('ERROR 3005:', err.message, err.response?.data);
  }

  try {
    const loginRes = await axios.post('http://localhost:3010/api/v1/auth/login', {
      username: 'muhfi_admin',
      password: 'admin123'
    });
    console.log('LOGIN 3010 OK:', loginRes.data);
    const token = loginRes.data.access_token;
    
    const usersRes = await axios.get('http://localhost:3010/api/v1/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('USERS 3010 OK:', usersRes.data);
  } catch (err) {
    console.error('ERROR 3010:', err.message, err.response?.data);
  }
}

test();
