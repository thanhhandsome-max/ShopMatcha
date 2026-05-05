// Service layer - gọi API thay vì query database trực tiếp
const BASE_URL = '/api/phieu';

// GET: Lấy danh sách phiếu nhập
export async function getPhieuNhapList() {
  const res = await fetch(`${BASE_URL}?type=nhap`);
  if (!res.ok) throw new Error('Failed to fetch phieu nhap');
  const data = await res.json();
  return data.phieu || [];
}

// GET: Lấy chi tiết phiếu nhập
export async function getPhieuNhapDetail(MaPN: string) {
  const res = await fetch(`${BASE_URL}?type=nhap&maphieu=${MaPN}&chitiet=true`);
  if (!res.ok) throw new Error('Failed to fetch phieu nhap detail');
  const data = await res.json();
  return data;
}

// GET: Lấy danh sách phiếu xuất
export async function getPhieuXuatList() {
  const res = await fetch(`${BASE_URL}?type=xuat`);
  if (!res.ok) throw new Error('Failed to fetch phieu xuat');
  const data = await res.json();
  return data.phieu || [];
}

// GET: Lấy chi tiết phiếu xuất
export async function getPhieuXuatDetail(MaPX: string) {
  const res = await fetch(`${BASE_URL}?type=xuat&maphieu=${MaPX}&chitiet=true`);
  if (!res.ok) throw new Error('Failed to fetch phieu xuat detail');
  const data = await res.json();
  return data;
}

// POST: Tạo phiếu nhập mới
export async function createPhieuNhap(phieuNhap: any, chiTiet: any[]) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'nhap', phieu: phieuNhap, chitiet: chiTiet }),
  });
  if (!res.ok) throw new Error('Failed to create phieu nhap');
  const data = await res.json();
  return data.MaPN;
}

// POST: Tạo phiếu xuất mới
export async function createPhieuXuat(phieuXuat: any, chiTiet: any[]) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'xuat', phieu: phieuXuat, chitiet: chiTiet }),
  });
  if (!res.ok) throw new Error('Failed to create phieu xuat');
  const data = await res.json();
  return data.MaPX;
}

// PUT: Cập nhật phiếu nhập
export async function updatePhieuNhap(MaPN: string, phieuNhap: any) {
  const res = await fetch(BASE_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'nhap', maphieu: MaPN, phieu: phieuNhap }),
  });
  if (!res.ok) throw new Error('Failed to update phieu nhap');
  return res.json();
}

// PUT: Cập nhật phiếu xuất
export async function updatePhieuXuat(MaPX: string, phieuXuat: any) {
  const res = await fetch(BASE_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'xuat', maphieu: MaPX, phieu: phieuXuat }),
  });
  if (!res.ok) throw new Error('Failed to update phieu xuat');
  return res.json();
}

// DELETE: Xóa phiếu nhập
export async function deletePhieuNhap(MaPN: string) {
  const res = await fetch(BASE_URL, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'nhap', maphieu: MaPN }),
  });
  if (!res.ok) throw new Error('Failed to delete phieu nhap');
  return res.json();
}

// DELETE: Xóa phiếu xuất
export async function deletePhieuXuat(MaPX: string) {
  const res = await fetch(BASE_URL, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'xuat', maphieu: MaPX }),
  });
  if (!res.ok) throw new Error('Failed to delete phieu xuat');
  return res.json();
}
