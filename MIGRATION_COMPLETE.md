# ✅ Migration từ React sang Next.js 15 - Hoàn Tất

## 📋 Tóm tắt thay đổi

Dự án **ShopMatcha** đã được chuyển đổi thành công từ:
- **Trước**: React 19 + Vite + React Router v7
- **Sau**: Next.js 15 + App Router + TypeScript

## 📂 Cấu trúc thư mục mới

```
ShopMatcha/
├── app/                          # Next.js App Router (NEW)
│   ├── layout.tsx                # Root layout với providers
│   ├── page.tsx                  # Trang chủ (/)
│   ├── products/
│   │   ├── page.tsx              # Danh sách sản phẩm (/products)
│   │   └── [id]/
│   │       └── page.tsx          # Chi tiết sản phẩm (/products/:id)
│   ├── matcha-guide/
│   │   └── page.tsx              # Hướng dẫn matcha
│   ├── contact/
│   │   └── page.tsx              # Liên hệ
│   └── auth/
│       ├── callback/
│       │   └── page.tsx          # Auth callback
│       └── error/
│           └── page.tsx          # Auth error
├── src/                          # Source code (unchanged location)
│   ├── pages/                    # Page components (không phải Next.js routes)
│   ├── components/               # UI components
│   ├── lib/                      # Utilities
│   ├── hooks/                    # Custom hooks
│   ├── store/                    # Zustand stores
│   ├── services/                 # API services
│   ├── data/                     # Static data
│   ├── App.tsx                   # (deprecated - empty)
│   ├── main.tsx                  # (deprecated - empty)
│   └── index.css                 # Global styles
├── prisma/                       # Database schema
├── public/                       # Static assets
├── package.json                  # Dependencies updated
├── next.config.ts                # Next.js config
├── tailwind.config.ts            # Tailwind config
├── tsconfig.json                 # TypeScript config
└── MIGRATION.md                  # Hướng dẫn chi tiết
```

## 🔄 Những gì đã thay đổi

### ✅ Đã cập nhật
- [x] Tạo app router structure trong `/app`
- [x] Chuyển React Router → Next.js routing
- [x] Cập nhật tất cả Link: `to=` → `href=`
- [x] Chuyển `useParams`, `useSearchParams` → Next.js versions
- [x] Thêm `'use client'` directive cho components cần dùng hooks
- [x] Cập nhật app/layout.tsx với providers (QueryClient, TooltipProvider)
- [x] Loại bỏ react-router-dom từ package.json
- [x] Cập nhật tailwind.config.ts để bao gồm app dir
- [x] Cập nhật tất cả page components

### ❌ Xóa
- react-router-dom (^7.14.0)
- @types/react-router-dom (^5.3.3)

### 📝 File chủ chốt
| File | Thay đổi |
|------|---------|
| `src/pages/Index.tsx` | ✅ Thêm 'use client', cập nhật Link imports |
| `src/pages/Products.tsx` | ✅ Thêm 'use client' |
| `src/pages/ProductDetail.tsx` | ✅ Thêm 'use client', sử dụng Next.js useParams |
| `src/pages/MatchaGuide.tsx` | ✅ Thêm 'use client' |
| `src/pages/Contact.tsx` | ✅ Thêm 'use client' |
| `src/pages/AuthCallback.tsx` | ✅ Thêm 'use client' |
| `src/pages/AuthError.tsx` | ✅ Thêm 'use client', sử dụng Next.js useSearchParams |
| `src/components/layout/Header.tsx` | ✅ Đã sử dụng Next.js correctly |
| `src/components/shop/CartDrawer.tsx` | ✅ Đã sử dụng Next.js correctly |
| `src/components/shop/ProductCard.tsx` | ✅ Đã sử dụng Next.js correctly |
| `app/layout.tsx` | ✅ NEW - Root layout |
| `app/page.tsx` | ✅ NEW - Trang chủ |
| `app/products/page.tsx` | ✅ NEW - Danh sách sản phẩm |
| `app/products/[id]/page.tsx` | ✅ NEW - Chi tiết sản phẩm |
| `app/matcha-guide/page.tsx` | ✅ NEW |
| `app/contact/page.tsx` | ✅ NEW |
| `app/auth/callback/page.tsx` | ✅ NEW |
| `app/auth/error/page.tsx` | ✅ NEW |

## 🚀 Cách chạy dự án

### 1. Cài dependencies
```bash
npm install
```

### 2. Chạy development server
```bash
npm run dev
```
Server sẽ chạy tại `http://localhost:3000`

### 3. Build cho production
```bash
npm run build
npm start
```

### 4. Các lệnh khác
```bash
npm run lint        # Chạy ESLint
npm run lint:fix    # Fix linting issues
npm run format      # Format code
npm run typecheck   # Type check
```

## ⚠️ Những điểm quan trọng

### 1. Dynamic Route Parameters
```tsx
// Cách cũ (React Router)
const { id } = useParams<{ id: string }>();

// Cách mới (Next.js)
const params = useParams();
const id = params.id as string;
// Hoặc trong server component:
const { id } = await params;
```

### 2. Client vs Server Components
- **Root layout** (`app/layout.tsx`): `'use client'` (dùng hooks & providers)
- **Page components** (`src/pages/*.tsx`): `'use client'` (dùng useState, useEffect)
- Không cần `'use client'` nếu chỉ render UI tĩnh

### 3. CSS Global
- Import CSS trong `app/layout.tsx`
- Tailwind CSS vẫn hoạt động bình thường

### 4. Environment Variables
- Client-side env phải có prefix `NEXT_PUBLIC_`
- Ví dụ: `NEXT_PUBLIC_API_URL=...`

## 🔗 Routing Map

| Path | File | Component |
|------|------|-----------|
| `/` | `app/page.tsx` | Index |
| `/products` | `app/products/page.tsx` | Products |
| `/products/[id]` | `app/products/[id]/page.tsx` | ProductDetail |
| `/matcha-guide` | `app/matcha-guide/page.tsx` | MatchaGuide |
| `/contact` | `app/contact/page.tsx` | Contact |
| `/auth/callback` | `app/auth/callback/page.tsx` | AuthCallback |
| `/auth/error` | `app/auth/error/page.tsx` | AuthError |

## 📦 Dependencies (Giữ lại)

- next (^15.0.0) ✅ Upgraded
- react (^19.0.0) ✅ Keep
- react-dom (^19.0.0) ✅ Keep
- @tanstack/react-query (^5.97.0) ✅ Keep
- zustand (^5.0.5) ✅ Keep
- @radix-ui/* ✅ Keep (10 packages)
- tailwindcss (^3.4.0) ✅ Keep
- Tất cả others ✅ Keep

## 🎯 Next Steps (Tùy chọn - không bắt buộc)

1. **API Routes**: Chuyển API calls sang `app/api/` nếu muốn
2. **Image Optimization**: Tối ưu hóa images với `next/image`
3. **Middleware**: Thêm auth middleware nếu cần
4. **Database**: Tích hợp Prisma API routes
5. **Caching**: Thêm ISR hoặc revalidation strategies

## ✨ Lợi ích của Next.js 15

- ✅ Built-in routing (không cần React Router)
- ✅ Server Components (giảm bundle size)
- ✅ Automatic code splitting
- ✅ Image optimization
- ✅ API routes built-in
- ✅ Better performance
- ✅ Full TypeScript support
- ✅ CSS-in-JS support

## 📞 Hỗ trợ

Nếu gặp lỗi:
1. Kiểm tra `MIGRATION.md` để biết chi tiết
2. Chạy `npm run typecheck` để kiểm tra lỗi TypeScript
3. Chạy `npm run lint` để kiểm tra linting issues
4. Xóa `.next` folder và chạy lại `npm run dev`

---

**Status**: ✅ Migration Complete
**Date**: 2026-04-10
