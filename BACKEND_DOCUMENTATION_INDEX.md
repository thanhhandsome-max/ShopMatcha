# ShopMatcha Backend Design - Complete Documentation Index

**Document Created:** May 5, 2026  
**Project:** ShopMatcha - Premium Matcha E-commerce Platform  
**Status:** ✅ Ready for Implementation

---

## 📚 Documentation Overview

This folder contains a complete backend design specification based on:
- ✅ Current frontend functionality
- ✅ Existing database schema (ERD)
- ✅ Prisma ORM models (15 main tables)
- ✅ 40+ API endpoints across 4 phases

### 📄 Main Documents

1. **[BACKEND_DESIGN_SPECIFICATION.md](./BACKEND_DESIGN_SPECIFICATION.md)** ⭐ START HERE
   - Complete backend architecture
   - 4 Phase implementation plan
   - Detailed step-by-step breakdown
   - 16 major steps with code examples
   - Technology stack & deployment checklist

2. **[API_ENDPOINTS_REFERENCE.md](./API_ENDPOINTS_REFERENCE.md)** 📋 QUICK REFERENCE
   - 40+ API endpoints in table format
   - Request/response examples
   - Authentication requirements
   - Status codes & error handling
   - Rate limiting & headers

3. **[BACKEND_DATABASE_MAPPING.md](./BACKEND_DATABASE_MAPPING.md)** 🗄️ DATA ARCHITECTURE
   - Data flow diagrams
   - Database schema mapping to APIs
   - Entity relationships
   - Validation rules & constraints
   - Performance indexes
   - Security considerations

---

## 🎯 Quick Start Guide

### For Project Managers
1. Read the **Executive Summary** in BACKEND_DESIGN_SPECIFICATION.md
2. Check **Phase Overview** timeline (6-10 weeks)
3. Review **Deployment Checklist**

### For Backend Developers
1. Start with **PHASE 1** in BACKEND_DESIGN_SPECIFICATION.md
2. Follow **Step-by-step implementation** with code templates
3. Reference API_ENDPOINTS_REFERENCE.md for endpoint details
4. Use BACKEND_DATABASE_MAPPING.md for data structure

### For DevOps/Infrastructure
1. Check **Technology Stack** section
2. Review **Deployment Checklist**
3. Note **Database Indexes** performance requirements
4. Plan **Testing Strategy** by phase

### For QA/Testing Teams
1. Review **Testing Strategy by Phase** in BACKEND_DATABASE_MAPPING.md
2. Use API_ENDPOINTS_REFERENCE.md for test case creation
3. Check **Request/Response Examples** for test data

---

## 🗺️ Document Navigation

### BACKEND_DESIGN_SPECIFICATION.md Structure
```
📖 Backend Design Specification
├─ Executive Summary
├─ Phase Overview
├─ PHASE 1: Core Infrastructure & Auth (1-2 weeks)
│  ├─ Step 1: Project Setup & Configuration
│  ├─ Step 2: Database Setup & Models
│  ├─ Step 3: Authentication & Authorization
│  └─ Step 4: Error Handling & Logging
├─ PHASE 2: Product & Catalog (1-2 weeks)
│  ├─ Step 1: Product Management Endpoints
│  ├─ Step 2: Product Categories
│  ├─ Step 3: Inventory & Stock
│  └─ Step 4: Search & Filtering
├─ PHASE 3: Order & Payment (2-3 weeks)
│  ├─ Step 1: Order Management
│  ├─ Step 2: Payment Integration (VNPay)
│  └─ Step 3: Payment Logging
├─ PHASE 4: Advanced Features (2-3 weeks)
│  ├─ Step 1: Customer & Address Management
│  ├─ Step 2: Promotions & Discounts
│  ├─ Step 3: Warehouse Management
│  ├─ Step 4: Invoice Generation
│  ├─ Step 5: Performance Optimization
│  └─ Step 6: API Documentation
├─ Complete API Endpoints Summary
├─ Technology Stack
├─ Development Timeline
├─ Testing Strategy
└─ Deployment Checklist
```

### API_ENDPOINTS_REFERENCE.md Structure
```
📋 API Endpoints Reference
├─ PHASE 1: Authentication (4 endpoints)
├─ PHASE 2: Products & Catalog (12 endpoints)
├─ PHASE 2.5: Inventory (4 endpoints)
├─ PHASE 3: Orders & Payments (8 endpoints)
├─ PHASE 4: Advanced Features (20+ endpoints)
├─ Request/Response Examples
├─ Database Models Mapping
├─ HTTP Status Codes
├─ Common Query Parameters
├─ Authentication Headers
├─ Error Response Format
├─ Rate Limiting Rules
└─ Webhook Events (Optional)
```

### BACKEND_DATABASE_MAPPING.md Structure
```
🗄️ Database Schema Mapping
├─ Data Flow Architecture
│  ├─ Order Flow
│  ├─ Product Search Flow
│  └─ Inventory Flow
├─ Database Schema Mapping
│  ├─ User & Authentication
│  ├─ Customer Management
│  ├─ Product Catalog
│  ├─ Inventory Management
│  ├─ Order Management
│  ├─ Payment Processing
│  ├─ Promotions & Discounts
│  ├─ Receipts & Transfers
│  └─ Employee & Authorization
├─ Entity Relationships Diagram
├─ Key Data Validation Rules
├─ Data Integrity & Constraints
├─ Database Indexes (Performance)
├─ Batch Operations
├─ Security Considerations
├─ Migration Checklist
└─ Code Generation Templates
```

---

## 📊 API Endpoints Summary

### Total: 40+ Endpoints Across 4 Phases

| Phase | Category | Count | Duration |
|-------|----------|-------|----------|
| 1 | Authentication | 4 | 1-2 weeks |
| 2 | Products | 7 | 1-2 weeks |
| 2.5 | Inventory | 4 | (included) |
| 2.5 | Search | 2 | (included) |
| 3 | Orders | 5 | 2-3 weeks |
| 3 | Payments | 3 | (included) |
| 4 | Customers | 5 | 2-3 weeks |
| 4 | Promotions | 3 | (included) |
| 4 | Warehouse | 6 | (included) |
| 4 | Invoices | 3 | (included) |
| 4 | Admin | 4 | (included) |
| **TOTAL** | | **46** | **6-10 weeks** |

---

## 🗄️ Database Models (15 Main Tables)

### Core Models
- `taikhoan` - User accounts
- `khachhang` - Customers
- `nhanvien` - Employees
- `kho` - Warehouses
- `cuahang` - Stores

### Product Models
- `sanpham` - Products
- `loaisanpham` - Categories
- `tonkho` - Warehouse stock
- `tonkhocuahang` - Store stock

### Order & Payment Models
- `donhang` - Orders
- `chitietdonhang` - Order items
- `payments` - Payment records
- `payment_logs` - Payment events

### Supporting Models
- `address` - Customer addresses
- `khuyenmai` - Promotions
- `khuyenmaikhachhang` - Customer promotions
- `phieunhap` - Import receipts
- `phieuxuat` - Export receipts
- `phieuchuyenhang` - Transfer receipts
- `chuyenhangthanhpham` - Shipments
- `vaitro` - Roles
- `phanquyen` - Role assignments
- `nhaphanphoi` - Distributors

**Total: 20+ tables managed by Prisma ORM**

---

## 🔐 Authentication & Authorization

### JWT-based System
- **Token Format:** `Bearer <JWT_TOKEN>`
- **Expiration:** 7 days (configurable)
- **Secret:** 32+ character random string
- **Algorithm:** HS256 (HMAC SHA-256)

### Role-Based Access Control (RBAC)
```
Roles:
├─ Admin (Full access)
├─ Manager (Store/Warehouse management)
├─ Staff (Order processing)
└─ Customer (Browse & checkout)
```

### Protected Endpoints
- 🔐 All endpoints with sensitive data require JWT
- 👨‍💼 Admin/Manager endpoints checked on every request
- 👤 Customer endpoints verify resource ownership

---

## 💳 Payment Gateway Integration

### VNPay Integration
- **Provider:** VNPay (Vietnamese Payment Gateway)
- **Sandbox URL:** https://sandbox.vnpayment.vn
- **API Flow:** 
  1. Generate payment URL with order details
  2. Customer redirected to VNPay
  3. VNPay callback to `/payments/vnpay-return`
  4. Verify signature & update payment status

### Verification Process
- HMAC SHA-512 signature verification
- Amount validation (must match order total)
- Transaction reference tracking
- Event logging for audit trail

---

## 🚀 Implementation Timeline

### Phase 1: Core Infrastructure (1-2 weeks)
- Project setup & TypeScript config
- Database initialization & Prisma setup
- JWT authentication system
- Error handling & logging

**Deliverables:** 4 API endpoints ready

### Phase 2: Product Catalog (1-2 weeks)
- Product CRUD operations
- Category management
- Stock management
- Search & filtering

**Deliverables:** 12+ API endpoints ready

### Phase 3: Orders & Payments (2-3 weeks)
- Order creation & management
- VNPay payment integration
- Payment verification & logging
- Order status tracking

**Deliverables:** 8+ API endpoints ready + Payment system

### Phase 4: Advanced Features (2-3 weeks)
- Customer management & addresses
- Promotion system
- Warehouse management
- Invoice generation
- Performance optimization
- API documentation

**Deliverables:** 20+ API endpoints + Optimization + Docs

**Total Duration:** 6-10 weeks

---

## 🛠️ Tech Stack

### Backend Runtime & Framework
- **Node.js:** 18.x LTS or newer
- **Framework:** Express.js or Fastify
- **Language:** TypeScript 5.x
- **Runtime Compilation:** ts-node or tsx

### Database & ORM
- **Database:** MySQL 8.0+
- **ORM:** Prisma 5.x
- **Connection Pooling:** Prisma's built-in

### Authentication
- **JWT:** jsonwebtoken package
- **Password Hashing:** bcryptjs (10 rounds)
- **Session Management:** JWT tokens

### Payment Gateway
- **Provider:** VNPay
- **Integration Method:** REST API
- **Verification:** HMAC SHA-512

### Development Tools
- **Package Manager:** npm or yarn
- **Build Tool:** tsc (TypeScript compiler)
- **Testing:** Jest + Supertest
- **Linting:** ESLint
- **Formatting:** Prettier

### Optional - Performance
- **Caching:** Redis 6.x (Phase 4)
- **File Storage:** AWS S3 or local (optional)
- **Email Service:** SendGrid or Gmail SMTP

### DevOps
- **Containerization:** Docker + Docker Compose
- **Deployment:** GitHub Actions or CI/CD pipeline
- **Monitoring:** Winston Logger
- **Backup:** Database backups (weekly)

---

## ✅ Verification Checklist

### Pre-Development
- [ ] Team understands the 4-phase approach
- [ ] Database credentials ready
- [ ] VNPay test account created
- [ ] Environment variables template prepared
- [ ] Development machine set up (Node.js 18+, MySQL)

### Phase 1 Completion
- [ ] All 4 auth endpoints working
- [ ] JWT token generation verified
- [ ] User registration & login tested
- [ ] Error handling functional

### Phase 2 Completion
- [ ] All 12 product endpoints working
- [ ] Stock calculations correct
- [ ] Search filters functional
- [ ] Pagination implemented

### Phase 3 Completion
- [ ] Orders create with stock deduction
- [ ] VNPay integration working
- [ ] Payment verification passing
- [ ] Orders track status correctly

### Phase 4 Completion
- [ ] All 20+ advanced endpoints working
- [ ] Performance optimized (caching)
- [ ] API documentation complete
- [ ] Tests covering 80%+ code

### Deployment Ready
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Security audit passed
- [ ] Load testing completed
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Documentation complete

---

## 📞 API Response Examples

### Success Response (200)
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

### Creation Response (201)
```json
{
  "success": true,
  "data": { /* created resource */ },
  "message": "Resource created"
}
```

### Error Response (400+)
```json
{
  "success": false,
  "error": "Error message",
  "code": 400,
  "details": {
    "field": "Validation error details"
  }
}
```

---

## 🔍 Common Development Tasks

### Task 1: Add New Product Endpoint
1. Create ProductDTO in `src/types/product.ts`
2. Add method to ProductService
3. Add controller method to ProductController
4. Add route to productRoutes.ts
5. Test with Postman/Thunder Client
6. Document in API_ENDPOINTS_REFERENCE.md

### Task 2: Add New Database Model
1. Define model in `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <name>`
3. Create corresponding Service class
4. Create corresponding Controller class
5. Create routes file
6. Add to main app.ts routing

### Task 3: Add Payment Processing
1. Use PaymentService template
2. Generate VNPay URL in createPayment()
3. Verify signature in handleReturn()
4. Update order status on success
5. Log all payment events
6. Test with VNPay sandbox

### Task 4: Implement New Role
1. Add role to vaitro table
2. Add role check in authorize middleware
3. Add role to JWT payload
4. Add permission checks in relevant endpoints
5. Test access control

---

## 📈 Performance Targets

### Response Time SLAs
- Product list endpoint: < 200ms
- Product detail: < 100ms
- Search results: < 300ms
- Order creation: < 500ms
- Payment verification: < 1s

### Throughput Targets
- 100 requests/second at 99th percentile
- Handle 1000 concurrent users
- Database connection pool: 20-30 connections

### Caching Strategy (Phase 4)
- Product cache: 1 hour TTL
- Category cache: 1 day TTL
- Promotion cache: 30 min TTL
- Search results: 5 min TTL

---

## 🔒 Security Checklist

- [ ] Passwords hashed with bcrypt (10+ rounds)
- [ ] JWT tokens have expiration (7 days)
- [ ] HTTPS enforced in production
- [ ] CORS configured for frontend only
- [ ] Rate limiting active on auth endpoints
- [ ] SQL injection prevention (Prisma ORM)
- [ ] XSS prevention (input validation)
- [ ] CSRF protection (JWT-based)
- [ ] VNPay signatures verified
- [ ] Sensitive data logged appropriately
- [ ] No credentials in version control
- [ ] Environment variables in .env

---

## 📞 Support & References

### For Questions About:
- **Architecture:** See BACKEND_DESIGN_SPECIFICATION.md
- **Specific Endpoints:** See API_ENDPOINTS_REFERENCE.md
- **Database Structure:** See BACKEND_DATABASE_MAPPING.md
- **Data Flows:** See BACKEND_DATABASE_MAPPING.md (Data Flow Architecture)

### External Resources
- Prisma Documentation: https://www.prisma.io/docs/
- Express.js Guide: https://expressjs.com/
- JWT Best Practices: https://tools.ietf.org/html/rfc7519
- VNPay Integration: Provided by VNPay team

---

## 📋 Document Maintenance

**Last Updated:** May 5, 2026  
**Next Review:** After Phase 1 Completion  
**Maintained By:** Backend Architecture Team

### Version History
| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-05 | Initial complete specification |

---

## 🎯 Success Metrics

### Development Success
- ✅ All 46+ endpoints implemented
- ✅ 80%+ test coverage
- ✅ 0 critical security issues
- ✅ API response time < 200ms (p95)

### Project Success
- ✅ Completed within 6-10 week timeline
- ✅ Backend matches frontend functionality
- ✅ Zero data integrity issues
- ✅ Payment system working flawlessly

### Business Success
- ✅ Customers can browse & purchase
- ✅ Payments processed securely
- ✅ Inventory tracked accurately
- ✅ Admin can manage operations

---

**🚀 Ready to start development? Begin with PHASE 1 in BACKEND_DESIGN_SPECIFICATION.md**

For any questions or clarifications, refer to the specific document sections noted above.

---

**Project:** ShopMatcha Backend Design  
**Status:** ✅ Complete & Ready  
**Last Updated:** May 5, 2026  
**Document Version:** 1.0
