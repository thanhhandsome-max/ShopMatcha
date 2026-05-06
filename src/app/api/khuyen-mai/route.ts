// // import { query as dbQuery } from '@/lib/db';
// // import { NextRequest, NextResponse } from 'next/server';

// // const TABLE = 'KhuyenMai';

// // // ---------------------------------------------------------
// // // GET: Lấy danh sách khuyến mãi/mã giảm giá
// // // ---------------------------------------------------------
// // export async function GET(req: NextRequest) {
// //   try {
// //     const { searchParams } = new URL(req.url);
// //     const type = searchParams.get('type'); // 'khuyen-mai' hoặc 'ma-giam-gia'
// //     const storeId = searchParams.get('storeId');
// //     const productId = searchParams.get('productId');
// //     const search = searchParams.get('search');

// //     let sqlQuery = `
// //       SELECT 
// //         Makhuyenmai,
// //         MaCH,
// //         Masp,
// //         mota,
// //         giatrima,
// //         thoihan
// //       FROM ${TABLE}
// //       WHERE 1=1
// //     `;

// //     const params: Record<string, any> = {};

// //     // Phân biệt khuyến mãi vs mã giảm giá dựa trên tiền tố Makhuyenmai
// //     if (type === 'khuyen-mai') {
// //       sqlQuery += ` AND Makhuyenmai LIKE 'KM_%'`;
// //     } else if (type === 'ma-giam-gia') {
// //       sqlQuery += ` AND Makhuyenmai LIKE 'GG_%'`;
// //     }

// //     if (storeId) {
// //       sqlQuery += ` AND MaCH = @storeId`;
// //       params.storeId = storeId;
// //     }

// //     if (productId) {
// //       sqlQuery += ` AND Masp = @productId`;
// //       params.productId = productId;
// //     }

// //     if (search) {
// //       sqlQuery += ` AND (Makhuyenmai LIKE @search OR mota LIKE @search OR Masp LIKE @search)`;
// //       params.search = `%${search}%`;
// //     }

// //     sqlQuery += ` ORDER BY thoihan DESC`;

// //     const result = await dbQuery(sqlQuery, params);
// //     return NextResponse.json({ success: true, data: result.recordset || [] });
// //   } catch (error: any) {
// //     console.error('[API/khuyen-mai] GET Error:', error);
// //     return NextResponse.json(
// //       { success: false, error: error.message || 'Lỗi lấy danh sách khuyến mãi' },
// //       { status: 500 }
// //     );
// //   }
// // }

// // // ---------------------------------------------------------
// // // POST: Tạo khuyến mãi/mã giảm giá mới
// // // ---------------------------------------------------------
// // export async function POST(req: NextRequest) {
// //   try {
// //     const body = await req.json();
// //     const { Makhuyenmai, MaCH, Masp, mota, giatrima, thoihan, type } = body;

// //     if (!Makhuyenmai || !giatrima) {
// //       return NextResponse.json(
// //         { success: false, error: 'Thiếu thông tin bắt buộc' },
// //         { status: 400 }
// //       );
// //     }

// //     // Kiểm tra tiền tố để phân biệt loại
// //     if (type === 'khuyen-mai' && !Makhuyenmai.startsWith('KM_')) {
// //       return NextResponse.json(
// //         { success: false, error: 'Mã khuyến mãi sản phẩm phải bắt đầu bằng KM_' },
// //         { status: 400 }
// //       );
// //     }

// //     if (type === 'ma-giam-gia' && !Makhuyenmai.startsWith('GG_')) {
// //       return NextResponse.json(
// //         { success: false, error: 'Mã giảm giá phải bắt đầu bằng GG_' },
// //         { status: 400 }
// //       );
// //     }

// //     const sqlQuery = `
// //       INSERT INTO ${TABLE} (Makhuyenmai, MaCH, Masp, mota, giatrima, thoihan)
// //       VALUES (@Makhuyenmai, @MaCH, @Masp, @mota, @giatrima, @thoihan)
// //     `;

// //     const params = {
// //       Makhuyenmai,
// //       MaCH: MaCH || null,
// //       Masp: Masp || null,
// //       mota: mota || '',
// //       giatrima: Number(giatrima),
// //       thoihan: thoihan || null,
// //     };

// //     await dbQuery(sqlQuery, params);
// //     return NextResponse.json(
// //       { success: true, message: 'Tạo thành công', data: body },
// //       { status: 201 }
// //     );
// //   } catch (error: any) {
// //     console.error('[API/khuyen-mai] POST Error:', error);
// //     return NextResponse.json(
// //       { success: false, error: error.message || 'Lỗi tạo' },
// //       { status: 500 }
// //     );
// //   }
// // }

// // // ---------------------------------------------------------
// // // PUT: Cập nhật khuyến mãi/mã giảm giá
// // // ---------------------------------------------------------
// // export async function PUT(req: NextRequest) {
// //   try {
// //     const body = await req.json();
// //     const { Makhuyenmai, MaCH, Masp, mota, giatrima, thoihan } = body;

// //     if (!Makhuyenmai) {
// //       return NextResponse.json(
// //         { success: false, error: 'Thiếu mã khuyến mãi' },
// //         { status: 400 }
// //       );
// //     }

// //     const sqlQuery = `
// //       UPDATE ${TABLE}
// //       SET 
// //         MaCH = @MaCH,
// //         Masp = @Masp,
// //         mota = @mota,
// //         giatrima = @giatrima,
// //         thoihan = @thoihan
// //       WHERE Makhuyenmai = @Makhuyenmai
// //     `;

// //     const params = {
// //       Makhuyenmai,
// //       MaCH: MaCH || null,
// //       Masp: Masp || null,
// //       mota: mota || '',
// //       giatrima: giatrima !== undefined ? Number(giatrima) : null,
// //       thoihan: thoihan || null,
// //     };

// //     await dbQuery(sqlQuery, params);
// //     return NextResponse.json({ success: true, message: 'Cập nhật thành công' });
// //   } catch (error: any) {
// //     console.error('[API/khuyen-mai] PUT Error:', error);
// //     return NextResponse.json(
// //       { success: false, error: error.message || 'Lỗi cập nhật' },
// //       { status: 500 }
// //     );
// //   }
// // }

// // // ---------------------------------------------------------
// // // DELETE: Xóa khuyến mãi/mã giảm giá
// // // ---------------------------------------------------------
// // export async function DELETE(req: NextRequest) {
// //   try {
// //     const { searchParams } = new URL(req.url);
// //     const Makhuyenmai = searchParams.get('id');

// //     if (!Makhuyenmai) {
// //       return NextResponse.json(
// //         { success: false, error: 'Thiếu mã' },
// //         { status: 400 }
// //       );
// //     }

// //     const sqlQuery = `DELETE FROM ${TABLE} WHERE Makhuyenmai = @Makhuyenmai`;
// //     await dbQuery(sqlQuery, { Makhuyenmai });

// //     return NextResponse.json({ success: true, message: 'Xóa thành công' });
// //   } catch (error: any) {
// //     console.error('[API/khuyen-mai] DELETE Error:', error);
// //     return NextResponse.json(
// //       { success: false, error: error.message || 'Lỗi xóa' },
// //       { status: 500 }
// //     );
// //   }
// // }





// import { query as dbQuery } from '@/lib/db';
// import { NextRequest, NextResponse } from 'next/server';

// /**
//  * Phân loại bảng dựa trên tham số 'type':
//  * - 'san-pham': Thao tác với bảng 'khuyenmai' (Khuyến mãi theo cửa hàng/sản phẩm)
//  * - 'khach-hang': Thao tác với bảng 'khuyenmaikhachhang' (Mã giảm giá/Voucher cho khách)
//  */

// // ---------------------------------------------------------
// // GET: Lấy danh sách từ bảng tương ứng
// // ---------------------------------------------------------
// // export async function GET(req: NextRequest) {
// //   try {
// //     const { searchParams } = new URL(req.url);
// //     const type = searchParams.get('type'); // 'san-pham' hoặc 'khach-hang'
// //     const search = searchParams.get('search');

// //     const isCustomerType = type === 'khach-hang';
// //     const table = isCustomerType ? 'khuyenmaikhachhang' : 'khuyenmai';
// //     const idCol = isCustomerType ? 'Makmkh' : 'Makhuyenmai';

// //     let sqlQuery = `SELECT * FROM ${table} WHERE 1=1`;
// //     const params: Record<string, any> = {};

// //     if (search) {
// //       if (isCustomerType) {
// //         sqlQuery += ` AND (Makmkh LIKE @search OR MaKH LIKE @search OR mota LIKE @search)`;
// //       } else {
// //         sqlQuery += ` AND (Makhuyenmai LIKE @search OR MaCH LIKE @search OR Masp LIKE @search OR mota LIKE @search)`;
// //       }
// //       params.search = `%${search}%`;
// //     }

// //     sqlQuery += ` ORDER BY thoihan DESC`;

// //     const result = await dbQuery(sqlQuery, params);
// //     // Hỗ trợ cả trường hợp trả về recordset (mssql) hoặc mảng trực tiếp
// //     const data = result.recordset ? result.recordset : result;

// //     return NextResponse.json({ success: true, data: data || [] });
// //   } catch (error: any) {
// //     console.error('[API/khuyen-mai] GET Error:', error);
// //     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
// //   }
// // }

// // // ---------------------------------------------------------
// // // POST: Thêm mới vào bảng tương ứng
// // // ---------------------------------------------------------
// // export async function POST(req: NextRequest) {
// //   try {
// //     const body = await req.json();
// //     const { type, id, target, storeId, prodId, value, date, desc, priority } = body;

// //     if (!id || !value) {
// //       return NextResponse.json({ success: false, error: 'Thiếu mã ID hoặc giá trị giảm' }, { status: 400 });
// //     }

// //     let sql = '';
// //     let params: any = {};

// //     if (type === 'khach-hang') {
// //       // Dùng cấu trúc bảng khuyenmaikhachhang
// //       sql = `INSERT INTO khuyenmaikhachhang (Makmkh, MaKH, giatri, thoihan, mota, Uutien) 
// //              VALUES (@id, @maKH, @val, @date, @desc, @priority)`;
// //       params = { 
// //         id, 
// //         maKH: target || null, 
// //         val: Number(value), 
// //         date: date || null, 
// //         desc: desc || '', 
// //         priority: Number(priority) || 0 
// //       };
// //     } else {
// //       // Dùng cấu trúc bảng khuyenmai
// //       sql = `INSERT INTO khuyenmai (Makhuyenmai, MaCH, Masp, mota, giatrima, thoihan) 
// //              VALUES (@id, @maCH, @maSP, @desc, @val, @date)`;
// //       params = { 
// //         id, 
// //         maCH: storeId || null, 
// //         maSP: prodId || null, 
// //         desc: desc || '', 
// //         val: Number(value), 
// //         date: date || null 
// //       };
// //     }

// //     await dbQuery(sql, params);
// //     return NextResponse.json({ success: true, message: 'Tạo thành công' }, { status: 201 });
// //   } catch (error: any) {
// //     console.error('[API/khuyen-mai] POST Error:', error);
// //     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
// //   }
// // }
//     export async function GET(req: NextRequest) {
//     try {
//         const { searchParams } = new URL(req.url);
//         const type = searchParams.get('type'); // 'san-pham' hoặc 'khach-hang'

//         // Xác định bảng và cột ID tương ứng
//         const isCustomer = type === 'khach-hang';
//         const table = isCustomer ? 'khuyenmaikhachhang' : 'khuyenmai';
        
//         // Truy vấn dữ liệu
//         const sqlQuery = `SELECT * FROM ${table} ORDER BY thoihan DESC`;
//         const result = await dbQuery(sqlQuery);

//         // FIX: Đảm bảo lấy đúng mảng dữ liệu tùy theo thư viện DB bạn dùng
//         const records = result.recordset ? result.recordset : result;

//         return NextResponse.json({ success: true, data: records || [] });
//     } catch (error: any) {
//         console.error('Lỗi GET Khuyến mãi:', error);
//         return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//     }
//     }

//     export async function POST(req: NextRequest) {
//     try {
//         const body = await req.json();
//         const { type, id, target, value, date, desc, storeId, prodId } = body;

//         let sql = '';
//         let params: any = {};

//         if (type === 'khach-hang') {
//         // Cấu trúc bảng khuyenmaikhachhang: Makmkh, MaKH, giatri, thoihan, mota
//         sql = `INSERT INTO khuyenmaikhachhang (Makmkh, MaKH, giatri, thoihan, mota, Uutien) 
//                 VALUES (@id, @target, @val, @date, @desc, 0)`;
//         params = { id, target, val: Number(value), date: date || null, desc: desc || '' };
//         } else {
//         // Cấu trúc bảng khuyenmai: Makhuyenmai, MaCH, Masp, mota, giatrima, thoihan
//         sql = `INSERT INTO khuyenmai (Makhuyenmai, MaCH, Masp, mota, giatrima, thoihan) 
//                 VALUES (@id, @store, @prod, @desc, @val, @date)`;
//         params = { 
//             id, 
//             store: storeId || null, 
//             prod: prodId || null, 
//             desc: desc || '', 
//             val: Number(value), 
//             date: date || null 
//         };
//         }

//         await dbQuery(sql, params);
//         return NextResponse.json({ success: true, message: 'Tạo thành công' });
//     } catch (error: any) {
//         return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//     }
//     }
// // ---------------------------------------------------------
// // PUT: Cập nhật bản ghi
// // ---------------------------------------------------------
// export async function PUT(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { type, id, target, storeId, prodId, value, date, desc, priority } = body;

//     if (!id) return NextResponse.json({ success: false, error: 'Thiếu mã ID' }, { status: 400 });

//     let sql = '';
//     let params: any = {};

//     if (type === 'khach-hang') {
//       sql = `UPDATE khuyenmaikhachhang SET MaKH = @target, giatri = @val, thoihan = @date, mota = @desc, Uutien = @priority WHERE Makmkh = @id`;
//       params = { id, target, val: Number(value), date, desc, priority: Number(priority) || 0 };
//     } else {
//       sql = `UPDATE khuyenmai SET MaCH = @storeId, Masp = @prodId, mota = @desc, giatrima = @val, thoihan = @date WHERE Makhuyenmai = @id`;
//       params = { id, storeId, prodId, desc, val: Number(value), date };
//     }

//     await dbQuery(sql, params);
//     return NextResponse.json({ success: true, message: 'Cập nhật thành công' });
//   } catch (error: any) {
//     console.error('[API/khuyen-mai] PUT Error:', error);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }

// // ---------------------------------------------------------
// // DELETE: Xóa bản ghi
// // ---------------------------------------------------------
// export async function DELETE(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const id = searchParams.get('id');
//     const type = searchParams.get('type');

//     if (!id || !type) return NextResponse.json({ success: false, error: 'Thiếu thông tin ID hoặc loại' }, { status: 400 });

//     const table = type === 'khach-hang' ? 'khuyenmaikhachhang' : 'khuyenmai';
//     const idCol = type === 'khach-hang' ? 'Makmkh' : 'Makhuyenmai';

//     await dbQuery(`DELETE FROM ${table} WHERE ${idCol} = @id`, { id });
//     return NextResponse.json({ success: true, message: 'Xóa thành công' });
//   } catch (error: any) {
//     console.error('[API/khuyen-mai] DELETE Error:', error);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }

import { query as dbQuery } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); 

    // ĐỒNG BỘ: Khớp với type gửi từ services.ts
    // Nếu là 'ma-giam-gia' -> dùng bảng khách hàng. Nếu là 'khuyen-mai' -> dùng bảng sản phẩm
    const isCustomerType = type === 'ma-giam-gia' || type === 'khach-hang';
    const table = isCustomerType ? 'khuyenmaikhachhang' : 'khuyenmai';

    const sqlQuery = `SELECT * FROM ${table} ORDER BY thoihan DESC`;
    const result = await dbQuery(sqlQuery);

    // Xử lý dữ liệu trả về linh hoạt để tránh lỗi undefined
    // const data = (result as any)?.recordset || (Array.isArray(result) ? result : []);
    let data: any[] = [];
    if (result) {
    if ((result as any).recordset) {
        data = (result as any).recordset;
    } else if (Array.isArray(result)) {
        data = result;
    }
    }
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[API/khuyen-mai] GET Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { type, Makhuyenmai, MaCH, Masp, mota, giatrima, thoihan } = body;

//     // Xác định bảng dựa trên type từ frontend gửi về
//     const isCustomerType = type === 'ma-giam-gia' || type === 'khach-hang';

//     let sql = '';
//     let params: any = {};

//     if (isCustomerType) {
//       // Bảng khuyenmaikhachhang: Dùng cột 'giatri' và 'Makmkh'
//       sql = `INSERT INTO khuyenmaikhachhang (Makmkh, MaKH, giatri, thoihan, mota, Uutien) 
//              VALUES (@id, @target, @val, @date, @desc, 1)`;
//       params = { id: Makhuyenmai, target: MaCH || 'ALL', val: Number(giatrima), date: thoihan, desc: mota };
//     } else {
//       // Bảng khuyenmai: Dùng cột 'giatrima' và 'Makhuyenmai'
//       sql = `INSERT INTO khuyenmai (Makhuyenmai, MaCH, Masp, mota, giatrima, thoihan) 
//              VALUES (@id, @store, @prod, @desc, @val, @date)`;
//       params = { id: Makhuyenmai, store: MaCH, prod: Masp, desc: mota, val: Number(giatrima), date: thoihan };
//     }

//     await dbQuery(sql, params);
//     return NextResponse.json({ success: true, message: 'Tạo thành công' });
//   } catch (error: any) {
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }
    export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // Đảm bảo tên biến ở đây khớp với tên trường bạn gửi từ fetch() ở Frontend
        const { type, id, target, value, date, desc, storeId, prodId, priority } = body;

        // Kiểm tra dữ liệu đầu vào trước khi truy vấn
        if (!id || id.trim() === '') {
        return NextResponse.json({ success: false, error: 'Mã khuyến mãi không được để trống' }, { status: 400 });
        }

        let sql = '';
        let params: any = {};

        if (type === 'ma-giam-gia' || type === 'khach-hang') {
        // Dành cho bảng khuyenmaikhachhang
        sql = `INSERT INTO khuyenmaikhachhang (Makmkh, MaKH, giatri, thoihan, mota, Uutien) 
                VALUES (@id, @target, @val, @date, @desc, @priority)`;
        params = { id, target: target || null, val: Number(value), date: date || null, desc: desc || '', priority: Number(priority) || 0 };
        } else {
        // Dành cho bảng khuyenmai (Sản phẩm)
        sql = `INSERT INTO khuyenmai (Makhuyenmai, MaCH, Masp, mota, giatrima, thoihan) 
                VALUES (@id, @store, @prod, @desc, @val, @date)`;
        params = { id, store: storeId || null, prod: prodId || null, desc: desc || '', val: Number(value), date: date || null };
        }

        await dbQuery(sql, params);
        return NextResponse.json({ success: true, message: 'Tạo thành công' });
    } catch (error: any) {
        console.error('Lỗi Database:', error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    }
    export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { type, id, target, storeId, prodId, value, date, desc, priority } = body;

        if (!id) return NextResponse.json({ success: false, error: 'Thiếu mã ID' }, { status: 400 });

        let sql = '';
        let params: any = {};

        if (type === 'ma-giam-gia' || type === 'khach-hang') {
        // Cập nhật bảng khuyenmaikhachhang - Tuyệt đối không UPDATE cột Makmkh
        sql = `UPDATE khuyenmaikhachhang 
                SET MaKH = @target, giatri = @val, thoihan = @date, mota = @desc, Uutien = @priority 
                WHERE Makmkh = @id`;
        params = { id, target, val: Number(value), date, desc, priority: Number(priority) || 0 };
        } else {
        // Cập nhật bảng khuyenmai - Tuyệt đối không UPDATE cột Makhuyenmai
        sql = `UPDATE khuyenmai 
                SET MaCH = @storeId, Masp = @prodId, mota = @desc, giatrima = @val, thoihan = @date 
                WHERE Makhuyenmai = @id`;
        params = { id, storeId, prodId, desc, val: Number(value), date };
        }

        await dbQuery(sql, params);
        return NextResponse.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error: any) {
        // Bắt lỗi trùng khóa nếu người dùng cố tình đổi ID sang một ID khác đã có sẵn
        if (error.number === 2627) {
        return NextResponse.json({ success: false, error: 'Mã hiệu này đã tồn tại, không thể sử dụng!' }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    }
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    const isCustomerType = type === 'ma-giam-gia' || type === 'khach-hang';
    const table = isCustomerType ? 'khuyenmaikhachhang' : 'khuyenmai';
    const idCol = isCustomerType ? 'Makmkh' : 'Makhuyenmai';

    await dbQuery(`DELETE FROM ${table} WHERE ${idCol} = @id`, { id });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}