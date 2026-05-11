const http = require('http');

console.log('Testing API connection...');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/don-hang/auto-cancel',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': 0
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response status:', res.statusCode);
    console.log('Response data:', data);
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.end();