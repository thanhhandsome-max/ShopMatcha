import prisma from '../lib/prisma';

export class PromotionService {
  async getActivePromotions() {
    const now = new Date();
    return prisma.khuyenmai.findMany({
      where: {
        thoihan: {
          gte: now
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
  }
}

export default new PromotionService();
