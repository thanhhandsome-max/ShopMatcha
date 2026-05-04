// src/lib/axios.ts
import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from './constants';

// Khởi tạo một instance của axios với các cấu hình mặc định
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // Quá 10s không phản hồi thì báo lỗi Time Out
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * 1. REQUEST INTERCEPTOR
 * Can thiệp vào request TRƯỚC KHI gửi lên server
 */
axiosInstance.interceptors.request.use(
    (config) => {
        // Kiểm tra xem có đang chạy trên trình duyệt không (tránh lỗi SSR trong Next.js)
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
            // Nếu có token, tự động nhét vào header Authorization
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * 2. RESPONSE INTERCEPTOR
 * Can thiệp vào response TRƯỚC KHI trả về cho component gọi API
 */
axiosInstance.interceptors.response.use(
    (response) => {
        // Nếu API gọi thành công, trả về đúng data mong muốn
        return response.data;
    },
    (error) => {
        if (error.response) {
            const status = error.response.status;

            switch (status) {
                case 401:
                    // Lỗi 401: Chưa đăng nhập hoặc Token hết hạn / bị sai
                    console.warn('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                    if (typeof window !== 'undefined') {
                        // Xóa dữ liệu cũ đi
                        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
                        localStorage.removeItem(STORAGE_KEYS.USER_INFO);

                        // Đá văng về trang đăng nhập 
                        // (Lưu ý: Nếu dùng Next.js App Router, bạn có thể phải xử lý redirect khác một chút, 
                        // nhưng dùng window.location.href là cách "cục súc" và luôn hiệu quả)
                        window.location.href = '/login';
                    }
                    break;

                case 403:
                    // Lỗi 403: Đã đăng nhập nhưng KHÔNG CÓ QUYỀN (Forbidden)
                    console.error('Bạn không có quyền truy cập vào tài nguyên này.');
                    // Có thể hiển thị Toast Notification báo lỗi ở đây
                    break;

                case 500:
                    // Lỗi 500: Server sập hoặc dính Exception
                    console.error('Lỗi hệ thống từ phía Server!');
                    break;
            }
        } else if (error.request) {
            // Lỗi không nhận được phản hồi từ server (mất mạng, server tắt...)
            console.error('Không thể kết nối đến Server.');
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
export { axiosInstance };