const sql = require('mssql');

const config = {
  server: 'localhost',
  port: 1433,
  user: 'sa',
  password: 'Thanh@123',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    connectionTimeout: 30000,
    requestTimeout: 30000
  }
};

async function testConnection() {
  try {
    console.log('🔍 Testing SQL Server connection...');
    const pool = await sql.connect(config);
    console.log('✅ Connection successful!');

    // Test query
    const result = await pool.request().query('SELECT @@VERSION as version');
    console.log('📊 SQL Server version:', result.recordset[0].version);

    // Create database if not exists
    await pool.request().query(`
      IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'web_matcha')
      CREATE DATABASE web_matcha;
    `);
    console.log('✅ Database web_matcha created/verified');

    await pool.close();
    console.log('🎉 Ready to run setup-db!');

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Make sure Docker is running');
    console.log('2. Check: docker ps -a');
    console.log('3. Restart container: docker restart sqlserver');
    console.log('4. Wait 2-3 minutes after starting container');
  }
}

testConnection();