import { NextRequest, NextResponse } from 'next/server';
import { PhieuSQLService } from '@/services/phieu.sql';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type');
    const maphieu = searchParams.get('maphieu');
    const chitiet = searchParams.get('chitiet') === 'true';

    if (type === 'nhap') {
      if (maphieu) {
        const phieu = await PhieuSQLService.getPhieuNhap(maphieu);
        const ct = chitiet ? await PhieuSQLService.getChiTietPhieuNhap(maphieu) : [];
        return NextResponse.json({ ok: true, phieu, chitiet: ct });
      }
      return NextResponse.json({ ok: true, phieu: await PhieuSQLService.getAllPhieuNhap() });
    }
    
    if (type === 'xuat') {
      if (maphieu) {
        const phieu = await PhieuSQLService.getPhieuXuat(maphieu);
        const ct = chitiet ? await PhieuSQLService.getChiTietPhieuXuat(maphieu) : [];
        return NextResponse.json({ ok: true, phieu, chitiet: ct });
      }
      return NextResponse.json({ ok: true, phieu: await PhieuSQLService.getAllPhieuXuat() });
    }

    if (type === 'chuyen') {
      if (maphieu) {
        const phieu = await PhieuSQLService.getPhieuChuyen(maphieu);
        const ct = chitiet ? await PhieuSQLService.getChiTietPhieuChuyen(maphieu) : [];
        return NextResponse.json({ ok: true, phieu, chitiet: ct });
      }
      return NextResponse.json({ ok: true, phieu: await PhieuSQLService.getAllPhieuChuyen() });
    }

    return NextResponse.json({ ok: false, error: 'Loại phiếu không hợp lệ' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}


// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { type, phieu, chitiet } = body;

//     if (type === 'nhap') {
//       const MaPN = await PhieuSQLService.taoPhieuNhap(phieu, chitiet);
//       return NextResponse.json({ ok: true, success: true, MaPN });
//     }

//     if (type === 'xuat') {
//       const MaPX = await PhieuSQLService.taoPhieuXuat(phieu, chitiet);
//       return NextResponse.json({ ok: true, success: true, MaPX });
//     }

//     if (type === 'chuyen') {
//       const MaPCH = await PhieuSQLService.taoPhieuChuyen(phieu, chitiet);
//       return NextResponse.json({ ok: true, success: true, MaPCH });
//     }
    
//     return NextResponse.json({ ok: false, error: 'Type not supported' }, { status: 400 });
//   } catch (err: any) {
//     console.error('[PHIEU API] POST Error:', err.message);
//     // Trả về thông báo lỗi cụ thể để bạn biết là do sai Mã NV hay sai Mã NPP
//     return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
//   }
// }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, phieu, chitiet } = body;

    // 1. Xử lý Phiếu Nhập
    if (type === 'nhap') {
      const MaPN = await PhieuSQLService.taoPhieuNhap(phieu, chitiet);
      return NextResponse.json({ ok: true, success: true, MaPN });
    }

    // 2. Xử lý Phiếu Xuất
    if (type === 'xuat') {
      const MaPX = await PhieuSQLService.taoPhieuXuat(phieu, chitiet);
      return NextResponse.json({ ok: true, success: true, MaPX });
    }

    // 3. THÊM LOGIC CHO PHIẾU CHUYỂN Ở ĐÂY
    if (type === 'chuyen') {
      const MaPC = await PhieuSQLService.taoPhieuChuyen(phieu, chitiet);
      return NextResponse.json({ ok: true, success: true, MaPC });
    }

    return NextResponse.json({ ok: false, error: 'Loại phiếu không hỗ trợ' }, { status: 400 });
  } catch (err: any) {
    console.error('[PHIEU API] POST Error:', err.message);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { type, maphieu } = await request.json();
    if (!type || !maphieu) throw new Error("Thiếu type hoặc maphieu để xóa");
    
    await PhieuSQLService.xoaPhieu(type, maphieu);
    return NextResponse.json({ ok: true, message: "Xóa thành công" });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}