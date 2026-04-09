# Contributing

## Cách làm việc chung

- Mỗi task → 1 branch riêng
- PR nhỏ, dễ review (ưu tiên < 300 dòng thay đổi nếu có thể)
- Không commit `.env` / secrets

## Quy ước branch

- `feat/<ten-ngan>`: tính năng
- `fix/<ten-ngan>`: sửa bug
- `chore/<ten-ngan>`: việc lặt vặt (refactor, config)

Ví dụ: `feat/cart-checkout`, `fix/admin-products`.

## Quy ước commit (gợi ý)

- `feat: ...`
- `fix: ...`
- `chore: ...`
- `refactor: ...`
- `docs: ...`

## Checklist trước khi mở PR

- Chạy `npm run lint`
- Chạy `npm run typecheck`
- Nếu thay đổi DB: chạy `npm run prisma:migrate`

## Notes về Prisma

- Schema nằm ở `prisma/schema.prisma`
- Cần `DATABASE_URL` đúng để migrate/generate chạy được
