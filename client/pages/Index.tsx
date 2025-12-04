import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import {
  Leaf,
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle,
  Heart,
} from "lucide-react";
import { useEffect , useState } from "react";

export default function Index() {
  const texts = [
  "Segar Langsung dari Kebun ke Meja Anda",
  "Dipanen Langsung dari Petani",
  "Produk Alami Berkualitas Tinggi",
  "Sehat, Segar, dan Terpercaya",
];

const [index, setIndex] = useState(0);
const [fade, setFade] = useState(true);

useEffect(() => {
  const interval = setInterval(() => {
    setFade(false);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % texts.length);
      setFade(true);
    }, 300);
  }, 3000);

  return () => clearInterval(interval);
}, []);
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 mb-4">
                  <Leaf  className={`w-4 h-4 text-primary transition-opacity`}/>
                  <span className={`text-sm font-medium text-primary transition-opacity duration-300 ${fade ? "opacity-100" : "opacity-0"}`}>
                    {texts[index]}
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                  Menghubungkan Petani, Memberdayakan Komunitas
                </h1>
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed">
                Ftrade adalah pasar terpercaya yang menghubungkan petani dan produsen pertanian
                langsung dengan pembeli. Dapatkan hasil panen segar berkualitas tinggi dengan harga
                yang adil sambil mendukung pertanian lokal.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/marketplace">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                    Mulai Berbelanja
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/5 w-full sm:w-auto"
                  >
                    Menjadi Penjual
                  </Button>
                </Link>
              </div>

              <div className="flex gap-8 pt-4">
                <div>
                  <p className="text-2xl font-bold text-foreground">10K+</p>
                  <p className="text-sm text-muted-foreground">Produk Terdaftar</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">5K+</p>
                  <p className="text-sm text-muted-foreground">Penjual Aktif</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">50K+</p>
                  <p className="text-sm text-muted-foreground">Pelanggan Puas</p>
                </div>
              </div>
            </div>

            {/* Right Side - Rice Field Image */}
            <div className="relative h-96 md:h-full rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/2164255/pexels-photo-2164255.jpeg"
                alt="Sawah terasering yang indah dengan karya seni pertanian Indonesia"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Mengapa Memilih Ftrade?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk pengalaman jual beli yang mulus
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-background border border-border rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Segar & Langsung</h3>
              <p className="text-muted-foreground">
                Beli langsung dari petani. Dapatkan hasil panen paling segar tanpa markup pedagang.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-background border border-border rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Harga Adil</h3>
              <p className="text-muted-foreground">
                Harga transparan memastikan pembeli dan penjual mendapat nilai terbaik untuk uang.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-background border border-border rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Transaksi Aman</h3>
              <p className="text-muted-foreground">
                Pembayaran terlindungi dan jaminan pembeli membuat perdagangan aman dan nyaman.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-background border border-border rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Penjualan Mudah</h3>
              <p className="text-muted-foreground">
                Daftar produk Anda dalam hitungan menit. Jangkau ribuan pembeli dengan mudah.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-background border border-border rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Kualitas Terjamin</h3>
              <p className="text-muted-foreground">
                Ulasan dan rating menjamin standar kualitas tinggi dari semua penjual.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-background border border-border rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Penjual Terverifikasi</h3>
              <p className="text-muted-foreground">
                Semua penjual adalah petani terverifikasi, menjamin keaslian dan keandalan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Cara Kerjanya
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Mulai dalam tiga langkah sederhana
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                    1
                  </div>
                </div>
                <div className="pt-1">
                  <h3 className="text-xl font-bold text-foreground">Buat Akun</h3>
                  <p className="text-muted-foreground mt-2">
                    Daftar sebagai pembeli atau penjual. Pendaftaran sederhana hanya membutuhkan 2 menit.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                    2
                  </div>
                </div>
                <div className="pt-1">
                  <h3 className="text-xl font-bold text-foreground">Jelajahi atau Daftar</h3>
                  <p className="text-muted-foreground mt-2">
                    Jelajahi produk segar atau daftarkan barang pertanian Anda dengan detail lengkap.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                    3
                  </div>
                </div>
                <div className="pt-1">
                  <h3 className="text-xl font-bold text-foreground">Bertransaksi & Nikmati</h3>
                  <p className="text-muted-foreground mt-2">
                    Selesaikan transaksi aman dan nikmati produk segar atau tingkatkan penjualan Anda.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
 <section
  className="relative py-20 md:py-32 overflow-hidden text-white"
  style={{
    backgroundImage:
      "url('https://images.pexels.com/photos/2164255/pexels-photo-2164255.jpeg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
  {/* GRADIENT OVERLAY */}
  <div className="absolute inset-0 bg-gradient-to-t from-green-700 via-green-00 to-transparent z-0" />

  <div className="container mx-auto px-4 text-center relative z-10">
    <h2 className="text-3xl md:text-4xl font-bold mb-6">
      Siap Bergabung dengan Ftrade?
    </h2>

    <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
      Baik Anda petani yang ingin menjual atau pembeli mencari hasil panen segar,
      Ftrade adalah pasar terpercaya Anda.
    </p>

    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link to="/marketplace">
        <Button
          size="lg"
          variant="outline"
          className="border-primary text-black hover:bg-white/10 w-full sm:w-auto"
        >
          Mulai Berbelanja Sekarang
        </Button>
      </Link>

      <Link to="/register">
        <Button
          size="lg"
          variant="outline"
          className="border-primary text-black hover:bg-white/10 w-full sm:w-auto"
        >
          Mulai Berjualan
        </Button>
      </Link>
    </div>
  </div>
</section>  
    </Layout>
  );
}
