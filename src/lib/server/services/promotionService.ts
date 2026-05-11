import prisma from '../db/prisma';

export type CustomerPromotion = {
  Makmkh: string;
  giatri: string | number | null;
  thoihan: Date | null;
  mota: string | null;
  Uutien: number | null;
};

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

  async getPromotionsForCustomer(customerEmail: string) {
    const customer = await prisma.khachhang.findFirst({
      where: { Email: customerEmail },
      select: { MaKH: true, TenKH: true, Email: true }
    });

    if (!customer) {
      return { customer: null, promotions: [] as CustomerPromotion[] };
    }

    const promotions = await prisma.khuyenmaikhachhang.findMany({
      where: {
        MaKH: customer.MaKH,
        OR: [{ thoihan: null }, { thoihan: { gte: new Date() } }]
      },
      orderBy: [{ Uutien: 'desc' }, { thoihan: 'asc' }],
      select: {
        Makmkh: true,
        giatri: true,
        thoihan: true,
        mota: true,
        Uutien: true
      }
    });

    return { customer, promotions };
  }
}

export default new PromotionService();
