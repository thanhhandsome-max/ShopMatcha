// Lưu ý: Nhớ thêm đuôi .js nếu bạn đang dùng ESM (như lỗi ban nãy), hoặc bỏ .js đi nếu dùng cách tsx
import { query } from './db'; 

const testLayDuLieu = async () => {
    try {
        console.log('⏳ Đang chui vào Database lấy dữ liệu...');
        
        // Viết câu lệnh SQL của bạn vào đây (Lấy thử 5 sản phẩm đầu tiên)
        const sqlString = 'SELECT TOP 5 MaSP, TenSP, Gia, SoLuong FROM SanPham';
        
        // Thực thi câu lệnh
        const data = await query(sqlString);
        
        console.log('\n🎉 THÀNH CÔNG! Dưới đây là danh sách sản phẩm:');
        
        // Dùng console.table để vẽ khung bảng đẹp như trong SQL Server
        console.table(data);
        
        process.exit(0); // Tắt tiến trình sau khi xong
    } catch (error) {
        console.error('❌ Thất bại! Lỗi chi tiết:', error);
        process.exit(1);
    }
};

testLayDuLieu();