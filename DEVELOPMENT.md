# ShopMatcha - Development Guide

## Project Setup

This project has been migrated from React + Vite to **Next.js 15 with App Router**.

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm or yarn
- MySQL 8.0+ (or use Docker)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment variables:**
   ```bash
   # Copy .env.local from .env.example (already created)
   # Edit as needed for your local setup
   ```

3. **Setup Database (Option A - Docker):**
   ```bash
   docker-compose up -d
   ```
   This will start MySQL with:
   - User: `root`
   - Password: `root`
   - Database: `matcha_shop`
   - Port: `3306`

4. **Setup Database (Option B - Local MySQL):**
   ```bash
   # Update DATABASE_URL in .env.local to your MySQL connection
   ```

5. **Initialize Prisma:**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

### Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3000`

### Build & Production

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Code Quality

```bash
# Format code
npm run format

# Lint code
npm run lint
```

## Project Structure

```
app/                          # Next.js App Router
├── api/                      # API routes
│   ├── config/route.ts       # Runtime config endpoint
│   ├── products/route.ts     # Products list endpoint
│   ├── products/[id]/route.ts # Product detail endpoint
│   └── contact/route.ts      # Contact form endpoint
├── products/                 # Product pages
│   └── [id]/page.tsx         # Dynamic product detail page
├── layout.tsx                # Root layout with providers
└── page.tsx                  # Home page

src/
├── pages/                    # Next.js page components (Client Components)
│   ├── Index.tsx            # Home page
│   ├── Products.tsx         # Product listing
│   ├── ProductDetail.tsx    # Product detail (server-agnostic)
│   ├── Contact.tsx          # Contact page
│   ├── MatchaGuide.tsx      # Info page
│   ├── AuthCallback.tsx     # Auth callback handler
│   └── AuthError.tsx        # Auth error handler
├── components/
│   ├── layout/              # Layout components (Header, Footer)
│   ├── shop/                # Shop components (ProductCard, CartDrawer)
│   └── ui/                  # shadcn/ui components
├── store/                   # Zustand state management
│   └── useCart.ts          # Shopping cart store
├── services/                # API services
│   ├── product.service.ts  # Product fetching
│   └── order.service.ts    # Order management
├── lib/                     # Utilities
│   ├── config.ts           # Runtime config loader
│   ├── api.ts              # API client
│   ├── auth.ts             # Auth utilities
│   ├── prisma.ts           # Prisma client
│   └── utils.ts            # Helper functions
├── hooks/                   # Custom React hooks
│   ├── use-mobile.tsx      # Mobile detection
│   └── use-toast.ts        # Toast notifications
├── data/                    # Static data
│   └── products.ts         # Mock product data
└── styles/                  # Global styles
    └── index.css           # Tailwind CSS
```

## Key Changes from React to Next.js

1. **Routing**: Next.js file-based routing replaces React Router
   - `src/pages/*.tsx` → Pages wrapped by `app/**/page.tsx`
   - Dynamic routes: `[id].tsx` → `[id]/page.tsx`

2. **Client Components**: All interactive pages use `'use client'` directive
   - Hooks (useState, useEffect) work as expected
   - Server components by default (when not using 'use client')

3. **API Routes**: Built-in API routes in `app/api/**`
   - No need for separate backend
   - Request handlers exported as GET, POST, etc.

4. **Image Optimization**: Next.js Image component available
   - Replace `<img>` with `<Image>` for optimization
   - See Dockerfile for next/image setup with sharp

5. **Link Navigation**: `<Link>` from 'next/link' instead of 'react-router-dom'
   - Use `href` instead of `to`
   - Dynamic routes: `href={`/products/${id}`}`

6. **Form Handling**: Use native HTML forms with Server Actions (optional)
   - Current implementation uses client-side form submission
   - Can migrate to Server Actions for validation

7. **Type Safety**: Full TypeScript support
   - Dynamic route params are properly typed
   - Use optional chaining `params?.id` for safety

## Development Tips

### Adding New Routes

1. Create `app/your-route/page.tsx`:
   ```tsx
   'use client';
   
   export default function YourPage() {
     return <div>Your content</div>;
   }
   ```

2. The route is automatically available at `/your-route`

### Adding API Endpoints

1. Create `app/api/your-endpoint/route.ts`:
   ```ts
   import { NextResponse } from 'next/server';
   
   export async function GET(request: Request) {
     return NextResponse.json({ data: 'response' });
   }
   
   export async function POST(request: Request) {
     const body = await request.json();
     return NextResponse.json({ success: true });
   }
   ```

2. Available at `/api/your-endpoint`

### Using Zustand Store (useCart)

```tsx
import { useCart } from '@/store/useCart';

export function MyComponent() {
  const cart = useCart();
  
  // Access items
  const items = cart.items; // CartItem[]
  
  // Call computed functions
  const total = cart.totalPrice(); // number
  const count = cart.totalItems(); // number
  
  // Modify cart
  cart.addItem(product);
  cart.removeItem(productId);
}
```

### Using API Services

```tsx
import { productService } from '@/services/product.service';

// Fetch products
const products = await productService.getProducts();

// Fetch product detail
const product = await productService.getProductById(id);
```

## Troubleshooting

### CSS Not Loading
- Ensure `app/layout.tsx` imports `../src/index.css`
- Tailwind CSS warnings are normal (about @tailwind directives)

### Params/SearchParams Undefined
- Always use optional chaining: `params?.id`
- Dynamic params are wrapped in Promise: `await params`

### Zustand Store Returns Undefined
- Remember to call functions: `totalItems()` not `totalItems`
- Always initialize store in client component with 'use client'

### Database Connection Issues
- Ensure MySQL is running (Docker or local)
- Check DATABASE_URL in .env.local
- Run `npx prisma migrate dev` to sync schema

## Docker Deployment

The included `Dockerfile` supports both development and production:

```bash
# Development
docker build -t shopmatcha:dev .
docker run -p 3000:3000 shopmatcha:dev

# Production
docker build --target prod -t shopmatcha:prod .
docker run -p 3000:3000 shopmatcha:prod
```

## Performance Tips

1. **Image Optimization**: Use Next.js `<Image>` component
2. **Code Splitting**: Dynamic imports for heavy components
3. **Caching**: Use SWR or TanStack Query for API caching
4. **Database**: Index frequently queried fields in Prisma schema

## Next Steps

1. ✅ Setup development environment
2. ✅ Create API endpoints for real backend integration
3. ⏳ Implement OAuth/authentication (Google, Facebook)
4. ⏳ Add Prisma models for products, orders, users
5. ⏳ Setup payment integration (Stripe, etc.)
6. ⏳ Add E2E tests (Cypress, Playwright)
7. ⏳ Deploy to production (Vercel, AWS, Azure, etc.)

## Support

For issues or questions:
1. Check error messages in terminal/browser console
2. Review this guide's Troubleshooting section
3. Check Next.js documentation: https://nextjs.org/docs
4. Check component library: https://ui.shadcn.com/

---

**Last Updated**: After React-to-Next.js migration completion
