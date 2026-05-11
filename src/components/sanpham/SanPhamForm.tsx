// src/components/SanPhamForm.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { ISanPham } from '@/types';
import { LoaiSanPhamSelect } from '@/components/LoaiSanPham/LoaiSanPhamSelect';
import { SanPhamImageManager } from '@/components/sanpham/SanPhamImageManager';

interface Props {
    initialData?: Partial<ISanPham>;
    onSubmit: (data: Partial<ISanPham>) => Promise<{ MaSP?: string } | void>;
    isLoading?: boolean;
    onCancel?: () => void;
    onImagesChanged?: () => void;
}

export const SanPhamForm: React.FC<Props> = ({ initialData, onSubmit, isLoading, onCancel, onImagesChanged }) => {
    const [formData, setFormData] = useState<Partial<ISanPham>>({
        MaSP: initialData?.MaSP || '',
        TenSanPham: initialData?.TenSanPham || '',
        MaCodeSp: initialData?.MaCodeSp || '',
        GiaVon: initialData?.GiaVon || 0,
        GiaBan: initialData?.GiaBan || 0,
        MoTa: initialData?.MoTa || '',
        TrangThai: initialData?.TrangThai ?? 1,
        MaLoai: initialData?.MaLoai || '',
        NgayTao: initialData?.NgayTao || new Date().toISOString(),
    });
    const [savedMaSP, setSavedMaSP] = useState<string>(initialData?.MaSP || '');

    useEffect(() => {
        setFormData({
            MaSP: initialData?.MaSP || '',
            TenSanPham: initialData?.TenSanPham || '',
            MaCodeSp: initialData?.MaCodeSp || '',
            GiaVon: initialData?.GiaVon || 0,
            GiaBan: initialData?.GiaBan || 0,
            MoTa: initialData?.MoTa || '',
            TrangThai: initialData?.TrangThai ?? 1,
            MaLoai: initialData?.MaLoai || '',
            NgayTao: initialData?.NgayTao || new Date().toISOString(),
        });
        setSavedMaSP(initialData?.MaSP || '');
    }, [initialData]);

    const handleChange = (field: keyof ISanPham, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate bắt buộc
        if (!formData.TenSanPham || !formData.GiaBan || !formData.MaLoai) {
            alert('Vui lòng điền đầy đủ: Tên Sản Phẩm, Giá Bán và Chọn Loại Sản Phẩm!');
            return;
        }

        if (formData.GiaBan <= 0) {
            alert('Giá bán phải lớn hơn 0!');
            return;
        }

        if (formData.GiaVon && formData.GiaVon < 0) {
            alert('Giá vốn không được âm!');
            return;
        }

        const result = await onSubmit(formData);
        const nextMaSP = result && typeof result === 'object' && 'MaSP' in result ? String(result.MaSP || '') : '';
        if (nextMaSP) {
            setSavedMaSP(nextMaSP);
        }
    };

    const imageMaSP = initialData?.MaSP || savedMaSP;

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-theme-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                {/* 1. Mã SP (Read-only, auto-generate) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã SP (ID)</label>
                    <input
                        type="text"
                        readOnly
                        className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                        value={formData.MaSP || '(Tự động tạo)'}
                    />
                </div>

                {/* 2. Mã Code/SKU */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã Code / SKU</label>
                    <input
                        type="text"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-500"
                        value={formData.MaCodeSp || ''}
                        onChange={(e) => handleChange('MaCodeSp', e.target.value)}
                        placeholder="VD: SP-001, SKU-2024..."
                    />
                </div>

                {/* 3. Tên Sản Phẩm (Chiếm 2 cột) */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên Sản Phẩm <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-500"
                        value={formData.TenSanPham || ''}
                        onChange={(e) => handleChange('TenSanPham', e.target.value)}
                        placeholder="VD: Trà Xanh Matcha Đặc Biệt..."
                        required
                    />
                </div>

                {/* 4. Loại Sản Phẩm */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại Sản Phẩm <span className="text-red-500">*</span></label>
                    <LoaiSanPhamSelect
                        value={formData.MaLoai || ''}
                        onChange={(val) => handleChange('MaLoai', val)}
                    />
                </div>

                {/* 5. Giá Vốn */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá Vốn (VNĐ)</label>
                    <input
                        type="number"
                        min="0"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-500"
                        value={formData.GiaVon || 0}
                        onChange={(e) => handleChange('GiaVon', Number(e.target.value))}
                        placeholder="0"
                    />
                </div>

                {/* 6. Giá Bán */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá Bán (VNĐ) <span className="text-red-500">*</span></label>
                    <input
                        type="number"
                        min="0"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-500"
                        value={formData.GiaBan || 0}
                        onChange={(e) => handleChange('GiaBan', Number(e.target.value))}
                        placeholder="0"
                        required
                    />
                </div>

                {/* 7. Trạng Thái */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng Thái</label>
                    <select
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-500"
                        value={formData.TrangThai ?? 1}
                        onChange={(e) => handleChange('TrangThai', Number(e.target.value))}
                    >
                        <option value={1}>1 - Đang bán</option>
                        <option value={2}>2 - Hết hàng</option>
                        <option value={0}>0 - Ngừng kinh doanh</option>
                    </select>
                </div>

                {/* 8. Ngày Tạo (Read-only) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày Tạo</label>
                    <input
                        type="text"
                        readOnly
                        className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                        value={formData.NgayTao ? new Date(formData.NgayTao).toLocaleDateString('vi-VN') : ''}
                    />
                </div>

                {/* 9. Mô Tả (Chiếm 2 cột) */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô Tả Chi Tiết</label>
                    <textarea
                        rows={4}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-500"
                        value={formData.MoTa || ''}
                        onChange={(e) => handleChange('MoTa', e.target.value)}
                        placeholder="Nhập mô tả sản phẩm, thông tin chi tiết..."
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                    type="button"
                    onClick={onCancel || (() => window.history.back())}
                    className="px-5 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                    Hủy bỏ
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2 bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 transition disabled:opacity-70"
                >
                    {isLoading ? 'Đang lưu...' : 'Lưu Sản Phẩm'}
                </button>
            </div>

            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                <strong className="font-semibold">Hướng dẫn:</strong>{' '}
                Để thêm ảnh cho sản phẩm, hãy lưu sản phẩm trước !
            </div>

            {imageMaSP && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                    <SanPhamImageManager maSP={imageMaSP} onImagesChanged={onImagesChanged} />
                </div>
            )}
        </form>
    );
};
