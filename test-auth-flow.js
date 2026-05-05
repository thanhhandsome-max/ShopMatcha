const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production-12345';

// Test 1: Generate token
const payload = {
  MaTaiKhoan: 'TK007',
  TenDangNhap: 'test2@example.com',
  MaVaiTro: 'VT03',
  role: 'Khách hàng'
};

const token = jwt.sign(payload, secret, { expiresIn: '15m' });
console.log('Generated token:', token);

// Test 2: Verify token
try {
  const decoded = jwt.verify(token, secret);
  console.log('Verified payload:', decoded);
  console.log('Token is valid!');
} catch (e) {
  console.log('Verification failed:', e.message);
}

// Test 3: Test with curl commands
const { exec } = require('child_process');

// Login to get fresh token
exec('curl -s -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\\"email\\":\\"test2@example.com\\",\\"password\\":\\"Test123!\\"}"', (error, stdout) => {
  if (error) {
    console.error('Login failed:', error);
    return;
  }
  
  const response = JSON.parse(stdout);
  if (!response.success) {
    console.error('Login failed:', response.message);
    return;
  }
  
  const accessToken = response.data.accessToken;
  console.log('\nLogin successful!');
  console.log('Access token:', accessToken);
  
  // Test /api/auth/me with token
  exec(`curl -s http://localhost:5000/api/auth/me -H "Authorization: Bearer ${accessToken}"`, (error2, stdout2) => {
    if (error2) {
      console.error('Auth/me failed:', error2);
      return;
    }
    
    console.log('\nAuth/me response:', stdout2);
  });
});
