import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { fa } from "zod/v4/locales";  
import { apiFarmerVerification } from "@shared/api";

export default function SellerVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const userId = location.state?.userId;

  useEffect(() => {
    if (!userId) {
      toast({
        title: "Session habis",
        description: "Silakan login kembali",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [userId, navigate, toast]);

  const [form, setForm] = useState({
    farmerCardNumber: "",
    farmerCardName: "",
    organizationName: "",
    organizationId: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    setLoading(true);

    const payload = {
      user_id: userId,
      farmer_card_number: form.farmerCardNumber,
      farmer_card_name: form.farmerCardName,
      organization_name: form.organizationName,
      organization_id: form.organizationId,
    };
    const res = await apiFarmerVerification(payload);
    if (res.success) {
      toast({
        title: "Berhasil",
        description: "Permohonan verifikasi telah dikirim",
      });
      navigate("/");
    } else {
      toast({
        title: "Gagal",
        description: res.message || "Terjadi kesalahan saat mengirim verifikasi",
        variant: "destructive",
      });
    }
    setLoading(false);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan saat mengirim verifikasi";
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
    setLoading(false);
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
            value={form.farmerCardNumber}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          <input
            name="farmerCardName"
            placeholder="Nama di Kartu"
            value={form.farmerCardName}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          <input
            name="organizationName"
            placeholder="Nama Kelompok Tani"
            value={form.organizationName}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          <input
            name="organizationId"
            placeholder="ID Organisasi"
            value={form.organizationId}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Mengirim..." : "Kirim Verifikasi"}
          </Button>
        </form>
      </div>
    </Layout>
  );
}
