import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Simpan order ke Firestore
 */
export const saveOrderToFirestore = async ({ cart, tableNumber, note }) => {
  if (!cart || Object.keys(cart).length === 0) {
    throw new Error("Keranjang kosong!");
  }
  if (!tableNumber) {
    throw new Error("Nomor meja harus diisi!");
  }

  const items = Object.values(cart).map((i) => ({
    itemName: i.name,
    variant: i.type,
    qty: i.qty,
    price: i.price,
    status: "Menunggu Konfirmasi",
    timestamp: serverTimestamp(),
  }));

  const orderData = {
    tableNumber,
    note: note || "",
    items,
    status: "Menunggu Konfirmasi",
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "orders"), orderData);
  return docRef.id;
};
