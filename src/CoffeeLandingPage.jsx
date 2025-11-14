import React from "react";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative w-full h-[100vh] flex flex-col justify-center items-center bg-[#0f1724] overflow-hidden">
      {/* Animasi Barista Interaktif */}
      <div
        className="absolute inset-0 flex justify-center items-center opacity-90 cursor-pointer"
        onClick={() => navigate("/menu")}
      >
        <lottie-player
          src="/animations/CoffeeBarista.lottie"
          background="transparent"
          speed="1"
          style={{
            width: "100%",
            maxWidth: "700px",
            height: "auto",
          }}
          loop
          autoplay
        ></lottie-player>
      </div>

      {/* Overlay gradient agar teks tetap terbaca */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f1724]/20 via-[#0f1724]/70 to-[#0f1724]/95"></div>

      {/* Teks Hero */}
      <div className="relative z-10 text-center mt-20">
        <h1 className="text-5xl md:text-6xl font-extrabold text-yellow-400 drop-shadow-lg">
          Winston Coffee
        </h1>
        <p className="mt-3 text-lg text-gray-200">
          Nikmati pengalaman memilih kopi favorit Anda secara interaktif.
        </p>

        <button
          onClick={() => navigate("/menu")}
          className="mt-6 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-full shadow-lg transition-transform transform hover:scale-105"
        >
          ☕ Lihat Menu
        </button>
      </div>
    </section>
  );
}
