import { query as dbQuery } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST: Tự động hủy các đơn hàng chờ thanh toán quá 10 phút
 * Cron job sẽ gọi endpoint này mỗi phút
 */
export async function POST(req: NextRequest) {
  try {
    // Tìm tất cả đơn hàng ở trạng thái chờ thanh toán (TrangThai = 0 hoặc 1)
    // Và thời gian tạo (NgayTao) cách đây hơn 10 phút
    const expiredOrders = await dbQuery(`
      SELECT MaHD, NgayTao, TrangThai
      FROM hoadon
      WHERE TrangThai IN (0, 1)
      AND NgayTao < DATEADD(MINUTE, -10, GETDATE())
    `);

    if (!expiredOrders || expiredOrders.length === 0) {
      return NextResponse.json({
        ok: true,
        message: 'Không có đơn hàng nào cần hủy',
        cancelledCount: 0,
      });
    }

    // Hủy tất cả các đơn hàng đã hết hạn
    const cancelledOrders = [];
    for (const order of expiredOrders) {
      try {
        // Cập nhật trạng thái thành 4 (đã hủy)
        await dbQuery(
          `UPDATE hoadon SET TrangThai = 4 WHERE MaHD = @maHD`,
          { maHD: order.MaHD }
        );

        cancelledOrders.push({
          maHD: order.MaHD,
          ngayTao: order.NgayTao,
          thoiGianCho: Math.floor((new Date() - new Date(order.NgayTao)) / (1000 * 60)), // phút
        });

        console.log(`✅ Đã tự động hủy đơn hàng ${order.MaHD} (chờ ${Math.floor((new Date() - new Date(order.NgayTao)) / (1000 * 60))} phút)`);
      } catch (error) {
        console.error(`❌ Lỗi khi hủy đơn hàng ${order.MaHD}:`, error);
      }
    }

    return NextResponse.json({
      ok: true,
      message: `Đã tự động hủy ${cancelledOrders.length} đơn hàng quá hạn`,
      cancelledCount: cancelledOrders.length,
      cancelledOrders,
    });

  } catch (error: any) {
    console.error('Error auto cancelling orders:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}