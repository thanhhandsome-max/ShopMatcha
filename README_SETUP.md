# 🍵 ShopMatcha - Matcha Shop Management System

A modern Next.js-based e-commerce backend for managing matcha shop products, categories, warehouses, and inventory.

**Current Status**: Phase 2B Complete - Testing Infrastructure Ready

---

## 🚀 Quick Start

### Automated Setup (Recommended)

#### Windows
```bash
# Run the setup script
setup.bat
```

#### macOS/Linux
```bash
# Run the setup script
bash setup.sh
```

### Manual Setup

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

# 6. Run tests (in another terminal)
npm run test
```

---

## 📚 Documentation

### For API Developers
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API endpoint reference with examples
- **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Development setup, testing, debugging

### For System Architects
- **[BACKEND_HOMEPAGE_SPECIFICATION.md](./BACKEND_HOMEPAGE_SPECIFICATION.md)** - System requirements and specifications
- **[PHASE_2B_SUMMARY.md](./PHASE_2B_SUMMARY.md)** - Testing infrastructure overview

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js | 15.0.0 |
| **Language** | TypeScript | 5.7.0 |
| **ORM** | Prisma | 6.7.0 |
| **Database** | MySQL | 8.4 (Docker) |
| **Validation** | Zod | 3.22.4 |
| **State** | Zustand | 5.0.5 |
| **Styling** | Tailwind CSS | 3.4.0 |
| **Testing** | Jest | 29.7.0 |

---

## 📋 Project Structure

```
ShopMatcha/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── (shop)/page.tsx
│   │   └── api/shop/              ← REST API endpoints
│   │       ├── route.ts           (healthcheck)
│   │       ├── categories/        (list categories)
│   │       ├── products/          (list with filters)
│   │       ├── products/search    (search products)
│   │       ├── products/[id]/     (product detail)
│   │       ├── homepage/          (bundle endpoint)
│   │       └── __tests__/         (integration tests)
│   ├── lib/
│   │   ├── prisma.ts              ← Prisma client singleton
│   │   ├── api-response.ts        ← Response formatting
│   │   ├── validation.ts          ← Zod schemas
│   │   ├── api-hooks.ts           ← Frontend integration
│   │   └── cache.ts               ← Caching layer
│   ├── services/                  ← Business logic
│   │   ├── product.service.ts
│   │   ├── category.service.ts
│   │   ├── stock.service.ts
│   │   ├── homepage.service.ts
│   │   └── product.service.test.ts
│   └── store/                     ← State management
│       └── useCart.ts
├── prisma/
│   └── schema.prisma              ← Database schema (9 models)
├── scripts/
│   └── seed.ts                    ← Sample data generator
├── jest.config.js                 ← Test configuration
├── jest.setup.ts                  ← Test setup
├── setup.bat                       ← Windows setup script
├── setup.sh                        ← Linux/macOS setup script
└── package.json
```

---

## 🗄️ Database Models

- **User** - System users (ADMIN, MANAGER, STAFF roles)
- **Product** - Product catalog with pricing & images
- **Category** - Product categories with slugs
- **Order** - Customer orders with status tracking
- **OrderItem** - Line items in orders
- **Warehouse** - Inventory warehouses
- **Shop** - Physical retail locations
- **WarehouseStock** - Stock quantities by warehouse
- **ShopStock** - Stock quantities by shop

---

## 🔌 API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/shop` | Health check |
| GET | `/api/shop/categories` | List all categories |
| GET | `/api/shop/products` | List products with filters |
| GET | `/api/shop/products/search` | Search products |
| GET | `/api/shop/products/:id` | Product detail |
| GET | `/api/shop/homepage` | Homepage bundle data |

### Query Parameters

**Products List**
- `page` (default: 1) - Page number
- `limit` (default: 12) - Items per page (max: 50)
- `categoryId` - Filter by category
- `sortBy` - Sort order (price_asc, price_desc, newest, name)
- `search` - Search term
- `minPrice` / `maxPrice` - Price range
- `inStock` (default: true) - Show only in-stock products

**Product Search**
- `q` (required) - Search query (2-100 chars)
- `limit` (default: 10) - Max results (1-20)

---

## 🧪 Testing

### Run All Tests
```bash
npm run test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Integration Tests Only
```bash
npm run test:integration
```

### Test Statistics
- **22 test cases** (15 unit + 18 integration)
- **6 endpoints** covered
- **Edge cases** for filtering, sorting, pagination
- **Error scenarios** (400, 404, 500 status codes)

---

## 📊 Sample Data

The seeding script creates:
- **10 Products** - Realistic matcha shop items
- **4 Categories** - Trà Xanh, Trà Đen, Matcha, Khác
- **2 Warehouses** - TP.HCM, Hà Nội
- **3 Shops** - Tân Bình, Quận 3, Hà Nội
- **Full Stock Distribution** - Warehouse & shop inventory

Run seeding:
```bash
npm run prisma:seed
```

---

## 💾 Database Setup

### Using Docker
```bash
# Start MySQL
docker-compose up -d

# Wait for connection, then run migration
npm run prisma:migrate
```

### Environment Variables (.env)
```
DATABASE_URL="mysql://root:root@localhost:3306/matcha_shop"
NODE_ENV="development"
```

---

## 🔄 Development Workflow

```bash
# 1. Start dev server
npm run dev

# 2. In another terminal, run tests
npm run test:watch

# 3. View database
npx prisma studio

# 4. Make changes and see live updates
# src/services/*.ts → npm run test (auto-runs)
```

---

## 🚀 Deployment

### Pre-Deployment Checklist
- [ ] `npm run typecheck` - TypeScript verification
- [ ] `npm run lint` - ESLint check
- [ ] `npm run test` - All tests passing
- [ ] `npm run format:check` - Code formatting
- [ ] Database migrations applied
- [ ] Environment variables configured

### Build & Run
```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 🔐 Performance Features

- **Database Indexes** - On key fields (categoryId, slug, status, isActive)
- **Selective Queries** - Only fetch needed fields
- **Pagination** - Prevent large data transfers
- **Caching Layer** - TTL-based in-memory cache (Redis-ready)
- **Parallel Queries** - Promise.all() for concurrent fetches

---

## 📚 Code Standards

- ✅ **TypeScript** - Strict mode enabled
- ✅ **Validation** - Zod schemas on all inputs
- ✅ **Error Handling** - Try-catch with proper logging
- ✅ **Testing** - Unit + Integration tests
- ✅ **Documentation** - JSDoc comments on functions

---

## 🐛 Debugging

### Enable SQL Logging
```bash
export DEBUG=prisma:*
npm run dev
```

### Use Prisma Studio
```bash
npx prisma studio
```
Opens GUI at http://localhost:5555

### Common Issues
See [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md#-debugging) for troubleshooting

---

## 📝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Write tests first (TDD)
3. Implement feature
4. Run all tests: `npm run test`
5. Format: `npm run format`
6. Commit with message: `git commit -m "feat: description"`

---

## 🎯 Project Phases

| Phase | Status | Focus |
|-------|--------|-------|
| Phase 1 | ✅ Complete | Core APIs, Services, Validation |
| Phase 2A | ✅ Complete | Caching Layer |
| Phase 2B | ✅ Complete | Testing Infrastructure |
| Phase 3 | 🟡 Next | Frontend Components |

---

## 📞 Support & Documentation

- **API Reference**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Development Guide**: [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
- **System Specification**: [BACKEND_HOMEPAGE_SPECIFICATION.md](./BACKEND_HOMEPAGE_SPECIFICATION.md)
- **Phase Summary**: [PHASE_2B_SUMMARY.md](./PHASE_2B_SUMMARY.md)

---

## ⚖️ License

Part of ShopMatcha project. All rights reserved.

---

**Happy coding! 🎉**

*Last Updated: 2026-05-02 | Phase 2B Complete*
