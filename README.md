# Matcha Shop

Hướng dẫn chạy dự án duy nhất cho workspace này.

## Yêu cầu

- Node.js 20+.
- Docker Desktop nếu muốn chạy MySQL bằng `docker-compose`.

## Cài đặt

1. Tạo file `.env` từ `.env.example`.
2. Cập nhật `DATABASE_URL` trong `.env` cho đúng môi trường local.
3. Cài dependency:

```bash
npm install
```

4. Tạo Prisma Client:

```bash
npm run db:generate
```

5. Đẩy schema xuống database:

```bash
npm run db:push
```

## Chạy ứng dụng

```bash
npm run dev
```

Mở `http://localhost:3000`.

## Scripts chính

- `npm run dev`: chạy dev server.
- `npm run build`: build production.
- `npm run start`: chạy bản production.
- `npm run lint`: kiểm tra ESLint.
- `npm run db:generate`: generate Prisma Client.
- `npm run db:push`: đồng bộ schema với database.
- `npm run prisma:seed`: seed dữ liệu mẫu.

## Ghi chú nhanh

- Nếu dùng Docker cho MySQL, chạy `docker compose up -d db` trước khi khởi động app.
- Nếu đổi schema Prisma, chạy lại `npm run db:generate` rồi `npm run db:push`.