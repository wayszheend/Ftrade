import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { Leaf, ArrowRight, CheckCircle } from "lucide-react";
import { apiRegister } from "@shared/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

type UserRole = "buyer" | "seller";

export default function Register() {
  const [role, setRole] = useState<UserRole>("buyer");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    businessName: "",
    agreeTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const { addPoints } = useCart();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Kata sandi tidak cocok");
      toast({
        title: "Kesalahan",
        description: "Kata sandi tidak cocok",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      setError("Kata sandi minimal 6 karakter");
      toast({
        title: "Kesalahan",
        description: "Kata sandi minimal 6 karakter",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
            const response = await apiRegister(
        formData.fullName,
        formData.email,
        formData.password,
        formData.phone,
        role,
        role === "seller" ? formData.businessName : undefined
      );

      if (response.success) {
        const user = response.data; 

        if (user.role === "seller") {
          toast({
            title: "Verifikasi Diperlukan",
            description: "Silakan lengkapi verifikasi kartu petani terlebih dahulu.",
          });

          navigate("/seller-verification", {
            state: {
              userId: user.id,
              sellerId: user.id
// jika backend Anda kirim ini
            },
          });
        } else {
          login(user);
          addPoints(100);

          toast({
            title: "Berhasil",
            description: "Akun Anda telah dibuat. Dapatkan 100 poin bonus!",
          });

          navigate("/");
        }
      } else {
        const errorMsg = response.message || "Pendaftaran gagal";
        setError(errorMsg);
        toast({
          title: "Gagal",
          description: errorMsg,
          variant: "destructive",
        });
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan saat pendaftaran";
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
      <div className="min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 space-y-2">
            <div className="flex justify-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground">Bergabung dengan Ftrade Hari Ini</h2>
            <p className="text-muted-foreground">
              Pilih peran Anda dan mulai dalam hitungan menit
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Buyer Card */}
            <button
              onClick={() => setRole("buyer")}
              className={`relative p-8 rounded-2xl border-2 transition-all text-left ${
                role === "buyer"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:border-primary/50"
              }`}
            >
              <div className="space-y-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    role === "buyer" ? "bg-primary text-primary-foreground" : "bg-primary/10"
                  }`}
                >
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Beli Hasil Panen Segar</h3>
                  <p className="text-muted-foreground mt-2">
                    Jelajahi dan beli produk pertanian berkualitas langsung dari petani.
                  </p>
                </div>
                {role === "buyer" && (
                  <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full"></div>
                )}
              </div>
            </button>

            {/* Seller Card */}
            <button
              onClick={() => setRole("seller")}
              className={`relative p-8 rounded-2xl border-2 transition-all text-left ${
                role === "seller"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:border-primary/50"
              }`}
            >
              <div className="space-y-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    role === "seller" ? "bg-primary text-primary-foreground" : "bg-primary/10"
                  }`}
                >
                  <Leaf className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Jual Produk Anda</h3>
                  <p className="text-muted-foreground mt-2">
                    Daftar dan jual produk pertanian Anda kepada ribuan pembeli.
                  </p>
                </div>
                {role === "seller" && (
                  <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full"></div>
                )}
              </div>
            </button>
          </div>

          {/* Registration Form */}
          <div className="max-w-md mx-auto bg-background rounded-2xl border border-border p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
                  Nama Lengkap
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Nama Anda"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Alamat Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="anda@contoh.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                  Nomor Telepon
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="+62 812 3456 7890"
                />
              </div>

              {/* Business Name - Show only for sellers */}
              {role === "seller" && (
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-foreground mb-2">
                    Nama Bisnis
                  </label>
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    required={role === "seller"}
                    disabled={isLoading}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Nama bisnis/toko Anda"
                  />
                </div>
              )}

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  Kata Sandi (minimal 6 karakter)
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                  Konfirmasi Kata Sandi
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
              </div>

              {/* Terms */}
              <div>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleInputChange}
                    required
                    className="w-4 h-4 rounded border-input accent-primary mt-1 flex-shrink-0"
                  />
                  <span className="text-sm text-muted-foreground">
                    Saya setuju dengan{" "}
                    <a href="#" className="text-primary hover:text-primary/80">
                      Syarat & Ketentuan
                    </a>{" "}
                    dan{" "}
                    <a href="#" className="text-primary hover:text-primary/80">
                      Kebijakan Privasi
                    </a>{" "}
                    Ftrade
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !formData.agreeTerms}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 h-10"
              >
                {isLoading ? "Membuat akun..." : "Buat Akun"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            {/* Sign In Link */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              Sudah punya akun?{" "}
              <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
