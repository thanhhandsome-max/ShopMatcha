import { query as dbQuery } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Định nghĩa kiểu dữ liệu cho context trong Next.js 15+
 * params bắt buộc phải được xử lý như một Promise.
 */
type RouteContext = {
  params: Promise<{ maHD: string }>;
};

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    // Phải await params trước khi truy cập maHD
    const { maHD } = await params;
    const body = await req.json();
    const { lyDo } = body;

    // Kiểm tra xem đơn hàng có thể hủy không (chỉ hủy được nếu đang chờ hoặc đang xử lý)
    const donHangCheck = await dbQuery(
      `SELECT TrangThai FROM hoadon WHERE MaHD = @maHD`,
      { maHD }
    );

    if (!donHangCheck || donHangCheck.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      );
    }

    const trangThai = donHangCheck[0].TrangThai;
    
    // Chỉ cho phép hủy nếu trạng thái là 1 (chờ thanh toán) hoặc 2 (đang giao)
    if (trangThai > 2) {
      return NextResponse.json(
        { ok: false, error: 'Không thể hủy đơn hàng ở trạng thái hiện tại' },
        { status: 400 }
      );
    }

    // Cập nhật trạng thái thành 4 (đã hủy)
    await dbQuery(
      `UPDATE hoadon SET TrangThai = 4 WHERE MaHD = @maHD`,
      { maHD }
    );

    return NextResponse.json({
      ok: true,
      message: 'Đơn hàng đã được hủy thành công',
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
