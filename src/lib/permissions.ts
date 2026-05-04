// src/lib/permissions.ts
import { ROLES } from './constants';

/**
 * Danh sách toàn bộ các Quyền (Hành động) có trong hệ thống
 */
export const PERMISSIONS = {
    // Nhóm Hệ thống & Cấu trúc (Super Admin)
    MANAGE_ACCOUNTS: 'MANAGE_ACCOUNTS',     // Quản lý tài khoản & phân quyền
    MANAGE_STORES: 'MANAGE_STORES',         // Quản lý thông tin cửa hàng, kho bãi
    MANAGE_EMPLOYEES: 'MANAGE_EMPLOYEES',   // Quản lý nhân viên

    // Nhóm Kinh doanh & Vận hành (Manager)
    VIEW_DASHBOARD: 'VIEW_DASHBOARD',       // Xem thống kê doanh thu
    MANAGE_CATALOG: 'MANAGE_CATALOG',       // Quản lý sản phẩm, loại sản phẩm
    MANAGE_INVENTORY: 'MANAGE_INVENTORY',   // Quản lý kho, phiếu nhập/xuat/chuyển
    MANAGE_ORDERS: 'MANAGE_ORDERS',         // Duyệt và quản lý tất cả đơn hàng
    MANAGE_PARTNERS: 'MANAGE_PARTNERS',     // Quản lý nhà phân phối, khách hàng
    MANAGE_PROMOS: 'MANAGE_PROMOS',         // Quản lý khuyến mãi, mã giảm giá

    // Nhóm Bán hàng (Staff)
    CREATE_ORDER: 'CREATE_ORDER',           // Lên đơn hàng mới tại quầy
    VIEW_PRODUCTS: 'VIEW_PRODUCTS',         // Xem danh sách sản phẩm
    
    // Nhóm Khách hàng (Customer)
    BUY_ONLINE: 'BUY_ONLINE',               // Đặt hàng online
    VIEW_OWN_ORDERS: 'VIEW_OWN_ORDERS',     // Xem lịch sử đơn hàng của chính mình
} as const;

// Ép kiểu để TypeScript hỗ trợ gợi ý (Autocomplete)
export type PermissionName = keyof typeof PERMISSIONS;
export type RoleName = typeof ROLES[keyof typeof ROLES];

/**
 * Ma trận phân quyền: Gắn Quyền vào Vai trò
 * Dựa đúng theo phân tích thiết kế CSDL ban đầu của chúng ta
 */
export const ROLE_PERMISSIONS: Record<RoleName, PermissionName[]> = {
    
    // Super Admin: Chỉ quản trị lõi hệ thống, không làm nghiệp vụ bán hàng
    [ROLES.ADMIN]: [
        PERMISSIONS.MANAGE_ACCOUNTS,
        PERMISSIONS.MANAGE_STORES,
        PERMISSIONS.MANAGE_EMPLOYEES,
    ],

    // Manager (Quản lý cửa hàng): Full quyền vận hành nghiệp vụ
    [ROLES.MANAGER]: [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.MANAGE_CATALOG,
        PERMISSIONS.MANAGE_INVENTORY,
        PERMISSIONS.MANAGE_ORDERS,
        PERMISSIONS.MANAGE_PARTNERS,
        PERMISSIONS.MANAGE_PROMOS,
        PERMISSIONS.VIEW_PRODUCTS,
    ],

    // Staff (Nhân viên bán hàng): Chỉ xem sản phẩm và lên đơn
    [ROLES.STAFF]: [
        PERMISSIONS.VIEW_PRODUCTS,
        PERMISSIONS.CREATE_ORDER,
    ],

    // Customer (Khách hàng): Chỉ thao tác với dữ liệu của mình
    [ROLES.CUSTOMER]: [
        PERMISSIONS.VIEW_PRODUCTS,
        PERMISSIONS.BUY_ONLINE,
        PERMISSIONS.VIEW_OWN_ORDERS,
    ],
};