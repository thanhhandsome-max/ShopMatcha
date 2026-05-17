const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('╔════════════════════════════════════════════════════════════════════════════════╗');
    console.log('║           COMPREHENSIVE DATABASE SCHEMA DOCUMENTATION - MATCHA SHOP              ║');
    console.log('║                      SQL Server: web_matcha Database                            ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');

    // 1. Get all tables
    console.log('\n═══════════════════════════════════════════════════════════════════════════════════');
    console.log('1. ALL DATABASE TABLES');
    console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

    const tables = await prisma.$queryRaw`
      SELECT 
        TABLE_NAME,
        TABLE_SCHEMA,
        TABLE_TYPE
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'dbo'
      ORDER BY TABLE_NAME
    `;

    console.log(`Total Tables: ${tables.length}\n`);
    tables.forEach((table, idx) => {
      console.log(`${idx + 1}. ${table.TABLE_NAME}`);
    });

    // 2. Get column information for each table
    console.log('\n\n═══════════════════════════════════════════════════════════════════════════════════');
    console.log('2. DETAILED TABLE STRUCTURE - COLUMNS & DATA TYPES');
    console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      const columns = await prisma.$queryRaw`
        SELECT 
          COLUMN_NAME,
          ORDINAL_POSITION,
          DATA_TYPE,
          CHARACTER_MAXIMUM_LENGTH,
          NUMERIC_PRECISION,
          NUMERIC_SCALE,
          IS_NULLABLE,
          COLUMN_DEFAULT,
          COLUMNPROPERTY(OBJECT_ID(TABLE_SCHEMA + '.' + TABLE_NAME), COLUMN_NAME, 'IsIdentity') as IS_IDENTITY
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = ${tableName}
        ORDER BY ORDINAL_POSITION
      `;

      console.log(`\n┌─ Table: [dbo].[${tableName}] (${columns.length} columns) ─┐`);
      columns.forEach((col, idx) => {
        let dataType = col.DATA_TYPE;
        if (col.CHARACTER_MAXIMUM_LENGTH) dataType += `(${col.CHARACTER_MAXIMUM_LENGTH})`;
        if (col.NUMERIC_PRECISION) dataType += `(${col.NUMERIC_PRECISION},${col.NUMERIC_SCALE})`;
        
        const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
        const identity = col.IS_IDENTITY === 1 ? ' [PK/IDENTITY]' : '';
        const defaultVal = col.COLUMN_DEFAULT ? ` DEFAULT(${col.COLUMN_DEFAULT})` : '';
        
        console.log(`   ${idx + 1}. ${col.COLUMN_NAME.padEnd(20)} | ${dataType.padEnd(20)} | ${nullable}${identity}${defaultVal}`);
      });
      console.log('└' + '─'.repeat(100) + '┘');
    }

    // 3. Get Primary Keys
    console.log('\n\n═══════════════════════════════════════════════════════════════════════════════════');
    console.log('3. PRIMARY KEYS');
    console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

    const primaryKeys = await prisma.$queryRaw`
      SELECT 
        t.TABLE_NAME,
        c.COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE k
      JOIN INFORMATION_SCHEMA.TABLES t ON k.TABLE_NAME = t.TABLE_NAME
      JOIN INFORMATION_SCHEMA.COLUMNS c ON k.COLUMN_NAME = c.COLUMN_NAME AND c.TABLE_NAME = t.TABLE_NAME
      WHERE k.CONSTRAINT_NAME LIKE 'PK_%' AND t.TABLE_SCHEMA = 'dbo'
      ORDER BY t.TABLE_NAME, k.ORDINAL_POSITION
    `;

    const pkMap = {};
    primaryKeys.forEach(pk => {
      if (!pkMap[pk.TABLE_NAME]) pkMap[pk.TABLE_NAME] = [];
      pkMap[pk.TABLE_NAME].push(pk.COLUMN_NAME);
    });

    Object.entries(pkMap).forEach(([table, keys]) => {
      console.log(`${table.padEnd(25)} → [${keys.join(', ')}]`);
    });

    // 4. Get Foreign Keys
    console.log('\n\n═══════════════════════════════════════════════════════════════════════════════════');
    console.log('4. FOREIGN KEY RELATIONSHIPS');
    console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

    const foreignKeys = await prisma.$queryRaw`
      SELECT 
        fk.CONSTRAINT_NAME,
        fk.TABLE_NAME as CHILD_TABLE,
        fk.COLUMN_NAME as CHILD_COLUMN,
        rc.UNIQUE_CONSTRAINT_NAME,
        rc.DELETE_RULE,
        rc.UPDATE_RULE,
        ku.TABLE_NAME as PARENT_TABLE,
        ku.COLUMN_NAME as PARENT_COLUMN
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE fk
      LEFT JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
        ON fk.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
      LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku
        ON rc.UNIQUE_CONSTRAINT_NAME = ku.CONSTRAINT_NAME
      WHERE fk.TABLE_SCHEMA = 'dbo' 
        AND rc.CONSTRAINT_NAME IS NOT NULL
      ORDER BY fk.TABLE_NAME, fk.CONSTRAINT_NAME
    `;

    const seenFks = new Set();
    foreignKeys.forEach(fk => {
      const key = `${fk.CHILD_TABLE}_${fk.CHILD_COLUMN}`;
      if (!seenFks.has(key)) {
        seenFks.add(key);
        const action = `[${fk.DELETE_RULE}/${fk.UPDATE_RULE}]`;
        console.log(`${fk.CHILD_TABLE.padEnd(25)} ${fk.CHILD_COLUMN.padEnd(20)} ──→ ${(fk.PARENT_TABLE || '?').padEnd(25)} ${fk.PARENT_COLUMN || '?'} ${action}`);
      }
    });

    // 5. Get Indexes
    console.log('\n\n═══════════════════════════════════════════════════════════════════════════════════');
    console.log('5. INDEXES');
    console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

    const indexes = await prisma.$queryRaw`
      SELECT 
        t.TABLE_NAME,
        i.NAME as INDEX_NAME,
        STRING_AGG(c.NAME, ', ') as COLUMNS,
        i.TYPE_DESC
      FROM sys.indexes i
      JOIN sys.tables t ON i.object_id = t.object_id
      JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
      JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
      WHERE t.schema_id = SCHEMA_ID('dbo') AND i.NAME IS NOT NULL
      GROUP BY t.TABLE_NAME, i.NAME, i.TYPE_DESC
      ORDER BY t.TABLE_NAME, i.NAME
    `;

    const indexMap = {};
    indexes.forEach(idx => {
      if (!indexMap[idx.TABLE_NAME]) indexMap[idx.TABLE_NAME] = [];
      indexMap[idx.TABLE_NAME].push(`${idx.INDEX_NAME} (${idx.COLUMNS}) [${idx.TYPE_DESC}]`);
    });

    Object.entries(indexMap).forEach(([table, idxList]) => {
      console.log(`\n${table}:`);
      idxList.forEach(idx => console.log(`  • ${idx}`));
    });

    // 6. Get Row Counts
    console.log('\n\n═══════════════════════════════════════════════════════════════════════════════════');
    console.log('6. TABLE ROW COUNTS & SIZE');
    console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

    for (const table of tables) {
      try {
        const result = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM [dbo].[${table.TABLE_NAME}]`);
        const count = result[0].count;
        console.log(`${table.TABLE_NAME.padEnd(30)} → ${count.toString().padStart(8)} rows`);
      } catch (e) {
        console.log(`${table.TABLE_NAME.padEnd(30)} → Query failed`);
      }
    }

    // 7. Relationships Summary
    console.log('\n\n═══════════════════════════════════════════════════════════════════════════════════');
    console.log('7. RELATIONSHIP HIERARCHY');
    console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

    console.log(`Core Business Tables:`);
    console.log(`  • hoadon (Orders) ─┬─→ chitiethoadon (Order Items)`);
    console.log(`                     ├─→ khachhang (Customers)`);
    console.log(`                     ├─→ cuahang (Stores)`);
    console.log(`                     ├─→ nhanvien (Employees)`);
    console.log(`                     ├─→ taikhoan (Accounts)`);
    console.log(`                     ├─→ payments (Payments)`);
    console.log(`                     ├─→ payment_logs (Payment Logs)`);
    console.log(`                     ├─→ khuyenmaikhachhang (Customer Promotions)`);
    console.log(`                     └─→ chuyenhanhthanhpham (Shipping)`);
    
    console.log(`\n  • sanpham (Products) ─┬─→ sanpham_anh (Product Images)`);
    console.log(`                        ├─→ loaisanpham (Product Categories)`);
    console.log(`                        ├─→ khuyenmai (Promotions)`);
    console.log(`                        ├─→ tonkho (Stock Levels)`);
    console.log(`                        └─→ chitiethoadon (Order Items)`);
    
    console.log(`\n  • khachhang (Customers) ─┬─→ address (Customer Addresses)`);
    console.log(`                           ├─→ khuyenmaikhachhang (Promotions)`);
    console.log(`                           ├─→ hoadon (Orders)`);
    console.log(`                           └─→ payments (Payments)`);
    
    console.log(`\n  • Inventory Tables:`);
    console.log(`    - tonkho (Warehouse Stock) → kho (Warehouses)`);
    console.log(`    - phieunhap (Purchase Orders) → nhaphanphoi (Suppliers)`);
    console.log(`    - phieuxuat (Export/Sales Orders) → cuahang (Stores)`);
    
    console.log(`\n  • Internal Logistics:`);
    console.log(`    - phieuchuyenhang (Transfer Orders) ↔ cuahang (Store-to-Store)`);
    console.log(`    - phieunhanhang (Receiving Orders) ← phieuchuyenhang`);

    // 8. Summary Statistics
    console.log('\n\n═══════════════════════════════════════════════════════════════════════════════════');
    console.log('8. SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

    console.log(`Total Tables:           ${tables.length}`);
    console.log(`Total Foreign Keys:     ${foreignKeys.length}`);
    console.log(`Total Indexed Columns:  ${indexes.length}`);
    console.log(`\nKey Entities:`);
    console.log(`  ✓ Business: Customers, Products, Orders, Payments, Shipping`);
    console.log(`  ✓ Inventory: Stock Tracking, Warehouses, Transfers`);
    console.log(`  ✓ Finance: Purchase Orders, Export Orders, Promotions`);
    console.log(`  ✓ Users: Accounts, Employees, Roles/Permissions`);
    console.log(`  ✓ Commerce: Shopping Cart, Payment Methods, Product Images\n`);

  } catch (e) {
    console.error('Error:', e.message);
    console.error(e.stack);
  } finally {
    await prisma.$disconnect();
  }
})();
