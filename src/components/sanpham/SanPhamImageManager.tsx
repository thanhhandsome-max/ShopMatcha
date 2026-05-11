'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ISanPhamAnh } from '@/types';

type Props = {
    maSP: string;
    onImagesChanged?: () => void;
};

type ImageItem = ISanPhamAnh & { _saving?: boolean };

function normalizeImageSrc(value?: string) {
    const raw = String(value || '').trim();
    if (!raw) return '';

    if (/^https?:\/\//i.test(raw) || raw.startsWith('data:')) {
        return raw;
    }

    const normalized = raw.replace(/\\/g, '/').replace(/^\.+\//, '');
    if (/^\/product-[^/]+$/i.test(normalized)) {
        return `/images/product/${normalized.replace(/^\//, '')}`;
    }
    if (normalized.startsWith('images/')) return `/${normalized}`;
    if (normalized.startsWith('public/')) return `/${normalized.replace(/^public\//, '')}`;
    if (/^product-[^/]+$/i.test(normalized)) return `/images/product/${normalized}`;
    return `/${normalized}`;
}

export const SanPhamImageManager: React.FC<Props> = ({ maSP, onImagesChanged }) => {
    const [images, setImages] = useState<ImageItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const loadImages = async () => {
        if (!maSP) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/san-pham/${encodeURIComponent(maSP)}/anh`);
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Load images failed');
            setImages((json.data || []) as ImageItem[]);
        } catch (err) {
            console.error('Không thể tải ảnh sản phẩm', err);
            setImages([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setImages([]);
        setUploadError('');
        setSelectedFiles(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        loadImages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [maSP]);

    const uploadFiles = async () => {
        if (!selectedFiles || selectedFiles.length === 0) return;

        setUploadError('');
        setUploading(true);
        try {
            for (const file of Array.from(selectedFiles)) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('maSP', maSP);

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || 'Upload failed');
            }

            setSelectedFiles(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            await loadImages();
            // notify parent that images changed
            try { onImagesChanged?.(); } catch (e) { /* ignore */ }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Upload ảnh thất bại';
            setUploadError(message);
        } finally {
            setUploading(false);
        }
    };

    const setMainImage = async (maAnh: string) => {
        try {
            const res = await fetch(`/api/san-pham/${encodeURIComponent(maSP)}/anh`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ MaAnh: maAnh, AnhChinh: 1 }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Update failed');
            await loadImages();
            try { onImagesChanged?.(); } catch (e) { /* ignore */ }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Không thể đặt ảnh chính');
        }
    };

    const updateOrder = async (maAnh: string, thuTu: number) => {
        try {
            const res = await fetch(`/api/san-pham/${encodeURIComponent(maSP)}/anh`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ MaAnh: maAnh, ThuTu: thuTu }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Update failed');
            await loadImages();
            try { onImagesChanged?.(); } catch (e) { /* ignore */ }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Không thể cập nhật thứ tự ảnh');
        }
    };

    const deleteImage = async (maAnh: string) => {
        if (!confirm('Xóa ảnh này?')) return;

        try {
            const res = await fetch(`/api/san-pham/${encodeURIComponent(maSP)}/anh`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ MaAnh: maAnh }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Delete failed');
            await loadImages();
                try { onImagesChanged?.(); } catch (e) { /* ignore */ }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Không thể xóa ảnh');
        }
    };

    return (
        <div className="mt-6 border border-gray-200 rounded-xl p-4 bg-gray-50">
            <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                    <h3 className="text-base font-semibold text-gray-800">Ảnh sản phẩm</h3>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 mb-4">
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="block w-full text-sm text-gray-600 file:mr-4 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-brand-500 file:text-white hover:file:bg-brand-600"
                    onChange={(e) => setSelectedFiles(e.target.files)}
                />
                <button
                    type="button"
                    disabled={uploading || !selectedFiles || selectedFiles.length === 0}
                    onClick={uploadFiles}
                    className="px-4 py-2 rounded-lg bg-brand-500 text-white font-medium disabled:opacity-60"
                >
                    {uploading ? 'Đang tải...' : 'Tải ảnh lên'}
                </button>
            </div>

            {uploadError && (
                <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {uploadError}
                </div>
            )}

            <div className="mb-3 text-sm text-gray-500">
                Mã sản phẩm: <span className="font-medium text-gray-700">{maSP}</span>
                {' '}
                - số ảnh: <span className="font-medium text-gray-700">{images.length}</span>
            </div>

            {loading ? (
                <div className="text-sm text-gray-500">Đang tải danh sách ảnh...</div>
            ) : images.length === 0 ? (
                <div className="text-sm text-gray-500">Chưa có ảnh nào cho sản phẩm này.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {images.map((image) => (
                        <div key={image.MaAnh} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3 flex items-center justify-center">
                                {console.log('[SanPhamImageManager] render image =', image.MaAnh, image.DuongDanAnh, normalizeImageSrc(image.DuongDanAnh))}
                                <img
                                    src={normalizeImageSrc(image.DuongDanAnh)}
                                    alt={image.MaAnh}
                                    title={Number(image.AnhChinh) === 1 ? 'Ảnh chính' : 'Nhấn để đặt làm ảnh chính'}
                                    className={`w-full h-full object-cover ${Number(image.AnhChinh) === 1 ? '' : 'cursor-pointer hover:opacity-90'}`}
                                    onClick={() => {
                                        if (Number(image.AnhChinh) !== 1) setMainImage(image.MaAnh);
                                    }}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22480%22 height=%22480%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22480%22 height=%22480%22/%3E%3C/svg%3E';
                                    }}
                                />
                                {Number(image.AnhChinh) === 1 && (
                                    <span className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium bg-emerald-600 text-white">
                                        Ảnh chính
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2">

                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-gray-500 whitespace-nowrap">Thứ tự</label>
                                    <input
                                        type="number"
                                        defaultValue={image.ThuTu ?? 9999}
                                        min={0}
                                        className="w-24 p-2 border border-gray-300 rounded-lg text-sm"
                                        onBlur={(e) => {
                                            const next = Number(e.target.value);
                                            if (!Number.isNaN(next) && next !== Number(image.ThuTu ?? 9999)) {
                                                updateOrder(image.MaAnh, next);
                                            }
                                        }}
                                    />
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setMainImage(image.MaAnh)}
                                        className="px-3 py-2 text-sm rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    >
                                        Đặt làm ảnh chính
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => deleteImage(image.MaAnh)}
                                        className="px-3 py-2 text-sm rounded-lg bg-rose-50 text-rose-700 border border-rose-200"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};