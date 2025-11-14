// src/Menu.jsx
import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, X, Plus, Minus } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { useNavigate, useLocation } from "react-router-dom";
import "https://unpkg.com/@lottiefiles/dotlottie-wc@0.8.5/dist/dotlottie-wc.js";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);

  const [menuData, setMenuData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem("wc_cart");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [tableNumber, setTableNumber] = useState(null);
  const [variantModal, setVariantModal] = useState(null);

  // Ambil nomor meja dari URL (?table=5)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tableParam = params.get("table");
    if (tableParam) {
      setTableNumber(tableParam);
      localStorage.setItem("tableNumber", tableParam);
    } else {
      const saved = localStorage.getItem("tableNumber");
      if (saved) setTableNumber(saved);
    }
  }, [location.search]);

  // Ambil data menu dari Firestore
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const snapshot = await getDocs(collection(db, "menu"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMenuData(data);
        const uniqueCategories = [
          "All",
          ...new Set(data.map((i) => i.category)),
        ];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Gagal memuat menu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  // Simpan keranjang
  useEffect(() => {
    localStorage.setItem("wc_cart", JSON.stringify(cart));
    if (Object.keys(cart).length === 0) localStorage.removeItem("wc_cart");
  }, [cart]);

  useEffect(() => {
    const handleScroll = () => {
      const scroll = window.scrollY;
      document.querySelectorAll(".parallax-img img").forEach((img) => {
        img.style.setProperty("--scroll", scroll);
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fungsi tambah ke keranjang
  const addToCart = (item, variantLabel, variantPrice) => {
    const key = `${item.id}_${variantLabel}`;
    setCart((prev) => {
      const copy = { ...prev };
      copy[key] = copy[key]
        ? { ...copy[key], qty: copy[key].qty + 1 }
        : { ...item, type: variantLabel, price: variantPrice, qty: 1 };
      return copy;
    });
  };

  // Update qty
  const updateQty = (id, delta) => {
    setCart((prev) => {
      const copy = { ...prev };
      if (!copy[id]) return prev;
      copy[id].qty += delta;
      if (copy[id].qty <= 0) delete copy[id];
      return copy;
    });
  };

  // Hitung total
  const total = Object.values(cart).reduce(
    (sum, i) => sum + i.qty * (i.price || 0),
    0
  );
  const cartCount = Object.values(cart).reduce((sum, i) => sum + i.qty, 0);

  // Checkout
  const checkout = () => {
    if (!tableNumber) {
      alert("Silakan scan QR code di meja Anda untuk mulai memesan.");
      return;
    }
    if (Object.keys(cart).length === 0) return alert("Keranjang masih kosong!");
    navigate("/payment", { state: { cart, tableNumber, note } });
  };

  // Jika belum scan QR
  if (!tableNumber) {
    return (
      <div className="min-h-screen bg-[#0f1724] text-white flex flex-col items-center justify-center text-center p-6">
        <dotlottie-wc
          src="https://lottie.host/3fd27b86-5d09-4f6d-bd63-8f6b0e4b4b71/6gV2Jx1eCy.lottie"
          autoplay
          loop
          style={{ width: "240px", height: "240px", marginBottom: "1rem" }}
        />

        <h2 className="text-2xl font-bold mb-3 text-amber-400">
          Akses Dibatasi
        </h2>
        <p className="text-gray-300 mb-4 max-w-sm">
          Silakan <span className="text-amber-400">scan QR code</span> pada meja
          Anda untuk mulai memesan.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="mt-3 bg-amber-400 text-black px-6 py-2 rounded-full font-semibold hover:bg-amber-500 transition"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1724] text-white font-inter overflow-hidden">
      {/* Navbar */}
      <header className="hidden sm:block fixed top-0 w-full bg-[#0f1724]/90 backdrop-blur-md z-50">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center text-black font-bold">
              W
            </div>
            <div className="text-sm font-semibold">
              Winston Coffee - Meja {tableNumber}
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="relative p-2 bg-white/10 rounded hover:bg-white/20 transition"
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <motion.span
                key={cartCount}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="absolute -top-1 -right-1 bg-amber-400 text-black text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full"
              >
                {cartCount}
              </motion.span>
            )}
          </button>
        </nav>
      </header>

      {/* Floating Cart Button Mobile */}
      <div className="fixed bottom-5 right-5 z-50 sm:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          className="relative p-4 bg-amber-400 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition"
        >
          <ShoppingCart size={24} className="text-white" />
          {cartCount > 0 && (
            <motion.span
              key={cartCount}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="absolute -top-1 -right-1 bg-black text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full"
            >
              {cartCount}
            </motion.span>
          )}
        </button>
      </div>

      {/* Hero */}
      <motion.div className="pt-24 relative h-[70vh] flex items-center justify-center">
        <dotlottie-wc
          src="https://lottie.host/6f16a8cd-804e-442a-9502-a22115a04d00/7YCwTT7KIu.lottie"
          autoplay
          loop
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div className="absolute inset-0 bg-black/40 z-10" />
      </motion.div>

      {/* Menu Section */}
      <section ref={menuRef} className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-amber-300 text-center mb-6">
          Menu Kami
        </h2>

        {/* Kategori */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedCategory === cat
                  ? "bg-amber-400 text-black"
                  : "bg-white/10 text-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Daftar Menu */}
        {loading ? (
          <p className="text-center text-gray-400">Loading menu...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {menuData
              .filter(
                (item) =>
                  selectedCategory === "All" ||
                  item.category === selectedCategory
              )
              .map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-[#0f1525] rounded-2xl overflow-hidden shadow-xl border border-white/10
    animate-staggerItem active:scale-[0.97] transition-all duration-500"
                >
                  {/* FOTO PARALLAX */}
                  <div className="relative w-full h-48 overflow-hidden bg-black/20 parallax-img">
                    <img
                      src={
                        item.imageBase64
                          ? `data:image/jpeg;base64,${item.imageBase64}`
                          : "https://via.placeholder.com/400x400?text=No+Image"
                      }
                      alt={item.name}
                      className="w-full h-full object-cover object-center transition duration-700 group-active:scale-110"
                    />

                    {/* SHIMMER PREMIUM */}
                    <div className="absolute inset-0 shimmer-gloss"></div>

                    {/* GRADIENT DARK OVERLAY */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-4 flex flex-col justify-between h-44">
                    <div>
                      <h3 className="text-lg font-bold text-white drop-shadow-sm">
                        {item.name}
                      </h3>

                      <p className="text-amber-400 text-sm mt-1">
                        Mulai Rp{" "}
                        {item.priceHot?.toLocaleString("id-ID") ||
                          item.price?.toLocaleString("id-ID")}
                      </p>
                    </div>

                    <button
                      onClick={() => setVariantModal(item)}
                      className="w-full py-2 bg-amber-400 text-black rounded-xl font-semibold text-sm 
        shadow-md hover:bg-amber-500 transition active:scale-95"
                    >
                      Pilih Varian
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      {/* Drawer Cart */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.aside
            initial={{ y: "100%", x: 0 }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="fixed bg-[#071026] p-6 z-[60] bottom-0 left-0 w-full sm:w-full max-w-sm sm:top-0 sm:right-0 sm:h-full sm:rounded-l-2xl rounded-t-2xl shadow-lg flex flex-col
                       max-h-[50vh] sm:max-h-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold">Keranjang</h4>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 bg-white/10 rounded"
              >
                <X />
              </button>
            </div>

            {/* List Item */}
            <div className="flex-1 overflow-y-auto">
              {Object.values(cart).length === 0 ? (
                <p className="text-gray-400">Keranjang kosong</p>
              ) : (
                Object.values(cart).map((it) => (
                  <div
                    key={it.id + it.type}
                    className="flex items-center gap-3 bg-white/5 p-3 rounded mb-2"
                  >
                    <img
                      src={
                        it.imageBase64
                          ? `data:image/jpeg;base64,${it.imageBase64}`
                          : "https://via.placeholder.com/100x80?text=No+Image"
                      }
                      alt={it.name}
                      className="w-14 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium">
                        {it.name} ({it.type})
                      </div>
                      <div className="text-xs text-gray-300">
                        Rp {(it.price * it.qty).toLocaleString("id-ID")}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => updateQty(it.id + "_" + it.type, -1)}
                          className="p-1 bg-white/10 rounded"
                        >
                          <Minus size={14} />
                        </button>
                        <div className="px-3">{it.qty}</div>
                        <button
                          onClick={() => updateQty(it.id + "_" + it.type, 1)}
                          className="p-1 bg-white/10 rounded"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Catatan */}
            <div className="mt-4">
              <label className="block text-sm mb-1">Catatan:</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Misal: kurang gula, jangan terlalu panas..."
                className="w-full px-3 py-2 rounded bg-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                rows={3}
              />
            </div>

            {/* Total */}
            <div className="mt-4 border-t pt-3 flex justify-between text-sm">
              <span>Total:</span>
              <span className="font-semibold">
                Rp {total.toLocaleString("id-ID")}
              </span>
            </div>

            {/* Tombol */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => {
                  setCart({});
                  setNote("");
                }}
                className="flex-1 py-2 bg-white/10 rounded"
              >
                Kosongkan
              </button>

              <button
                onClick={checkout}
                className="flex-1 py-2 bg-amber-400 text-black rounded font-semibold"
              >
                Checkout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Modal Varian */}
      <AnimatePresence>
        {variantModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[80] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-[#0f1724] p-6 rounded-2xl w-full max-w-sm text-center"
            >
              <h3 className="text-lg font-bold mb-3 text-amber-400">
                Pilih Varian
              </h3>
              <p className="text-sm text-gray-300 mb-5">{variantModal.name}</p>

              <div className="space-y-3">
                {(() => {
                  const options = [];
                  if (variantModal.hasHot && variantModal.priceHot) {
                    options.push({
                      label: "Hot",
                      price: variantModal.priceHot,
                    });
                  }
                  if (variantModal.hasIceL && variantModal.priceIceL) {
                    options.push({
                      label: "Ice L",
                      price: variantModal.priceIceL,
                    });
                  }
                  if (variantModal.hasIceR && variantModal.priceIceR) {
                    options.push({
                      label: "Ice R",
                      price: variantModal.priceIceR,
                    });
                  }

                  return options.length > 0 ? (
                    options.map((v, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          addToCart(variantModal, v.label, v.price);
                          setVariantModal(null);
                        }}
                        className="w-full py-2 bg-amber-400 text-black rounded font-semibold hover:bg-amber-500 transition"
                      >
                        {v.label} - Rp {v.price.toLocaleString("id-ID")}
                      </button>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">
                      Varian belum tersedia untuk menu ini.
                    </p>
                  );
                })()}
              </div>

              <button
                onClick={() => setVariantModal(null)}
                className="mt-5 text-gray-400 text-sm"
              >
                Batal
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
