import { query as dbQuery } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Định nghĩa kiểu dữ liệu cho params trong Next.js 15+ 
 * params bây giờ là một Promise.
 */
type RouteContext = {
  params: Promise<{ maHD: string }>;
};

// ---------------------------------------------------------
// GET: Lấy chi tiết một đơn hàng và danh sách sản phẩm
// ---------------------------------------------------------
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    // Phải await params trước khi truy cập maHD
    const { maHD } = await params;

    // 1. Lấy thông tin tổng quan đơn hàng
    const donHangSQL = `
      SELECT 
        hd.MaHD, hd.MaCuahang, ch.TenCH,
        hd.MaNV, nv.HoTen as TenNhanVien,
        hd.Makh, kh.TenKH as TenKhachHang, kh.SDT as SoDienThoai,
        kh.DiaChi as KhachHangDiaChi, kh.Email as KhachHangEmail,
        hd.TongTien, hd.subtotal, hd.shipping_fee,
        hd.TrangThai, hd.payment_status, hd.payment_method,
        hd.customer_note, hd.NgayTao
      FROM hoadon hd
      LEFT JOIN cuahang ch ON hd.MaCuahang = ch.MaCH
      LEFT JOIN nhanvien nv ON hd.MaNV = nv.MaNV
      LEFT JOIN khachhang kh ON hd.Makh = kh.MaKH
      WHERE hd.MaHD = @maHD
    `;

    const donHangResult = await dbQuery(donHangSQL, { maHD });

    if (!donHangResult || donHangResult.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      );
    }

    const donHang = donHangResult[0];

    // 2. Lấy danh sách sản phẩm chi tiết
    // Đã loại bỏ sp.Anh vì cột này không tồn tại trong bảng sanpham của bạn
    const chiTietSQL = `
      SELECT 
        ct.MaHD, ct.MaSP, sp.TenSanPham, sp.MaCodeSp,
        ct.SoLuong, ct.DonGia, ct.ThanhTien, sp.GiaVon
      FROM chitiethoadon ct
      LEFT JOIN sanpham sp ON ct.MaSP = sp.MaSP
      WHERE ct.MaHD = @maHD
    `;

    const chiTiet = await dbQuery(chiTietSQL, { maHD });

    return NextResponse.json({
      ok: true,
      donHang,
      chiTiet: chiTiet || [],
    });

  } catch (error: any) {
    console.error('Error fetching order detail:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------
// PUT: Cập nhật trạng thái đơn hàng
// ---------------------------------------------------------
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { maHD } = await params;
    const body = await req.json();
    const { trangThai } = body;

    if (trangThai === undefined) {
      return NextResponse.json(
        { ok: false, error: 'Vui lòng cung cấp trạng thái mới' },
        { status: 400 }
      );
    }

    // Cập nhật trạng thái trong bảng hoadon[cite: 1]
    await dbQuery(
      `UPDATE hoadon SET TrangThai = @trangThai WHERE MaHD = @maHD`,
      { trangThai, maHD }
    );

    return NextResponse.json({
      ok: true,
      message: `Cập nhật trạng thái đơn hàng ${maHD} thành công`,
    });

  } catch (error: any) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------
// DELETE: Hủy đơn hàng (Chuyển trạng thái sang 5)
// ---------------------------------------------------------
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { maHD } = await params;
    
    // Kiểm tra sự tồn tại trước khi hủy
    const orderCheck = await dbQuery(`SELECT TrangThai FROM hoadon WHERE MaHD = @maHD`, { maHD });
    
    if (!orderCheck || orderCheck.length === 0) {
      return NextResponse.json({ ok: false, error: 'Đơn hàng không tồn tại' }, { status: 404 });
    }

    // Cập nhật trạng thái thành 5 (Hủy)[cite: 1]
    await dbQuery(
      `UPDATE hoadon SET TrangThai = 5 WHERE MaHD = @maHD`,
      { maHD }
    );

    return NextResponse.json({
      ok: true,
      message: `Đơn hàng ${maHD} đã được hủy thành công`,
    });

  } catch (error: any) {
    console.error('Error canceling order:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
