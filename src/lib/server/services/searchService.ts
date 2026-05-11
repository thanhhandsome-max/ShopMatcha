import prisma from '../db/prisma';

export class SearchService {
  async searchProducts(query: string, limit = 20) {
    const q = query.trim();
    const safeLimit = Math.max(1, Math.min(limit || 20, 100));

    const results = await prisma.sanpham.findMany({
      where: {
        TrangThai: 1,
        OR: [
          { TenSP: { contains: q } },
          { Mota: { contains: q } },
          { MaCodeSp: { contains: q } },
        ],
      },
      take: safeLimit,
      orderBy: [
        { TrangThai: 'desc' },
        { NgayTao: 'desc' },
      ],
      include: {
        sanpham_anh: {
          where: { AnhChinh: 1 },
          take: 1,
        },
        loaisanpham: true,
      },
    });

    return {
      query,
      results,
      count: results.length,
    };
  }
}

export default new SearchService();