import prisma from '../db/prisma';

export type ProductSortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'newest';

interface ProductFilters {
  category?: string;
  sort?: ProductSortOption;
  page?: number;
  limit?: number;
}

export class ProductService {
  async getProducts(filters: ProductFilters = {}) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? Math.min(filters.limit, 100) : 20;
    const skip = (page - 1) * limit;

    const where: any = {
      TrangThai: 1
    };

    if (filters.category) {
      where.MaLoai = filters.category;
    }

    let orderBy: any = { NgayTao: 'desc' };

    switch (filters.sort) {
      case 'price-asc':
        orderBy = { GiaBan: 'asc' };
        break;
      case 'price-desc':
        orderBy = { GiaBan: 'desc' };
        break;
      case 'name-asc':
        orderBy = { TenSP: 'asc' };
        break;
      case 'newest':
      default:
        orderBy = { NgayTao: 'desc' };
    }

    const [products, total] = await Promise.all([
      prisma.sanpham.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          loaisanpham: true,
          sanpham_anh: {
            orderBy: [
              { AnhChinh: 'desc' },
              { ThuTu: 'asc' }
            ],
            take: 5
          },
          tonkho: {
            select: {
              MaKho: true,
              SoLuong: true
            }
          }
        }
      }),
      prisma.sanpham.count({ where })
    ]);

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getProductById(id: string) {
    const product = await prisma.sanpham.findUnique({
      where: { MaSP: id },
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
        }
      }
    });

    if (!product) {
      return null;
    }

    const stock = await prisma.tonkho.aggregate({
      where: { MaSP: id },
      _sum: { SoLuong: true }
    });

    return {
      ...product,
      totalStock: stock._sum.SoLuong ?? 0
    };
  }

  async getRelatedProducts(id: string, limit = 5) {
    const product = await prisma.sanpham.findUnique({
      where: { MaSP: id },
      select: { MaLoai: true }
    });

    if (!product || !product.MaLoai) {
      return [];
    }

    return prisma.sanpham.findMany({
      where: {
        MaLoai: product.MaLoai,
        MaSP: { not: id },
        TrangThai: 1
      } as any,
      take: limit,
      include: {
        sanpham_anh: {
          where: { AnhChinh: 1 },
          take: 1
        }
      }
    });
  }
}

export default new ProductService();
