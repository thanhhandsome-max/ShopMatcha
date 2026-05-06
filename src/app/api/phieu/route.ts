import { NextRequest, NextResponse } from 'next/server';
import { PhieuSQLService } from '@/services/phieu.sql';

// ---------------------------------------------------------
// 1. GET: LẤY DANH SÁCH HOẶC CHI TIẾT PHIẾU
// ---------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as 'nhap' | 'xuat' | 'chuyen' | 'nhan';
    const maphieu = searchParams.get('maphieu');
    const chitiet = searchParams.get('chitiet') === 'true';

    if (!type) return NextResponse.json({ ok: false, error: 'Thiếu loại phiếu' }, { status: 400 });

    
    if (chitiet && maphieu) {
    let data = [];
    if (type === 'nhap') data = await PhieuSQLService.getChiTietPhieuNhap(maphieu);
    if (type === 'xuat') data = await PhieuSQLService.getChiTietPhieuXuat(maphieu);
    if (type === 'chuyen') data = await PhieuSQLService.getChiTietPhieuChuyen(maphieu);
    if (type === 'nhan') data = await PhieuSQLService.getChiTietPhieuNhan(maphieu);

    // CHUẨN HÓA DỮ LIỆU TRƯỚC KHI TRẢ VỀ FRONTEND
    const normalizedData = data.map((item: any) => ({
        MaSP: item.MaSp || item.MaSP || item.masp || "N/A", // Ép về MaSP (viết hoa SP)
        SoLuong: item.SoLuong || item.soluong || 0,
        TongTien: item.TongTien || 0
    }));

    return NextResponse.json({ ok: true, chitiet: normalizedData });
    }
    // Trường hợp 2: Lấy danh sách phiếu theo loại
    let list;
    if (type === 'nhap') list = await PhieuSQLService.getAllPhieuNhap();
    else if (type === 'xuat') list = await PhieuSQLService.getAllPhieuXuat();
    else if (type === 'chuyen') list = await PhieuSQLService.getAllPhieuChuyen();
    else if (type === 'nhan') list = await PhieuSQLService.getAllPhieuNhan();

    return NextResponse.json({ ok: true, phieu: list });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

// ---------------------------------------------------------
// 2. POST: TẠO PHIẾU MỚI & GHI LỊCH SỬ KHO
// ---------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, phieu, chitiet } = body;

    if (!type || !phieu) return NextResponse.json({ ok: false, error: 'Thiếu dữ liệu' }, { status: 400 });

    let maPhieuMoi = '';

    // 2.1 Thực hiện ghi vào bảng nghiệp vụ chính (SQL)
    switch (type) {
      case 'nhap':
        maPhieuMoi = await PhieuSQLService.taoPhieuNhap(phieu, chitiet);
        break;
      case 'xuat':
        maPhieuMoi = await PhieuSQLService.taoPhieuXuat(phieu, chitiet);
        break;
      case 'chuyen':
        maPhieuMoi = await PhieuSQLService.taoPhieuChuyen(phieu, chitiet);
        break;
      case 'nhan':
        maPhieuMoi = await PhieuSQLService.taoPhieuNhan(phieu, chitiet);
        break;
      default:
        throw new Error('Loại phiếu không hợp lệ');
    }

    // 2.2 TỰ ĐỘNG GHI LỊCH SỬ KHO (Gọi nội bộ hoặc DB tùy kiến trúc)
    // Để Dashboard nhảy số, ta cần đẩy dữ liệu vào bảng lichsukho
    if (maPhieuMoi && chitiet && chitiet.length > 0) {
        // Lưu ý: Logic Chờ (0) - Hoàn thành (1) được áp dụng tại đây
        const historyTrangThai = type === 'chuyen' ? 0 : 1;
        
        for (const item of chitiet) {
            // Chuẩn bị dữ liệu cho lịch sử
            const historyData = {
                type,
                maSP: item.MaSP,
                maKho: type === 'nhap' || type === 'xuat' ? phieu.MaKho : null,
                maCH: type === 'chuyen' ? phieu.MaCH_Xuat : (type === 'nhan' || type === 'xuat' ? phieu.MaCH : null),
                soLuong: item.SoLuong,
                tongTien: item.TongTien || 0,
                maPhieu: maPhieuMoi,
                maNhanVien: phieu.MaNV,
                trangthai: historyTrangThai
            };

            // Gọi API POST của lich-su-kho (đã được Thành viết)
            // Hoặc gọi trực tiếp vào DB để tối ưu
            await fetch(`${req.nextUrl.origin}/api/lich-su-kho`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(historyData)
            });
        }
    }

    return NextResponse.json({ ok: true, MaPhieu: maPhieuMoi });
  } catch (error: any) {
    console.error('[PHIEU API ERROR]', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

// ---------------------------------------------------------
// 3. DELETE: XÓA PHIẾU
// ---------------------------------------------------------
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, maphieu } = body;

    if (!type || !maphieu) return NextResponse.json({ ok: false, error: 'Thiếu ID' }, { status: 400 });

    const result = await PhieuSQLService.xoaPhieu(type, maphieu);
    
    // Đồng thời xóa luôn lịch sử liên quan để sạch DB
    // await dbQuery('DELETE FROM lichsukho WHERE MaPhieuLienQuan = @maphieu', { maphieu });

    return NextResponse.json({ ok: result });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}


