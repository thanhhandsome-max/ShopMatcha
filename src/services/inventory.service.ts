// import { query as dbQuery } from '@/lib/db';

// export type InventoryLocationType = 'warehouse' | 'store';

// export type InventoryQueryParams = {
//   type?: InventoryLocationType;
//   locationId?: string;
//   productId?: string;
// };

// export type InventoryItem = {
//   productId: string;
//   productName: string | null;
//   productCode: string | null;
//   quantity: number;
//   lastUpdated: Date | null;
// };

// export type InventoryLocation = {
//   id: string;
//   name: string;
//   location: string | null;
//   phone: string | null;
//   type: InventoryLocationType;
//   inventory: InventoryItem[];
// };

// const buildInventoryConditions = (
//   query: InventoryQueryParams,
//   type: InventoryLocationType
// ) => {
//   const conditions: string[] = [];
//   const params: Record<string, string> = {};

//   if (query.locationId) {
//     if (type === 'warehouse') {
//       conditions.push('t.MaKho = @locationId');
//     } else {
//       conditions.push('t.MaCH = @locationId');
//     }
//     params.locationId = query.locationId;
//   }

//   if (query.productId) {
//     conditions.push('t.MaSP = @productId');
//     params.productId = query.productId;
//   }

//   return { conditions, params };
// };

// export async function listInventoryByWarehouse(query: InventoryQueryParams = {}): Promise<InventoryLocation[]> {
//   const { conditions, params } = buildInventoryConditions(query, 'warehouse');

//   const warehouseQuery = `SELECT k.MaKho AS id,
//            k.TenKho AS name,
//            k.DiaChi AS location,
//            k.SoDienThoai AS phone
//     FROM kho k
//     ${conditions.length ? `WHERE k.MaKho IN (SELECT MaKho FROM tonkho t WHERE ${conditions.join(' AND ')})` : ''}
//     ORDER BY k.TenKho;`;

//   const inventoryQuery = `SELECT t.MaKho AS locationId,
//             t.MaSP AS productId,
//             p.TenSanPham AS productName,
//             p.MaCodeSp AS productCode,
//             t.SoLuong AS quantity,
//             t.NgayCapNhat AS lastUpdated
//      FROM tonkho t
//      LEFT JOIN sanpham p ON t.MaSP = p.MaSP
//      ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
//      ORDER BY t.MaKho, p.TenSanPham;`;

//   const warehouses = await dbQuery<{
//     id: string;
//     name: string;
//     location: string | null;
//     phone: string | null;
//   }>(warehouseQuery, params);

//   const inventoryRows = await dbQuery<InventoryItem & { locationId: string }>(inventoryQuery, params);

//   return warehouses.map((warehouse) => ({
//     ...warehouse,
//     type: 'warehouse',
//     inventory: inventoryRows
//       .filter((item) => item.locationId === warehouse.id)
//       .map((item) => ({
//         productId: item.productId,
//         productName: item.productName,
//         productCode: item.productCode,
//         quantity: item.quantity,
//         lastUpdated: item.lastUpdated,
//       })),
//   }));
// }

// export async function listInventoryByStore(query: InventoryQueryParams = {}): Promise<InventoryLocation[]> {
//   const { conditions, params } = buildInventoryConditions(query, 'store');

//   const storeQuery = `SELECT MaCH AS id,
//            TenCH AS name,
//            DiaChi AS location,
//            SDT AS phone
//     FROM cuahang
//     ORDER BY TenCH;`;

//   const stores = await dbQuery<{
//     id: string;
//     name: string;
//     location: string | null;
//     phone: string | null;
//   }>(storeQuery);

//   const checkColumn = await dbQuery<{ hasColumn: number }>(
//     `SELECT COUNT(*) AS hasColumn
//      FROM INFORMATION_SCHEMA.COLUMNS
//      WHERE TABLE_NAME = 'TonKho' AND COLUMN_NAME = 'MaCH';`
//   );

//   const hasStoreInventory = checkColumn?.[0]?.hasColumn > 0;

//   if (!hasStoreInventory) {
//     return stores.map((store) => ({
//       ...store,
//       type: 'store',
//       inventory: [],
//     }));
//   }

//   const inventoryQuery = `SELECT t.MaCH AS locationId,
//             t.MaSP AS productId,
//             p.TenSanPham AS productName,
//             p.MaCodeSp AS productCode,
//             t.SoLuong AS quantity,
//             t.NgayCapNhat AS lastUpdated
//      FROM tonkho t
//      LEFT JOIN sanpham p ON t.MaSP = p.MaSP
//      ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
//      ORDER BY t.MaCH, p.TenSanPham;`;

//   const inventoryRows = await dbQuery<InventoryItem & { locationId: string }>(inventoryQuery, params);

//   return stores.map((store) => ({
//     ...store,
//     type: 'store',
//     inventory: inventoryRows
//       .filter((item) => item.locationId === store.id)
//       .map((item) => ({
//         productId: item.productId,
//         productName: item.productName,
//         productCode: item.productCode,
//         quantity: item.quantity,
//         lastUpdated: item.lastUpdated,
//       })),
//   }));
// }

// export async function getInventoryView(query: InventoryQueryParams = {}): Promise<InventoryLocation[]> {
//   if (query.type === 'store') {
//     return listInventoryByStore(query);
//   }

//   return listInventoryByWarehouse(query);
// }
import { query as dbQuery } from '@/lib/db';

export type InventoryLocationType = 'warehouse' | 'store';

export type InventoryQueryParams = {
  type?: InventoryLocationType;
  locationId?: string;
  productId?: string;
};

export type InventoryItem = {
  productId: string;
  productName: string | null;
  productCode: string | null;
  quantity: number;
  lastUpdated: Date | null;
};

export type InventoryLocation = {
  id: string;
  name: string;
  location: string | null;
  phone: string | null;
  type: InventoryLocationType;
  inventory: InventoryItem[];
};

// Hàm bổ trợ xây dựng điều kiện WHERE để tránh lỗi SQL khi conditions trống
const buildWhereClause = (conditions: string[]) => {
  return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
};

const buildInventoryConditions = (
  query: InventoryQueryParams,
  locationColumn: string // Truyền tên cột tương ứng (MaKho hoặc MaCH)
) => {
  const conditions: string[] = [];
  const params: Record<string, string> = {};

  if (query.locationId) {
    conditions.push(`t.${locationColumn} = @locationId`);
    params.locationId = query.locationId;
  }

  if (query.productId) {
    conditions.push('t.MaSP = @productId');
    params.productId = query.productId;
  }

  return { conditions, params };
};

export async function listInventoryByWarehouse(query: InventoryQueryParams = {}): Promise<InventoryLocation[]> {
  const { conditions, params } = buildInventoryConditions(query, 'MaKho');

  // Lấy danh sách kho
  const warehouseQuery = `
    SELECT k.MaKho AS id,
           k.TenKho AS name,
           k.DiaChi AS location,
           k.SoDienThoai AS phone
    FROM kho k
    ORDER BY k.TenKho;`;

  // Lấy chi tiết tồn kho
  const inventoryQuery = `
    SELECT t.MaKho AS locationId,
           t.MaSP AS productId,
           p.TenSanPham AS productName,
           p.MaCodeSp AS productCode,
           t.SoLuong AS quantity,
           t.NgayCapNhat AS lastUpdated
    FROM tonkho t
    LEFT JOIN sanpham p ON t.MaSP = p.MaSP
    ${buildWhereClause(conditions)}
    ORDER BY t.MaKho, p.TenSanPham;`;

  const warehouses = await dbQuery<any>(warehouseQuery);
  const inventoryRows = await dbQuery<any>(inventoryQuery, params);

  return warehouses.map((warehouse: any) => ({
    ...warehouse,
    type: 'warehouse',
    inventory: inventoryRows
      .filter((item: any) => item.locationId === warehouse.id)
      .map((item: any) => ({
        productId: item.productId,
        productName: item.productName,
        productCode: item.productCode,
        quantity: item.quantity,
        lastUpdated: item.lastUpdated,
      })),
  }));
}

export async function listInventoryByStore(query: InventoryQueryParams = {}): Promise<InventoryLocation[]> {
  // LƯU Ý: Vì Database của bạn bảng 'tonkho' không có 'MaCH', 
  // nên tạm thời hàm này sẽ trả về danh sách cửa hàng và inventory trống 
  // để tránh crash ứng dụng.
  
  const storeQuery = `
    SELECT MaCH AS id,
           TenCH AS name,
           DiaChi AS location,
           SDT AS phone
    FROM cuahang
    ORDER BY TenCH;`;

  const stores = await dbQuery<any>(storeQuery);

  // Nếu sau này bạn thêm cột MaCH vào tonkho, hãy dùng logic giống listInventoryByWarehouse
  return stores.map((store: any) => ({
    ...store,
    type: 'store',
    inventory: [], // Hiện tại database chưa hỗ trợ lưu tồn kho theo cửa hàng
  }));
}

export async function getInventoryView(query: InventoryQueryParams = {}): Promise<InventoryLocation[]> {
  if (query.type === 'store') {
    return listInventoryByStore(query);
  }
  return listInventoryByWarehouse(query);
}