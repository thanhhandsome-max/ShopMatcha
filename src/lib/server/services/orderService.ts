import prisma from '../db/prisma';

export interface CreateOrderRequest {
  items: {
    MaSP: string;
    quantity: number;
    price: number;
  }[];
  MaCH: string; // Mã cửa hàng
  MaKH?: string; // Mã khách hàng (nếu đã đăng nhập)
  MaTaiKhoan?: string; // Mã tài khoản
  payment_method: string; // 'COD' | 'BankTransfer' | 'VNPay'
  address_id?: string;
  customer_note?: string;
  shipping_fee?: number;
  promotionId?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  data?: {
    MaDH: string;
    order_code: string;
    TongTien: number;
    payment_method: string;
  };
}

/**
 * Generate unique MaDH
 */
async function generateMaDH(): Promise<string> {
  const lastOrder = await prisma.donhang.findFirst({
    orderBy: { MaDH: 'desc' }
  });
  
  if (!lastOrder) return 'DH001';
  
  const lastNumber = parseInt(lastOrder.MaDH.replace('DH', ''));
  return `DH${String(lastNumber + 1).padStart(3, '0')}`;
}

/**
 * Generate unique order_code
 */
function generateOrderCode(): string {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.random().toString(36).substr(2, 3).toUpperCase();
  return `ORD-${dateStr}-${random}`;
}

async function resolveStoreId(requestedMaCH?: string): Promise<string> {
  const requested = requestedMaCH?.trim();

  if (requested) {
    const requestedStore = await prisma.cuahang.findUnique({
      where: { MaCH: requested },
      select: { MaCH: true }
    });

    if (requestedStore) {
      return requestedStore.MaCH;
    }
  }

  const envMaCH = process.env.CART_STORE_MA_CH?.trim();
  if (envMaCH) {
    const envStore = await prisma.cuahang.findUnique({
      where: { MaCH: envMaCH },
      select: { MaCH: true }
    });

    if (envStore) {
      return envStore.MaCH;
    }
  }

  const fallbackStore = await prisma.cuahang.findFirst({
    select: { MaCH: true },
    orderBy: { MaCH: 'asc' }
  });

  if (!fallbackStore) {
    throw new Error('Không tìm thấy cửa hàng hợp lệ để tạo đơn hàng');
  }

  return fallbackStore.MaCH;
}

/**
 * Create order from cart items
 */
export async function createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
  try {
    const storeId = await resolveStoreId(data.MaCH);

    // Validate items exist and have enough stock
    for (const item of data.items) {
      const product = await prisma.sanpham.findUnique({
        where: { MaSP: item.MaSP }
      });
      
      if (!product) {
        return { success: false, message: `Sản phẩm ${item.MaSP} không tồn tại` };
      }
      
      if (Number(product.TrangThai) !== 1) {
        return { success: false, message: `Sản phẩm ${product.TenSP} đã ngừng kinh doanh` };
      }
      
      // Check stock in tonkho (schema hiện tại không có tonkhocuahang)
      const stock = await prisma.tonkho.aggregate({
        where: { MaSP: item.MaSP },
        _sum: { SoLuong: true }
      });

      const currentStock = stock._sum.SoLuong || 0;
      if (currentStock < item.quantity) {
        return { 
          success: false, 
          message: `Sản phẩm ${product.TenSP} không đủ số lượng trong kho (còn ${currentStock})` 
        };
      }
    }
    
    // Generate IDs
    const maDH = await generateMaDH();
    const orderCode = generateOrderCode();
    
    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = data.shipping_fee || 0;
    let discountAmount = 0;
    let promotionText = '';

    if (data.promotionId && data.MaKH) {
      const promotion = await prisma.khuyenmaikhachhang.findFirst({
        where: {
          MaKH: data.MaKH,
          Makmkh: data.promotionId,
          thoihan: {
            gte: new Date()
          }
        }
      });

      if (!promotion) {
        return { success: false, message: 'Mã khuyến mãi không hợp lệ hoặc đã hết hạn' };
      }

      discountAmount = Number(promotion.giatri || 0);
      promotionText = `Khuyến mãi ${promotion.Makmkh} giảm ${discountAmount}`;
    }

    const tongTien = Math.max(subtotal + shippingFee - discountAmount, 0);
    
    // Use transaction to create order and order items
    const result = await prisma.$transaction(async (tx) => {
      // Create donhang
      const order = await tx.donhang.create({
        data: {
          MaDH: maDH,
          MaCH: storeId,
          MaKH: data.MaKH,
          MaTaiKhoan: data.MaTaiKhoan,
          order_code: orderCode,
          TongTien: tongTien,
          subtotal: subtotal,
          shipping_fee: shippingFee,
          payment_method: data.payment_method,
          address_id: data.address_id,
          customer_note: [data.customer_note, promotionText].filter(Boolean).join(' | '),
          TrangThai: 1, // Pending
          payment_status: 0 // Unpaid
        }
      });
      
      // Create chitietdonhang for each item
      for (const item of data.items) {
        const itemTotal = item.price * item.quantity;
        
        await tx.chitietdonhang.create({
          data: {
            MaSP: item.MaSP,
            MaDH: maDH,
            SoLuong: item.quantity,
            TongTien: itemTotal
          }
        });
        
        // Decrease stock in tonkho
        await tx.tonkho.updateMany({
          where: { MaSP: item.MaSP },
          data: {
            SoLuong: {
              decrement: item.quantity
            }
          }
        });
      }
      
      return order;
    });
    
    return {
      success: true,
      message: 'Tạo đơn hàng thành công',
      data: {
        MaDH: result.MaDH,
        order_code: result.order_code!,
        TongTien: Number(result.TongTien),
        payment_method: result.payment_method!
      }
    };
    
  } catch (error) {
    console.error('Create order error:', error);
    return { success: false, message: 'Lỗi hệ thống khi tạo đơn hàng' };
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(maDH: string, maKH?: string): Promise<any> {
  try {
    const order = await prisma.donhang.findUnique({
      where: { MaDH: maDH },
      include: {
        chitietdonhang: {
          include: {
            sanpham: {
              include: {
                sanpham_anh: true
              }
            }
          }
        },
        khachhang: true,
        taikhoan: true
      }
    });
    
    if (!order) {
      return { success: false, message: 'Không tìm thấy đơn hàng' };
    }
    
    // If customer ID provided, verify ownership
    if (maKH && order.MaKH !== maKH) {
      return { success: false, message: 'Không có quyền xem đơn hàng này' };
    }
    
    return { success: true, data: order };
  } catch (error) {
    console.error('Get order error:', error);
    return { success: false, message: 'Lỗi hệ thống' };
  }
}

/**
 * Get orders by customer
 */
export async function getOrdersByCustomer(maKH: string, page = 1, limit = 10): Promise<any> {
  try {
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      prisma.donhang.findMany({
        where: { MaKH: maKH },
        include: {
          chitietdonhang: {
            include: {
              sanpham: {
                include: {
                  sanpham_anh: true
                }
              }
            }
          }
        },
        orderBy: { NgayTao: 'desc' },
        skip,
        take: limit
      }),
      prisma.donhang.count({
        where: { MaKH: maKH }
      })
    ]);
    
    return {
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    };
  } catch (error) {
    console.error('Get orders error:', error);
    return { success: false, message: 'Lỗi hệ thống' };
  }
}
