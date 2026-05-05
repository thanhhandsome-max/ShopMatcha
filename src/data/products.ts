export interface Product {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  priceMax?: number;
  category: "matcha" | "sencha" | "accessories";
  image: string;
  imageHover: string;
  origin: string;
  weight: string;
  inStock: boolean;
  featured: boolean;
  tags: string[];
}

export const products: Product[] = [
  {
    id: "kyoto-premium-blend",
    name: "Kyoto Premium Matcha Blend - tin 30gr",
    description: "Hỗn hợp matcha cao cấp từ Kyoto, hương vị cân bằng hoàn hảo giữa ngọt và umami.",
    longDescription:
      "Kyoto Premium Matcha Blend là sự kết hợp tinh tế của những lá trà matcha tốt nhất từ vùng Uji, Kyoto. Được thu hoạch từ những vườn trà che nắng 3 tuần, bột matcha này mang đến hương vị umami đậm đà, hậu vị ngọt tự nhiên và màu xanh ngọc bích rực rỡ. Phù hợp cho cả usucha (trà loãng) và matcha latte.",
    price: 695000,
    priceMax: 950000,
    category: "matcha",
    image: "/images/products/kyotomatcha.webp",
    imageHover: "/images/products/kyotomatcha.webp",
    origin: "Uji, Kyoto, Nhật Bản",
    weight: "30gr",
    inStock: true,
    featured: true,
    tags: ["bestseller", "ceremonial"],
  },
  {
    id: "samidori-single-cultivar",
    name: "Samidori Single Cultivar Matcha - tin 30gr",
    description: "Matcha đơn giống Samidori, hương vị ngọt dịu đặc trưng với màu xanh tươi sáng.",
    longDescription:
      "Samidori là một trong những giống trà quý hiếm nhất của Nhật Bản, được trồng tại vùng Ujitawara, Kyoto. Matcha từ giống Samidori nổi tiếng với vị ngọt tự nhiên, ít đắng, và màu xanh lá tươi sáng đặc biệt. Đây là lựa chọn hoàn hảo cho những ai yêu thích matcha thuần khiết.",
    price: 895000,
    priceMax: 1150000,
    category: "matcha",
    image: "/images/products/samidori-matcha.png",
    imageHover: "/images/products/samidori-matcha.png",
    origin: "Ujitawara, Kyoto, Nhật Bản",
    weight: "30gr",
    inStock: true,
    featured: true,
    tags: ["premium", "single-cultivar"],
  },
  {
    id: "yuzu-sencha",
    name: "Yuzu Sencha Loose Tea Leaves - 20gr tin",
    description: "Trà sencha pha hương yuzu, sự kết hợp tươi mát giữa trà xanh và cam chanh Nhật.",
    longDescription:
      "Yuzu Sencha là sự kết hợp độc đáo giữa lá trà sencha chất lượng cao và hương yuzu tự nhiên từ Nhật Bản. Vị trà xanh tươi mát hòa quyện cùng hương cam chanh yuzu thơm ngát, tạo nên một trải nghiệm thưởng trà đặc biệt. Phù hợp pha nóng hoặc cold brew.",
    price: 590000,
    priceMax: 790000,
    category: "sencha",
    image: "/images/products/yuzusencha.webp",
    imageHover: "/images/products/yuzusencha.webp",
    origin: "Shizuoka, Nhật Bản",
    weight: "20gr",
    inStock: true,
    featured: true,
    tags: ["new", "sencha"],
  },
  {
    id: "okumidori-single-cultivar",
    name: "Okumidori Single Cultivar Matcha - tin 30gr",
    description: "Matcha đơn giống Okumidori, hương vị đậm đà với hậu vị umami kéo dài.",
    longDescription:
      "Okumidori là giống trà nổi tiếng với khả năng tạo ra matcha có hương vị umami mạnh mẽ và hậu vị kéo dài. Được trồng và thu hoạch thủ công tại Kyoto, matcha Okumidori có màu xanh đậm đặc trưng và kết cấu mịn như lụa. Lý tưởng cho koicha (trà đặc) và các công thức pha chế cao cấp.",
    price: 695000,
    priceMax: 950000,
    category: "matcha",
    image: "/images/products/okumidori.webp",
    imageHover: "/images/products/okumidori.webp",
    origin: "Uji, Kyoto, Nhật Bản",
    weight: "30gr",
    inStock: true,
    featured: true,
    tags: ["premium", "single-cultivar"],
  },
  {
    id: "matcha-starter-set",
    name: "Matcha Starter Set - Bộ dụng cụ pha matcha",
    description: "Bộ dụng cụ pha matcha truyền thống bao gồm chawan, chasen và chashaku.",
    longDescription:
      "Bộ Matcha Starter Set bao gồm đầy đủ dụng cụ cần thiết để pha matcha truyền thống tại nhà: chawan (bát matcha) bằng gốm thủ công, chasen (cây đánh matcha) bằng tre 80 nan, và chashaku (muỗng múc matcha) bằng tre. Mỗi sản phẩm được chế tác thủ công bởi nghệ nhân Nhật Bản.",
    price: 1250000,
    category: "accessories",
    image: "/images/products/matchaset.webp",
    imageHover: "/images/products/matchaset.webp",
    origin: "Nhật Bản",
    weight: "500gr",
    inStock: true,
    featured: false,
    tags: ["accessories", "gift"],
  },
  {
    id: "hojicha-powder",
    name: "Hojicha Roasted Tea Powder - tin 30gr",
    description: "Bột hojicha rang thơm, vị caramel ấm áp, ít caffeine, phù hợp uống buổi tối.",
    longDescription:
      "Hojicha là trà xanh Nhật Bản được rang ở nhiệt độ cao, tạo nên hương vị caramel ấm áp và màu nâu hổ phách đặc trưng. Với hàm lượng caffeine thấp hơn matcha, hojicha là lựa chọn lý tưởng cho buổi chiều và tối. Bột hojicha mịn của HTDCHA có thể dùng pha latte, làm bánh hoặc thưởng thức thuần túy.",
    price: 450000,
    category: "sencha",
    image: "/images/products/houjicha.webp",
    imageHover: "/images/products/houjicha.webp",
    origin: "Kyoto, Nhật Bản",
    weight: "30gr",
    inStock: true,
    featured: false,
    tags: ["hojicha", "low-caffeine"],
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "all") return products;
  return products.filter((p) => p.category === category);
}