import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, Zap, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { apiCreateOrder } from "@shared/api";

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart, userPoints, addPoints, usePoints } =
    useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [usePointsForDiscount, setUsePointsForDiscount] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Calculate discount based on available points (10 points = 2000 rupiah)
  const maxPointsToUse = Math.min(userPoints, Math.floor(cartTotal / 200)); // 1 point = 200 Rp
  const discountAmount = (pointsToUse / 10) * 2000; // 10 points = 2000 Rp

  const handleUsePointsToggle = () => {
    if (!usePointsForDiscount) {
      setUsePointsForDiscount(true);
      setPointsToUse(maxPointsToUse);
    } else {
      setUsePointsForDiscount(false);
      setPointsToUse(0);
    }
  };

  const handlePointsChange = (value: string) => {
    const points = Math.min(parseInt(value) || 0, maxPointsToUse);
    setPointsToUse(Math.max(points, 0));
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Silakan login terlebih dahulu");
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Keranjang Anda kosong!");
      return;
    }

    setIsCheckingOut(true);

    try {
      // Prepare order items
      const items = cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      }));

      // Create order via API
      const response = await apiCreateOrder(
        user.id,
        items,
        "Alamat pengiriman default", // TODO: Get from user profile
        undefined, // voucher code
        "pending", // payment method
        usePointsForDiscount ? pointsToUse : 0
      );

      if (response.success) {
        const { points_earned, user_points } = response.data || {};

        // Update user's points in localStorage and cart context
        if (user_points !== undefined) {
          // Update points in cart context
          const pointsDiff = user_points - userPoints;
          if (pointsDiff !== 0) {
            if (pointsDiff > 0) {
              addPoints(pointsDiff);
            } else {
              usePoints(Math.abs(pointsDiff));
            }
          }
        }

        // Show success message
        let successMsg = "Pembelian berhasil!";
        if (points_earned > 0) {
          successMsg += ` Anda mendapatkan ${points_earned} poin 🎉`;
        }
        toast.success(successMsg);

        // Clear cart
        clearCart();
        setUsePointsForDiscount(false);
        setPointsToUse(0);

        // Redirect to home
        navigate("/");
      } else {
        toast.error(response.message || "Checkout gagal");
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Terjadi kesalahan saat checkout";
      toast.error(errorMsg);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const finalTotal = Math.max(cartTotal - discountAmount, 0);

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-64px)] py-20 px-4 sm:px-6 lg:px-8 bg-muted/30 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md">
            <div className="text-6xl">🛒</div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Keranjang Kosong</h1>
              <p className="text-muted-foreground mb-6">
                Belum ada produk di keranjang Anda. Mulai berbelanja sekarang!
              </p>
            </div>
            <Link to="/marketplace">
              <Button className="bg-primary hover:bg-primary/90 w-full">
                Lanjut Belanja
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Keranjang Belanja</h1>
            <p className="text-lg text-muted-foreground">
              {cartItems.length} item dalam keranjang
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-background border border-border rounded-xl p-6">
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center text-4xl flex-shrink-0">
                      {item.image}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Rp {item.price.toLocaleString("id-ID")} / {item.unit}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-muted rounded-lg transition-colors"
                        >
                          <Minus className="w-4 h-4 text-foreground" />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(item.id, parseInt(e.target.value) || 1)
                          }
                          className="w-16 px-2 py-1 border border-input rounded-lg bg-background text-center text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-muted rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4 text-foreground" />
                        </button>
                      </div>
                    </div>

                    {/* Price & Delete */}
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => {
                          removeFromCart(item.id);
                          toast.success("Produk dihapus dari keranjang");
                        }}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-500"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Subtotal</p>
                        <p className="text-xl font-bold text-primary">
                          Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-background border border-border rounded-2xl p-6 space-y-6 sticky top-24">
                <h3 className="text-lg font-bold text-foreground">Ringkasan Pesanan</h3>

                {/* Subtotal */}
                <div className="space-y-3 pb-4 border-b border-border">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold text-foreground">
                      Rp {cartTotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ongkir</span>
                    <span className="font-semibold text-foreground">Gratis</span>
                  </div>
                </div>

                {/* Points Redemption */}
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-secondary" />
                      <span className="font-semibold text-foreground">Poin Saya</span>
                    </div>
                    <span className="text-lg font-bold text-primary">{userPoints}</span>
                  </div>

                  {userPoints > 0 && (
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={usePointsForDiscount}
                          onChange={handleUsePointsToggle}
                          className="w-4 h-4 rounded accent-primary"
                        />
                        <span className="text-sm text-foreground">
                          Gunakan poin untuk diskon
                        </span>
                      </label>
                      {usePointsForDiscount && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Poin yang digunakan:</span>
                            <input
                              type="number"
                              min="0"
                              max={maxPointsToUse}
                              value={pointsToUse}
                              onChange={(e) => handlePointsChange(e.target.value)}
                              className="w-16 px-2 py-1 border border-input rounded-lg bg-background text-center text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <span className="text-xs text-muted-foreground">/ {maxPointsToUse}</span>
                          </div>
                          <p className="text-xs text-primary">
                            Diskon: -Rp {discountAmount.toLocaleString("id-ID")}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    10 poin = Rp 2.000 diskon
                  </p>
                </div>

                {/* Total */}
                <div className="space-y-2 py-4 border-b border-border">
                  <div className="flex justify-between items-end">
                    <span className="text-foreground">Total</span>
                    <div className="text-right">
                      {usePointsForDiscount && (
                        <p className="text-xs text-muted-foreground line-through">
                          Rp {cartTotal.toLocaleString("id-ID")}
                        </p>
                      )}
                      <p className="text-2xl font-bold text-primary">
                        Rp {finalTotal.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Points Earned Preview */}
                {cartTotal > 0 && (
                  <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Setelah pembelian, Anda akan mendapat</p>
                    <p className="text-lg font-bold text-secondary">
                      +{Math.floor(finalTotal / 1000)} poin 🎁
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      (1 poin per Rp 1.000)
                    </p>
                  </div>
                )}

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 h-12"
                >
                  {isCheckingOut ? "Memproses..." : "Lanjut ke Pembayaran"}
                </Button>

                {/* Continue Shopping */}
                <Link to="/marketplace">
                  <Button
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary/5"
                  >
                    Lanjut Belanja
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
