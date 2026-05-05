import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import {
    createOrder,
    getOrderById,
    getOrdersByCustomer
} from '../services/orderService';

/**
 * Create new order from cart
 * POST /api/orders
 */
export async function createOrderHandler(req: Request, res: Response): Promise<void> {
  try {
    const { 
      items, 
      MaCH, 
      payment_method, 
      address_id, 
      customer_note,
      shipping_fee 
    } = req.body;
    
    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Giỏ hàng trống'
      });
      return;
    }
    
    if (!MaCH) {
      res.status(400).json({
        success: false,
        message: 'Vui lòng chọn cửa hàng'
      });
      return;
    }
    
    if (!payment_method) {
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
      
      // Get MaKH from khachhang
      const customer = await prisma.khachhang.findFirst({
        where: { MaTaiKhoan: req.user.MaTaiKhoan }
      });
      
      if (customer) {
        maKH = customer.MaKH;
      }
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
      shipping_fee
    };
    
    const result = await createOrder(orderData);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Create order error:', error);
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
    let maKH: string | undefined;
    
    if (req.user) {
      const customer = await prisma.khachhang.findFirst({
        where: { MaTaiKhoan: req.user.MaTaiKhoan }
      });
      
      if (customer) {
        maKH = customer.MaKH;
      }
    }
    
    const result = await getOrderById(id, maKH);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Get order error:', error);
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
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Chưa xác thực'
      });
      return;
    }
    
    const customer = await prisma.khachhang.findFirst({
      where: { MaTaiKhoan: req.user.MaTaiKhoan }
    });
    
    if (!customer) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin khách hàng'
      });
      return;
    }
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await getOrdersByCustomer(customer.MaKH, page, limit);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống'
    });
  }
}
