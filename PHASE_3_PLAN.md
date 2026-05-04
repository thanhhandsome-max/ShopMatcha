# Phase 3 - Frontend Components (Ready to Start)

**Estimated Timeline**: Week of 2026-05-05  
**Status**: 🟡 Planned (Ready for Implementation)

---

## 📋 Phase 3 Overview

Phase 3 focuses on building reusable React components and pages for the ShopMatcha storefront. All backend APIs are complete and tested. This phase will focus on connecting the frontend with the existing API layer.

---

## 🎯 Components to Build

### Section A: Core UI Components (Week 1)

#### A1. ProductCard
- **File**: `src/components/ProductCard.tsx`
- **Props**:
  - `product: Product` - Product object
  - `onAddToCart?: (productId: string) => void` - Add to cart handler
- **Features**:
  - Product image carousel
  - Price display with formatting (VND)
  - Stock status badge
  - Rating/review count
  - Add to cart button
- **Styling**: Tailwind CSS with hover effects

#### A2. CategoryFilter
- **File**: `src/components/CategoryFilter.tsx`
- **Props**:
  - `categories: Category[]` - Available categories
  - `selectedCategory?: string` - Currently selected
  - `onCategoryChange: (categoryId: string) => void` - Change handler
- **Features**:
  - Category list with images
  - Active state styling
  - Product count display
  - Responsive grid layout

#### A3. PriceFilter
- **File**: `src/components/PriceFilter.tsx`
- **Props**:
  - `minPrice?: number`
  - `maxPrice?: number`
  - `onPriceChange: (min: number, max: number) => void`
- **Features**:
  - Price range slider
  - Min/max input fields
  - Currency formatting (VND)
  - Real-time updates

#### A4. SortMenu
- **File**: `src/components/SortMenu.tsx`
- **Props**:
  - `currentSort?: 'price_asc' | 'price_desc' | 'newest' | 'name'`
  - `onSortChange: (sort: string) => void`
- **Features**:
  - Dropdown menu
  - Keyboard navigation
  - Icon indicators

#### A5. ProductGrid
- **File**: `src/components/ProductGrid.tsx`
- **Props**:
  - `products: Product[]`
  - `columns?: number` - Responsive columns (1-4)
  - `isLoading?: boolean`
- **Features**:
  - Responsive grid layout
  - Loading skeleton
  - Empty state message
  - Pagination controls

#### A6. SearchBar
- **File**: `src/components/SearchBar.tsx`
- **Props**:
  - `onSearch: (query: string) => void`
  - `placeholder?: string`
- **Features**:
  - Input with debounce
  - Clear button
  - Search icon
  - Keyboard shortcuts (Cmd+K / Ctrl+K)

#### A7. Pagination
- **File**: `src/components/Pagination.tsx`
- **Props**:
  - `currentPage: number`
  - `totalPages: number`
  - `onPageChange: (page: number) => void`
- **Features**:
  - Previous/Next buttons
  - Page numbers
  - Disabled state
  - Jump to page input

### Section B: Feature Components (Week 2)

#### B1. ProductList
- **File**: `src/components/ProductList.tsx`
- **Props**:
  - `filters?: ProductFilters`
- **Features**:
  - Combines ProductGrid + Pagination
  - Loading states
  - Error handling
  - Empty results message

#### B2. ProductDetail
- **File**: `src/components/ProductDetail.tsx`
- **Props**:
  - `productId: string`
- **Features**:
  - Product images carousel
  - Detailed description
  - Stock information by warehouse/shop
  - Related products
  - Add to cart with quantity selector
  - Star rating
  - Reviews section (placeholder)

#### B3. Cart Widget
- **File**: `src/components/CartWidget.tsx`
- **Features**:
  - Integration with existing `useCart` store
  - Cart item count badge
  - Dropdown preview
  - Quick actions (view cart, checkout)

#### B4. Breadcrumbs
- **File**: `src/components/Breadcrumbs.tsx`
- **Props**:
  - `items: BreadcrumbItem[]`
- **Features**:
  - Navigation trail
  - Schema markup for SEO
  - Responsive behavior

### Section C: Layout Components (Week 2)

#### C1. Header
- **File**: `src/components/Header.tsx`
- **Features**:
  - Logo/brand
  - Navigation menu
  - Search bar
  - Cart widget
  - User account dropdown

#### C2. Footer
- **File**: `src/components/Footer.tsx`
- **Features**:
  - Company info
  - Links (About, FAQ, Contact)
  - Newsletter signup
  - Social media links
  - Copyright

#### C3. Sidebar
- **File**: `src/components/Sidebar.tsx`
- **Features**:
  - Category filter
  - Price filter
  - Sort options
  - Clear filters button

---

## 📄 Pages to Build

### P1. Homepage
- **File**: `src/app/(shop)/page.tsx`
- **Components Used**:
  - Header
  - Hero section
  - Featured products section
  - New products section
  - Category showcase
  - Newsletter signup
  - Footer

### P2. Product Listing
- **File**: `src/app/(shop)/products/page.tsx`
- **Components Used**:
  - Header
  - Breadcrumbs
  - Sidebar (filters)
  - ProductList with filters
  - Footer

### P3. Product Detail
- **File**: `src/app/(shop)/products/[id]/page.tsx`
- **Components Used**:
  - Header
  - Breadcrumbs
  - ProductDetail
  - Related products
  - Footer

### P4. Search Results
- **File**: `src/app/(shop)/search/page.tsx`
- **Components Used**:
  - Header
  - SearchBar
  - ProductGrid
  - Pagination
  - Footer

---

## 🔌 API Hooks Integration

All components should use existing hooks from `src/lib/api-hooks.ts`:

```typescript
// Available hooks
- useHomepage()           // Get homepage data bundle
- useProducts()           // Get products with filters
- useProductDetail()      // Get single product
- useProductSearch()      // Search products
- useCategories()         // Get categories
```

### Example Usage

```typescript
import { useProducts } from '@/lib/api-hooks';

export function ProductList() {
  const { data, isLoading, error } = useProducts({
    page: 1,
    limit: 12,
    sortBy: 'newest'
  });

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage />;

  return <ProductGrid products={data.products} />;
}
```

---

## 🎨 Styling Strategy

### Tailwind Configuration
- Custom color palette for matcha shop (greens, whites)
- Custom spacing scale
- Custom font sizes

### Component Structure
```
component-name/
├── ComponentName.tsx      # Main component
├── ComponentName.module.css # If needed
├── types.ts               # TypeScript types
├── hooks.ts               # Custom hooks
└── __tests__/
    └── ComponentName.test.tsx
```

### Class Naming
- Use Tailwind classes (no custom CSS)
- BEM methodology if CSS modules needed
- Consistent naming convention

---

## 📊 Component State Management

### Local State
- Use `useState` for UI-only state (dropdown open/close)
- Use React hooks for form state

### Global State
- Use `useCart` (Zustand) for shopping cart
- Use API hooks for server data

### Form Handling
- Use `react-hook-form` for complex forms (optional)
- HTML5 validation for simple forms

---

## 🧪 Testing Strategy

### Unit Tests for Components
```typescript
// ProductCard.test.tsx
describe('ProductCard', () => {
  it('should render product name', () => {
    const product = { id: '1', name: 'Matcha' };
    render(<ProductCard product={product} />);
    expect(screen.getByText('Matcha')).toBeInTheDocument();
  });

  it('should call onAddToCart when button clicked', () => {
    const onAddToCart = jest.fn();
    const { getByRole } = render(
      <ProductCard product={product} onAddToCart={onAddToCart} />
    );
    fireEvent.click(getByRole('button'));
    expect(onAddToCart).toHaveBeenCalled();
  });
});
```

### Visual Regression Testing
- Use screenshot testing for components
- Compare against baseline images

### E2E Tests
- Test full user flows (browse → search → add to cart)

---

## 📦 Dependency Considerations

### Potential New Dependencies
```json
{
  "react-hook-form": "^7.0.0",
  "zustand": "^5.0.5",        // Already installed
  "swiper": "^11.0.0",         // For image carousel
  "react-hot-toast": "^2.4.0", // For notifications
  "date-fns": "^2.29.0"        // For date formatting
}
```

### No Breaking Changes
- All new components will be side-by-side
- Existing layout.tsx preserved
- Existing styles extended (not replaced)

---

## 🗓️ Implementation Timeline

### Week 1: Core Components
- Mon-Tue: A1 ProductCard + A2 CategoryFilter
- Wed: A3 PriceFilter + A4 SortMenu
- Thu: A5 ProductGrid + A6 SearchBar
- Fri: A7 Pagination + Testing

### Week 2: Feature & Layout
- Mon-Tue: B1 ProductList + B2 ProductDetail
- Wed: B3 Cart Widget + B4 Breadcrumbs
- Thu: C1 Header + C2 Footer
- Fri: C3 Sidebar + Integration

### Week 3: Pages & Polish
- Mon-Tue: P1 Homepage
- Wed: P2 Product Listing + P3 Product Detail
- Thu: P4 Search Results
- Fri: Bug fixes, performance optimization

---

## ✅ Checklist for Phase 3 Start

Before starting Phase 3:

- [ ] All Phase 2B tests passing (`npm run test`)
- [ ] Database seeded (`npm run prisma:seed`)
- [ ] Dev server running (`npm run dev`)
- [ ] API endpoints tested and working
- [ ] Existing `useCart` store understood
- [ ] Tailwind configuration reviewed
- [ ] Page routing structure reviewed
- [ ] Designer mockups/wireframes reviewed

---

## 🎯 Success Criteria

Phase 3 is complete when:

✅ All 17 components built and tested  
✅ All 4 pages functional and responsive  
✅ All API hooks integrated correctly  
✅ Shopping cart flow working end-to-end  
✅ Mobile responsive (all breakpoints)  
✅ Accessibility (WCAG 2.1 AA)  
✅ Performance metrics met (Core Web Vitals)  
✅ No TypeScript errors  
✅ No console errors/warnings  
✅ All tests passing  

---

## 📝 Notes

- Component order: Atomic (A) → Feature (B) → Layout (C) → Pages (P)
- Each component should be self-contained and reusable
- Props should be well-typed with TypeScript
- Error states should be handled gracefully
- Loading states should use skeleton screens
- Accessibility should be considered (ARIA labels, keyboard navigation)

---

## 🚀 Ready to Proceed?

Phase 3 is ready to start. All backend infrastructure is in place:

- ✅ Database schema (9 models)
- ✅ API endpoints (6 tested)
- ✅ Service layer (21 functions)
- ✅ Validation layer (5 schemas)
- ✅ API hooks (10 functions)
- ✅ Sample data (10 products)
- ✅ Testing framework (22 tests)

**Proceed to Phase 3 when ready!**

---

**Phase 3 Status: 🟡 PLANNED - Ready to Start**
