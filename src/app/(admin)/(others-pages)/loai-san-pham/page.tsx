// src/app/loai-san-pham/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { ILoaiSanPham } from '@/types';
import { loaiSanPhamService } from '@/services/LoaiSanPham.service';

export default function LoaiSanPhamPage() {
    // 2. State quản lý dữ liệu
    const [loaiSPs, setLoaiSPs] = useState<ILoaiSanPham[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // State cho tìm kiếm
    const [searchTen, setSearchTen] = useState('');

    // State cho Form thêm mới (modal/form)
    const [showAddForm, setShowAddForm] = useState(false);
    const [newMaLSP, setNewMaLSP] = useState('');
    const [newTenLSP, setNewTenLSP] = useState('');

    // State cho Form sửa inline
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingTen, setEditingTen] = useState('');

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await loaiSanPhamService.getAll();
            setLoaiSPs(data);
        } catch (error) {
            console.error('Lỗi tải dữ liệu', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTenLSP.trim()) return;

        try {
            await loaiSanPhamService.create({
                MaLSP: newMaLSP || `LSP${Date.now()}`.substring(0, 10),
                TenLSP: newTenLSP
            });
            setNewMaLSP('');
            setNewTenLSP('');
            setShowAddForm(false);
            loadData();
        } catch (error) {
            alert('Thêm thất bại!');
        }
    };

    const handleCloseAddForm = () => {
        setShowAddForm(false);
        setNewMaLSP('');
        setNewTenLSP('');
    };

    const handleDelete = async (maLSP: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa?')) return;
        try {
            await loaiSanPhamService.delete(maLSP);
            loadData();
        } catch (error) {
            alert('Xóa thất bại! Có thể do đang có Sản Phẩm thuộc loại này.');
        }
    };

    const handleEdit = (maLSP: string, tenLSP: string) => {
        setEditingId(maLSP);
        setEditingTen(tenLSP);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTen.trim() || !editingId) return;
        try {
            await loaiSanPhamService.update(editingId, editingTen);
            setEditingId(null);
            setEditingTen('');
            loadData();
        } catch (error) {
            alert('Sửa thất bại!');
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingTen('');
    };

    const filteredLoaiSPs = loaiSPs.filter((item) =>
        item.MaLSP.toLowerCase().includes(searchTen.toLowerCase()) ||
        item.TenLSP.toLowerCase().includes(searchTen.toLowerCase())
    );

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản Lý Danh Mục: Loại Sản Phẩm</h1>

            {/* Khung tìm kiếm + Nút thêm mới */}
            <div className="mb-6 flex gap-3">
                <div className="flex-1 flex gap-3 bg-white p-4 rounded-lg shadow-theme-sm border border-gray-200">
                    <input
                        type="text"
                        placeholder="Tìm kiếm loại sản phẩm..."
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand-500"
                        value={searchTen}
                        onChange={(e) => setSearchTen(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-brand-500 text-white px-6 py-2 rounded-lg hover:bg-brand-600 transition font-medium whitespace-nowrap"
                >
                    + Thêm Mới
                </button>
            </div>

            {/* Modal thêm mới */}
            {showAddForm && (
                <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Thêm Loại Sản Phẩm Mới</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên Loại Sản Phẩm <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nhập tên loại sản phẩm..."
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand-500"
                                    value={newTenLSP}
                                    onChange={(e) => setNewTenLSP(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-3 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseAddForm}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600 transition"
                                >
                                    Lưu
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bảng danh sách */}
            <div className="bg-white rounded-lg shadow-theme-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                        <tr>
                            <th className="p-4 font-medium">Mã Loại</th>
                            <th className="p-4 font-medium">Tên Loại Sản Phẩm</th>
                            <th className="p-4 font-medium w-32 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={3} className="p-4 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
                        ) : loaiSPs.length === 0 ? (
                            <tr><td colSpan={3} className="p-4 text-center text-gray-500">Chưa có dữ liệu</td></tr>
                        ) : filteredLoaiSPs.length === 0 ? (
                            <tr><td colSpan={3} className="p-4 text-center text-gray-500">Không tìm thấy kết quả</td></tr>
                        ) : (
                            filteredLoaiSPs.map((item) => (
                                editingId === item.MaLSP ? (
                                    <tr key={item.MaLSP} className="border-b border-gray-100 bg-blue-50">
                                        <td className="p-4 text-gray-600">{item.MaLSP}</td>
                                        <td className="p-4">
                                            <form onSubmit={handleUpdate} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={editingTen}
                                                    onChange={(e) => setEditingTen(e.target.value)}
                                                    className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand-500"
                                                    autoFocus
                                                />
                                                <button type="submit" className="bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 text-sm">
                                                    Lưu
                                                </button>
                                                <button type="button" onClick={handleCancelEdit} className="bg-gray-400 text-white px-3 py-2 rounded-md hover:bg-gray-500 text-sm">
                                                    Hủy
                                                </button>
                                            </form>
                                        </td>
                                        <td className="p-4"></td>
                                    </tr>
                                ) : (
                                    <tr key={item.MaLSP} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-4 text-gray-600">{item.MaLSP}</td>
                                        <td className="p-4 font-medium text-gray-800">{item.TenLSP}</td>
                                        <td className="p-4 text-center flex gap-2 justify-center">
                                            <button
                                                onClick={() => handleEdit(item.MaLSP, item.TenLSP)}
                                                className="text-blue-500 hover:text-blue-700 font-medium text-sm"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.MaLSP)}
                                                className="text-red-500 hover:text-red-700 font-medium text-sm"
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                )
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}