-- Insert test product categories
INSERT INTO loaisanpham (MaLoai, TenLoai, Mota, TrangThai)
VALUES ('LH001', 'Matcha', 'Sản phẩm Matcha chất lượng cao', 1);

-- Insert test products
INSERT INTO sanpham (MaSP, TenSP, MaCodeSp, GiaVon, GiaBan, Mota, TrangThai, MaLoai, NgayTao)
VALUES 
  ('SP001', 'Bột Matcha Hojicha Rang', 'CODE001', 150000.00, 420000.00, 'Bột matcha hojicha rang nguyên chất từ Nhật Bản', 1, 'LH001', GETDATE()),
  ('SP002', 'Bột Matcha Ceremonial', 'CODE002', 200000.00, 520000.00, 'Bột matcha ceremonial grade cao cấp', 1, 'LH001', GETDATE()),
  ('SP003', 'Bột Matcha Premium', 'CODE003', 180000.00, 480000.00, 'Bột matcha premium cho các đồ uống chuyên nghiệp', 1, 'LH001', GETDATE());

-- Get MaKho for inventory (assuming warehouse exists, if not create one first)
-- If no warehouse exists, uncomment and run this:
-- INSERT INTO kho (MaKho, TenKho, DiaChi) VALUES ('KHO001', 'Kho chính', 'Hà Nội');

-- Insert inventory for products (adjust MaKho as needed)
INSERT INTO tonkho (MaSP, MaKho, SoLuong, NgayCapNhat)
SELECT 'SP001', 'KHO001', 100, GETDATE()
WHERE EXISTS (SELECT 1 FROM kho WHERE MaKho = 'KHO001');

INSERT INTO tonkho (MaSP, MaKho, SoLuong, NgayCapNhat)
SELECT 'SP002', 'KHO001', 50, GETDATE()
WHERE EXISTS (SELECT 1 FROM kho WHERE MaKho = 'KHO001');

INSERT INTO tonkho (MaSP, MaKho, SoLuong, NgayCapNhat)
SELECT 'SP003', 'KHO001', 75, GETDATE()
WHERE EXISTS (SELECT 1 FROM kho WHERE MaKho = 'KHO001');

-- If warehouse doesn't exist, run this to create it first:
-- INSERT INTO kho (MaKho, TenKho, DiaChi, DienTich, SoLuongMax, TrangThai)
-- VALUES ('KHO001', 'Kho chính', 'Hà Nội', NULL, NULL, 1);
