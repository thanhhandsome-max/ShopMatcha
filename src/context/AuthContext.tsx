"use client";

// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { STORAGE_KEYS } from '../lib/constants';
import { RoleName } from '../lib/permissions';

// 1. Định nghĩa kiểu dữ liệu User lưu trên Frontend
export interface UserInfo {
    MaTK: string;
    TenDN: string;
    Role: RoleName; // Bắt buộc phải khớp với các Role đã định nghĩa (ADMIN, MGR, STAFF, CUST)
    // Bạn có thể mở rộng thêm TenNV, MaCH... tùy vào dữ liệu API Login trả về
}

// 2. Định nghĩa khuôn mẫu cho Context
interface AuthContextType {
    user: UserInfo | null;
    isAuthenticated: boolean; // Trạng thái đã đăng nhập chưa
    isLoading: boolean;       // Trạng thái đang check token (để hiển thị loading/spinner)
    login: (token: string, userInfo: UserInfo) => void;
    logout: () => void;
}

// Khởi tạo Context với giá trị mặc định
export const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    login: () => { },
    logout: () => { },
});

// 3. Provider Component - Dùng để bọc bên ngoài toàn bộ App
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Chạy 1 lần khi load lại trang: Khôi phục phiên đăng nhập từ LocalStorage
    useEffect(() => {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const savedUser = localStorage.getItem(STORAGE_KEYS.USER_INFO);

        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.error('Lỗi khi đọc dữ liệu User:', error);
                localStorage.removeItem(STORAGE_KEYS.USER_INFO);
            }
        }
        setIsLoading(false); // Đã check xong
    }, []);

    // Hàm gọi khi API Login thành công
    const login = (token: string, userInfo: UserInfo) => {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
        setUser(userInfo);
    };

    // Hàm gọi khi nhấn Đăng xuất
    const logout = () => {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_INFO);
        setUser(null);
        // Chuyển hướng về trang chủ hoặc trang đăng nhập
        window.location.href = '/signin';
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// 4. Custom Hook để gọi Context nhanh hơn ở các Component khác
export const useAuth = () => {
    return useContext(AuthContext);
};