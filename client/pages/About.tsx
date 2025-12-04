import Layout from "@/components/Layout";
import { Leaf, Target, Users, ShieldCheck } from "lucide-react";

export default function About() {
  return (
    <Layout>
      {/* HERO */}
      <section className="relative py-24 bg-gradient-to-r from-green-700 to-green-600 text-white"
      style={{backgroundImage: "url('https://images.pexels.com/photos/2164255/pexels-photo-2164255.jpeg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Tentang Ftrade</h1>
          <p className="max-w-2xl mx-auto text-lg opacity-90">
            Menghubungkan petani dan konsumen secara langsung untuk menciptakan perdagangan yang adil,
            transparan, dan berkelanjutan.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-4xl space-y-16">

          {/* Intro */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Siapa Kami?</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Ftrade adalah pasar revolusioner yang menghubungkan petani dan produsen pertanian
              langsung dengan pembeli. Kami berkomitmen mendukung pertanian lokal dan memastikan
              hasil panen segar berkualitas sampai ke tangan konsumen dengan harga yang adil.
            </p>
          </div>

          {/* GRID 2 */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Misi */}
            <div className="p-8 rounded-2xl border bg-background shadow-sm hover:shadow-md transition">
              <Target className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-3">Misi Kami</h3>
              <p className="text-muted-foreground leading-relaxed">
                Memberdayakan petani dengan menyediakan saluran penjualan langsung ke pasar, sambil
                memberikan konsumen akses ke produk pertanian yang asli dan segar. Kami percaya pada
                perdagangan yang adil, transparansi, dan praktik pertanian berkelanjutan.
              </p>
            </div>

            {/* Visi / Cerita */}
            <div className="p-8 rounded-2xl border bg-background shadow-sm hover:shadow-md transition">
              <Users className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-3">Cerita Kami</h3>
              <p className="text-muted-foreground leading-relaxed">
                Ftrade lahir dari keprihatinan terhadap panjangnya rantai distribusi pertanian yang
                merugikan petani. Kami hadir untuk memangkas perantara dan menciptakan pasar langsung
                yang menguntungkan semua pihak.
              </p>
            </div>
          </div>

          {/* KEUNGGULAN */}
          <div>
            <h2 className="text-3xl font-bold text-center text-foreground mb-10">
              Mengapa Memilih Ftrade?
            </h2>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex gap-4 p-6 rounded-xl border bg-background">
                <Leaf className="w-6 h-6 text-green-600" />
                <span className="text-muted-foreground">
                  Transaksi langsung petani ke konsumen
                </span>
              </div>

              <div className="flex gap-4 p-6 rounded-xl border bg-background">
                <ShieldCheck className="w-6 h-6 text-green-600" />
                <span className="text-muted-foreground">
                  Harga adil dan transparan
                </span>
              </div>

              <div className="flex gap-4 p-6 rounded-xl border bg-background">
                <Leaf className="w-6 h-6 text-green-600" />
                <span className="text-muted-foreground">
                  Produk berkualitas terjamin
                </span>
              </div>

              <div className="flex gap-4 p-6 rounded-xl border bg-background">
                <Users className="w-6 h-6 text-green-600" />
                <span className="text-muted-foreground">
                  Dukungan penuh untuk pertanian berkelanjutan
                </span>
              </div>
            </div>
          </div>

          {/* CTA BOX */}
          <div className="bg-green-600 text-white rounded-2xl p-10 text-center">
            <h3 className="text-2xl font-bold mb-4">
              Siap Bergabung dengan Kami?
            </h3>
            <p className="opacity-90 max-w-2xl mx-auto">
              Baik Anda petani yang ingin memperluas pasar atau pembeli mencari hasil panen segar,
              Ftrade adalah platform sempurna untuk Anda.
            </p>
          </div>

        </div>
      </section>
    </Layout>
  );
}
