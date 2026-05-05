const { exec } = require('child_process');
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production-12345';

console.log('🚀 Starting E2E Flow Test...\n');

// Step 1: Register new user with unique email
const uniqueEmail = `e2e_test_${Date.now()}@example.com`;
console.log('Step 1: Register new user...');
console.log('   Email:', uniqueEmail);
exec(`curl -s -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{\\"email\\":\\"${uniqueEmail}\\",\\"password\\":\\"Test123!\\",\\"confirmPassword\\":\\"Test123!\\",\\"fullName\\":\\"E2E Test User\\",\\"phone\\":\\"0909999999\\"}"`, (error, stdout) => {
  if (error) {
    console.error('❌ Registration failed:', error.message);
    return;
  }
  
  const regResponse = JSON.parse(stdout);
  if (!regResponse.success) {
    console.error('❌ Registration failed:', regResponse.message);
    return;
  }
  
  console.log('✅ Registration successful!');
  console.log('   User:', regResponse.data.user.TenDangNhap);
  console.log('   MaTaiKhoan:', regResponse.data.user.MaTaiKhoan);
  
  const accessToken = regResponse.data.accessToken;
  const refreshToken = regResponse.data.refreshToken;
  
  // Step 2: Test Auth/Me with token
  console.log('\nStep 2: Test Auth/Me with token...');
  exec(`curl -s http://localhost:5000/api/auth/me -H "Authorization: Bearer ${accessToken}"`, (error2, stdout2) => {
    if (error2) {
      console.error('❌ Auth/Me failed:', error2.message);
      return;
    }
    
    const meResponse = JSON.parse(stdout2);
    if (!meResponse.success) {
      console.error('❌ Auth/Me failed:', meResponse.message);
      return;
    }
    
    console.log('✅ Auth/Me successful!');
    console.log('   User:', meResponse.data.user.TenDangNhap);
    console.log('   Customer:', meResponse.data.customer?.TenKH);
    
    // Step 3: Get products
    console.log('\nStep 3: Get products...');
    exec(`curl -s http://localhost:5000/api/products?limit=2`, (error3, stdout3) => {
      if (error3) {
        console.error('❌ Get products failed:', error3.message);
        return;
      }
      
      const productsResponse = JSON.parse(stdout3);
      if (!productsResponse.success || !productsResponse.data.products?.length) {
        console.error('❌ Get products failed: No products found');
        return;
      }
      
      console.log('✅ Products retrieved!');
      console.log('   Found', productsResponse.data.products.length, 'products');
      const product = productsResponse.data.products[0];
      console.log('   Selected product:', product.TenSP, '- Price:', product.GiaBan);
      
      // Step 4: Create order (simulate cart checkout)
      console.log('\nStep 4: Create order (checkout)...');
      // Use store that has stock (CH01 has 15 units for SP01)
      const orderData = {
        items: [
          {
            MaSP: product.MaSP,
            quantity: 2,
            price: parseFloat(product.GiaBan)
          }
        ],
        MaCH: 'CH01', // Store CH01 has stock (15 units)
        payment_method: 'COD',
        customer_note: 'E2E Test Order'
      };
      
      const orderDataStr = JSON.stringify(orderData).replace(/"/g, '\\"');
      exec(`curl -s -X POST http://localhost:5000/api/orders -H "Content-Type: application/json" -H "Authorization: Bearer ${accessToken}" -d "${orderDataStr}"`, (error4, stdout4) => {
        if (error4) {
          console.error('❌ Create order failed:', error4.message);
          return;
        }
        
        const orderResponse = JSON.parse(stdout4);
        if (!orderResponse.success) {
          console.error('❌ Create order failed:', orderResponse.message);
          return;
        }
        
        console.log('✅ Order created successfully!');
        console.log('   Order ID:', orderResponse.data.MaDH);
        console.log('   Order Code:', orderResponse.data.order_code);
        console.log('   Total:', orderResponse.data.TongTien);
        
        const maDH = orderResponse.data.MaDH;
        
        // Step 5: Get order by ID
        console.log('\nStep 5: Get order by ID...');
        exec(`curl -s http://localhost:5000/api/orders/${maDH} -H "Authorization: Bearer ${accessToken}"`, (error5, stdout5) => {
          if (error5) {
            console.error('❌ Get order failed:', error5.message);
            return;
          }
          
          const orderDetailResponse = JSON.parse(stdout5);
          if (!orderDetailResponse.success) {
            console.error('❌ Get order failed:', orderDetailResponse.message);
            return;
          }
          
          console.log('✅ Order retrieved successfully!');
          console.log('   Order ID:', orderDetailResponse.data.MaDH);
          console.log('   Status:', orderDetailResponse.data.TrangThai);
          
          // Step 6: Get customer orders
          console.log('\nStep 6: Get customer orders...');
          exec(`curl -s "http://localhost:5000/api/orders?page=1&limit=5" -H "Authorization: Bearer ${accessToken}"`, (error6, stdout6) => {
            if (error6) {
              console.error('❌ Get orders failed:', error6.message);
              return;
            }
            
            const ordersResponse = JSON.parse(stdout6);
            if (!ordersResponse.success) {
              console.error('❌ Get orders failed:', ordersResponse.message);
              return;
            }
            
            console.log('✅ Customer orders retrieved!');
            console.log('   Total orders:', ordersResponse.data.pagination.total);
            console.log('   Orders on page:', ordersResponse.data.orders.length);
            
            // Step 7: Test Refresh Token
            console.log('\nStep 7: Test Refresh Token...');
            exec(`curl -s -X POST http://localhost:5000/api/auth/refresh -H "Content-Type: application/json" -d "{\\"refreshToken\\":\\"${refreshToken}\\"}"`, (error7, stdout7) => {
              if (error7) {
                console.error('❌ Refresh token failed:', error7.message);
                return;
              }
              
              const refreshResponse = JSON.parse(stdout7);
              if (!refreshResponse.success) {
                console.error('❌ Refresh token failed:', refreshResponse.message);
                return;
              }
              
              console.log('✅ Token refreshed successfully!');
              console.log('   New access token received');
              
              console.log('\n🎉 E2E Flow Test Completed Successfully!');
              console.log('\n📊 Summary:');
              console.log('   ✅ Registration');
              console.log('   ✅ Login/Token Generation');
              console.log('   ✅ Auth/Me (Protected Route)');
              console.log('   ✅ Products API');
              console.log('   ✅ Create Order (Checkout)');
              console.log('   ✅ Get Order by ID');
              console.log('   ✅ Get Customer Orders');
              console.log('   ✅ Refresh Token');
              console.log('\n🚀 All systems operational!');
            });
          });
        });
      });
    });
  });
});
