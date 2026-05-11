'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ISanPham } from '@/types';
import { sanPhamService } from '@/services/SanPham.service';
import { SanPhamForm } from '@/components/sanpham/SanPhamForm';

export default function SanPhamPage() {
    const [sanPhams, setSanPhams] = useState<ISanPham[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchValue, setSearchValue] = useState('');
    const [filterLoai, setFilterLoai] = useState('');
    const [filterStatus, setFilterStatus] = useState<string | number>('');
    const [priceMin, setPriceMin] = useState<number | ''>('');
    const [priceMax, setPriceMax] = useState<number | ''>('');
    const [loaiOptions, setLoaiOptions] = useState<{ MaLoai: string; TenLoai: string }[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<ISanPham | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [mainImages, setMainImages] = useState<Record<string, string>>({});

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await sanPhamService.getAll();
            setSanPhams(data);
            return data;
        } catch (err) {
            console.error('Lỗi tải dữ liệu', err);
            return [] as ISanPham[];
        } finally {
            setIsLoading(false);
        }
    };

    const handleImagesChanged = async () => {
        const data = await loadData();
        if (data && data.length > 0) loadMainImages(data);
    };

    useEffect(() => {
        loadData();
        // load loai options
        (async () => {
            try {
                const res = await fetch('/api/loai-san-pham');
                const json = await res.json();
                if (res.ok && json.data) setLoaiOptions(json.data);
            } catch (err) {
                console.warn('Không thể tải loại sản phẩm', err);
            }
        })();
    }, []);

    // Load main images for products (cache by MaSP)
    const loadMainImages = async (items: ISanPham[]) => {
        try {
            const map: Record<string, string> = {};
            await Promise.all(items.map(async (it) => {
                if (!it.MaSP) return;
                try {
                    const res = await fetch(`/api/san-pham/${encodeURIComponent(it.MaSP)}/anh`);
                    if (!res.ok) return;
                    const json = await res.json();
                    const imgs = json.data || [];
                    const main = imgs.find((x: any) => Number(x.AnhChinh) === 1) || imgs[0];
                    if (main && main.DuongDanAnh) {
                        map[it.MaSP] = main.DuongDanAnh;
                    }
                } catch (e) {
                    // ignore per-item errors
                }
            }));
            setMainImages(map);
        } catch (e) {
            console.warn('Could not load main images', e);
        }
    };

    useEffect(() => {
        if (sanPhams && sanPhams.length > 0) loadMainImages(sanPhams);
    }, [sanPhams]);

    const openCreateForm = () => {
        setEditingItem(null);
        setShowForm(true);
    };

    const openEditForm = (item: ISanPham) => {
        setEditingItem(item);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingItem(null);
        setIsSaving(false);
    };

    const handleSubmit = async (formData: Partial<ISanPham>) => {
        setIsSaving(true);
        try {
            const isEditing = Boolean(editingItem?.MaSP);
            let result: { MaSP?: string } | void = undefined;

            if (isEditing && editingItem?.MaSP) {
                result = await sanPhamService.update(editingItem.MaSP, formData);
            } else {
                result = await sanPhamService.create(formData);
            }

            await loadData();

            const nextMaSP = result && typeof result === 'object' ? String(result.MaSP || '') : '';

            if (!isEditing && nextMaSP) {
                const createdProduct: ISanPham = {
                    MaSP: nextMaSP,
                    TenSanPham: formData.TenSanPham || '',
                    MaCodeSp: formData.MaCodeSp || '',
                    GiaVon: formData.GiaVon || 0,
                    GiaBan: formData.GiaBan || 0,
                    MoTa: formData.MoTa || '',
                    TrangThai: formData.TrangThai ?? 1,
                    MaLoai: formData.MaLoai || '',
                    NgayTao: formData.NgayTao || new Date().toISOString(),
                };
                setEditingItem(createdProduct);
                setShowForm(true);
                setIsSaving(false);

                return { MaSP: nextMaSP };
            } else {
                closeForm();
            }

            return result;
        } catch (err) {
            setIsSaving(false);
            alert(`${editingItem?.MaSP ? 'Sửa' : 'Thêm'} sản phẩm thất bại: ` + (err instanceof Error ? err.message : 'Unknown error'));
            return undefined;
        }
    };

    const handleDelete = async (maSP: string) => {
        const confirmed = confirm(
            'Bạn có chắc chắn muốn xóa sản phẩm này?\n\n' +
            'Tất cả ảnh và dữ liệu liên quan cũng sẽ bị xóa và không thể khôi phục.'
        );
        if (!confirmed) return;

        try {
            await sanPhamService.delete(maSP);
            loadData();
        } catch (err) {
            alert('Xóa sản phẩm thất bại: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    };

    const filteredSanPhams = useMemo(() => {
        const keyword = searchValue.trim().toLowerCase();

        return sanPhams.filter((item) => {
            // search text
            if (keyword) {
                const tenSanPham = String(item.TenSanPham || '').toLowerCase();
                const maSP = String(item.MaSP || '').toLowerCase();
                const maCode = String(item.MaCodeSp || '').toLowerCase();
                const maLoai = String(item.MaLoai || '').toLowerCase();
                const matchText = tenSanPham.includes(keyword) || maSP.includes(keyword) || maCode.includes(keyword) || maLoai.includes(keyword);
                if (!matchText) return false;
            }

            // filter by loai
            if (filterLoai) {
                if (String(item.MaLoai || '') !== String(filterLoai)) return false;
            }

            // filter by status
            if (filterStatus !== '' && filterStatus !== undefined) {
                if (String(item.TrangThai || '') !== String(filterStatus)) return false;
            }

            // filter by price range (GiaBan)
            const price = Number(item.GiaBan || 0);
            if (priceMin !== '') {
                if (price < Number(priceMin)) return false;
            }
            if (priceMax !== '') {
                if (price > Number(priceMax)) return false;
            }

            return true;
        });
    }, [sanPhams, searchValue, filterLoai, filterStatus, priceMin, priceMax]);

    const formatCurrency = (value?: number) => {
        if (value === undefined || value === null) return '-';
        return Number(value).toLocaleString('vi-VN');
    };

    const resolveImageSrcForItem = (item: ISanPham) => {
        const raw = mainImages[item.MaSP || ''];
        if (raw) {
            const v = String(raw || '').trim();
            if (!v) return undefined;
            if (/^https?:\/\//i.test(v)) return v;
            if (v.startsWith('/')) return v;
            if (v.startsWith('images/')) return `/${v}`;
            if (/^product-[^/]+$/i.test(v)) return `/images/product/${v}`;
            return `/images/product/${v}`;
        }
        return undefined;
    };

    const getStatusMeta = (status?: number) => {
        switch (Number(status)) {
            case 1:
                return { label: 'Đang bán', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
            case 2:
                return { label: 'Hết hàng', className: 'bg-amber-50 text-amber-700 border-amber-200' };
            case 0:
                return { label: 'Ngừng kinh doanh', className: 'bg-rose-50 text-rose-700 border-rose-200' };
            default:
                return { label: 'Không rõ', className: 'bg-gray-100 text-gray-700 border-gray-200' };
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản Lý Sản Phẩm</h1>
                </div>
                <button
                    onClick={openCreateForm}
                    className="bg-brand-500 text-white px-5 py-2 rounded-lg hover:bg-brand-600 transition font-medium"
                >
                    + Thêm Mới
                </button>
            </div>

            <div className="mb-6 bg-white p-4 rounded-lg shadow-theme-sm border border-gray-200">
                <div className="mb-3">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mã, mã code, mã loại hoặc tên sản phẩm..."
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-500"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Loại sản phẩm</label>
                        <select
                            className="w-full p-2.5 border border-gray-300 rounded-lg"
                            value={filterLoai}
                            onChange={(e) => setFilterLoai(e.target.value)}
                        >
                            <option value="">Tất cả</option>
                            {loaiOptions.map((l) => (
                                <option key={l.MaLoai} value={l.MaLoai}>{l.TenLoai}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Trạng thái</label>
                        <select
                            className="w-full p-2.5 border border-gray-300 rounded-lg"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">Tất cả</option>
                            <option value={1}>Đang bán</option>
                            <option value={2}>Hết hàng</option>
                            <option value={0}>Ngừng kinh doanh</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Giá bán từ (VNĐ)</label>
                        <input
                            type="number"
                            min={0}
                            className="w-full p-2.5 border border-gray-300 rounded-lg"
                            value={priceMin}
                            onChange={(e) => setPriceMin(e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder="Min"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Giá bán đến (VNĐ)</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                min={0}
                                className="w-full p-2.5 border border-gray-300 rounded-lg"
                                value={priceMax}
                                onChange={(e) => setPriceMax(e.target.value === '' ? '' : Number(e.target.value))}
                                placeholder="Max"
                            />
                            <button
                                type="button"
                                onClick={() => { setFilterLoai(''); setFilterStatus(''); setPriceMin(''); setPriceMax(''); setSearchValue(''); }}
                                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 z-100000 bg-black/50 flex items-center justify-center px-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingItem?.MaSP ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
                            </h2>
                            <button type="button" onClick={closeForm} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">
                                &times;
                            </button>
                        </div>

                        <SanPhamForm
                            initialData={editingItem || undefined}
                            onSubmit={handleSubmit}
                            onCancel={closeForm}
                            isLoading={isSaving}
                            onImagesChanged={handleImagesChanged}
                        />
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-theme-sm border border-gray-200 max-h-[60vh] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                        <tr>
                            <th className="p-4 font-medium">Mã SP</th>
                            <th className="p-4 font-medium">Tên Sản Phẩm</th>
                            <th className="p-4 font-medium">Ảnh</th>
                            <th className="p-4 font-medium">Giá Vốn</th>
                            <th className="p-4 font-medium">Giá Bán</th>
                            <th className="p-4 font-medium">Trạng Thái</th>
                            <th className="p-4 font-medium">Loại SP</th>
                            <th className="p-4 font-medium w-32 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={10} className="p-4 text-center text-gray-500">
                                    Đang tải dữ liệu...
                                </td>
                            </tr>
                        ) : filteredSanPhams.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="p-4 text-center text-gray-500">
                                    Chưa có dữ liệu phù hợp
                                </td>
                            </tr>
                        ) : (
                            filteredSanPhams.map((item) => {
                                const statusMeta = getStatusMeta(item.TrangThai);

                                return (
                                    <tr key={item.MaSP} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-4 text-gray-600">{item.MaSP}</td>
                                        <td className="p-4 font-medium text-gray-800">{item.TenSanPham}</td>
                                        <td className="p-4">
                                            {(() => {
                                                const srcFromApi = resolveImageSrcForItem(item);
                                                if (srcFromApi) {
                                                    return (
                                                        <img
                                                            src={srcFromApi}
                                                            alt={item.TenSanPham}
                                                            className="w-12 h-12 object-cover rounded border border-gray-300"
                                                            onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2248%22 height=%2248%22%3E%3Crect fill=%22%23e5e7eb%22 width=%2248%22 height=%2248%22/%3E%3C/svg%3E'; }}
                                                        />
                                                    );
                                                }

                                                // fallback: derive from MaSP as before
                                                let src: string | undefined = undefined;
                                                if (item.MaSP) {
                                                    const m = String(item.MaSP).match(/(\d+)$/);
                                                    if (m) {
                                                        const n = Number(m[1]);
                                                        const pad = n <= 9 ? `0${n}` : String(n).padStart(2, '0');
                                                        src = `/images/product/product-${pad}.jpg`;
                                                    }
                                                }

                                                if (src) {
                                                    return (
                                                        <img
                                                            src={src}
                                                            alt={item.TenSanPham}
                                                            className="w-12 h-12 object-cover rounded border border-gray-300"
                                                            onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2248%22 height=%2248%22%3E%3Crect fill=%22%23e5e7eb%22 width=%2248%22 height=%2248%22/%3E%3C/svg%3E'; }}
                                                        />
                                                    );
                                                }

                                                return <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-400">No</div>;
                                            })()}
                                        </td>
                                        <td className="p-4 text-gray-700">{formatCurrency(item.GiaVon)}</td>
                                        <td className="p-4 text-gray-700 font-semibold">{formatCurrency(item.GiaBan)}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusMeta.className}`}>
                                                {statusMeta.label}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-700">{item.MaLoai || '-'}</td>

                                        <td className="p-6 text-center flex gap-2 justify-center">
                                            <button
                                                onClick={() => openEditForm(item)}
                                                className="text-blue-500 hover:text-blue-700 font-medium text-700 "
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.MaSP)}
                                                className="text-red-500 hover:text-red-700 font-medium text-700 "
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}