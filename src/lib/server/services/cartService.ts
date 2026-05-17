import prisma from '../db/prisma';

const DEFAULT_STORE = process.env.CART_STORE_MA_CH || 'CH001';

export type CartLinePayload = {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  /** Tồn kho cửa hàng mặc định (CART_STORE_MA_CH) — không vượt quá khi cộng dồn giỏ */
  availableAtStore: number;
};

export type CartResponsePayload = {
  maGH: string;
  maCH: string;
  items: CartLinePayload[];
};



export async function resolveCustomerMaKH(maTaiKhoan: string): Promise<string | null> {
  // First, get the TenDangNhap (email) from taikhoan
  const account = await prisma.taikhoan.findUnique({
    where: { MaTaiKhoan: maTaiKhoan },
    select: { TenDangNhap: true }
  });
  
  if (!account?.TenDangNhap) {
    return null;
  }
  
  // Then find khachhang by that email
  const kh = await prisma.khachhang.findFirst({
    where: { Email: account.TenDangNhap },
    select: { MaKH: true }
  });
  return kh?.MaKH ?? null;
}

async function getStoreQuantity(maSP: string, maCH: string): Promise<number> {
  const row = await prisma.tonkho.findFirst({
    where: { MaSP: maSP }
  });
  return row?.SoLuong ?? 0;
}

export async function getCartForAccount(maTaiKhoan: string): Promise<CartResponsePayload | null> {
  const maKH = await resolveCustomerMaKH(maTaiKhoan);
  if (!maKH) return null;

  // Get all cart items for this customer from CartItems table
  const cartItems = await prisma.cartItems.findMany({
    where: { MaKH: maKH },
    orderBy: { createdAt: 'asc' }
  });

  if (!cartItems || cartItems.length === 0) {
    return { maGH: '', maCH: DEFAULT_STORE, items: [] };
  }

  const items: CartLinePayload[] = [];
  for (const line of cartItems) {
    const availableAtStore = await getStoreQuantity(line.MaSp, DEFAULT_STORE);
    
    // Normalize image path
    let imagePath = line.image || '';
    if (imagePath) {
      const trimmed = imagePath.trim();
      if (!trimmed.startsWith('/') && !trimmed.startsWith('http') && !trimmed.startsWith('data:')) {
        imagePath = `/images/products/${trimmed}`;
      }
    }

    items.push({
      productId: line.MaSp,
      name: line.name,
      price: Number(line.price ?? 0),
      image: imagePath,
      quantity: line.quantity,
      availableAtStore
    });
  }

  return {
    maGH: '', // CartItems doesn't have a cart ID like giohang.MaGH
    maCH: DEFAULT_STORE,
    items
  };
}

export async function addOrUpdateCartItem(
  maTaiKhoan: string,
  maSP: string,
  quantityDelta: number
): Promise<{ ok: true; cart: CartResponsePayload } | { ok: false; message: string; code?: string }> {
  const maKH = await resolveCustomerMaKH(maTaiKhoan);
  if (!maKH) {
    return { ok: false, message: 'Chỉ tài khoản khách hàng mới dùng giỏ hàng', code: 'NOT_CUSTOMER' };
  }

  if (!Number.isFinite(quantityDelta) || quantityDelta <= 0 || !Number.isInteger(quantityDelta)) {
    return { ok: false, message: 'Số lượng không hợp lệ' };
  }

  try {
    // Check product exists and is active
    const product = await prisma.sanpham.findUnique({
      where: { MaSP: maSP },
      select: { 
        MaSP: true, 
        TenSP: true, 
        GiaBan: true, 
        TrangThai: true,
        sanpham_anh: {
          where: { AnhChinh: 1 },
          select: { DuongDanAnh: true },
          take: 1
        }
      }
    });
    if (!product || Number(product.TrangThai) !== 1) {
      return { ok: false, message: 'Sản phẩm không tồn tại hoặc ngừng kinh doanh', code: 'BAD_PRODUCT' };
    }

    // Get product image
    const productImage = product.sanpham_anh?.[0]?.DuongDanAnh || '';

    // Check available stock
    const stockRow = await prisma.tonkho.findFirst({
      where: { MaSP: maSP }
    });
    const available = stockRow?.SoLuong ?? 0;

    // Check existing quantity in cart
    const existing = await prisma.cartItems.findFirst({
      where: { MaKH: maKH, MaSp: maSP }
    });
    const currentQty = existing?.quantity ?? 0;
    const newQty = currentQty + quantityDelta;

    if (newQty > available) {
      return {
        ok: false,
        message:
          available <= 0
            ? 'Sản phẩm đã hết hàng tại cửa hàng'
            : `Số lượng trong giỏ (${newQty}) vượt tồn kho cửa hàng (${available})`,
        code: 'INSUFFICIENT_STOCK'
      };
    }

    if (newQty <= 0) {
      return { ok: false, message: 'Số lượng không hợp lệ', code: 'BAD_QTY' };
    }

    // Upsert cart item
    if (existing) {
      await prisma.cartItems.update({
        where: { Cartid: existing.Cartid },
        data: { quantity: newQty, updatedAt: new Date() }
      });
    } else {
      await prisma.cartItems.create({
        data: {
          MaKH: maKH,
          MaCH: DEFAULT_STORE,
          MaSp: maSP,
          name: product.TenSP,
          price: product.GiaBan || 0,
          image: productImage,
          quantity: newQty,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    const cart = await getCartForAccount(maTaiKhoan);
    if (!cart) {
      return { ok: false, message: 'Không đọc được giỏ hàng' };
    }
    return { ok: true, cart };
  } catch (e: any) {
    console.error('addOrUpdateCartItem error:', e);
    return { ok: false, message: 'Không thể cập nhật giỏ hàng' };
  }
}

export async function setCartLineQuantity(
  maTaiKhoan: string,
  maSP: string,
  soLuong: number
): Promise<{ ok: true; cart: CartResponsePayload } | { ok: false; message: string; code?: string }> {
  const maKH = await resolveCustomerMaKH(maTaiKhoan);
  if (!maKH) {
    return { ok: false, message: 'Chỉ tài khoản khách hàng mới dùng giỏ hàng', code: 'NOT_CUSTOMER' };
  }

  if (!Number.isFinite(soLuong) || !Number.isInteger(soLuong) || soLuong < 0) {
    return { ok: false, message: 'Số lượng không hợp lệ' };
  }

  try {
    const existing = await prisma.cartItems.findFirst({
      where: { MaKH: maKH, MaSp: maSP }
    });

    if (soLuong === 0) {
      // Delete the cart item
      if (existing) {
        await prisma.cartItems.delete({ where: { Cartid: existing.Cartid } });
      }
    } else {
      // Check product and stock
      const product = await prisma.sanpham.findUnique({
        where: { MaSP: maSP },
        select: { TrangThai: true }
      });
      if (!product || Number(product.TrangThai) !== 1) {
        return { ok: false, message: 'Sản phẩm không tồn tại hoặc ngừng kinh doanh', code: 'BAD_PRODUCT' };
      }

      const stockRow = await prisma.tonkho.findFirst({
        where: { MaSP: maSP }
      });
      const available = stockRow?.SoLuong ?? 0;

      if (soLuong > available) {
        return {
          ok: false,
          message:
            available <= 0
              ? 'Sản phẩm đã hết hàng tại cửa hàng'
              : `Chỉ còn ${available} sản phẩm tại cửa hàng`,
          code: 'INSUFFICIENT_STOCK'
        };
      }

      // Update or create cart item
      if (existing) {
        await prisma.cartItems.update({
          where: { Cartid: existing.Cartid },
          data: { quantity: soLuong, updatedAt: new Date() }
        });
      } else {
        // If item doesn't exist and soLuong > 0, create it
        const product = await prisma.sanpham.findUnique({
          where: { MaSP: maSP },
          select: { 
            TenSP: true, 
            GiaBan: true,
            sanpham_anh: {
              where: { AnhChinh: 1 },
              select: { DuongDanAnh: true },
              take: 1
            }
          }
        });
        if (product) {
          const productImage = product.sanpham_anh?.[0]?.DuongDanAnh || '';
          await prisma.cartItems.create({
            data: {
              MaKH: maKH,
              MaCH: DEFAULT_STORE,
              MaSp: maSP,
              name: product.TenSP,
              price: product.GiaBan || 0,
              image: productImage,
              quantity: soLuong,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
        }
      }
    }

    const cart = await getCartForAccount(maTaiKhoan);
    if (!cart) {
      return { ok: false, message: 'Không đọc được giỏ hàng' };
    }
    return { ok: true, cart };
  } catch (e: any) {
    console.error('setCartLineQuantity error:', e);
    return { ok: false, message: 'Không thể cập nhật giỏ hàng' };
  }
}

export async function clearCartForAccount(maTaiKhoan: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const maKH = await resolveCustomerMaKH(maTaiKhoan);
  if (!maKH) {
    return { ok: false, message: 'Chỉ tài khoản khách hàng mới dùng giỏ hàng' };
  }

  await prisma.cartItems.deleteMany({ where: { MaKH: maKH } });
  return { ok: true };
}

export async function removeCartLine(
  maTaiKhoan: string,
  maSP: string
): Promise<{ ok: true; cart: CartResponsePayload } | { ok: false; message: string }> {
  const maKH = await resolveCustomerMaKH(maTaiKhoan);
  if (!maKH) {
    return { ok: false, message: 'Chỉ tài khoản khách hàng mới dùng giỏ hàng' };
  }

  await prisma.cartItems.deleteMany({ where: { MaKH: maKH, MaSp: maSP } });

  const cart = await getCartForAccount(maTaiKhoan);
  if (!cart) {
    return { ok: false, message: 'Không đọc được giỏ hàng' };
  }
  return { ok: true, cart };
}
