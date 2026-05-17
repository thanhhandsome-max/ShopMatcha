import { Request, Response } from 'express';
import prisma from '../db/prisma';
import {
    createOrder,
    getOrderById,
    getOrdersByCustomer
} from '../services/orderService';

/**
 * Update order status
 * PUT /api/orders/:id/status
 * Body: { TrangThai: number }
 */
export async function updateOrderStatusHandler(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Chưa xác thực' });
      return;
    }

    const { id } = req.params;
    const newStatus = Number(req.body?.TrangThai ?? req.body?.trangThai ?? NaN);

    if (!id) {
      res.status(400).json({ success: false, message: 'Thiếu MaDH' });
      return;
    }

    if (!Number.isFinite(newStatus)) {
      res.status(400).json({ success: false, message: 'TrangThai không hợp lệ' });
      return;
    }

    const order = await prisma.donhang.findUnique({ where: { MaDH: id } });
    if (!order) {
      res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
      return;
    }

    // Accept optional reason for return/cancel requests
    const reason = String(req.body?.reason ?? '');

    // Allow setting TrangThai = 4 (return/cancel) even if already paid.
    // The system will mark related payments as cancelled below and set payment_status accordingly.

    // Only allow owner (MaKH) or the account that created order (MaTaiKhoan) to cancel, or allow any authenticated user for now
    const userLogin = req.user.TenDangNhap;

    // If order has MaKH, ensure the logged-in customer matches
    if (order.MaKH) {
      const cust = await prisma.khachhang.findFirst({ where: { Email: userLogin } });
      if (!cust || cust.MaKH !== order.MaKH) {
        res.status(403).json({ success: false, message: 'Không có quyền cập nhật đơn hàng' });
        return;
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (newStatus === 4) {
        await tx.payments.updateMany({
          where: {
            MaHD: id,
            status: { not: 1 }
          },
          data: {
            status: 3
          }
        });
      }

      return tx.donhang.update({
        where: { MaDH: id },
        data: {
          TrangThai: newStatus,
          ...(newStatus === 4 ? { payment_status: 3 } : {})
        }
      });
    });

    if (reason) {
      console.log(`📝 [Order] Return reason for ${id}:`, reason);
    }

    res.status(200).json({ success: true, message: 'Đã cập nhật trạng thái đơn', data: { MaDH: updated.MaDH, TrangThai: updated.TrangThai, reason: reason || null } });
  } catch (error) {
    console.error('❌ [Order] Update status error:', error);
    res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
  }
}

/**
 * Create new order from cart
 * POST /api/orders
 */
export async function createOrderHandler(req: Request, res: Response): Promise<void> {
  try {
    console.log('📝 [Order] Create order request:', JSON.stringify(req.body, null, 2));
    
    const { 
      items, 
      MaCH, 
      payment_method, 
      address_id, 
      customer_note,
      shipping_fee,
      promotionId
    } = req.body;
    
    console.log('📝 [Order] Parsed data:', { items: items?.length, MaCH, payment_method, address_id, promotionId });
    
    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.warn('⚠️ [Order] Validation failed: empty items');
      res.status(400).json({
        success: false,
        message: 'Giỏ hàng trống'
      });
      return;
    }
    
    if (!MaCH) {
      console.warn('⚠️ [Order] Validation failed: no MaCH');
      res.status(400).json({
        success: false,
        message: 'Vui lòng chọn cửa hàng'
      });
      return;
    }
    
    if (!payment_method) {
      console.warn('⚠️ [Order] Validation failed: no payment_method');
      res.status(400).json({
        success: false,
        message: 'Vui lòng chọn phương thức thanh toán'
      });
      return;
    }
    
    // Get user info if logged in
    let maKH: string | undefined;
    let maTaiKhoan: string | undefined;
    
    if (req.user) {
      maTaiKhoan = req.user.MaTaiKhoan;
      console.log('👤 [Order] User authenticated:', req.user.TenDangNhap);
      
      // Get MaKH from khachhang via login email
      const customer = await prisma.khachhang.findFirst({
        where: { Email: req.user.TenDangNhap }
      });
      
      if (customer) {
        maKH = customer.MaKH;
        console.log('✅ [Order] Found customer:', maKH);
      } else {
        console.warn('⚠️ [Order] Customer not found for email:', req.user.TenDangNhap);
      }
    } else {
      console.log('👤 [Order] Anonymous user (no auth)');
    }
    
    const orderData = {
      items: items.map((item: any) => ({
        MaSP: item.productId || item.MaSP,
        quantity: item.quantity,
        price: item.price
      })),
      MaCH,
      MaKH: maKH,
      MaTaiKhoan: maTaiKhoan,
      payment_method,
      address_id,
      customer_note,
      shipping_fee,
      promotionId
    };
    
    console.log('📤 [Order] Sending to orderService:', JSON.stringify(orderData, null, 2));
    const result = await createOrder(orderData);
    console.log('📥 [Order] Result from orderService:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ [Order] Order created successfully');
      res.status(201).json(result);
    } else {
      console.error('❌ [Order] Order creation failed:', result.message);
      // Check if it's a stock-related error
      if (result.message && result.message.includes('không đủ số lượng')) {
        // Try to extract product info for better error reporting
        const outOfStockItems = [];
        for (const item of items) {
          const product = await prisma.sanpham.findUnique({
            where: { MaSP: item.productId || item.MaSP }
          });
          const stock = await prisma.tonkho.aggregate({
            where: { MaSP: item.productId || item.MaSP },
            _sum: { SoLuong: true }
          });
          const avail = stock._sum.SoLuong ?? 0;
          if (product && avail < item.quantity) {
            outOfStockItems.push({
              MaSP: item.productId || item.MaSP,
              TenSP: product.TenSP,
              requested: item.quantity,
              available: avail
            });
          }
        }
        
        res.status(400).json({
          success: false,
          message: result.message,
          outOfStockItems: outOfStockItems.length > 0 ? outOfStockItems : undefined
        });
      } else {
        res.status(400).json(result);
      }
    }
  } catch (error) {
    console.error('❌ [Order] Create order error:', error);
    if (error instanceof Error) {
      console.error('📍 Error stack:', error.stack);
      console.error('📍 Error message:', error.message);
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống'
    });
  }
}

/**
 * Get order by ID
 * GET /api/orders/:id
 */
export async function getOrderHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    console.log('🔍 [Order] Getting order:', id);
    let maKH: string | undefined;
    
    if (req.user) {
      const customer = await prisma.khachhang.findFirst({
        where: { Email: req.user.TenDangNhap }
      });
      
      if (customer) {
        maKH = customer.MaKH;
        console.log('👤 [Order] Authenticated user, MaKH:', maKH);
      }
    }
    
    const result = await getOrderById(id, maKH);
    console.log('📥 [Order] Get result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ [Order] Successfully retrieved order');
      res.status(200).json(result);
    } else {
      if (result.message === 'Lỗi hệ thống') {
        console.error('❌ [Order] System error while fetching order');
        res.status(500).json(result);
      } else {
        console.warn('⚠️ [Order] Order not found or access denied');
        res.status(404).json(result);
      }
    }
  } catch (error) {
    console.error('❌ [Order] Get order error:', error);
    if (error instanceof Error) {
      console.error('📍 Error:', error.message);
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống'
    });
  }
}

/**
 * Get orders by customer (requires authentication)
 * GET /api/orders?page=1&limit=10
 */
export async function getCustomerOrdersHandler(req: Request, res: Response): Promise<void> {
  try {
    console.log('📋 [Order] Get customer orders, page:', req.query.page, 'limit:', req.query.limit);
    
    if (!req.user) {
      console.warn('⚠️ [Order] Unauthorized - no user');
      res.status(401).json({
        success: false,
        message: 'Chưa xác thực'
      });
      return;
    }
    
    console.log('👤 [Order] User:', req.user.TenDangNhap);
    const customer = await prisma.khachhang.findFirst({
      where: { Email: req.user.TenDangNhap }
    });
    
    if (!customer) {
      console.warn('⚠️ [Order] Customer not found for email:', req.user.TenDangNhap);
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin khách hàng'
      });
      return;
    }
    
    console.log('✅ [Order] Found customer MaKH:', customer.MaKH);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    console.log('📤 [Order] Fetching orders, page:', page, 'limit:', limit);
    const result = await getOrdersByCustomer(customer.MaKH, page, limit);
    console.log('📥 [Order] Got', result.data?.orders?.length || 0, 'orders');
    
    if (result.success) {
      console.log('✅ [Order] Successfully fetched customer orders');
      res.status(200).json(result);
    } else {
      console.error('❌ [Order] Failed to fetch orders:', result.message);
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ [Order] Get customer orders error:', error);
    if (error instanceof Error) {
      console.error('📍 Error:', error.message);
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống'
    });
  }
}
