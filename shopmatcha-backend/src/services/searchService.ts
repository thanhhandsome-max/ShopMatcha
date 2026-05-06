import prisma from '../lib/prisma';

export class SearchService {
  async searchProducts(query: string, limit = 20) {
    const q = query.trim();
    const pattern = `%${q}%`;
    const safeLimit = Math.min(limit, 100);

    // Raw query để MySQL LIKE không phân biệt hoa thường (mặc định với utf8_general_ci)
    const results: any[] = await prisma.$queryRaw`
      SELECT sp.*
      FROM sanpham sp
      WHERE sp.TrangThai = '1'
        AND (
          sp.TenSP    LIKE ${pattern}
          OR sp.Mota      LIKE ${pattern}
          OR sp.MaCodeSp  LIKE ${pattern}
        )
      LIMIT ${safeLimit}
    `;

    // Lấy ảnh + loại sản phẩm cho từng kết quả
    const enriched = await Promise.all(
      results.map(async (sp) => {
        const [sanpham_anh, loaisanpham] = await Promise.all([
          prisma.sanpham_anh.findMany({
            where: { MaSP: sp.MaSP, AnhChinh: 1 },
            take: 1,
          }),
          sp.MaLoai
            ? prisma.loaisanpham.findUnique({ where: { MaLoai: sp.MaLoai } })
            : null,
        ]);
        return { ...sp, sanpham_anh, loaisanpham };
      })
    );

    return {
      query,
      results: enriched,
      count: enriched.length,
    };
  }
}

export default new SearchService();