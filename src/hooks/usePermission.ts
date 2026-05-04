// src/hooks/usePermission.ts
import { useAuth } from '../context/AuthContext';
import { ROLE_PERMISSIONS, PermissionName } from '../lib/permissions';

/**
 * Custom hook để kiểm tra quyền của user đang đăng nhập
 * @param requiredPermission Quyền cần kiểm tra (vd: 'MANAGE_CATALOG')
 * @returns boolean (true nếu có quyền, false nếu không)
 */
export const usePermission = (requiredPermission: PermissionName): boolean => {
    // Lấy thông tin user hiện tại từ Context
    const { user, isAuthenticated } = useAuth();

    // Nếu chưa đăng nhập, mặc định là không có quyền
    if (!isAuthenticated || !user) {
        return false;
    }

    // Lấy danh sách các quyền tương ứng với Vai trò (Role) của user
    const userPermissions = ROLE_PERMISSIONS[user.Role];

    // Nếu vai trò này chưa được định nghĩa trong ma trận, chặn luôn
    if (!userPermissions) {
        return false;
    }

    // Kiểm tra xem quyền yêu cầu có nằm trong danh sách quyền của user không
    return userPermissions.includes(requiredPermission);
};

/**
 * (Nâng cao) Hook kiểm tra xem user có ÍT NHẤT 1 trong các quyền được truyền vào không
 */
export const useAnyPermission = (requiredPermissions: PermissionName[]): boolean => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated || !user || !ROLE_PERMISSIONS[user.Role]) {
        return false;
    }

    const userPermissions = ROLE_PERMISSIONS[user.Role];
    return requiredPermissions.some(permission => userPermissions.includes(permission));
};
