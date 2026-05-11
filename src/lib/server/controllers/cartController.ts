import { Request, Response } from 'express';
import {
  addOrUpdateCartItem,
  clearCartForAccount,
  getCartForAccount,
  removeCartLine,
  setCartLineQuantity
} from '../services/cartService';

/**
 * GET /api/cart
 */
export async function getCart(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Chưa xác thực' });
      return;
    }

    const cart = await getCartForAccount(req.user.MaTaiKhoan);
    if (cart === null) {
      res.status(403).json({
        success: false,
        message: 'Tài khoản không gắn với khách hàng — không dùng được giỏ hàng',
        code: 'NOT_CUSTOMER'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('getCart error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải giỏ hàng'
    });
  }
}

/**
 * POST /api/cart/items
 * Body: { maSP: string, soLuong?: number } — mặc định cộng 1
 */
export async function postCartItem(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Chưa xác thực' });
      return;
    }

    const maSP = String(req.body?.maSP ?? req.body?.MaSP ?? '').trim();
    const qtyRaw = req.body?.soLuong ?? req.body?.SoLuong ?? 1;
    const soLuong = typeof qtyRaw === 'number' ? qtyRaw : parseInt(String(qtyRaw), 10);

    if (!maSP) {
      res.status(400).json({ success: false, message: 'Thiếu mã sản phẩm (maSP)' });
      return;
    }

    const result = await addOrUpdateCartItem(req.user.MaTaiKhoan, maSP, soLuong);

    if (!result.ok) {
      const status =
        result.code === 'NOT_CUSTOMER' ? 403 : result.code === 'INSUFFICIENT_STOCK' ? 409 : 400;
      res.status(status).json({
        success: false,
        message: result.message,
        code: result.code
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Đã cập nhật giỏ hàng',
      data: result.cart
    });
  } catch (error) {
    console.error('postCartItem error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi thêm vào giỏ'
    });
  }
}

/**
 * PUT /api/cart/items/:maSP
 * Body: { soLuong: number }
 */
export async function putCartItem(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Chưa xác thực' });
      return;
    }

    const maSP = String(req.params.maSP ?? '').trim();
    const qtyRaw = req.body?.soLuong ?? req.body?.SoLuong;
    const soLuong = typeof qtyRaw === 'number' ? qtyRaw : parseInt(String(qtyRaw ?? ''), 10);

    if (!maSP) {
      res.status(400).json({ success: false, message: 'Thiếu mã sản phẩm' });
      return;
    }

    if (!Number.isFinite(soLuong) || !Number.isInteger(soLuong) || soLuong < 0) {
      res.status(400).json({ success: false, message: 'soLuong phải là số nguyên ≥ 0' });
      return;
    }

    const result = await setCartLineQuantity(req.user.MaTaiKhoan, maSP, soLuong);

    if (!result.ok) {
      const status =
        result.code === 'NOT_CUSTOMER' ? 403 : result.code === 'INSUFFICIENT_STOCK' ? 409 : 400;
      res.status(status).json({
        success: false,
        message: result.message,
        code: result.code
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Đã cập nhật số lượng',
      data: result.cart
    });
  } catch (error) {
    console.error('putCartItem error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi cập nhật giỏ hàng'
    });
  }
}

/**
 * DELETE /api/cart/items/:maSP
 */
/**
 * DELETE /api/cart — xóa toàn bộ dòng trong giỏ (giữ bản ghi giohang)
 */
export async function deleteCart(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Chưa xác thực' });
      return;
    }

    const result = await clearCartForAccount(req.user.MaTaiKhoan);
    if (!result.ok) {
      res.status(403).json({ success: false, message: result.message });
      return;
    }

    const cart = await getCartForAccount(req.user.MaTaiKhoan);
    res.status(200).json({
      success: true,
      message: 'Đã xóa giỏ hàng',
      data: cart ?? { maGH: '', maCH: process.env.CART_STORE_MA_CH || 'CH001', items: [] }
    });
  } catch (error) {
    console.error('deleteCart error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể xóa giỏ hàng'
    });
  }
}

export async function deleteCartItem(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Chưa xác thực' });
      return;
    }

    const maSP = String(req.params.maSP ?? '').trim();
    if (!maSP) {
      res.status(400).json({ success: false, message: 'Thiếu mã sản phẩm' });
      return;
    }

    const result = await removeCartLine(req.user.MaTaiKhoan, maSP);

    if (!result.ok) {
      res.status(400).json({
        success: false,
        message: result.message
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Đã xóa khỏi giỏ hàng',
      data: result.cart
    });
  } catch (error) {
    console.error('deleteCartItem error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi xóa mặt hàng'
    });
  }
}
