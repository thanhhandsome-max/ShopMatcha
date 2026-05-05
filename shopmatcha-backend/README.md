# ShopMatcha Backend

This backend folder contains the homepage API implementation for ShopMatcha.

## Setup

1. Copy `.env.example` to `.env` and update database credentials.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - start development server with hot reload
- `npm run build` - compile TypeScript to JavaScript
- `npm run start` - run compiled code
- `npm run prisma:generate` - generate Prisma client
- `npm run prisma:push` - push Prisma schema to database

## API Documentation

For endpoint details, request examples, and response shapes, see [API_REFERENCE.md](./API_REFERENCE.md).
