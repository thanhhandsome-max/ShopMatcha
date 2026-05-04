// src/components/LoaiSanPham/LoaiSanPhamSelect.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { ILoaiSanPham } from '@/types';
import { loaiSanPhamService } from '@/services/LoaiSanPham.service';

interface Props {
    value?: string;
    onChange: (value: string) => void;
    error?: string;
}

export const LoaiSanPhamSelect: React.FC<Props> = ({ value, onChange, error }) => {
    const [danhSach, setDanhSach] = useState<ILoaiSanPham[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLoaiSP = async () => {
            try {
                const data = await loaiSanPhamService.getAll();
                setDanhSach(data);
            } catch (err) {
                console.error('Lỗi khi tải loại sản phẩm:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLoaiSP();
    }, []);

    return (
        <div className="w-full md:col-span-2">

            <select
                className={`w-full p-2.5 border rounded-lg outline-none transition-colors ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-brand-500'
                    }`}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                disabled={isLoading}
            >
                <option value="" disabled>
                    {isLoading ? 'Đang tải...' : '-- Chọn loại sản phẩm --'}
                </option>
                {danhSach.map((item) => (
                    <option
                        key={(item as any).MaLoai || (item as any).MaLSP}
                        value={(item as any).MaLoai || (item as any).MaLSP || ''}
                    >
                        {(item as any).TenLoai || (item as any).TenLSP || ''}
                    </option>
                ))}
            </select>
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
};
