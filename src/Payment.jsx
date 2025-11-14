// src/Payment.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { app } from "./firebase";

const db = getFirestore(app);

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, tableNumber, note } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState("QRIS");
  const [loading, setLoading] = useState(false);

  // PREMIUM UI STATES
  const [showPremiumQR, setShowPremiumQR] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [qrisToken, setQrisToken] = useState(null);

  const total = Object.values(cart || {}).reduce(
    (sum, i) => sum + (i.qty || 0) * (i.price || 0),
    0
  );

  if (!cart || Object.keys(cart).length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>
          Belum ada pesanan.{" "}
          <button
            onClick={() => navigate("/")}
            className="text-amber-400 underline"
          >
            Kembali
          </button>
        </p>
      </div>
    );

  // Countdown
  useEffect(() => {
    if (!showPremiumQR) return;

    if (countdown === 0 && qrisToken) {
      window.snap.pay(qrisToken);
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [showPremiumQR, countdown, qrisToken]);

  const handlePayment = async () => {
    if (!tableNumber) return alert("Nomor meja tidak boleh kosong.");

    setLoading(true);

    try {
      const items = Object.values(cart).map((i) => ({
        name: i.name,
        variant: i.type,
        qty: i.qty,
        price: i.price,
        note: i.note || "",
      }));

      // Simpan ke Firestore
      const orderRef = await addDoc(collection(db, "orders"), {
        tableNumber,
        note: note || "",
        items,
        total,
        paymentMethod,
        orderStatus:
          paymentMethod === "QRIS"
            ? "Menunggu Pembayaran"
            : "Menunggu Diproses",
        paymentStatus: paymentMethod === "QRIS" ? "PENDING" : "CASH",
        createdAt: serverTimestamp(),
      });

      // 🟨 JIKA QRIS
      if (paymentMethod === "QRIS") {
        // Load snap.js
        const script = document.createElement("script");
        script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
        script.setAttribute(
          "data-client-key",
          import.meta.env.VITE_MIDTRANS_CLIENT_KEY
        );
        document.body.appendChild(script);

        script.onload = async () => {
          // Panggil API Vercel
          const response = await fetch("/api/midtrans", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: orderRef.id,
              grossAmount: total,
            }),
          });

          const data = await response.json();
          if (!data.token) throw new Error("Token QRIS gagal dibuat.");

          // Simpan token ke state → tampilkan UI premium QRIS
          setQrisToken(data.token);
          setShowPremiumQR(true);

          // Jalankan Snap setelah countdown selesai
        };
      }

      // 🟩 TUNAI
      else {
        await updateDoc(doc(db, "orders", orderRef.id), {
          paymentStatus: "CASH",
          orderStatus: "Menunggu Pesanan",
        });

        alert("Silakan bayar tunai ke kasir.");
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan pesanan.");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  //   PREMIUM QRIS UI
  // ============================
  if (showPremiumQR) {
    return (
      <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-2xl w-full max-w-md text-center border border-white/20">
          <h2 className="text-2xl font-bold text-amber-400 mb-3">
            QRIS Premium
          </h2>
          <p className="text-sm text-white/60">Membuat pembayaran QRIS...</p>

          {/* Loading QR Code Shimmer */}
          <div className="mt-5 w-56 h-56 mx-auto rounded-xl bg-gradient-to-br from-white/10 to-white/5 animate-pulse shadow-inner border border-white/20"></div>

          {/* Status */}
          <div className="mt-6 p-3 bg-black/20 rounded-xl border border-white/10">
            <p className="text-amber-300 font-semibold">
              Menghubungkan ke QRIS...
            </p>
            <p className="text-white/60 text-sm mt-1">
              Snap akan terbuka otomatis dalam {countdown} detik
            </p>
          </div>

          {/* Premium Glow */}
          <div className="mt-4 text-xs text-white/40">
            Winston Coffee • Secure Payment System
          </div>
        </div>
      </div>
    );
  }

  // ============================
  //  UI NORMAL PEMBAYARAN
  // ============================

  return (
    <div className="min-h-screen bg-[#0f1724] text-white p-6">
      <h2 className="text-3xl font-bold text-amber-400 mb-6 text-center">
        Pembayaran Pesanan
      </h2>

      {/* Daftar Pesanan */}
      <div className="bg-white/10 p-4 rounded-lg mb-4">
        <h3 className="text-lg font-semibold mb-2">Daftar Pesanan</h3>
        <div className="space-y-2">
          {Object.values(cart).map((it) => (
            <div
              key={(it.id || it.name) + (it.type || "")}
              className="flex justify-between bg-white/5 p-2 rounded"
            >
              <span>
                {it.name} ({it.type}) × {it.qty}
              </span>
              <span>Rp {(it.price * it.qty).toLocaleString("id-ID")}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 border-t pt-2 flex justify-between font-semibold text-amber-400">
          <span>Total:</span>
          <span>Rp {total.toLocaleString("id-ID")}</span>
        </div>
      </div>

      {/* Metode Pembayaran */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">Metode Pembayaran:</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full px-3 py-2 bg-white/10 rounded text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="QRIS">QRIS (Midtrans)</option>
          <option value="cash">Tunai</option>
        </select>
      </div>

      {/* Tombol bayar */}
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full py-3 bg-amber-400 text-black font-semibold rounded hover:bg-amber-500 transition disabled:opacity-50"
      >
        {loading ? "Memproses..." : `Bayar Rp ${total.toLocaleString("id-ID")}`}
      </button>
    </div>
  );
}
