# Backend Design Specification - ShopMatcha
## Bản chi tiết thiết kế Backend theo ERD & Frontend Requirements

**Document Date:** May 5, 2026  
**Project:** ShopMatcha - Premium Matcha E-commerce Platform  
**Database:** MySQL + Prisma ORM  
**Stack:** Node.js + Express/Fastify + TypeScript

---

## 📋 Executive Summary

Tài liệu này cung cấp kế hoạch chi tiết thiết kế backend hệ thống thương mại điện tử bán matcha cao cấp. Backend phải hỗ trợ toàn bộ các chức năng của frontend hiện có và khả năng quản lý kho, đơn hàng, thanh toán từ ERD đã định nghĩa.

**Phạm vi:**
- 25+ API endpoints
- 15 models chính từ database
- 4 Phase triển khai
- Authentication & Authorization
- Payment Gateway Integration
- Inventory Management
- Order Management System

---

## 📊 Phase Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 1: Core Infrastructure & Auth (1-2 tuần)                  │
├─────────────────────────────────────────────────────────────────┤
│ PHASE 2: Product & Catalog Management (1-2 tuần)                │
├─────────────────────────────────────────────────────────────────┤
│ PHASE 3: Order & Payment System (2-3 tuần)                      │
├─────────────────────────────────────────────────────────────────┤
│ PHASE 4: Advanced Features & Optimization (2-3 tuần)            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 PHASE 1: Core Infrastructure & Authentication (1-2 tuần)

### Phase 1 Mục tiêu:
- Thiết lập project structure và dependencies
- Implement authentication & authorization system
- Thiết lập database connections
- Setup middleware & error handling
- Cài đặt logging & monitoring

### Phase 1 - Step 1: Project Setup & Configuration

**Công việc cụ thể:**
1. Initialize Node.js + TypeScript project
2. Cài đặt dependencies:
   - `express` hoặc `fastify`
   - `prisma` + `@prisma/client`
   - `dotenv` + `joi` (validation)
   - `bcryptjs` + `jsonwebtoken` (auth)
   - `cors`, `helmet`, `express-rate-limit`
   - `morgan` (logging)
   - `axios` (HTTP client cho payment gateway)

3. Tạo folder structure:
   ```
   src/
   ├── controllers/
   ├── services/
   ├── routes/
   ├── middleware/
   ├── utils/
   ├── types/
   ├── config/
   └── app.ts
   ```

4. Cài đặt environment variables (.env):
   ```
   NODE_ENV=development
   PORT=5000
   DATABASE_URL=mysql://user:password@localhost:3306/shopmatcha
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=7d
   BCRYPT_ROUNDS=10
   
   # Payment Gateway
   VNP_TMN_CODE=your_vnpay_code
   VNP_HASH_SECRET=your_secret
   VNP_API_URL=https://sandbox.vnpayment.vn
   
   # Email Service
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email
   SMTP_PASS=your_password
   
   # Logging
   LOG_LEVEL=debug
   LOG_FILE=logs/app.log
   ```

5. Cấu hình TypeScript (tsconfig.json):
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "commonjs",
       "lib": ["ES2020"],
       "outDir": "./dist",
       "rootDir": "./src",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true,
       "resolveJsonModule": true,
       "declaration": true,
       "declarationMap": true,
       "sourceMap": true
     },
     "include": ["src/**/*"],
     "exclude": ["node_modules"]
   }
   ```

6. Tạo app.ts:
   ```typescript
   import express from 'express';
   import cors from 'cors';
   import helmet from 'helmet';
   import morgan from 'morgan';
   import rateLimit from 'express-rate-limit';
   
   const app = express();
   
   // Middleware
   app.use(helmet());
   app.use(cors());
   app.use(morgan('dev'));
   app.use(express.json({ limit: '10mb' }));
   app.use(express.urlencoded({ limit: '10mb' }));
   
   // Rate limiting
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100
   });
   app.use(limiter);
   
   // Routes (sẽ thêm ở các phase tiếp theo)
   
   export default app;
   ```

**Output/Deliverables:**
- ✅ Project structure hoàn thiện
- ✅ Environment configuration đầy đủ
- ✅ TypeScript setup
- ✅ Basic middleware

---

### Phase 1 - Step 2: Database Setup & Models

**Công việc cụ thể:**

1. Khởi tạo Prisma:
   ```bash
   npx prisma init
   ```

2. Cấu hình database connection trong `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }
   ```

3. Verify & migrate current schema:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. Tạo Prisma Client wrapper (`src/lib/prisma.ts`):
   ```typescript
   import { PrismaClient } from '@prisma/client';
   
   const prisma = new PrismaClient();
   
   export default prisma;
   ```

5. Verify 15 main models:
   - ✅ taikhoan (User Accounts)
   - ✅ nhanvien (Employees)
   - ✅ khachhang (Customers)
   - ✅ sanpham (Products)
   - ✅ loaisanpham (Product Categories)
   - ✅ donhang (Orders)
   - ✅ chitietdonhang (Order Details)
   - ✅ cuahang (Stores)
   - ✅ kho (Warehouses)
   - ✅ tonkho (Warehouse Stock)
   - ✅ tonkhocuahang (Store Stock)
   - ✅ payments (Payments)
   - ✅ address (Customer Addresses)
   - ✅ khuyenmai (Promotions)
   - ✅ vaitro (Roles/Permissions)

6. Tạo database seeding script (`prisma/seed.ts`):
   ```typescript
   import prisma from '@/lib/prisma';
   
   async function main() {
     // Seed categories
     await prisma.loaisanpham.createMany({
       data: [
         { MaLoai: 'CAT001', TenLoai: 'Matcha Premium', TrangThai: 1 },
         { MaLoai: 'CAT002', TenLoai: 'Sencha & Hojicha', TrangThai: 1 },
         { MaLoai: 'CAT003', TenLoai: 'Dụng cụ', TrangThai: 1 },
       ],
       skipDuplicates: true
     });
   
     // Seed roles
     await prisma.vaitro.createMany({
       data: [
         { MaVaiTro: 'ROLE001', TenVaiTro: 'Admin' },
         { MaVaiTro: 'ROLE002', TenVaiTro: 'Manager' },
         { MaVaiTro: 'ROLE003', TenVaiTro: 'Customer' },
       ],
       skipDuplicates: true
     });
   }
   
   main()
     .catch(console.error)
     .finally(() => prisma.$disconnect());
   ```

**Output/Deliverables:**
- ✅ Prisma client setup
- ✅ Database migrations
- ✅ Schema validation
- ✅ Seeding script

---

### Phase 1 - Step 3: Authentication & Authorization System

**Công việc cụ thể:**

1. Tạo Auth Types (`src/types/auth.ts`):
   ```typescript
   export interface JwtPayload {
     MaTaiKhoan: string;
     role: string;
     email: string;
     iat: number;
     exp: number;
   }
   
   export interface LoginRequest {
     email: string;
     password: string;
   }
   
   export interface RegisterRequest {
     email: string;
     password: string;
     HoTen: string;
     SDT?: string;
   }
   ```

2. Tạo Auth Service (`src/services/authService.ts`):
   ```typescript
   import bcrypt from 'bcryptjs';
   import jwt from 'jsonwebtoken';
   import prisma from '@/lib/prisma';
   
   export class AuthService {
     async register(data: RegisterRequest) {
       const hashedPassword = await bcrypt.hash(data.password, 10);
       
       const taikhoan = await prisma.taikhoan.create({
         data: {
           Email: data.email,
           MatKhau: hashedPassword,
           TrangThai: 1,
           NgayTao: new Date()
         }
       });
       
       // Create customer record
       await prisma.khachhang.create({
         data: {
           MaKH: generateId(),
           TenKH: data.HoTen,
           Email: data.email,
           SDT: data.SDT,
           MaTaiKhoan: taikhoan.MaTaiKhoan,
           NgayTao: new Date(),
           TrangThai: 1
         }
       });
       
       return this.generateToken(taikhoan);
     }
     
     async login(email: string, password: string) {
       const taikhoan = await prisma.taikhoan.findUnique({
         where: { Email: email }
       });
       
       if (!taikhoan) throw new Error('Invalid credentials');
       
       const valid = await bcrypt.compare(password, taikhoan.MatKhau);
       if (!valid) throw new Error('Invalid credentials');
       
       return this.generateToken(taikhoan);
     }
     
     private generateToken(taikhoan: any) {
       const token = jwt.sign(
         {
           MaTaiKhoan: taikhoan.MaTaiKhoan,
           email: taikhoan.Email
         },
         process.env.JWT_SECRET!,
         { expiresIn: process.env.JWT_EXPIRE }
       );
       
       return { token, user: taikhoan };
     }
   }
   ```

3. Tạo Auth Middleware (`src/middleware/authMiddleware.ts`):
   ```typescript
   import jwt from 'jsonwebtoken';
   import { Request, Response, NextFunction } from 'express';
   
   declare global {
     namespace Express {
       interface Request {
         user?: JwtPayload;
       }
     }
   }
   
   export function authMiddleware(
     req: Request,
     res: Response,
     next: NextFunction
   ) {
     const token = req.headers.authorization?.split(' ')[1];
     
     if (!token) {
       return res.status(401).json({ error: 'No token provided' });
     }
     
     try {
       const decoded = jwt.verify(token, process.env.JWT_SECRET!);
       req.user = decoded as JwtPayload;
       next();
     } catch (error) {
       res.status(401).json({ error: 'Invalid token' });
     }
   }
   ```

4. Tạo Authorization Middleware (`src/middleware/authorize.ts`):
   ```typescript
   export function authorize(allowedRoles: string[]) {
     return (req: Request, res: Response, next: NextFunction) => {
       const userRole = req.user?.role;
       
       if (!allowedRoles.includes(userRole)) {
         return res.status(403).json({ error: 'Forbidden' });
       }
       
       next();
     };
   }
   ```

5. Tạo Auth Routes (`src/routes/authRoutes.ts`):
   ```typescript
   import express from 'express';
   import { AuthController } from '@/controllers/authController';
   
   const router = express.Router();
   const authController = new AuthController();
   
   router.post('/register', authController.register);
   router.post('/login', authController.login);
   router.get('/profile', authController.getProfile);
   router.post('/logout', authController.logout);
   
   export default router;
   ```

6. Tạo Auth Controller (`src/controllers/authController.ts`):
   ```typescript
   import { Request, Response } from 'express';
   import { AuthService } from '@/services/authService';
   
   export class AuthController {
     private authService = new AuthService();
     
     async register(req: Request, res: Response) {
       try {
         const result = await this.authService.register(req.body);
         res.status(201).json(result);
       } catch (error) {
         res.status(400).json({ error: error.message });
       }
     }
     
     async login(req: Request, res: Response) {
       try {
         const result = await this.authService.login(
           req.body.email,
           req.body.password
         );
         res.json(result);
       } catch (error) {
         res.status(401).json({ error: error.message });
       }
     }
     
     async getProfile(req: Request, res: Response) {
       res.json({ user: req.user });
     }
     
     async logout(req: Request, res: Response) {
       res.json({ message: 'Logged out' });
     }
   }
   ```

**API Endpoints (Phase 1):**
| Method | Endpoint | Auth | Role | Status |
|--------|----------|------|------|--------|
| POST | `/api/auth/register` | ❌ | - | 201 |
| POST | `/api/auth/login` | ❌ | - | 200 |
| GET | `/api/auth/profile` | ✅ | - | 200 |
| POST | `/api/auth/logout` | ✅ | - | 200 |

**Output/Deliverables:**
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Auth middleware
- ✅ Role-based authorization
- ✅ 4 authentication endpoints

---

### Phase 1 - Step 4: Error Handling & Logging

**Công việc cụ thể:**

1. Tạo Custom Error Classes (`src/utils/errors.ts`):
   ```typescript
   export class AppError extends Error {
     constructor(
       public statusCode: number,
       message: string
     ) {
       super(message);
     }
   }
   
   export class ValidationError extends AppError {
     constructor(message: string) {
       super(400, message);
     }
   }
   
   export class NotFoundError extends AppError {
     constructor(resource: string) {
       super(404, `${resource} not found`);
     }
   }
   
   export class UnauthorizedError extends AppError {
     constructor() {
       super(401, 'Unauthorized');
     }
   }
   ```

2. Tạo Error Handler Middleware (`src/middleware/errorHandler.ts`):
   ```typescript
   export function errorHandler(
     error: any,
     req: Request,
     res: Response,
     next: NextFunction
   ) {
     const status = error.statusCode || 500;
     const message = error.message || 'Internal server error';
     
     logger.error({
       status,
       message,
       path: req.path,
       method: req.method,
       stack: error.stack
     });
     
     res.status(status).json({
       error: message,
       ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
     });
   }
   ```

3. Tạo Logger Utility (`src/utils/logger.ts`):
   ```typescript
   import winston from 'winston';
   
   const logger = winston.createLogger({
     level: process.env.LOG_LEVEL || 'debug',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
       new winston.transports.File({ filename: 'logs/app.log' })
     ]
   });
   
   if (process.env.NODE_ENV !== 'production') {
     logger.add(new winston.transports.Console({
       format: winston.format.simple()
     }));
   }
   
   export default logger;
   ```

**Output/Deliverables:**
- ✅ Custom error classes
- ✅ Global error handler
- ✅ Logging system
- ✅ Error tracking

---

## 🛍️ PHASE 2: Product & Catalog Management (1-2 tuần)

### Phase 2 Mục tiêu:
- Implement product CRUD operations
- Manage product categories
- Implement inventory/stock management
- Product filtering & search
- Pricing & promotions

### Phase 2 - Step 1: Product Management Endpoints

**Công việc cụ thể:**

1. Tạo Product Service (`src/services/productService.ts`):
   ```typescript
   export class ProductService {
     async getAllProducts(filters?: {
       MaLoai?: string;
       sortBy?: string;
       page?: number;
       limit?: number;
     }) {
       let query: any = {
         include: { loaisanpham: true }
       };
       
       if (filters?.MaLoai) {
         query.where = { MaLoai: filters.MaLoai };
       }
       
       // Pagination
       const page = filters?.page || 1;
       const limit = filters?.limit || 20;
       query.skip = (page - 1) * limit;
       query.take = limit;
       
       // Sorting
       if (filters?.sortBy === 'price-asc') {
         query.orderBy = { GiaBan: 'asc' };
       } else if (filters?.sortBy === 'price-desc') {
         query.orderBy = { GiaBan: 'desc' };
       }
       
       const products = await prisma.sanpham.findMany(query);
       const total = await prisma.sanpham.count();
       
       return { products, total, page, limit };
     }
     
     async getProductById(MaSP: string) {
       const product = await prisma.sanpham.findUnique({
         where: { MaSP },
         include: {
           loaisanpham: true,
           tonkho: {
             include: { kho: true }
           },
           tonkhocuahang: {
             include: { cuahang: true }
           }
         }
       });
       
       if (!product) throw new NotFoundError('Product');
       return product;
     }
     
     async createProduct(data: CreateProductDTO) {
       return prisma.sanpham.create({
         data: {
           MaSP: generateProductId(),
           TenSP: data.TenSP,
           MoTa: data.MoTa,
           GiaVon: data.GiaVon,
           GiaBan: data.GiaBan,
           MaLoai: data.MaLoai,
           Hinh: data.Hinh,
           TrangThai: 1,
           NgayTao: new Date()
         }
       });
     }
     
     async updateProduct(MaSP: string, data: UpdateProductDTO) {
       return prisma.sanpham.update({
         where: { MaSP },
         data: {
           TenSP: data.TenSP,
           MoTa: data.MoTa,
           GiaBan: data.GiaBan,
           TrangThai: data.TrangThai,
           NgayCapNhat: new Date()
         }
       });
     }
     
     async deleteProduct(MaSP: string) {
       return prisma.sanpham.update({
         where: { MaSP },
         data: { TrangThai: 0 }
       });
     }
   }
   ```

2. Tạo Product DTO (`src/types/product.ts`):
   ```typescript
   export interface CreateProductDTO {
     TenSP: string;
     MoTa: string;
     GiaVon: number;
     GiaBan: number;
     MaLoai: string;
     Hinh?: string;
   }
   
   export interface UpdateProductDTO {
     TenSP?: string;
     MoTa?: string;
     GiaBan?: number;
     TrangThai?: number;
   }
   ```

3. Tạo Product Controller (`src/controllers/productController.ts`):
   ```typescript
   export class ProductController {
     private productService = new ProductService();
     
     async getAllProducts(req: Request, res: Response) {
       try {
         const filters = {
           MaLoai: req.query.category,
           sortBy: req.query.sort,
           page: parseInt(req.query.page as string) || 1,
           limit: parseInt(req.query.limit as string) || 20
         };
         
         const result = await this.productService.getAllProducts(filters);
         res.json(result);
       } catch (error) {
         res.status(500).json({ error: error.message });
       }
     }
     
     async getProductById(req: Request, res: Response) {
       try {
         const product = await this.productService.getProductById(req.params.id);
         res.json(product);
       } catch (error) {
         res.status(404).json({ error: error.message });
       }
     }
     
     async createProduct(req: Request, res: Response) {
       try {
         const product = await this.productService.createProduct(req.body);
         res.status(201).json(product);
       } catch (error) {
         res.status(400).json({ error: error.message });
       }
     }
     
     async updateProduct(req: Request, res: Response) {
       try {
         const product = await this.productService.updateProduct(
           req.params.id,
           req.body
         );
         res.json(product);
       } catch (error) {
         res.status(400).json({ error: error.message });
       }
     }
     
     async deleteProduct(req: Request, res: Response) {
       try {
         await this.productService.deleteProduct(req.params.id);
         res.json({ message: 'Product deleted' });
       } catch (error) {
         res.status(400).json({ error: error.message });
       }
     }
   }
   ```

4. Tạo Product Routes (`src/routes/productRoutes.ts`):
   ```typescript
   const router = express.Router();
   const controller = new ProductController();
   
   router.get('/', controller.getAllProducts);
   router.get('/:id', controller.getProductById);
   router.post('/', authMiddleware, authorize(['Admin', 'Manager']), controller.createProduct);
   router.put('/:id', authMiddleware, authorize(['Admin', 'Manager']), controller.updateProduct);
   router.delete('/:id', authMiddleware, authorize(['Admin']), controller.deleteProduct);
   
   export default router;
   ```

**API Endpoints (Phase 2.1):**
| Method | Endpoint | Auth | Role | Status |
|--------|----------|------|------|--------|
| GET | `/api/products` | ❌ | - | 200 |
| GET | `/api/products/:id` | ❌ | - | 200 |
| POST | `/api/products` | ✅ | Admin/Manager | 201 |
| PUT | `/api/products/:id` | ✅ | Admin/Manager | 200 |
| DELETE | `/api/products/:id` | ✅ | Admin | 200 |

**Output/Deliverables:**
- ✅ Product CRUD operations
- ✅ Filtering & sorting
- ✅ Pagination
- ✅ 5 product endpoints

---

### Phase 2 - Step 2: Product Categories Management

**Công việc cụ thể:**

1. Tạo Category Service (`src/services/categoryService.ts`):
   ```typescript
   export class CategoryService {
     async getAllCategories() {
       return prisma.loaisanpham.findMany({
         include: { sanpham: true }
       });
     }
     
     async getCategoryById(MaLoai: string) {
       const category = await prisma.loaisanpham.findUnique({
         where: { MaLoai },
         include: { sanpham: true }
       });
       
       if (!category) throw new NotFoundError('Category');
       return category;
     }
     
     async createCategory(data: CreateCategoryDTO) {
       return prisma.loaisanpham.create({
         data: {
           MaLoai: generateCategoryId(),
           TenLoai: data.TenLoai,
           Mota: data.Mota,
           TrangThai: 1
         }
       });
     }
     
     async updateCategory(MaLoai: string, data: UpdateCategoryDTO) {
       return prisma.loaisanpham.update({
         where: { MaLoai },
         data: {
           TenLoai: data.TenLoai,
           Mota: data.Mota,
           TrangThai: data.TrangThai
         }
       });
     }
     
     async deleteCategory(MaLoai: string) {
       return prisma.loaisanpham.update({
         where: { MaLoai },
         data: { TrangThai: 0 }
       });
     }
   }
   ```

2. Tạo Category Controller & Routes tương tự Product

**API Endpoints (Phase 2.2):**
| Method | Endpoint | Auth | Role | Status |
|--------|----------|------|------|--------|
| GET | `/api/categories` | ❌ | - | 200 |
| GET | `/api/categories/:id` | ❌ | - | 200 |
| POST | `/api/categories` | ✅ | Admin | 201 |
| PUT | `/api/categories/:id` | ✅ | Admin | 200 |
| DELETE | `/api/categories/:id` | ✅ | Admin | 200 |

---

### Phase 2 - Step 3: Inventory & Stock Management

**Công việc cụ thể:**

1. Tạo Stock Service (`src/services/stockService.ts`):
   ```typescript
   export class StockService {
     async getWarehouseStock(MaKho: string) {
       return prisma.tonkho.findMany({
         where: { MaKho },
         include: {
           sanpham: true,
           kho: true
         }
       });
     }
     
     async getStoreStock(MaCH: string) {
       return prisma.tonkhocuahang.findMany({
         where: { MaCH },
         include: {
           sanpham: true,
           cuahang: true
         }
       });
     }
     
     async updateWarehouseStock(
       MaKho: string,
       MaSP: string,
       SoLuong: number
     ) {
       let stock = await prisma.tonkho.findUnique({
         where: { MaKho_MaSP: { MaKho, MaSP } }
       });
       
       if (!stock) {
         return prisma.tonkho.create({
           data: { MaKho, MaSP, SoLuong }
         });
       }
       
       return prisma.tonkho.update({
         where: { MaKho_MaSP: { MaKho, MaSP } },
         data: { SoLuong: stock.SoLuong + SoLuong }
       });
     }
     
     async decrementStock(MaSP: string, SoLuong: number) {
       // Tìm kho có sẵn hàng và giảm số lượng
       const stock = await prisma.tonkho.findFirst({
         where: {
           MaSP,
           SoLuong: { gte: SoLuong }
         }
       });
       
       if (!stock) throw new Error('Out of stock');
       
       return prisma.tonkho.update({
         where: { MaKho_MaSP: { MaKho: stock.MaKho, MaSP } },
         data: { SoLuong: stock.SoLuong - SoLuong }
       });
     }
     
     async checkAvailability(MaSP: string, SoLuong: number) {
       const totalStock = await prisma.tonkho.aggregate({
         where: { MaSP },
         _sum: { SoLuong: true }
       });
       
       return (totalStock._sum.SoLuong || 0) >= SoLuong;
     }
   }
   ```

2. Tạo Stock Controller & Routes

**API Endpoints (Phase 2.3):**
| Method | Endpoint | Auth | Role | Status |
|--------|----------|------|------|--------|
| GET | `/api/stock/warehouse/:id` | ✅ | Admin/Manager | 200 |
| GET | `/api/stock/store/:id` | ✅ | Admin/Manager | 200 |
| POST | `/api/stock/check` | ✅ | - | 200 |
| PUT | `/api/stock/warehouse/:id` | ✅ | Admin | 200 |

---

### Phase 2 - Step 4: Search & Filtering

**Công việc cụ thể:**

1. Tạo Search Service (`src/services/searchService.ts`):
   ```typescript
   export class SearchService {
     async searchProducts(query: string, filters?: any) {
       const where: any = {
         AND: [
           {
             OR: [
               { TenSP: { contains: query } },
               { MoTa: { contains: query } }
             ]
           }
         ]
       };
       
       if (filters?.MaLoai) {
         where.AND.push({ MaLoai: filters.MaLoai });
       }
       
       if (filters?.minPrice || filters?.maxPrice) {
         where.AND.push({
           GiaBan: {
             gte: filters?.minPrice || 0,
             lte: filters?.maxPrice || 999999999
           }
         });
       }
       
       return prisma.sanpham.findMany({
         where,
         take: 50
       });
     }
     
     async getRelatedProducts(MaSP: string) {
       const product = await prisma.sanpham.findUnique({
         where: { MaSP }
       });
       
       if (!product) throw new NotFoundError('Product');
       
       return prisma.sanpham.findMany({
         where: {
           MaLoai: product.MaLoai,
           MaSP: { not: MaSP }
         },
         take: 10
       });
     }
   }
   ```

2. Tạo Search Routes

**API Endpoints (Phase 2.4):**
| Method | Endpoint | Auth | Role | Status |
|--------|----------|------|------|--------|
| GET | `/api/search` | ❌ | - | 200 |
| GET | `/api/products/:id/related` | ❌ | - | 200 |

---

## 💳 PHASE 3: Order & Payment System (2-3 tuần)

### Phase 3 Mục tiêu:
- Implement complete order management
- Payment gateway integration (VNPay)
- Order status tracking
- Payment verification
- Invoice generation

### Phase 3 - Step 1: Order Management

**Công việc cụ thể:**

1. Tạo Order Service (`src/services/orderService.ts`):
   ```typescript
   export class OrderService {
     async createOrder(userId: string, data: CreateOrderDTO) {
       // 1. Validate cart items & stock
       for (const item of data.items) {
         const available = await this.stockService.checkAvailability(
           item.MaSP,
           item.SoLuong
         );
         if (!available) throw new Error(`Product ${item.MaSP} out of stock`);
       }
       
       // 2. Get customer data
       const customer = await prisma.khachhang.findFirst({
         where: { MaTaiKhoan: userId }
       });
       
       // 3. Calculate totals
       let subtotal = 0;
       for (const item of data.items) {
         const product = await prisma.sanpham.findUnique({
           where: { MaSP: item.MaSP }
         });
         subtotal += product.GiaBan * item.SoLuong;
       }
       
       const shipping_fee = data.shippingMethod === 'express' ? 50000 : 0;
       const total = subtotal + shipping_fee;
       
       // 3. Create order
       const order = await prisma.donhang.create({
         data: {
           MaDH: generateOrderId(),
           MaKH: customer.MaKH,
           MaTaiKhoan: userId,
           order_code: generateOrderCode(),
           order_type: 1,
           TongTien: total,
           subtotal: subtotal,
           shipping_fee: shipping_fee,
           TrangThai: 1, // Pending
           payment_status: 0, // Unpaid
           payment_method: data.paymentMethod,
           address_id: data.addressId,
           customer_note: data.note,
           MaCH: data.storeId,
           NgayTao: new Date()
         }
       });
       
       // 4. Create order items
       for (const item of data.items) {
         await prisma.chitietdonhang.create({
           data: {
             MaDH: order.MaDH,
             MaSP: item.MaSP,
             SoLuong: item.SoLuong,
             TongTien: item.price * item.SoLuong
           }
         });
         
         // Decrement stock
         await this.stockService.decrementStock(item.MaSP, item.SoLuong);
       }
       
       return order;
     }
     
     async getOrderById(MaDH: string, userId?: string) {
       const order = await prisma.donhang.findUnique({
         where: { MaDH },
         include: {
           chitietdonhang: {
             include: { sanpham: true }
           },
           taikhoan: true,
           khachhang: true,
           payments: true
         }
       });
       
       if (!order) throw new NotFoundError('Order');
       
       // Check authorization
       if (userId && order.MaTaiKhoan !== userId) {
         throw new UnauthorizedError();
       }
       
       return order;
     }
     
     async getOrdersByUser(userId: string) {
       return prisma.donhang.findMany({
         where: { MaTaiKhoan: userId },
         include: {
           chitietdonhang: { include: { sanpham: true } },
           payments: true
         },
         orderBy: { NgayTao: 'desc' }
       });
     }
     
     async updateOrderStatus(MaDH: string, TrangThai: number) {
       return prisma.donhang.update({
         where: { MaDH },
         data: { TrangThai, NgayCapNhat: new Date() }
       });
     }
     
     async cancelOrder(MaDH: string) {
       const order = await this.getOrderById(MaDH);
       
       if (order.payment_status === 1) {
         throw new Error('Cannot cancel paid order');
       }
       
       // Refund stock
       for (const item of order.chitietdonhang) {
         await this.stockService.updateWarehouseStock(
           order.MaCH || 'KHO001',
           item.MaSP,
           item.SoLuong
         );
       }
       
       return this.updateOrderStatus(MaDH, 5); // Cancelled
     }
   }
   ```

2. Tạo Order DTO (`src/types/order.ts`):
   ```typescript
   export interface CreateOrderDTO {
     items: {
       MaSP: string;
       SoLuong: number;
       price: number;
     }[];
     addressId: string;
     storeId?: string;
     paymentMethod: string;
     shippingMethod: 'standard' | 'express';
     note?: string;
   }
   ```

3. Tạo Order Controller

**API Endpoints (Phase 3.1):**
| Method | Endpoint | Auth | Role | Status |
|--------|----------|------|------|--------|
| POST | `/api/orders` | ✅ | Customer | 201 |
| GET | `/api/orders` | ✅ | Customer | 200 |
| GET | `/api/orders/:id` | ✅ | Customer | 200 |
| PUT | `/api/orders/:id/status` | ✅ | Admin/Manager | 200 |
| DELETE | `/api/orders/:id` | ✅ | Customer | 200 |

---

### Phase 3 - Step 2: Payment Integration (VNPay)

**Công việc cụ thể:**

1. Tạo Payment Service (`src/services/paymentService.ts`):
   ```typescript
   import crypto from 'crypto';
   import axios from 'axios';
   
   export class PaymentService {
     async createVNPayUrl(order: any, returnUrl: string) {
       const date = new Date();
       const createDate = this.formatDate(date);
       const orderId = order.order_code;
       const amount = order.TongTien * 100; // VNPay expects amount in cents
       
       const vnp_Params = {
         vnp_Version: '2.1.0',
         vnp_Command: 'pay',
         vnp_TmnCode: process.env.VNP_TMN_CODE,
         vnp_Locale: 'vn',
         vnp_CurrCode: 'VND',
         vnp_TxnRef: orderId,
         vnp_OrderInfo: `Payment for order ${orderId}`,
         vnp_OrderType: '250000',
         vnp_Amount: amount,
         vnp_ReturnUrl: returnUrl,
         vnp_IpAddr: '127.0.0.1',
         vnp_CreateDate: createDate,
         vnp_SecureHash: ''
       };
       
       // Sort parameters
       const sortedParams = this.sortObject(vnp_Params);
       
       // Create hash input
       let hashInput = '';
       for (const key in sortedParams) {
         hashInput += `&${key}=${encodeURIComponent(sortedParams[key])}`;
       }
       hashInput = hashInput.substring(1);
       
       // Create secure hash
       const secureHash = crypto
         .createHmac('sha512', process.env.VNP_HASH_SECRET!)
         .update(Buffer.from(hashInput, 'utf-8'))
         .digest('hex');
       
       const paymentUrl = `${process.env.VNP_API_URL}/?${hashInput}&vnp_SecureHash=${secureHash}`;
       
       return paymentUrl;
     }
     
     async verifyPayment(vnp_Params: any) {
       const secureHash = vnp_Params['vnp_SecureHash'];
       delete vnp_Params['vnp_SecureHash'];
       delete vnp_Params['vnp_SecureHashType'];
       
       const sortedParams = this.sortObject(vnp_Params);
       let hashInput = '';
       
       for (const key in sortedParams) {
         hashInput += `&${key}=${encodeURIComponent(sortedParams[key])}`;
       }
       hashInput = hashInput.substring(1);
       
       const computedHash = crypto
         .createHmac('sha512', process.env.VNP_HASH_SECRET!)
         .update(Buffer.from(hashInput, 'utf-8'))
         .digest('hex');
       
       return secureHash === computedHash;
     }
     
     private sortObject(obj: any) {
       const sorted: any = {};
       const keys = Object.keys(obj).sort();
       
       keys.forEach(key => {
         sorted[key] = obj[key];
       });
       
       return sorted;
     }
     
     private formatDate(date: Date): string {
       return date.getFullYear() +
         String(date.getMonth() + 1).padStart(2, '0') +
         String(date.getDate()).padStart(2, '0') +
         String(date.getHours()).padStart(2, '0') +
         String(date.getMinutes()).padStart(2, '0') +
         String(date.getSeconds()).padStart(2, '0');
     }
   }
   ```

2. Tạo Payment Controller (`src/controllers/paymentController.ts`):
   ```typescript
   export class PaymentController {
     private paymentService = new PaymentService();
     private orderService = new OrderService();
     
     async createPayment(req: Request, res: Response) {
       try {
         const { MaDH } = req.body;
         const order = await this.orderService.getOrderById(MaDH);
         
         const returnUrl = `${process.env.APP_URL}/order-confirmation?orderId=${MaDH}`;
         const paymentUrl = await this.paymentService.createVNPayUrl(order, returnUrl);
         
         res.json({ paymentUrl });
       } catch (error) {
         res.status(500).json({ error: error.message });
       }
     }
     
     async handleReturn(req: Request, res: Response) {
       try {
         const verified = await this.paymentService.verifyPayment(req.query);
         
         if (!verified) {
           return res.status(400).json({ error: 'Invalid signature' });
         }
         
         const { vnp_TxnRef, vnp_ResponseCode } = req.query;
         
         // Save payment log
         const payment = await prisma.payments.create({
           data: {
             payment_id: generatePaymentId(),
             MaHD: vnp_TxnRef as string,
             status: vnp_ResponseCode === '00' ? 1 : 0,
             transaction_id: req.query.vnp_TransactionNo as string,
             paid_at: vnp_ResponseCode === '00' ? new Date() : null
           }
         });
         
         // Update order payment status
         if (vnp_ResponseCode === '00') {
           await this.orderService.updateOrderPaymentStatus(
             vnp_TxnRef as string,
             1
           );
         }
         
         res.json({ success: true, payment });
       } catch (error) {
         res.status(500).json({ error: error.message });
       }
     }
   }
   ```

3. Tạo Payment Routes

**API Endpoints (Phase 3.2):**
| Method | Endpoint | Auth | Role | Status |
|--------|----------|------|------|--------|
| POST | `/api/payments/create` | ✅ | Customer | 200 |
| GET | `/api/payments/vnpay-return` | ❌ | - | 200 |
| GET | `/api/payments/:id` | ✅ | - | 200 |

---

### Phase 3 - Step 3: Payment Logging & Verification

**Công việc cụ thể:**

1. Tạo Payment Log Service:
   ```typescript
   export class PaymentLogService {
     async logPaymentEvent(paymentId: string, logType: string, data: any) {
       return prisma.payment_logs.create({
         data: {
           payment_id: paymentId,
           log_type: logType,
           response_code: data.response_code,
           message: data.message,
           new_data: data,
           created_at: new Date()
         }
       });
     }
   }
   ```

**Output/Deliverables:**
- ✅ Order CRUD operations
- ✅ Order status management
- ✅ VNPay integration
- ✅ Payment verification
- ✅ Transaction logging
- ✅ 8 order/payment endpoints

---

## 📦 PHASE 4: Advanced Features & Optimization (2-3 tuần)

### Phase 4 Mục tiêu:
- Customer management & addresses
- Promotion & discount system
- Invoice & receipt generation
- Warehouse management
- Performance optimization
- API documentation

### Phase 4 - Step 1: Customer & Address Management

**API Endpoints (Phase 4.1):**
| Method | Endpoint | Auth | Role | Status |
|--------|----------|------|------|--------|
| GET | `/api/customers/:id` | ✅ | - | 200 |
| GET | `/api/customers/:id/addresses` | ✅ | - | 200 |
| POST | `/api/addresses` | ✅ | - | 201 |
| PUT | `/api/addresses/:id` | ✅ | - | 200 |
| DELETE | `/api/addresses/:id` | ✅ | - | 200 |

### Phase 4 - Step 2: Promotions & Discounts

**Công việc cụ thể:**

1. Tạo Promotion Service:
   ```typescript
   export class PromotionService {
     async getActivePromotions() {
       const now = new Date();
       return prisma.khuyenmai.findMany({
         where: {
           AND: [
             { NgayBatDau: { lte: now } },
             { NgayKetThuc: { gte: now } },
             { TrangThai: 1 }
           ]
         }
       });
     }
     
     async applyPromotion(customerId: string, promotionId: string) {
       return prisma.khuyenmaikhachhang.create({
         data: {
           Makmkh: generatePromotionId(),
           MaKM: promotionId,
           MaKH: customerId,
           NgayApply: new Date()
         }
       });
     }
   }
   ```

**API Endpoints (Phase 4.2):**
| Method | Endpoint | Auth | Role | Status |
|--------|----------|------|------|--------|
| GET | `/api/promotions` | ❌ | - | 200 |
| POST | `/api/promotions/apply` | ✅ | - | 200 |
| GET | `/api/promotions/:id/details` | ❌ | - | 200 |

### Phase 4 - Step 3: Store & Warehouse Management

**API Endpoints (Phase 4.3):**
| Method | Endpoint | Auth | Role | Status |
|--------|----------|------|------|--------|
| GET | `/api/stores` | ❌ | - | 200 |
| GET | `/api/stores/:id` | ❌ | - | 200 |
| GET | `/api/warehouses` | ✅ | Admin/Manager | 200 |
| POST | `/api/warehouses/transfer` | ✅ | Admin/Manager | 201 |

### Phase 4 - Step 4: Invoice & Receipt Generation

**Công việc cụ thể:**

1. Tạo Invoice Service:
   ```typescript
   export class InvoiceService {
     async generateInvoice(MaDH: string) {
       const order = await prisma.donhang.findUnique({
         where: { MaDH },
         include: { chitietdonhang: { include: { sanpham: true } } }
       });
       
       return {
         invoiceNo: order.order_code,
         date: order.NgayTao,
         items: order.chitietdonhang,
         total: order.TongTien,
         customer: order.khachhang
       };
     }
   }
   ```

**API Endpoints (Phase 4.4):**
| Method | Endpoint | Auth | Role | Status |
|--------|----------|------|------|--------|
| GET | `/api/invoices/:id` | ✅ | - | 200 |
| GET | `/api/invoices/:id/pdf` | ✅ | - | 200 |

### Phase 4 - Step 5: Performance Optimization

**Công việc cụ thể:**

1. Implement Caching (Redis):
   ```typescript
   import Redis from 'ioredis';
   
   const redis = new Redis();
   
   export async function getProductsWithCache() {
     const cached = await redis.get('products');
     if (cached) return JSON.parse(cached);
     
     const products = await prisma.sanpham.findMany();
     await redis.setex('products', 3600, JSON.stringify(products));
     
     return products;
   }
   ```

2. Database Query Optimization:
   - Add indexes
   - Implement pagination
   - Use select for specific fields

3. API Response Compression

4. Implement Rate Limiting per endpoint

### Phase 4 - Step 6: API Documentation

**Công việc cụ thể:**

1. Tạo Swagger/OpenAPI documentation:
   ```typescript
   import swaggerJsdoc from 'swagger-jsdoc';
   import swaggerUi from 'swagger-ui-express';
   
   const options = {
     definition: {
       openapi: '3.0.0',
       info: {
         title: 'ShopMatcha API',
         version: '1.0.0'
       },
       servers: [
         { url: 'http://localhost:5000', description: 'Development' },
         { url: 'https://api.shopmatcha.com', description: 'Production' }
       ]
     },
     apis: ['./src/routes/*.ts']
   };
   
   const specs = swaggerJsdoc(options);
   app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
   ```

**Output/Deliverables:**
- ✅ Customer management
- ✅ Promotion system
- ✅ Warehouse transfers
- ✅ Invoice generation
- ✅ Performance caching
- ✅ API documentation
- ✅ 15+ additional endpoints

---

## 📊 Complete API Endpoints Summary

### Total: 40+ Endpoints

| Category | Phase | Count | Status |
|----------|-------|-------|--------|
| Authentication | 1 | 4 | ✅ |
| Products | 2 | 7 | ✅ |
| Orders | 3 | 5 | ✅ |
| Payments | 3 | 3 | ✅ |
| Customers | 4 | 5 | ✅ |
| Promotions | 4 | 3 | ✅ |
| Inventory | 4 | 4 | ✅ |
| Admin | 4 | 4 | ✅ |
| **TOTAL** | | **38+** | ✅ |

---

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js / Fastify
- **Language:** TypeScript 5+
- **ORM:** Prisma 5+

### Database
- **Primary:** MySQL 8.0+
- **Cache:** Redis 6+ (optional, Phase 4)

### External Services
- **Payment:** VNPay
- **Email:** SendGrid / Gmail SMTP
- **File Storage:** AWS S3 / Local (optional)

### DevOps
- **Containerization:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Monitoring:** Winston Logger
- **Testing:** Jest + Supertest

---

## 📈 Development Timeline

| Phase | Duration | Key Deliverables |
|-------|----------|-----------------|
| **Phase 1** | 1-2 weeks | Auth, DB, Infrastructure |
| **Phase 2** | 1-2 weeks | Products, Categories, Stock |
| **Phase 3** | 2-3 weeks | Orders, Payments, Integration |
| **Phase 4** | 2-3 weeks | Advanced Features, Optimization |
| **Total** | **6-10 weeks** | **Complete Backend System** |

---

## ✅ Testing Strategy

### Unit Tests
- Service layer (business logic)
- Utils & helpers
- Error handling

### Integration Tests
- API endpoints
- Database operations
- Payment flows

### E2E Tests
- Complete order flow
- Payment verification
- Inventory updates

### Coverage Target
- Minimum 80% code coverage
- All critical paths tested

---

## 🚀 Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] API documentation complete
- [ ] Tests pass (80%+ coverage)
- [ ] Error handling verified
- [ ] Logging configured
- [ ] Rate limiting active
- [ ] Security headers set
- [ ] CORS configured
- [ ] Payment gateway tested
- [ ] Load testing completed
- [ ] Backup strategy defined

---

## 📝 Notes & Considerations

1. **Database Relationships:** Tất cả foreign keys đã được định nghĩa trong schema
2. **Stock Management:** Sử dụng transaction để tránh race condition khi update stock
3. **Payment Verification:** Luôn verify signature từ VNPay trước khi update payment status
4. **Scalability:** Cân nhắc database sharding nếu dữ liệu tăng đáng kể
5. **Security:** Hash passwords, validate input, use JWT với expiration
6. **API Versioning:** Consider adding /v1 prefix từ đầu

---

## 📞 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": 400,
  "details": { ... }
}
```

---

**Document Prepared By:** Backend Architecture Team  
**Last Updated:** May 5, 2026  
**Status:** Ready for Development  
**Next Review:** After Phase 1 Completion
