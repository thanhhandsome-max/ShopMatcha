# Homepage Backend - Database Queries Reference
## Cheat Sheet cho các query Prisma sử dụng trong homepage backend

**Document Date:** May 5, 2026

---

## 📋 Table of Contents

1. Category Queries
2. Product Queries
3. Search Queries
4. Promotion Queries
5. Stock Queries
6. Image Queries

---

## 🏷️ Category Queries

### Get All Active Categories
```typescript
// ✅ HOMEPAGE API #1
const categories = await prisma.loaisanpham.findMany({
  where: {
    TrangThai: 1  // Must be 1 (number), not "1" (string)
  },
  include: {
    _count: {
      select: {
        sanpham: true  // Count products in each category
      }
    }
  }
});

// Response structure:
// {
//   MaLoai: "CAT001",
//   TenLoai: "Matcha Premium",
//   Mota: "...",
//   TrangThai: 1,
//   _count: { sanpham: 5 }
// }
```

### Get Category with Product Count
```typescript
const categoryWithCount = await prisma.loaisanpham.findUnique({
  where: { MaLoai: "CAT001" },
  include: {
    _count: {
      select: { sanpham: true }
    }
  }
});
```

---

## 🛍️ Product Queries

### Get All Products (with pagination)
```typescript
// ✅ HOMEPAGE API #2
const page = 1;
const limit = 20;

const products = await prisma.sanpham.findMany({
  where: {
    TrangThai: "1"  // Must be "1" (string), not 1
  },
  skip: (page - 1) * limit,
  take: limit,
  include: {
    loaisanpham: true,
    sanpham_anh: {
      orderBy: [
        { AnhChinh: 'desc' },
        { ThuTu: 'asc' }
      ]
    },
    tonkho: true
  },
  orderBy: {
    NgayTao: 'desc'  // Newest first
  }
});
```

### Get Products by Category
```typescript
const products = await prisma.sanpham.findMany({
  where: {
    TrangThai: "1",
    MaLoai: "CAT001"  // Filter by category
  },
  include: {
    loaisanpham: true,
    sanpham_anh: true,
    tonkho: true
  }
});
```

### Sort Products by Price (Ascending)
```typescript
const products = await prisma.sanpham.findMany({
  where: { TrangThai: "1" },
  orderBy: {
    GiaBan: 'asc'  // Sort by price ascending
  },
  include: {
    sanpham_anh: true,
    loaisanpham: true
  }
});
```

### Sort Products by Price (Descending)
```typescript
const products = await prisma.sanpham.findMany({
  where: { TrangThai: "1" },
  orderBy: {
    GiaBan: 'desc'  // Sort by price descending
  },
  include: {
    sanpham_anh: true,
    loaisanpham: true
  }
});
```

### Sort Products by Name
```typescript
const products = await prisma.sanpham.findMany({
  where: { TrangThai: "1" },
  orderBy: {
    TenSP: 'asc'  // Sort by name alphabetically
  },
  include: {
    sanpham_anh: true,
    loaisanpham: true
  }
});
```

### Get Single Product Detail
```typescript
// ✅ HOMEPAGE API #3
const product = await prisma.sanpham.findUnique({
  where: { MaSP: "SP001" },
  include: {
    loaisanpham: true,
    sanpham_anh: {
      orderBy: [
        { AnhChinh: 'desc' },
        { ThuTu: 'asc' }
      ]
    },
    tonkho: {
      select: {
        MaKho: true,
        SoLuong: true
      }
    },
    tonkhocuahang: {
      select: {
        MaCH: true,
        SoLuong: true
      }
    }
  }
});
```

### Get Related Products (Same Category)
```typescript
// ✅ HOMEPAGE API #4
const sourceProduct = await prisma.sanpham.findUnique({
  where: { MaSP: "SP001" },
  select: { MaLoai: true }
});

const relatedProducts = await prisma.sanpham.findMany({
  where: {
    MaLoai: sourceProduct.MaLoai,
    MaSP: { not: "SP001" },  // Exclude current product
    TrangThai: "1"
  },
  take: 5,
  include: {
    sanpham_anh: {
      where: { AnhChinh: 1 },
      take: 1
    }
  }
});
```

### Count Total Products
```typescript
const total = await prisma.sanpham.count({
  where: { TrangThai: "1" }
});
```

### Get Products with Count in Single Query
```typescript
const [products, total] = await Promise.all([
  prisma.sanpham.findMany({
    where: { TrangThai: "1" },
    include: { sanpham_anh: true },
    skip: 0,
    take: 20
  }),
  prisma.sanpham.count({
    where: { TrangThai: "1" }
  })
]);
```

---

## 🔍 Search Queries

### Search by Product Name
```typescript
// ✅ HOMEPAGE API #5
const results = await prisma.sanpham.findMany({
  where: {
    TrangThai: "1",
    TenSP: {
      contains: "matcha",
      mode: 'insensitive'  // Case-insensitive search
    }
  },
  include: {
    sanpham_anh: {
      where: { AnhChinh: 1 },
      take: 1
    }
  }
});
```

### Search by Multiple Fields
```typescript
const results = await prisma.sanpham.findMany({
  where: {
    AND: [
      { TrangThai: "1" },
      {
        OR: [
          { TenSP: { contains: "matcha", mode: 'insensitive' } },
          { Mota: { contains: "matcha", mode: 'insensitive' } },
          { MaCodeSp: { contains: "matcha", mode: 'insensitive' } }
        ]
      }
    ]
  },
  take: 20,
  include: {
    sanpham_anh: true,
    loaisanpham: true
  }
});
```

### Search with Limit
```typescript
const results = await prisma.sanpham.findMany({
  where: {
    TrangThai: "1",
    TenSP: { contains: query }
  },
  take: Math.min(limit, 100),  // Cap at 100 results
  include: { sanpham_anh: true }
});
```

---

## 🎯 Promotion Queries

### Get Active Promotions
```typescript
// ✅ HOMEPAGE API #6
const now = new Date();

const promotions = await prisma.khuyenmai.findMany({
  where: {
    thoihan: {
      gte: now  // Only promotions with expiry >= now
    }
  },
  include: {
    sanpham: {
      select: {
        MaSP: true,
        TenSP: true,
        GiaBan: true,
        sanpham_anh: {
          where: { AnhChinh: 1 },
          take: 1
        }
      }
    },
    cuahang: {
      select: {
        MaCH: true,
        TenCH: true
      }
    }
  }
});

// Response: Array of khuyenmai records with expiry in future
```

### Get Product Promotions
```typescript
const now = new Date();

const productPromo = await prisma.khuyenmai.findMany({
  where: {
    Masp: "SP001",
    thoihan: { gte: now }
  },
  select: {
    giatri: true,    // Discount percentage
    mota: true,      // Description
    thoihan: true    // Expiry date
  }
});
```

### Get Store-wide Promotions
```typescript
const now = new Date();

const storePromo = await prisma.khuyenmai.findMany({
  where: {
    MaCH: "CH001",   // For specific store
    Masp: null,      // NULL means store-wide
    thoihan: { gte: now }
  }
});
```

### Count Active Promotions
```typescript
const count = await prisma.khuyenmai.count({
  where: {
    thoihan: { gte: new Date() }
  }
});
```

---

## 📦 Stock Queries

### Get Product Stock in Warehouse
```typescript
// Warehouse stock (composite key: [MaKho, MaSP])
const warehouseStock = await prisma.tonkho.findMany({
  where: { MaSP: "SP001" }
});

// Result: [{ MaKho, MaSP, SoLuong, NgayCapNhat }]
```

### Get Total Warehouse Stock
```typescript
const totalStock = await prisma.tonkho.aggregate({
  where: { MaSP: "SP001" },
  _sum: { SoLuong: true }
});

// Result: { _sum: { SoLuong: 100 } }
```

### Get Store Stock
```typescript
// Store stock (composite key: [MaSP, MaCH])
const storeStock = await prisma.tonkhocuahang.findMany({
  where: { MaSP: "SP001" }
});

// Result: [{ MaSP, MaCH, SoLuong }]
```

### Get Specific Store Stock
```typescript
const stock = await prisma.tonkhocuahang.findUnique({
  where: {
    tonkhocuahang_MaSP_MaCH: {
      MaSP: "SP001",
      MaCH: "CH001"
    }
  }
});

// Result: { MaSP, MaCH, SoLuong }
```

### Check if Product In Stock
```typescript
const stock = await prisma.tonkho.aggregate({
  where: { MaSP: "SP001" },
  _sum: { SoLuong: true }
});

const inStock = (stock._sum.SoLuong || 0) > 0;
```

---

## 🖼️ Image Queries

### Get Product Images (Ordered Correctly)
```typescript
// Main image first (AnhChinh=1), then by order (ThuTu)
const images = await prisma.sanpham_anh.findMany({
  where: { MaSP: "SP001" },
  orderBy: [
    { AnhChinh: 'desc' },  // 1 first, then 0
    { ThuTu: 'asc' }       // Then by ThuTu ascending
  ]
});

// Result: [
//   { MaAnh, DuongDanAnh, AnhChinh: 1, ThuTu: 0 },  // Main image
//   { MaAnh, DuongDanAnh, AnhChinh: 0, ThuTu: 1 },  // Secondary images
//   { MaAnh, DuongDanAnh, AnhChinh: 0, ThuTu: 2 }
// ]
```

### Get Main Product Image Only
```typescript
const mainImage = await prisma.sanpham_anh.findFirst({
  where: {
    MaSP: "SP001",
    AnhChinh: 1
  }
});

// Result: { MaAnh, DuongDanAnh, ... }
```

### Get Images Excluding Main
```typescript
const images = await prisma.sanpham_anh.findMany({
  where: {
    MaSP: "SP001",
    AnhChinh: 0  // Only non-main images
  },
  orderBy: { ThuTu: 'asc' }
});
```

### Get Limited Images
```typescript
const images = await prisma.sanpham_anh.findMany({
  where: { MaSP: "SP001" },
  orderBy: [
    { AnhChinh: 'desc' },
    { ThuTu: 'asc' }
  ],
  take: 5  // Limit to 5 images
});
```

---

## ⚠️ Common Pitfalls & Solutions

### ❌ WRONG - String vs Number
```typescript
// WRONG
where: { TrangThai: 1 }

// RIGHT
where: { TrangThai: "1" }
```

### ❌ WRONG - Composite Key Syntax
```typescript
// WRONG
where: { MaKho: "KHO001", MaSP: "SP001" }

// RIGHT (for tonkho)
where: {
  tonkho_MaKho_MaSP: {
    MaKho: "KHO001",
    MaSP: "SP001"
  }
}

// OR simpler
where: { MaSP: "SP001" }
```

### ❌ WRONG - DateTime Comparison
```typescript
// WRONG
where: { thoihan: { gt: new Date().toISOString() } }

// RIGHT
where: { thoihan: { gte: new Date() } }
```

### ❌ WRONG - Pagination
```typescript
// WRONG
skip: page * limit

// RIGHT
skip: (page - 1) * limit
```

---

## 📊 Performance Tips

### ✅ Use Select to Reduce Data
```typescript
// Good - Only needed fields
const products = await prisma.sanpham.findMany({
  select: {
    MaSP: true,
    TenSP: true,
    GiaBan: true,
    sanpham_anh: true
  }
});
```

### ✅ Use Take Instead of Limit
```typescript
// Good
take: 20  // Limit results

// Take with skip for pagination
skip: (page - 1) * limit,
take: limit
```

### ✅ Use Aggregate for Counts
```typescript
// Fast - Single database call
const [products, total] = await Promise.all([
  prisma.sanpham.findMany({ ... }),
  prisma.sanpham.count({ where: {...} })
]);
```

### ✅ Cache Category List
```typescript
// Categories rarely change - cache for 1 hour
const categories = await Cache.getOrSet('categories', async () => {
  return await prisma.loaisanpham.findMany({
    where: { TrangThai: 1 }
  });
}, 3600);
```

---

## 🔗 Database Schema Reference

**loaisanpham** (Categories)
- PK: MaLoai
- Fields: TenLoai, Mota, TrangThai (1=active)
- Relations: sanpham[]

**sanpham** (Products)
- PK: MaSP
- Fields: TenSP, MaCodeSp (unique), GiaVon, GiaBan, Mota, TrangThai ("1"=active), MaLoai, NgayTao
- Relations: loaisanpham, sanpham_anh[], tonkho[], tonkhocuahang[]

**sanpham_anh** (Product Images)
- PK: MaAnh
- FK: MaSP
- Fields: DuongDanAnh, ThuTu (order), AnhChinh (is_main: 1/0)

**khuyenmai** (Promotions)
- PK: Makhuyenmai
- FK: MaCH (store), Masp (product) - both nullable
- Fields: mota, giatri (%), thoihan (expiry)

**tonkho** (Warehouse Stock)
- PK: [MaKho, MaSP] (composite)
- Fields: SoLuong, NgayCapNhat

**tonkhocuahang** (Store Stock)
- PK: [MaSP, MaCH] (composite)
- Fields: SoLuong

---

**Last Updated:** May 5, 2026  
**Status:** Ready to Use
