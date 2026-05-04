# Development Guide - ShopMatcha Backend

**Date**: 2026-05-02  
**Phase**: 2 - Enhanced Features & Optimization

---

## 🎯 Setup & Running

### Initial Setup

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npm run prisma:generate

# 3. Run database migration
npm run prisma:migrate -- --name "initial_schema"

# 4. Seed sample data
npm run prisma:seed

# 5. Start development server
npm run dev
```

### Verify Installation

```bash
# Check API is running
curl http://localhost:3000/api/shop

# Test categories endpoint
curl http://localhost:3000/api/shop/categories

# Test products endpoint
curl http://localhost:3000/api/shop/products
```

---

## 🧪 Testing

### Run All Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run only integration tests
npm run test:integration
```

### Test Structure

```
src/
├── services/
│   ├── product.service.ts
│   ├── product.service.test.ts    ← Unit tests
│   ├── category.service.ts
│   └── ...
└── app/api/shop/
    ├── products/
    │   └── route.ts
    └── __tests__/
        └── integration.test.ts     ← Integration tests
```

---

## 💾 Database Seeding

### Seed Sample Data

```bash
npm run prisma:seed
```

This creates:
- 2 Warehouses
- 3 Shops
- 4 Categories
- 10 Products
- Warehouse stock for each product
- Shop stock for each product

### Seed Output Example

```
📦 Creating warehouses...
✅ Created 2 warehouses

🏪 Creating shops...
✅ Created 3 shops

📂 Creating categories...
✅ Created 4 categories

🛍️  Creating products...
✅ Created 10 products

✨ Database seeding completed successfully!
```

### Reset Database

To start fresh:

```bash
# 1. Drop all tables
npx prisma migrate reset

# 2. Run migration + seed
npm run prisma:seed
```

---

## 🔄 Caching Strategy

### In-Memory Cache (Development)

The caching layer is already integrated but currently uses in-memory storage. This is fine for development.

### Cache Configuration

File: `src/lib/cache.ts`

```typescript
export const CACHE_CONFIG = {
  CATEGORIES_ALL: { key: "categories:all", ttl: 3600 },           // 1 hour
  FEATURED_PRODUCTS: { key: "products:featured", ttl: 1800 },     // 30 min
  PRODUCT_DETAIL: { key: (id) => `product:${id}`, ttl: 7200 },    // 2 hours
  HOMEPAGE_DATA: { key: "homepage:data", ttl: 600 },              // 10 min
};
```

### Upgrade to Redis (Production)

For production, you can upgrade to Redis:

1. Install Redis client:
   ```bash
   npm install redis
   ```

2. Replace cache manager in `src/lib/cache.ts`:
   ```typescript
   import { createClient } from "redis";
   
   const redisClient = createClient({
     host: process.env.REDIS_HOST || "localhost",
     port: process.env.REDIS_PORT || 6379,
   });
   
   // Replace cache implementation with Redis calls
   ```

---

## 📊 Performance Monitoring

### Database Indexes

Indexes are automatically created by Prisma migration. To verify:

```bash
# Connect to MySQL
mysql -u root -p matcha_shop

# List indexes
SHOW INDEXES FROM Product;
SHOW INDEXES FROM Category;
SHOW INDEXES FROM WarehouseStock;
SHOW INDEXES FROM ShopStock;
```

### Query Performance

Monitor slow queries in MySQL:

```sql
-- Check query execution time
EXPLAIN SELECT * FROM Product WHERE categoryId = 'xxx';
```

### API Performance Tips

1. **Use appropriate pagination**
   ```
   GET /api/shop/products?page=1&limit=12  ✅ Good
   GET /api/shop/products?limit=1000       ❌ Bad (too much data)
   ```

2. **Filter results early**
   ```
   GET /api/shop/products?inStock=true&categoryId=cat_1  ✅ Good
   GET /api/shop/products  (filter client-side)          ❌ Bad
   ```

3. **Use specific queries**
   ```
   GET /api/shop/products/search?q=matcha  ✅ Good
   GET /api/shop/products (filter in code) ❌ Bad
   ```

---

## 🔧 Common Development Tasks

### Add New Product

```bash
# Use Prisma Studio (interactive GUI)
npx prisma studio

# Or use seed script as template and modify
```

### Update Category

```typescript
// Use Prisma client directly
const category = await prisma.category.update({
  where: { id: "cat_1" },
  data: { name: "New Name" },
});
```

### Invalidate Cache

```typescript
import { invalidateProductCaches } from "@/lib/cache";

// When updating a product
invalidateProductCaches(productId);

// When updating categories
invalidateCategoryCaches();

// Clear all cache
invalidateAllCaches();
```

---

## 🐛 Debugging

### Enable SQL Query Logging

```bash
# Set environment variable before running
export DEBUG=prisma:*
npm run dev
```

This will show all Prisma queries in console.

### Use Prisma Studio

```bash
npx prisma studio
```

Opens interactive GUI at `http://localhost:5555` to browse/modify database.

### API Testing Tools

#### Using curl

```bash
# Get products with filters
curl -X GET "http://localhost:3000/api/shop/products?page=1&limit=5&sortBy=price_asc"

# Search products
curl -X GET "http://localhost:3000/api/shop/products/search?q=matcha&limit=10"

# Get product detail
curl -X GET "http://localhost:3000/api/shop/products/prod_123"
```

#### Using Postman

Import collection template:

```json
{
  "info": {
    "name": "ShopMatcha API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Categories",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/shop/categories"
      }
    },
    {
      "name": "Get Products",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/shop/products?page=1&limit=12"
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000"
    }
  ]
}
```

---

## 📝 Code Standards

### TypeScript

- ✅ Use strict mode: `"strict": true` in tsconfig.json
- ✅ Add explicit return types on functions
- ✅ Define interfaces for data models
- ✅ Use `const` and `let`, avoid `var`

### Naming Conventions

- **Files**: `kebab-case.ts` or `camelCase.ts`
- **Functions**: `camelCase()`
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces**: `PascalCase`
- **Classes**: `PascalCase`

### Comments

Add JSDoc comments for all public functions:

```typescript
/**
 * Get products with advanced filtering
 * @param filters - Filter configuration
 * @returns Paginated product results
 */
export async function getProductsWithFilters(filters: ProductFilters) {
  // Implementation
}
```

### Error Handling

Always use try-catch with proper logging:

```typescript
try {
  const result = await prisma.product.findMany();
  return result;
} catch (error) {
  console.error("Error fetching products:", error);
  throw new Error("Failed to fetch products");
}
```

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Run all tests: `npm run test`
- [ ] Check TypeScript: `npm run typecheck`
- [ ] Check linting: `npm run lint`
- [ ] Format code: `npm run format`
- [ ] Test all API endpoints manually
- [ ] Verify database migration
- [ ] Set production environment variables
- [ ] Enable Redis caching
- [ ] Set up monitoring/logging
- [ ] Configure rate limiting

---

## 📚 Useful Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Zod Validation](https://zod.dev)
- [Zustand State Management](https://github.com/pmndrs/zustand)
- [Jest Testing](https://jestjs.io/docs/getting-started)

---

## 🤝 Contributing

When adding new features:

1. Create feature branch: `git checkout -b feature/your-feature`
2. Write tests first (TDD)
3. Implement feature
4. Run all tests: `npm run test`
5. Format code: `npm run format`
6. Commit with clear message: `git commit -m "feat: add your feature"`
7. Push and create pull request

---

## 📞 Support

For issues or questions:

1. Check the [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
2. Review test files for usage examples
3. Check Prisma Studio for data integrity
4. Enable SQL logging for debugging

---

**Happy coding! 🎉**
