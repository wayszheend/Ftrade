import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { Leaf, ArrowRight } from "lucide-react";
import { apiLogin } from "@shared/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type UserRole = "buyer" | "seller";

export default function Login() {
  const [role, setRole] = useState<UserRole>("buyer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setIsLoading(true);

  try {
    const response = await apiLogin(email, password);

    if (response.success) {
      const user = response.data;

      // CEK ROLE BENAR
      if (user?.role !== role) {
        setError(`Akun ini terdaftar sebagai ${user?.role === 'buyer' ? 'pembeli' : 'penjual'}`);
        setIsLoading(false);
        return;
      }

      // =======================
      //     SELLER LOGIN
      // =======================
      if (user.role === "seller") {
        // SELLER BELUM VERIFIKASI
        if (user.verification_status !== "approved") {
          toast({
            title: "Verifikasi Diperlukan",
            description: "Akun seller Anda belum diverifikasi",
            variant: "destructive"
          });

          navigate("/seller-verification", {
            state: { userId: user.id }
          });
          return;
        }

        // SELLER SUDAH VERIFIKASI → KE ADMIN
        login(user);

        toast({
          title: "Berhasil",
          description: "Login sebagai seller berhasil",
        });

        navigate("/admin"); // ⬅️ ARAHKAN KE ADMIN
        return;
      }

      // =======================
      //     BUYER LOGIN
      // =======================
      if (user.role === "buyer") {
        login(user);

        toast({
          title: "Berhasil",
          description: "Login berhasil",
        });

        navigate("/"); // ⬅️ HOME PAG E
        return;
      }

    } else {
      setError(response.message || "Email atau kata sandi salah");
      toast({
        title: "Gagal",
        description: response.message || "Login gagal",
        variant: "destructive",
      });
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan saat login";
    setError(errorMessage);
    toast({
      title: "Kesalahan",
      description: errorMessage,
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};


  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground">Selamat Datang Kembali</h2>
            <p className="text-muted-foreground">Masuk ke akun Ftrade Anda</p>
          </div>

          {/* Role Selection */}
          <div className="flex gap-4 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setRole("buyer")}
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
                role === "buyer"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pembeli
            </button>
            <button
              onClick={() => setRole("seller")}
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
                role === "seller"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Penjual
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Alamat Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="anda@contoh.com"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Kata Sandi
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-input accent-primary"
                />
                <span className="text-sm text-muted-foreground">Ingat saya</span>
              </label>
              <a href="#" className="text-sm text-primary hover:text-primary/80 transition-colors">
                Lupa kata sandi?
              </a>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 h-10"
            >
              {isLoading ? "Sedang Masuk..." : "Masuk"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">Atau lanjutkan dengan</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="border-input hover:bg-muted transition-colors"
            >
              Google
            </Button>
            <Button
              variant="outline"
              className="border-input hover:bg-muted transition-colors"
            >
              Facebook
            </Button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link to="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Daftar
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
