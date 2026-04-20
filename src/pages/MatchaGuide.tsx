'use client';

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const fieldImage = "https://mgx-backend-cdn.metadl.com/generate/images/618746/2026-04-09/cc543ae9-1f31-403d-b2bf-8b80c519d337.png";
const matchaPowder = "https://mgx-backend-cdn.metadl.com/generate/images/618746/2026-04-09/c28b23f3-9da1-4efb-982d-89d459bd2427.png";
const matchaLatte = "https://mgx-backend-cdn.metadl.com/generate/images/618746/2026-04-09/842bcae5-9110-4f1b-8bb9-5ada7d092124.png";
const heroImage = "https://mgx-backend-cdn.metadl.com/generate/images/618746/2026-04-09/88544963-be0e-491f-abe3-dbfd08bebd77.png";

const guides = [
  {
    title: "Kyoto – Cái nôi của Matcha",
    image: fieldImage,
    excerpt:
      "Matcha có nguồn gốc từ hơn 800 năm trước tại Nhật Bản. Vùng Uji, Kyoto được xem là nơi sản xuất matcha tốt nhất thế giới nhờ khí hậu, thổ nhưỡng và truyền thống canh tác lâu đời.",
    content: [
      "Matcha (抹茶) nghĩa đen là \"trà bột\", được phát minh vào thế kỷ 12 bởi nhà sư Eisai khi mang hạt trà từ Trung Quốc về Nhật Bản.",
      "Vùng Uji và Ujitawara tại Kyoto có điều kiện tự nhiên lý tưởng: sương mù dày đặc vào buổi sáng, nhiệt độ chênh lệch ngày đêm lớn, và đất giàu khoáng chất.",
      "Ngày nay, matcha ceremonial grade từ Kyoto vẫn được coi là chuẩn mực vàng cho chất lượng matcha trên toàn thế giới.",
    ],
  },
  {
    title: "Cách pha Matcha truyền thống",
    image: heroImage,
    excerpt:
      "Hướng dẫn chi tiết cách pha matcha theo phong cách truyền thống Nhật Bản với hai kiểu: Usucha (trà loãng) và Koicha (trà đặc).",
    content: [
      "Usucha (薄茶 - trà loãng): Sử dụng 1-2g matcha (khoảng 1 chashaku) với 70-80ml nước nóng 80°C. Đánh bằng chasen theo hình chữ W nhanh trong 15-20 giây cho đến khi tạo lớp bọt mịn.",
      "Koicha (濃茶 - trà đặc): Sử dụng 3-4g matcha với 40ml nước nóng 80°C. Khuấy nhẹ nhàng theo hình tròn (không đánh bọt) để tạo ra hỗn hợp sệt như mật ong.",
      "Lưu ý: Luôn rây matcha qua rây mịn trước khi pha để tránh vón cục. Nước không được sôi 100°C vì sẽ làm matcha bị đắng.",
    ],
  },
  {
    title: "Công thức Matcha Latte hoàn hảo",
    image: matchaLatte,
    excerpt:
      "Bí quyết pha matcha latte thơm ngon tại nhà chỉ với 3 bước đơn giản, phù hợp cho cả matcha latte nóng và đá.",
    content: [
      "Bước 1: Rây 2g matcha vào bát, thêm 30ml nước nóng 80°C, đánh đều bằng chasen cho đến khi mịn và không còn vón cục.",
      "Bước 2: Đun nóng 200ml sữa tươi (hoặc sữa yến mạch) đến khoảng 65°C. Dùng máy tạo bọt sữa để tạo lớp foam mịn.",
      "Bước 3: Rót sữa nóng vào ly, sau đó từ từ đổ matcha đã pha lên trên. Có thể thêm mật ong hoặc đường nếu thích. Với matcha latte đá, thêm đá viên vào ly trước khi rót.",
    ],
  },
  {
    title: "Lợi ích sức khỏe của Matcha",
    image: matchaPowder,
    excerpt:
      "Matcha không chỉ là thức uống ngon mà còn mang lại nhiều lợi ích sức khỏe vượt trội nhờ hàm lượng chất chống oxy hóa cao.",
    content: [
      "Chất chống oxy hóa: Matcha chứa catechin EGCG cao gấp 137 lần so với trà xanh thông thường, giúp bảo vệ tế bào khỏi tổn thương.",
      "L-Theanine: Axit amin tự nhiên giúp tăng cường sự tập trung, giảm stress mà không gây buồn ngủ. Kết hợp với caffeine tạo ra trạng thái \"calm alertness\".",
      "Tăng cường trao đổi chất: Matcha giúp đốt cháy calo hiệu quả hơn 25% trong quá trình tập luyện. Chlorophyll trong matcha còn hỗ trợ giải độc cơ thể tự nhiên.",
    ],
  },
];

export default function MatchaGuide() {
  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <Header />

      {/* Page Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <nav className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-4">
            <Link href="/" className="hover:text-[#2D5016] transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-gray-900">Matcha Guide</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-serif text-[#2D5016] tracking-wide mb-2">
            Matcha Guide
          </h1>
          <p className="text-gray-500 text-sm tracking-wide">
            Khám phá thế giới matcha cùng HTDCHA
          </p>
        </div>
      </div>

      {/* Articles */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {guides.map((guide, index) => (
          <article key={index} className="group">
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${index % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
              <div className={index % 2 === 1 ? "md:order-2" : ""}>
                <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                  <img
                    src={guide.image}
                    alt={guide.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </div>
              <div className={index % 2 === 1 ? "md:order-1" : ""}>
                <h2 className="text-xl md:text-2xl font-serif text-[#2D5016] mb-4">
                  {guide.title}
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{guide.excerpt}</p>
                {guide.content.map((para, i) => (
                  <p key={i} className="text-gray-500 text-sm leading-relaxed mb-3">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      <Footer />
    </div>
  );
}