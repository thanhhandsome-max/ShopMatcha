# Migration từ React (Vite) sang Next.js 15

## ✅ Hoàn tất

Dự án đã được migrate thành công từ React (Vite + React Router) sang **Next.js 15 App Router**.

## 📁 Thay đổi cấu trúc

### Thêm
- `app/` - Thư mục chứa route definitions theo chuẩn Next.js App Router
  - `layout.tsx` - Root layout với providers (QueryClient, TooltipProvider, Toaster)
  - `page.tsx` - Trang chủ
  - `products/page.tsx` - Trang sản phẩm
  - `products/[id]/page.tsx` - Trang chi tiết sản phẩm
  - `matcha-guide/page.tsx` - Trang Matcha Guide
  - `contact/page.tsx` - Trang Liên hệ
  - `auth/callback/page.tsx` - Trang xác thực callback
  - `auth/error/page.tsx` - Trang lỗi xác thực

### Xóa/Thay đổi
- ❌ `src/main.tsx` - Không còn cần (Next.js không dùng entry point này)
- ⚠️ `src/App.tsx` - Deprecated (giữ lại để tránh lỗi import nhưng không sử dụng)
- ✅ `src/pages/*` - Vẫn giữ lại để chứa page components (không phải Next.js pages)

## 🔄 Thay đổi imports

### React Router → Next.js
```tsx
// Trước
import { Link, useParams, useNavigate } from "react-router-dom";

// Sau
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
```

### Link component
```tsx
// Trước
<Link to="/products">Products</Link>

// Sau
<Link href="/products">Products</Link>
```

### Dynamic routes (URL params)
```tsx
// Trước - pages/ProductDetail.tsx
const { id } = useParams<{ id: string }>();

// Sau - pages/ProductDetail.tsx
const { id } = useParams<{ id: string }>();
// (Next.js useParams tự động mapping từ [id] folder)
```

## 📦 Dependencies

### Xóa
- `react-router-dom` (^7.14.0)
- `@types/react-router-dom` (^5.3.3)

### Giữ lại
- Tất cả Radix UI components
- TanStack React Query
- Tailwind CSS
- Zustand
- Prisma

## 🚀 Chạy dự án

### Development
```bash
npm install  # Cài dependencies mới
npm run dev  # Khởi động dev server (localhost:3000)
```

### Build & Production
```bash
npm run build  # Build cho production
npm start      # Chạy production build
```

### Lint & Format
```bash
npm run lint        # Chạy ESLint
npm run lint:fix    # Fix linting issues
npm run format      # Format code với Prettier
npm run typecheck   # Type checking với TypeScript
```

## 🔧 Cấu hình

### next.config.ts
- Bật `reactStrictMode`
- Có thể thêm các config khác nếu cần (image optimization, API routes, etc.)

### tailwind.config.ts
- Cập nhật content paths để bao gồm `./app/**/*.{ts,tsx}`

### tsconfig.json
- `baseUrl: "."` và `paths: { "@/*": ["./src/*"] }` để hỗ trợ path aliases

## ⚠️ Lưu ý quan trọng

### 1. Environment Variables
- Nếu cần sử dụng env variables, tạo `.env.local`
- Client-side env phải có prefix `NEXT_PUBLIC_`

### 2. API Routes
- Có thể tạo API routes trong `app/api/` (nếu cần)
- Ví dụ: `app/api/products/route.ts`

### 3. Server vs Client Components
- Server Components là default (không cần directive)
- Client Components cần `'use client'` ở đầu file
- Tất cả page components hiện tại là Server Components (layout.tsx là 'use client' để dùng hooks)

### 4. Image Component
- ProductCard.tsx sử dụng `next/image` cho tối ưu hóa
- Cấu hình domain trong next.config.ts nếu sử dụng external images

## 📝 File thay đổi chính

| File | Thay đổi |
|------|---------|
| `src/pages/Index.tsx` | Link imports từ react-router-dom → next/link |
| `src/pages/Products.tsx` | Không import React Router |
| `src/pages/ProductDetail.tsx` | useParams từ next/navigation |
| `src/pages/MatchaGuide.tsx` | Link imports → next/link |
| `src/pages/Contact.tsx` | Link imports → next/link |
| `src/pages/AuthError.tsx` | useSearchParams từ next/navigation |
| `src/components/layout/Header.tsx` | Đã sử dụng Next.js imports |
| `package.json` | Xóa react-router-dom & @types/react-router-dom |

## 🎯 Next Steps (Tùy chọn)

1. **API Routes**: Chuyển API calls sang Next.js API routes nếu cần
2. **Image Optimization**: Thêm next/image với custom loaders nếu cần
3. **Incremental Static Regeneration (ISR)**: Thêm `revalidate` cho caching
4. **Middleware**: Thêm middleware.ts cho auth/redirects nếu cần
5. **Database**: Tích hợp Prisma API routes
