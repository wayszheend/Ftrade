import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Search, Leaf } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface FilterState {
  category: string;
  priceRange: [number, number];
  search: string;
}

const categories = [
  { id: "all", name: "Semua Kategori" },
  { id: "vegetables", name: "Sayuran" },
  { id: "fruits", name: "Buah-buahan" },
  { id: "staples", name: "Bahan Pangan" },
  { id: "herbs", name: "Rempah & Bumbu" },
];

const products = [
  { id: 1, name: "Tomat Segar", category: "vegetables", price: 25000, unit: "/kg", image: "🍅" },
  { id: 2, name: "Apel Import", category: "fruits", price: 75000, unit: "/kg", image: "🍎" },
  { id: 3, name: "Beras Organik", category: "staples", price: 45000, unit: "/kg", image: "🌾" },
  { id: 4, name: "Cabai Merah", category: "vegetables", price: 55000, unit: "/kg", image: "🌶️" },
  { id: 5, name: "Pisang Cavendish", category: "fruits", price: 15000, unit: "/kg", image: "🍌" },
  { id: 6, name: "Jagung Manis", category: "staples", price: 20000, unit: "/kg", image: "🌽" },
  { id: 7, name: "Mangga Harum Manis", category: "fruits", price: 35000, unit: "/kg", image: "🥭" },
  { id: 8, name: "Bawang Putih", category: "vegetables", price: 85000, unit: "/kg", image: "🧄" },
  { id: 9, name: "Kunyit Segar", category: "herbs", price: 30000, unit: "/kg", image: "🌱" },
];

export default function Marketplace() {
  const { addToCart } = useCart();
  const [filters, setFilters] = useState<FilterState>({
    category: "all",
    priceRange: [0, 100000],
    search: "",
  });

  const handleAddToCart = (product: typeof products[0]) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      image: product.image,
    });
    toast.success(`${product.name} ditambahkan ke keranjang!`);
  };

  const handleCategoryChange = (categoryId: string) => {
    setFilters((prev) => ({ ...prev, category: categoryId }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = parseInt(e.target.value);
    setFilters((prev) => ({ ...prev, priceRange: [0, newPrice] }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value.toLowerCase() }));
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = filters.category === "all" || product.category === filters.category;
    const matchesPrice = product.price <= filters.priceRange[1];
    const matchesSearch =
      product.name.toLowerCase().includes(filters.search) ||
      filters.search === "";
    return matchesCategory && matchesPrice && matchesSearch;
  });

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Jelajahi Produk Segar</h1>
            <p className="text-lg text-muted-foreground">
              Temukan hasil panen berkualitas dari petani terverifikasi
            </p>
          </div>

          {/* Main Content - Filters and Products */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <div className="lg:col-span-1">
              <div className="bg-background border border-border rounded-2xl p-6 space-y-6 sticky top-24">
                <h3 className="text-lg font-bold text-foreground">Filter</h3>

                {/* Category Filter */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Kategori</h4>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value={cat.id}
                          checked={filters.category === cat.id}
                          onChange={() => handleCategoryChange(cat.id)}
                          className="w-4 h-4 accent-primary"
                        />
                        <span className="text-sm text-muted-foreground hover:text-foreground">
                          {cat.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Harga Maksimal</h4>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="5000"
                    value={filters.priceRange[1]}
                    onChange={handlePriceChange}
                    className="w-full accent-primary"
                  />
                  <div className="mt-3 text-sm text-muted-foreground">
                    Rp 0 - Rp {filters.priceRange[1].toLocaleString("id-ID")} / kg
                  </div>
                </div>

                {/* Clear Filters Button */}
                <Button
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary/5"
                  onClick={() =>
                    setFilters({ category: "all", priceRange: [0, 100000], search: "" })
                  }
                >
                  Hapus Filter
                </Button>
              </div>
            </div>

            {/* Products Section */}
            <div className="lg:col-span-3">
              {/* Search Bar */}
              <div className="mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-3 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Cari produk..."
                    value={filters.search}
                    onChange={handleSearchChange}
                    className="w-full pl-12 pr-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Products Grid */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-background border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="w-full h-40 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-5xl">
                        {product.image}
                      </div>
                      <div className="p-4 space-y-3">
                        <h3 className="font-semibold text-foreground">{product.name}</h3>
                        <p className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full inline-block">
                          {categories.find((c) => c.id === product.category)?.name}
                        </p>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-lg font-bold text-primary">
                            Rp {product.price.toLocaleString("id-ID")}
                          </span>
                          <span className="text-xs text-muted-foreground">{product.unit}</span>
                        </div>
                        <Button
                          className="w-full bg-primary hover:bg-primary/90 text-xs"
                          onClick={() => handleAddToCart(product)}
                        >
                          + Keranjang
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Leaf className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Produk Tidak Ditemukan
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Coba sesuaikan filter atau pencarian Anda
                  </p>
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={() =>
                      setFilters({ category: "all", priceRange: [0, 100000], search: "" })
                    }
                  >
                    Hapus Filter
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
