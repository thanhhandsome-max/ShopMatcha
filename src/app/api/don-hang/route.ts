import { query as dbQuery } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------
// GET: Lấy danh sách đơn hàng
// ---------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const store = searchParams.get('store');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');

    let sqlQuery = `
      SELECT 
        hd.MaHD,
        hd.MaCuahang,
        ch.TenCH,
        hd.MaNV,
        nv.HoTen as TenNhanVien,
        hd.Makh,
        kh.TenKH as TenKhachHang,
        kh.SDT as SoDienThoai,
        hd.TongTien,
        hd.subtotal,
        hd.shipping_fee,
        hd.TrangThai,
        hd.payment_status,
        hd.payment_method,
        hd.customer_note,
        hd.NgayTao,
        kh.DiaChi as KhachHangDiaChi,
        (SELECT COUNT(*) FROM chitiethoadon WHERE MaHD = hd.MaHD) as SoSanPham
      FROM hoadon hd
      LEFT JOIN cuahang ch ON hd.MaCuahang = ch.MaCH
      LEFT JOIN nhanvien nv ON hd.MaNV = nv.MaNV
      LEFT JOIN khachhang kh ON hd.Makh = kh.MaKH
      WHERE 1=1
    `;

    const params: Record<string, any> = {};

    if (status) {
      sqlQuery += ` AND hd.TrangThai = @status`;
      params.status = parseInt(status);
    }

    if (store) {
      sqlQuery += ` AND hd.MaCuahang = @store`;
      params.store = store;
    }

    if (startDate) {
      sqlQuery += ` AND hd.NgayTao >= @startDate`;
      params.startDate = new Date(startDate);
    }

    if (endDate) {
      sqlQuery += ` AND hd.NgayTao <= @endDate`;
      params.endDate = new Date(endDate);
    }

    if (search) {
      sqlQuery += ` AND (hd.MaHD LIKE @search OR kh.TenKH LIKE @search OR kh.SDT LIKE @search)`;
      params.search = `%${search}%`;
    }

    sqlQuery += ` ORDER BY hd.NgayTao DESC`;

    const donHang = await dbQuery(sqlQuery, params);

    return NextResponse.json({
      ok: true,
      donHang: donHang || [],
      count: donHang?.length || 0,
    });
  } catch (error: any) {
    console.error('Error getting don hang:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------
// PUT: Cập nhật đơn hàng (trạng thái, thanh toán)
// ---------------------------------------------------------
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { maHD, trangThai, paymentStatus, paymentMethod, ghiChu } = body;

    if (!maHD) {
      return NextResponse.json(
        { ok: false, error: 'Cần cung cấp MaHD' },
        { status: 400 }
      );
    }

    let updateSQL = 'UPDATE hoadon SET ';
    const updates: string[] = [];
    const params: Record<string, any> = { maHD };

    if (trangThai !== undefined) {
      updates.push('TrangThai = @trangThai');
      params.trangThai = trangThai;
    }

    if (paymentStatus !== undefined) {
      updates.push('payment_status = @paymentStatus');
      params.paymentStatus = paymentStatus;
    }

    if (paymentMethod) {
      updates.push('payment_method = @paymentMethod');
      params.paymentMethod = paymentMethod;
    }

    if (!updates.length) {
      return NextResponse.json(
        { ok: false, error: 'Không có dữ liệu cần cập nhật' },
        { status: 400 }
      );
    }

    updateSQL += updates.join(', ') + ' WHERE MaHD = @maHD';

    await dbQuery(updateSQL, params);

    return NextResponse.json({
      ok: true,
      message: 'Cập nhật đơn hàng thành công',
    });
  } catch (error: any) {
    console.error('Error updating don hang:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------
// DELETE: Hủy đơn hàng
// ---------------------------------------------------------
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { maHD, lyDo } = body;

    if (!maHD) {
      return NextResponse.json(
        { ok: false, error: 'Cần cung cấp MaHD' },
        { status: 400 }
      );
    }

    // Cập nhật trạng thái thành hủy (giả sử 5 = hủy)
    await dbQuery(
      `UPDATE hoadon SET TrangThai = 5 WHERE MaHD = @maHD`,
      { maHD }
    );

    return NextResponse.json({
      ok: true,
      message: 'Đơn hàng đã được hủy',
      lyDo: lyDo || '',
    });
  } catch (error: any) {
    console.error('Error canceling don hang:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
