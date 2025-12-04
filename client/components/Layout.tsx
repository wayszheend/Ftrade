import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, Search, ShoppingCart, User, Menu, X, Zap } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import ProfileMenu from "@/components/ProfileMenu";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount, userPoints } = useCart();
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 font-bold text-2xl">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-primary">Ftrade</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                to="/"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Beranda
              </Link>
              <Link
                to="/marketplace"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Pasar
              </Link>
              <Link
                to="/about"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Tentang Kami
              </Link>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Search className="w-5 h-5 text-foreground" />
              </button>
              {isAuthenticated && (
                <div className="flex items-center gap-3 px-3 py-2 bg-muted rounded-lg">
                  <Zap className="w-4 h-4 text-secondary" />
                  <span className="text-sm font-semibold text-foreground">{userPoints}</span>
                </div>
              )}
              <Link to="/cart">
                <button className="p-2 hover:bg-muted rounded-lg transition-colors relative">
                  <ShoppingCart className="w-5 h-5 text-foreground" />
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-secondary rounded-full flex items-center justify-center text-xs font-bold text-secondary-foreground">
                      {cartCount}
                    </span>
                  )}
                </button>
              </Link>
              {isAuthenticated ? (
                <ProfileMenu />
              ) : (
                <>
                  <Link to="/login">
                    <Button size="sm" variant="ghost">
                      Masuk
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      Mulai Berjualan
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-border pb-4 pt-4 space-y-3">
              <Link
                to="/"
                className="block text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Beranda
              </Link>
              <Link
                to="/marketplace"
                className="block text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Pasar
              </Link>
              <Link
                to="/about"
                className="block text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Tentang Kami
              </Link>
              {isAuthenticated && (
                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                  <Zap className="w-4 h-4 text-secondary" />
                  <span className="text-sm font-semibold text-foreground">{userPoints} poin</span>
                </div>
              )}
              <div className="flex items-center gap-2 pt-4">
                {isAuthenticated ? (
                  <Link to="/" className="flex-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profil
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="flex-1">
                      <Button size="sm" variant="outline" className="w-full">
                        Masuk
                      </Button>
                    </Link>
                    <Link to="/register" className="flex-1">
                      <Button
                        size="sm"
                        className="w-full bg-primary hover:bg-primary/90"
                      >
                        Mulai Berjualan
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 font-bold text-lg mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                  <Leaf className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-primary">Ftrade</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Menghubungkan petani dan pembeli untuk hasil panen segar berkualitas.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-sm mb-4">Platform</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/marketplace"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Jelajahi Produk
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Menjadi Penjual
                  </Link>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Cerita Kami
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-sm mb-4">Dukungan</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Pusat Bantuan
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Hubungi Kami
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Info Pengiriman
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-sm mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Syarat & Ketentuan
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Kebijakan Privasi
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Kebijakan Cookie
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground">
              © 2024 Ftrade. Semua hak dilindungi.
            </p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Twitter
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Facebook
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
