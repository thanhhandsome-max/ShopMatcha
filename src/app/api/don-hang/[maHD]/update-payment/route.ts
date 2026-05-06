import { query as dbQuery } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  req: NextRequest,
  { params }: { params: { maHD: string } }
) {
  try {
    const maHD = params.maHD;
    const body = await req.json();
    const { paymentStatus, paymentMethod } = body;

    if (paymentStatus === undefined) {
      return NextResponse.json(
        { ok: false, error: 'Cần cung cấp trạng thái thanh toán' },
        { status: 400 }
      );
    }

    let updateSQL = `UPDATE hoadon SET payment_status = @paymentStatus`;
    const params_: Record<string, any> = { paymentStatus, maHD };

    if (paymentMethod) {
      updateSQL += `, payment_method = @paymentMethod`;
      params_.paymentMethod = paymentMethod;
    }

    updateSQL += ` WHERE MaHD = @maHD`;

    await dbQuery(updateSQL, params_);

    return NextResponse.json({
      ok: true,
      message: 'Cập nhật trạng thái thanh toán thành công',
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
