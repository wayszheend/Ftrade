import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { BarChart3, Package, Users, Zap } from "lucide-react";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Panel Admin
            </h1>
            <p className="text-lg text-muted-foreground">
              Kelola produk, pengguna, dan voucher Ftrade
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-border flex-wrap">
            {[
              {
                id: "dashboard",
                label: "Dashboard",
                icon: BarChart3,
              },
              {
                id: "products",
                label: "Produk",
                icon: Package,
              },
              {
                id: "users",
                label: "Pengguna",
                icon: Users,
              },
              {
                id: "vouchers",
                label: "Voucher",
                icon: Zap,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: "Total Produk", value: "1,234", color: "primary" },
                  {
                    label: "Total Pengguna",
                    value: "5,678",
                    color: "secondary",
                  },
                  {
                    label: "Penjualan Hari Ini",
                    value: "Rp 45.2M",
                    color: "primary",
                  },
                  { label: "Pending Orders", value: "23", color: "secondary" },
                ].map((stat, i) => (
                  <div key={i} className="bg-background border border-border rounded-xl p-6">
                    <p className="text-sm text-muted-foreground mb-2">
                      {stat.label}
                    </p>
                    <p className={`text-3xl font-bold text-${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                <h3 className="font-bold text-foreground mb-2">
                  Setup Database
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Jika belum melakukan setup database, ikuti panduan di bawah:
                </p>
                <Button className="bg-primary hover:bg-primary/90">
                  Lihat Panduan Setup
                </Button>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-foreground">
                  Kelola Produk
                </h2>
                <Button className="bg-primary hover:bg-primary/90">
                  + Tambah Produk
                </Button>
              </div>

              <div className="bg-background border border-border rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Produk
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Kategori
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Harga
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Stok
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map((i) => (
                      <tr key={i} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 text-sm text-foreground">
                          Produk {i}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          Sayuran
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-primary">
                          Rp {(25000 * i).toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {100 * i} kg
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-primary text-primary hover:bg-primary/5"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500 text-red-500 hover:bg-red-500/5"
                          >
                            Hapus
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Kelola Pengguna</h2>

              <div className="bg-background border border-border rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Nama
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map((i) => (
                      <tr key={i} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-foreground">
                          Pengguna {i}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          user{i}@ftrade.com
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              i % 2 === 0
                                ? "bg-primary/10 text-primary"
                                : "bg-secondary/10 text-secondary"
                            }`}
                          >
                            {i % 2 === 0 ? "Penjual" : "Pembeli"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-600">
                            Aktif
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-primary text-primary hover:bg-primary/5"
                          >
                            Lihat Detail
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Vouchers Tab */}
          {activeTab === "vouchers" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-foreground">
                  Kelola Voucher
                </h2>
                <Button className="bg-primary hover:bg-primary/90">
                  + Buat Voucher
                </Button>
              </div>

              <div className="bg-background border border-border rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Kode
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Diskon
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Terpakai
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map((i) => (
                      <tr key={i} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-foreground">
                          SAVE{i}0
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {i * 10}% Diskon
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {i * 50} / 500
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-600">
                            Aktif
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-primary text-primary hover:bg-primary/5"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500 text-red-500 hover:bg-red-500/5"
                          >
                            Hapus
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
