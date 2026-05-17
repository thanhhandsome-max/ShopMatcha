'use client';

import CartDrawer from "@/components/shop/CartDrawer";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/store/useCart";
import { History, LogOut, Menu, Search, ShoppingBag, User, X, MessageSquare } from "lucide-react";
import MatchaAssistantPanel from '@/components/shop/MatchaAssistantPanel';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const navLinks = [
  { href: "/", label: "HOME" },
  { href: "/products", label: "SẢN PHẨM" },
  { href: "/matcha-guide", label: "MATCHA GUIDE" },
  { href: "/contact", label: "LIÊN HỆ" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const totalItems = useCart((s) => s.totalItems);
  const { user, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const announcementRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    function update() {
      const annH = announcementRef.current?.offsetHeight || 0;
      const hdrH = headerRef.current?.offsetHeight || 0;
      setHeaderHeight(annH + hdrH);
    }
    update();
    const ro = new ResizeObserver(update);
    if (headerRef.current) ro.observe(headerRef.current);
    window.addEventListener('load', update);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('load', update);
      window.removeEventListener('resize', update);
      // cleanup body padding if unmounted
      try { document.body.style.paddingTop = ''; } catch (e) {}
    };
  }, []);

  // apply header height as body padding so fixed header doesn't cover content
  useEffect(() => {
    try {
      if (headerHeight) {
        document.body.style.paddingTop = `${headerHeight}px`;
        document.documentElement.style.setProperty('--site-header-height', `${headerHeight}px`);
      } else {
        document.body.style.paddingTop = '';
        document.documentElement.style.removeProperty('--site-header-height');
      }
    } catch (e) {
      // ignore (SSR safety)
    }
    return () => {
      try {
        document.body.style.paddingTop = '';
        document.documentElement.style.removeProperty('--site-header-height');
      } catch (e) {}
    };
  }, [headerHeight]);

  return (
    <>
      {/* Announcement Bar */}
      <div ref={announcementRef} className="bg-[#2D5016] text-white text-center py-2 text-xs tracking-widest font-medium">
        Giao hàng miễn phí toàn quốc! Free shipping on every order!
      </div>

      {/* Main Header — fixed to top; we render a spacer after it so page content isn't hidden */}
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 -ml-2 relative z-50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Desktop Nav - Left */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs tracking-[0.2em] font-medium transition-colors hover:text-[#2D5016] ${
                    pathname === link.href
                      ? "text-[#2D5016] border-b-2 border-[#2D5016] pb-1"
                      : "text-gray-700"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Logo - Center */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2 lg:relative lg:left-auto lg:translate-x-0 z-40">
              <h1 className="text-2xl lg:text-3xl font-bold tracking-[0.15em] text-[#2D5016] font-serif">
                HTDCHA
              </h1>
            </Link>

            {/* Right Actions */}
            <div className="flex items-center gap-3 relative z-50">

              {/* Search */}
              <button
                className="p-2 transform-gpu transition duration-300 hover:text-[#2D5016] hover:scale-110"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Tìm kiếm"
              >
                <Search size={18} />
              </button>

              {/* Matcha Assistant */}
              <Sheet open={assistantOpen} onOpenChange={setAssistantOpen}>
                <SheetTrigger asChild>
                  <button className="p-2 transform-gpu transition duration-300 hover:text-[#2D5016] hover:scale-110 relative" aria-label="Chuyên gia Matcha">
                    <MessageSquare size={18} />
                  </button>
                </SheetTrigger>
                <SheetContent aria-label="Chuyên gia Matcha" className="p-0 w-full sm:w-[520px] bg-white" style={{ zIndex: 110 }}>
                  <MatchaAssistantPanel />
                </SheetContent>
              </Sheet>

              {/* Account */}
              {user ? (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="p-2 transform-gpu transition duration-300 hover:text-[#2D5016] hover:scale-110"
                  >
                    <User size={18} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link
                        href="/account/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50"
                      >
                        <History size={16} /> Lịch sử đơn hàng
                      </Link>
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <LogOut size={16} /> Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/auth/login" className="p-2 transform-gpu transition duration-300 hover:text-[#2D5016] hover:scale-110 hidden sm:block" title="Đăng nhập">
                  <User size={18} />
                </Link>
              )}

              {/* Cart — FIX: chỉ render CartDrawer 1 lần duy nhất trong SheetContent */}
              <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                <SheetTrigger asChild>
                  <button className="p-2 transform-gpu transition duration-300 hover:text-[#2D5016] hover:scale-110 relative" aria-label="Giỏ hàng">
                    <ShoppingBag size={18} />
                    {totalItems() > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-[#2D5016] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {totalItems()}
                      </span>
                    )}
                  </button>
                </SheetTrigger>
                {/* ✅ CartDrawer chỉ ở đây, không render thêm lần nào nữa */}
                <SheetContent
                  className="p-0 w-full sm:w-[420px] bg-white"
                  style={{ zIndex: 100 }} // trên mọi thứ kể cả header z-50
                >
                  <CartDrawer onClose={() => setCartOpen(false)} />
                </SheetContent>
              </Sheet>

            </div>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="border-t border-gray-100 bg-white py-4 px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-b-2 border-gray-300 focus:border-[#2D5016] bg-transparent py-2 pr-10 text-sm outline-none transition-colors"
                autoFocus
              />
              <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2D5016] transition-colors">
                <Search size={16} />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white">
            <nav className="flex flex-col py-4 px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-3 text-sm tracking-[0.15em] font-medium border-b border-gray-50 ${
                    pathname === link.href ? "text-[#2D5016]" : "text-gray-700"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <div className="py-3 text-sm border-b border-gray-50">
                    <p className="text-gray-700 font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Link
                    href="/account/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-left py-3 text-sm tracking-[0.15em] font-medium text-gray-700 flex items-center gap-2 border-b border-gray-50"
                  >
                    <History size={16} /> Lịch sử đơn hàng
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="w-full text-left py-3 text-sm tracking-[0.15em] font-medium text-gray-700 flex items-center gap-2"
                  >
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 text-sm tracking-[0.15em] font-medium text-gray-700 flex items-center gap-2"
                >
                  <User size={16} /> Đăng nhập
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* spacer removed — body padding applied instead to avoid visible block */}
    </>
  );
}