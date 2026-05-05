# ShopMatcha Backend API Reference

This document describes the homepage API endpoints implemented in the `shopmatcha-backend` service.

## Overview

This backend exposes the homepage catalog and search APIs for ShopMatcha. It is built with Express, TypeScript, and Prisma connecting to a MySQL database.

## Setup

1. Copy `.env.example` to `.env`.
2. Update the database connection string.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

The backend reads configuration from `.env`:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=mysql://root:@localhost:3306/web_matcha
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```

> Adjust `DATABASE_URL` for your local MySQL instance.

## Health Check

- `GET /health`
- `GET /api/health`

Response:

```json
{
  "status": "OK",
  "timestamp": "2026-05-05T..."
}
```

## API Endpoints

### Categories

- `GET /api/categories`

Query parameters: none

Response shape:

```json
{
  "success": true,
  "data": [
    {
      "MaLoai": "L01",
      "TenLoai": "Bột Matcha Nguyên Chất",
      "Mota": null,
      "TrangThai": 1,
      "_count": { "sanpham": 6 }
    }
  ]
}
```

### Products

- `GET /api/products`

Query parameters:
- `category` (string) - filter by category ID
- `sort` (string) - one of `price-asc`, `price-desc`, `name-asc`, `newest`
- `page` (number) - page index, default `1`
- `limit` (number) - page size, default `20`, max `100`

Example:

```http
GET /api/products?category=L01&sort=price-desc&page=1&limit=10
```

Response shape:

```json
{
  "success": true,
  "data": {
    "products": [ /* product list */ ],
    "total": 20,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

- `GET /api/products/search`

Search alias routed through the product API.

Query parameters:
- `query` (string) - search text
- `limit` (number) - maximum results

Example:

```http
GET /api/products/search?query=Matcha&limit=10
```

- `GET /api/products/:id`

Example:

```http
GET /api/products/SP01
```

- `GET /api/products/:id/related`

Example:

```http
GET /api/products/SP01/related
```

### Search

- `GET /api/search`

Query parameters:
- `q` or `query` (string) - search text, required
- `limit` (number) - max results, default `20`

Example:

```http
GET /api/search?q=Matcha&limit=10
```

Response shape:

```json
{
  "success": true,
  "data": {
    "query": "Matcha",
    "results": [ /* matching products */ ],
    "count": 9
  }
}
```

### Promotions

- `GET /api/promotions`

Returns active promotional entries from the `khuyenmai` table.

Example response:

```json
{
  "success": true,
  "data": []
}
```

## Implementation Notes

- `src/app.ts` configures middleware, routes, and global error handling.
- `src/services` contains the business logic for categories, products, search, and promotions.
- `src/controllers` maps HTTP requests to service calls and normalizes API responses.
- `src/routes` defines route paths for the homepage APIs.
- `src/lib/prisma.ts` exports a shared Prisma client connection.

## Running the Production Build

Compile TypeScript:

```bash
npm run build
```

Run the compiled server:

```bash
npm run start
```
