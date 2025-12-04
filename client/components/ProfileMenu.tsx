import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

export default function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const { userPoints } = useCart();
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/");
  };

  if (!user) return null;

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-muted rounded-lg transition-colors flex items-center justify-center"
        title={user.full_name}
      >
        <User className="w-5 h-5 text-foreground" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-lg z-50">
          {/* User Info */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{user.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Points Info */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Poin Anda</span>
              <span className="font-semibold text-sm">{userPoints} poin</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Setiap pembelian menghasilkan poin
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/");
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Profil Saya
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                // Navigate to settings/profile edit page if it exists
                navigate("/");
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Pengaturan
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-border p-2">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 rounded"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
