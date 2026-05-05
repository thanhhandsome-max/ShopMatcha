import prisma from '../lib/prisma';

export class SearchService {
  async searchProducts(query: string, limit = 20) {
    const results = await prisma.sanpham.findMany({
      where: {
        AND: [
          { TrangThai: '1' },
          {
            OR: [
              { TenSP: { contains: query } },
              { Mota: { contains: query } },
              { MaCodeSp: { contains: query } }
            ]
          }
        ]
      },
      take: Math.min(limit, 100),
      include: {
        sanpham_anh: {
          where: { AnhChinh: 1 },
          take: 1
        },
        loaisanpham: true
      }
    });

    return {
      query,
      results,
      count: results.length
    };
  }
}

export default new SearchService();
