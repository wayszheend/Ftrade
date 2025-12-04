import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { se } from "date-fns/locale";

export default function SellerVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const userId = location.state?.userId;

  // ✅ PROTEKSI JIKA USER ID HILANG
  if (!userId) {
    navigate("/login");
    return null;
  }

  const [form, setForm] = useState({
    farmerCardNumber: "",
    sellerId: "",
    farmerCardName: "",
    organizationName: "",
    organizationId: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const res = await fetch("/api/farmer-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seller_id: form.sellerId,
        farmer_card_number: form.farmerCardNumber,
        farmer_card_name: form.farmerCardName,
        organization_name: form.organizationName,
        organization_id: form.organizationId,
      }),
    });

    const data = await res.json();

    if (data.success) {
      toast({
        title: "Berhasil",
        description: "Permintaan verifikasi dikirim, menunggu persetujuan admin",
      });
      navigate("/login");
    } else {
      toast({
        title: "Gagal",
        description: data.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded-xl border">
        <h2 className="text-xl font-bold mb-4">Verifikasi Petani</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="farmerCardNumber"
            placeholder="Nomor Kartu Petani"
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
          <input
            name="farmerCardName"
            placeholder="Nama di Kartu"
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
          <input
            name="organizationName"
            placeholder="Nama Kelompok Tani"
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
          <input
            name="organizationId"
            placeholder="ID Organisasi"
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
          <Button type="submit" className="w-full">
            Kirim Verifikasi
          </Button>
        </form>
      </div>
    </Layout>
  );
}
