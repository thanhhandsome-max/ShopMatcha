import prisma from '../lib/prisma';

export class CategoryService {
  async getAllCategories() {
    return prisma.loaisanpham.findMany({
      where: { TrangThai: 1 },
      include: {
        _count: {
          select: {
            sanpham: true
          }
        }
      }
    });
  }
}

export default new CategoryService();
