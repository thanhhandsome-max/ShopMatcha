# ShopMatcha - AI Assistant Guide

Tài liệu này đóng vai trò là "bộ nhớ nhanh" dành cho AI Assistant (hoặc bất kỳ lập trình viên nào mới tham gia) để có thể hiểu ngay bối cảnh, công nghệ và cấu trúc của dự án ShopMatcha chỉ qua một lần đọc.

## 📌 Tổng quan dự án (Project Overview)
- **Tên dự án**: ShopMatcha (matcha-shop)
- **Mô tả**: Website thương mại điện tử bán Matcha. Dự án vừa hoàn tất việc chuyển đổi (migration) toàn bộ từ React + Vite (React Router) sang **Next.js 15 (App Router)**.
- **Trạng thái hiện tại**: Quá trình migration đã hoàn tất, không còn lỗi. Dự án sẵn sàng cho việc phát triển thêm các tính năng mới (Ready for Development).

## 🛠 Tech Stack (Công nghệ sử dụng)
- **Core Framework**: Next.js 15 (sử dụng App Router) + React 19
- **Ngôn ngữ**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Data Fetching (Client)**: TanStack Query (React Query)
- **Database & ORM**: MySQL + Prisma

## 📂 Cấu trúc thư mục cốt lõi (Core Structure)
Kiến trúc của dự án phân tách rõ ràng giữa Routing (Next.js) và Code logic (src):

```text
ShopMatcha/
├── app/                      # Next.js App Router (Routing)
│   ├── api/                  # API Endpoints (Next.js Route Handlers)
│   ├── (auth)/, (shop)/...   # Route groups phân chia theo logic
│   └── layout.tsx, page.tsx  # Layout và Page chính
├── src/                      # Source code logic & UI
│   ├── components/           # UI Components (chứa shadcn/ui, layout, admin, shop components)
│   ├── store/                # Zustand stores để quản lý state
│   ├── services/             # API services / Data fetching logic
│   ├── lib/                  # Utilities (như utils.ts) và cấu hình singleton (prisma.ts)
│   ├── hooks/                # Custom React hooks
│   └── types/                # TypeScript types & interfaces chia sẻ
├── prisma/                   # Quản lý Database
│   └── schema.prisma         # Nơi định nghĩa các bảng (Models)
└── public/                   # Tài nguyên tĩnh (Images, Icons)
```

## 🚀 Các lệnh phát triển quan trọng (Commands)
- `npm install`: Cài đặt dependencies.
- `npm run dev`: Khởi chạy development server (mặc định tại `http://localhost:3000`).
- `docker compose up -d db`: Khởi động nhanh MySQL local thông qua Docker.
- `npx prisma generate`: Cập nhật lại Prisma Client (cần chạy sau khi clone hoặc đổi schema).
- `npx prisma migrate dev`: Cập nhật schema vào database và tạo migration files.

## 📚 Hệ thống tài liệu (Documentation)
Dự án có hệ thống tài liệu cực kỳ đầy đủ. Khi cần tìm hiểu sâu hơn, hãy tra cứu theo thứ tự:
1. **`DOCS_INDEX.md`**: Điểm bắt đầu (Hub) trỏ tới mọi tài liệu khác. Luôn xem file này đầu tiên nếu tìm kiếm thông tin.
2. **`GET_STARTED.md`**: Hướng dẫn cài đặt và chạy dự án step-by-step.
3. **`DEVELOPMENT.md`**: Hướng dẫn chi tiết cho developer (cách thêm API, conventions, cấu trúc thư mục chi tiết).
4. **`START_HERE.txt`** & **`FINAL_REPORT.md`**: Tóm tắt quá trình migration để hiểu những gì đã thay đổi.

## 💡 Lưu ý cốt lõi khi code (AI Guidelines)
1. **Next.js App Router**: Luôn tuân thủ nguyên tắc thư mục của App Router (`/app`), **KHÔNG** sử dụng Pages Router (`/pages`).
2. **Server vs Client Components**: 
   - Mặc định mọi component trong `/app` là **Server Component**. 
   - Nếu component cần tính tương tác (chứa hooks như `useState`, `useEffect` hoặc event listeners như `onClick`), BẮT BUỘC phải thêm directive `"use client"` ở dòng đầu tiên của file.
3. **Routing Hook**: Thay vì dùng thư viện cũ `react-router-dom`, hãy dùng các hooks từ `next/navigation` (`useRouter`, `usePathname`, `useSearchParams`).
4. **Database Changes**: Nếu có sự thay đổi về cấu trúc CSDL, hãy sửa đổi trong file `prisma/schema.prisma`, sau đó phải chạy lệnh `npx prisma migrate dev` để apply.
5. **UI Components**: Ưu tiên sử dụng và mở rộng các component của `shadcn/ui` (trong `src/components/ui`) thay vì code lại từ đầu. Kết hợp `tailwind-merge` (`cn` utility) để nối class an toàn.
