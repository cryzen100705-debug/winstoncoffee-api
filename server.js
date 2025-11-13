// server.js
import express from "express";
import cors from "cors";
import midtransClient from "midtrans-client";

const app = express();
app.use(cors());
app.use(express.json());

// === Konfigurasi Midtrans ===
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: "Mid-server-VXyJcFl2ROhHYqKw1yLwRNRF", // GANTI DENGAN SERVER KEY SANDBOX ANDA
});

app.post("/create-transaction", async (req, res) => {
  try {
    const { order_id, gross_amount } = req.body;

    const parameter = {
      transaction_details: {
        order_id,
        gross_amount,
      },
      qris: {
        acquirer: "gopay",
      },
    };

    const transaction = await snap.createTransaction(parameter);
    res.json({ token: transaction.token });
  } catch (error) {
    console.error("Midtrans Error:", error);
    res.status(500).json({ error: "Gagal membuat transaksi" });
  }
});

app.listen(5000, () => console.log("Server berjalan di http://localhost:5000"));
