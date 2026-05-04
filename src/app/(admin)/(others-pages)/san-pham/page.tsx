'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ISanPham } from '@/types';
import { sanPhamService } from '@/services/SanPham.service';
import { SanPhamForm } from '@/components/sanpham/SanPhamForm';

type FormMode = 'create' | 'edit';

export default function SanPhamPage() {
    const [sanPhams, setSanPhams] = useState<ISanPham[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchValue, setSearchValue] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formMode, setFormMode] = useState<FormMode>('create');
    const [editingItem, setEditingItem] = useState<ISanPham | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await sanPhamService.getAll();
            setSanPhams(data);
        } catch (err) {
            console.error('Lỗi tải dữ liệu', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const openCreateForm = () => {
        setFormMode('create');
        setEditingItem(null);
        setShowForm(true);
    };

    const openEditForm = (item: ISanPham) => {
        setFormMode('edit');
        setEditingItem(item);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setFormMode('create');
        setEditingItem(null);
        setIsSaving(false);
    };

    const handleSubmit = async (formData: Partial<ISanPham>) => {
        setIsSaving(true);
        try {
            if (formMode === 'create') {
                await sanPhamService.create(formData);
            } else if (editingItem?.MaSP) {
                await sanPhamService.update(editingItem.MaSP, formData);
            }

            closeForm();
            loadData();
        } catch (err) {
            setIsSaving(false);
            alert(`${formMode === 'create' ? 'Thêm' : 'Sửa'} sản phẩm thất bại: ` + (err instanceof Error ? err.message : 'Unknown error'));
        }
    };

    const handleDelete = async (maSP: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;

        try {
            await sanPhamService.delete(maSP);
            loadData();
        } catch (err) {
            alert('Xóa sản phẩm thất bại: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    };

    const filteredSanPhams = useMemo(() => {
        const keyword = searchValue.trim().toLowerCase();
        if (!keyword) return sanPhams;

        return sanPhams.filter((item) => {
            const tenSanPham = String(item.TenSanPham || '').toLowerCase();
            const maSP = String(item.MaSP || '').toLowerCase();
            const maCode = String(item.MaCodeSp || '').toLowerCase();
            const maLoai = String(item.MaLoai || '').toLowerCase();
            return tenSanPham.includes(keyword) || maSP.includes(keyword) || maCode.includes(keyword) || maLoai.includes(keyword);
        });
    }, [sanPhams, searchValue]);

    const formatCurrency = (value?: number) => {
        if (value === undefined || value === null) return '-';
        return Number(value).toLocaleString('vi-VN');
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
                    <p className="text-sm text-gray-500 mt-1">Danh sách sản phẩm theo schema mới</p>
                </div>
                <button
                    onClick={openCreateForm}
                    className="bg-brand-500 text-white px-5 py-2 rounded-lg hover:bg-brand-600 transition font-medium"
                >
                    + Thêm Mới
                </button>
            </div>

            <div className="mb-6 bg-white p-4 rounded-lg shadow-theme-sm border border-gray-200">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo mã, mã code, mã loại hoặc tên sản phẩm..."
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-500"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                />
            </div>

            {showForm && (
                <div className="fixed inset-0 z-100000 bg-black/50 flex items-center justify-center px-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-gray-800">
                                {formMode === 'create' ? 'Thêm Sản Phẩm Mới' : 'Sửa Sản Phẩm'}
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
                        />
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-theme-sm border border-gray-200 overflow-hidden">
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
                                                // Prefer explicit Anh from API, otherwise try to derive filename from MaSP
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

                                        <td className="p-4 text-center flex gap-2 justify-center">
                                            <button
                                                onClick={() => openEditForm(item)}
                                                className="text-blue-500 hover:text-blue-700 font-medium text-sm"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.MaSP)}
                                                className="text-red-500 hover:text-red-700 font-medium text-sm"
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