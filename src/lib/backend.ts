export interface FrontendProduct {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  priceMax?: number;
  category: 'matcha' | 'sencha' | 'accessories';
  image: string;
  imageHover: string;
  origin: string;
  weight: string;
  inStock: boolean;
  featured: boolean;
  tags: string[];
}

interface BackendProductResponse {
  success: boolean;
  data: any;
  error?: string;
}

const API_BASE_PATH = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

const mapCategory = (categoryName?: string): FrontendProduct['category'] => {
  const normalized = String(categoryName || '').toLowerCase();

  if (normalized.includes('access') || normalized.includes('tool') || normalized.includes('dụng cụ') || normalized.includes('kit')) {
    return 'accessories';
  }

  if (normalized.includes('sencha') || normalized.includes('hojicha') || normalized.includes('houjicha')) {
    return 'sencha';
  }

  return 'matcha';
};

const mapInStock = (product: any): boolean => {
  if (typeof product.totalStock === 'number') {
    return product.totalStock > 0;
  }

  if (Array.isArray(product.tonkho)) {
    return product.tonkho.some((stock: any) => Number(stock.SoLuong) > 0);
  }

  if (Array.isArray(product.tonkhocuahang)) {
    return product.tonkhocuahang.some((stock: any) => Number(stock.SoLuong) > 0);
  }

  return Boolean(product.TrangThai === '1');
};

const mapImage = (product: any): string => {
  if (product.sanpham_anh && Array.isArray(product.sanpham_anh) && product.sanpham_anh.length > 0) {
    return product.sanpham_anh[0].DuongDanAnh || product.sanpham_anh[0].Anh || '';
  }

  return product.image || product.anhDaiDien || '';
};

const mapDescription = (product: any): string => {
  return product.Mota || product.MoTa || product.description || product.DanhGia || '';
};

export const mapBackendProduct = (product: any): FrontendProduct => {
  const image = mapImage(product) || 'https://via.placeholder.com/500?text=No+Image';
  const name = product.TenSP || product.name || 'Sản phẩm';
  const categoryName = product.loaisanpham?.TenLoai || product.MaLoai || product.category;

  return {
    id: product.MaSP || product.id || String(product.uuid || ''),
    name,
    description: mapDescription(product),
    longDescription: product.MoTa || product.Mota || product.description || product.details?.description || '',
    price: Number(product.GiaBan ?? product.price ?? 0),
    priceMax: typeof product.GiaBan === 'number' ? undefined : undefined,
    category: mapCategory(categoryName),
    image,
    imageHover: image,
    origin: product.XuatXu || product.origin || product.details?.origin || '',
    weight: product.TrongLuong || product.weight || product.details?.weight || 'N/A',
    inStock: mapInStock(product),
    featured: false,
    tags: [],
  };
};

const getApiUrl = (path: string): string => {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_PATH}${normalized}`;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json()) as BackendProductResponse;

  if (!response.ok || !payload?.success) {
    const message = payload?.error || `Backend request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload.data as T;
};

export const fetchProductList = async (options?: { limit?: number }) => {
  const query = new URLSearchParams();
  if (options?.limit) {
    query.set('limit', String(options.limit));
  }

  const response = await fetch(getApiUrl(`/products?${query.toString()}`));
  return handleResponse<{ products: any[] }>(response);
};

export const fetchProductById = async (id: string) => {
  const response = await fetch(getApiUrl(`/products/${id}`));
  return handleResponse<any>(response);
};

export const fetchRelatedProducts = async (id: string) => {
  const response = await fetch(getApiUrl(`/products/${id}/related`));
  return handleResponse<any[]>(response);
};

export const searchProducts = async (query: string, limit = 20) => {
  const params = new URLSearchParams();
  params.set('q', query);
  if (limit) {
    params.set('limit', String(limit));
  }

  const response = await fetch(getApiUrl(`/search?${params.toString()}`));
  return handleResponse<{ query: string; results: any[]; count: number }>(response);
};
