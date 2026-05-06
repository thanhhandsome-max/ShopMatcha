import { query as dbQuery } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Định nghĩa kiểu dữ liệu cho context trong Next.js 15+
 * params bắt buộc phải được xử lý như một Promise.
 */
type RouteContext = {
  params: Promise<{ maHD: string }>;
};

// ---------------------------------------------------------
// PUT: Cập nhật trạng thái đơn hàng
// ---------------------------------------------------------
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    // 1. Giải nén params bằng await trước khi sử dụng
    const { maHD } = await params;
    
    const body = await req.json();
    const { trangThai } = body;

    if (trangThai === undefined || trangThai === null) {
      return NextResponse.json(
        { ok: false, error: 'Vui lòng cung cấp mã trạng thái (trangThai)' },
        { status: 400 }
      );
    }

    // 2. Kiểm tra sự tồn tại của đơn hàng
    const checkOrder = await dbQuery(
      `SELECT MaHD FROM hoadon WHERE MaHD = @maHD`,
      { maHD }
    );

    if (!checkOrder || checkOrder.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Đơn hàng không tồn tại trên hệ thống' },
        { status: 404 }
      );
    }

    // 3. Thực hiện cập nhật vào bảng hoadon
    await dbQuery(
      `UPDATE hoadon SET TrangThai = @trangThai WHERE MaHD = @maHD`,
      { trangThai, maHD }
    );

    return NextResponse.json({
      ok: true,
      message: `Đơn hàng ${maHD} đã được cập nhật sang trạng thái mới`,
    });

  } catch (error: any) {
    console.error('Lỗi API Update Status (PUT):', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Lỗi xử lý yêu cầu' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------
// GET: Lấy thông tin chi tiết đơn hàng và sản phẩm
// ---------------------------------------------------------
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { maHD } = await params;

    // 1. Truy vấn thông tin tổng quan từ bảng hoadon và các bảng liên quan[cite: 1]
    const donHangResult = await dbQuery(`
      SELECT 
        hd.MaHD, hd.MaCuahang, ch.TenCH,
        hd.MaNV, nv.HoTen as TenNhanVien,
        hd.Makh, kh.TenKH as TenKhachHang, kh.SDT as SoDienThoai,
        hd.TongTien, hd.TrangThai, hd.NgayTao, hd.customer_note
      FROM hoadon hd
      LEFT JOIN cuahang ch ON hd.MaCuahang = ch.MaCH
      LEFT JOIN nhanvien nv ON hd.MaNV = nv.MaNV
      LEFT JOIN khachhang kh ON hd.Makh = kh.MaKH
      WHERE hd.MaHD = @maHD
    `, { maHD });

    if (!donHangResult || donHangResult.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Không tìm thấy thông tin đơn hàng' },
        { status: 404 }
      );
    }

    // 2. Truy vấn chi tiết các mặt hàng từ bảng chitiethoadon[cite: 1]
    // Lưu ý: Đã loại bỏ cột 'Anh' vì bảng sanpham không chứa cột này[cite: 1]
    const chiTiet = await dbQuery(`
      SELECT 
        ct.MaHD, ct.MaSP, sp.TenSanPham, sp.MaCodeSp,
        ct.SoLuong, ct.DonGia, ct.ThanhTien
      FROM chitiethoadon ct
      LEFT JOIN sanpham sp ON ct.MaSP = sp.MaSP
      WHERE ct.MaHD = @maHD
    `, { maHD });

    return NextResponse.json({
      ok: true,
      donHang: donHangResult[0],
      chiTiet: chiTiet || [],
    });

  } catch (error: any) {
    console.error('Lỗi API Update Status (GET):', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}