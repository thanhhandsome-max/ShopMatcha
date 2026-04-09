# Matcha Shop

Monorepo (1 app) cho website bán Matcha: Next.js 15 (App Router) + Prisma + MySQL + Tailwind + Zustand.

## Yêu cầu

- Node.js (khuyến nghị Node 20+)
- Docker Desktop (nếu chạy MySQL bằng docker-compose)

## Quick start (chạy local)

### 1) Tạo file env

- Copy `.env.example` → `.env`
- Mặc định kết nối tới MySQL chạy bằng Docker:

`DATABASE_URL="mysql://root:root@localhost:3306/matcha_shop"`

### 2) Chạy MySQL bằng Docker

```bash
docker compose up -d db
```

### 3) Cài dependencies + Prisma

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
```

### 4) Chạy dev

```bash
npm run dev
```

## Scripts

- `npm run dev`: chạy dev server
- `npm run build`: build production
- `npm run start`: chạy production server
- `npm run lint` / `npm run lint:fix`: ESLint
- `npm run typecheck`: TypeScript check
- `npm run format` / `npm run format:check`: Prettier
- `npm run prisma:generate`: generate Prisma Client
- `npm run prisma:migrate`: migrate DB (dev)

## Cấu trúc thư mục

```
matcha-shop/
├── prisma/                  # Quản lý Database
│   └── schema.prisma        # Nơi định nghĩa các bảng (User, Product, Order...)
├── public/                  # Tài nguyên tĩnh (Logo, Ảnh Matcha, Icons)
├── src/
│   ├── app/                 # Next.js 15 App Router
│   │   ├── (auth)/          # Đăng ký, Đăng nhập, Quên mật khẩu
│   │   ├── (shop)/          # Trang chủ, Sản phẩm, Giỏ hàng, Checkout
│   │   ├── (user)/          # Dashboard khách hàng, Lịch sử đơn hàng
│   │   ├── admin/           # Trang quản trị (Dashboard, Quản lý kho)
│   │   ├── api/             # API routes
│   │   ├── layout.tsx       # Layout tổng
│   │   └── globals.css      # Tailwind directives
│   ├── components/          # UI components tái sử dụng
│   │   ├── ui/
│   │   ├── shop/
│   │   ├── admin/
│   │   └── layout/
│   ├── lib/                 # Singletons / utilities
│   │   ├── prisma.ts        # PrismaClient singleton
│   │   └── utils.ts
│   ├── services/            # Data access layer
│   ├── store/               # Client state (Zustand)
│   └── types/               # Shared TS types
├── .env.example             # Env template (KHÔNG chứa secret)
├── docker-compose.yml       # MySQL (local)
├── Dockerfile               # Container hoá Next.js (tuỳ dùng)
└── ...
```

## Contributing

Xem `CONTRIBUTING.md` để biết cách tạo branch/PR và quy ước commit.