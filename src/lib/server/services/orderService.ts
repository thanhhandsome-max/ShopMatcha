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

  if (!lastOrder || !lastOrder.MaDH) return 'DH001';

  // Accept existing prefixes like 'DH' or 'HD' and extract the numeric suffix
  const match = lastOrder.MaDH.match(/(\D*)(\d+)$/);
  if (!match) return 'DH001';

  const prefix = match[1] || 'DH';
  const num = parseInt(match[2], 10);
  return `${prefix}${String(num + 1).padStart(match[2].length, '0')}`;
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

function buildVisibleOrdersWhere(maKH: string) {
  return {
    MaKH: maKH,
    order_type: { not: 2 }
  };
}

/**
 * Create order from cart items
 */
export async function createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
  try {
    console.log('🛒 [OrderService] createOrder called with:', JSON.stringify(data, null, 2));
    
    const storeId = await resolveStoreId(data.MaCH);
    console.log('✅ [OrderService] Store resolved to:', storeId);
    const isVNPay = String(data.payment_method || '').toLowerCase() === 'vnpay';
    const initialOrderStatus = isVNPay ? 0 : 1;
    const initialOrderType = isVNPay ? 2 : 1;

    // Validate items exist and have enough stock
    for (const item of data.items) {
      console.log(`🔍 [OrderService] Validating item MaSP:${item.MaSP}, quantity:${item.quantity}`);
      
      const product = await prisma.sanpham.findUnique({
        where: { MaSP: item.MaSP }
      });
      
      if (!product) {
        console.error(`❌ [OrderService] Product not found: ${item.MaSP}`);
        return { success: false, message: `Sản phẩm ${item.MaSP} không tồn tại` };
      }
      
      console.log(`📦 [OrderService] Product found: ${product.TenSP}, TrangThai: ${product.TrangThai}`);
      
      if (Number(product.TrangThai) !== 1) {
        console.error(`❌ [OrderService] Product inactive: ${product.TenSP}`);
        return { success: false, message: `Sản phẩm ${product.TenSP} đã ngừng kinh doanh` };
      }
      
      // Check stock in tonkho (schema hiện tại không có tonkhocuahang)
      const stock = await prisma.tonkho.aggregate({
        where: { MaSP: item.MaSP },
        _sum: { SoLuong: true }
      });

      const currentStock = stock._sum.SoLuong || 0;
      console.log(`📊 [OrderService] Current stock for ${item.MaSP}: ${currentStock}`);
      
      if (currentStock < item.quantity) {
        console.error(`❌ [OrderService] Insufficient stock: need ${item.quantity}, have ${currentStock}`);
        return { 
          success: false, 
          message: `Sản phẩm ${product.TenSP} không đủ số lượng trong kho (còn ${currentStock})` 
        };
      }
    }
    
    console.log('✅ [OrderService] All items validated');
    
    // Generate IDs
    const maDH = await generateMaDH();
    const orderCode = generateOrderCode();
    console.log(`📋 [OrderService] Generated MaDH:${maDH}, OrderCode:${orderCode}`);
    
    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = data.shipping_fee || 0;
    let discountAmount = 0;
    let promotionText = '';

    console.log(`💰 [OrderService] Subtotal: ${subtotal}, ShippingFee: ${shippingFee}`);

    if (data.promotionId && data.MaKH) {
      console.log(`🎁 [OrderService] Checking promotion: ${data.promotionId} for customer: ${data.MaKH}`);
      
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
        console.warn('⚠️ [OrderService] Promotion not found or expired');
        return { success: false, message: 'Mã khuyến mãi không hợp lệ hoặc đã hết hạn' };
      }

      discountAmount = Number(promotion.giatri || 0);
      promotionText = `Khuyến mãi ${promotion.Makmkh} giảm ${discountAmount}`;
      console.log(`✅ [OrderService] Promotion applied: -${discountAmount}`);
    }

    const tongTien = Math.max(subtotal + shippingFee - discountAmount, 0);
    console.log(`📝 [OrderService] Total amount: ${tongTien}`);
    
    // Use transaction to create order and order items
    console.log('🔄 [OrderService] Starting transaction to create order');
    
    const result = await prisma.$transaction(async (tx) => {
      // Create donhang
      console.log('📝 [OrderService] Creating donhang record...');
      const order = await tx.donhang.create({
        data: {
          MaDH: maDH,
          MaCH: storeId,
          MaKH: data.MaKH,
          order_code: orderCode,
          TongTien: tongTien,
          subtotal: subtotal,
          shipping_fee: shippingFee,
          payment_method: data.payment_method,
          address_id: data.address_id,
          customer_note: [data.customer_note, promotionText].filter(Boolean).join(' | '),
          TrangThai: initialOrderStatus,
          order_type: initialOrderType,
          payment_status: 0 // Unpaid
        }
      });
      
      console.log(`✅ [OrderService] Order created: ${order.MaDH}`);
      
      // Create chitietdonhang for each item
      console.log(`📝 [OrderService] Creating ${data.items.length} order items...`);
      for (const item of data.items) {
        const itemTotal = item.price * item.quantity;
        console.log(`  - MaSP:${item.MaSP}, Qty:${item.quantity}, Price:${item.price}, Total:${itemTotal}`);
        console.log('  - Item create payload:', JSON.stringify({
          MaSP: item.MaSP,
          MaDH: maDH,
          SoLuong: item.quantity,
          DonGia: item.price,
          TongTien: itemTotal
        }));
        
        await tx.chitietdonhang.create({
          data: {
            MaSP: item.MaSP,
            MaDH: maDH,
            SoLuong: item.quantity,
            DonGia: item.price,
            TongTien: itemTotal
          }
        });
        
        // Decrease stock in tonkho
        console.log(`  - Decreasing stock for ${item.MaSP} by ${item.quantity}`);
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
    console.error('❌ [OrderService] Create order error:', error);
    if (error instanceof Error) {
      console.error('📍 Error message:', error.message);
      console.error('📍 Error stack:', error.stack);
    }
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
        khachhang: true
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
    const visibleOrdersWhere = buildVisibleOrdersWhere(maKH);
    
    const [orders, total] = await Promise.all([
      prisma.donhang.findMany({
        where: visibleOrdersWhere,
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
        where: visibleOrdersWhere
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
