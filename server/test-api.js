const http = require('http');

async function testAPI() {
  console.log('========= API TESTS =========\n');
  
  // Test 1: Health
  await new Promise(resolve => {
    const req = http.get('http://localhost:8000/api/health',  (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✓ Health Endpoint:', res.statusCode);
        console.log('  Response:', data.substring(0, 100));
        resolve();
      });
    }).on('error', e => {
      console.error('✗ Health Error:', e.message);
      resolve();
    });
  });
  
  // Test 2: Swagger
  await new Promise(resolve => {
    const req = http.get('http://localhost:8000/api-docs/', (res) => {
      console.log('\n✓ Swagger:', res.statusCode);
      resolve();
    }).on('error', e => {
      console.error('\n✗ Swagger Error:', e.message);
      resolve();
    });
  });
  
  // Test 3: Login
  await new Promise(resolve => {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {'Content-Type': 'application/json'}
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('\n✓ Login Endpoint:', res.statusCode);
        try {
          const json = JSON.parse(data);
          console.log('  Message:', json.message);
          if (json.data && json.data.token) {
            console.log('  Token:', 'Generated (✓)');
          }
        } catch (e) {
          console.log('  Response:', data.substring(0, 100));
        }
        resolve();
      });
    }).on('error', e => {
      console.error('\n✗ Login Error:', e.message);
      resolve();
    });
    
    req.write(JSON.stringify({
      email: 'admin@meditrack.com',
      password: 'Password123!'
    }));
    req.end();
  });
  
  console.log('\n========= TESTS COMPLETE =========');
  process.exit(0);
}

setTimeout(() => {
  testAPI();
}, 2000);
