"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

interface Note {
  id: string;
  title: string;
  price: number;
  file_path: string;
}
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string | undefined;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  theme: { color: string };
}
interface RazorpayConstructor {
  new(options: RazorpayOptions):{
    open: () => void;
  };

}
declare global {
  interface Window {
    Razorpay: RazorpayConstructor;
  }
}

// Load Razorpay script dynamically
const loadRazorpayScript = () =>
  new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) router.push("/auth");
  }, [user, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);

      const { data: notesData, error: notesError } = await supabase
        .from("notes")
        .select("id, title, price, file_path")
        .order("created_at", { ascending: false });

      if (notesError) console.error("Error fetching notes:", notesError.message);
      else setNotes(notesData || []);

      const { data: purchaseData, error: purchaseError } = await supabase
        .from("purchases")
        .select("note_id")
        .eq("user_id", user.id);

      if (purchaseError) console.error("Error fetching purchases:", purchaseError.message);
      else setPurchasedIds(purchaseData?.map((p) => p.note_id) || []);

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const openPDF = (note: Note) => {
    const { data } = supabase.storage.from("notes").getPublicUrl(note.file_path);
    const publicUrl = data?.publicUrl;
    if (publicUrl) window.open(publicUrl, "_blank");
    else alert("Failed to get file URL.");
  };

  const handleBuy = async (note: Note) => {
    if (!note.file_path) {
      alert("File not available.");
      return;
    }

    const res = await loadRazorpayScript();
    if (!res) {
      alert("Failed to load Razorpay SDK.");
      return;
    }

    try {
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: note.price, noteId: note.id }),
      });
      const orderData = await orderRes.json();
      if (orderData.error) throw new Error(orderData.error);

      const options: RazorpayOptions = {
        key: process.env.RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Study Notes",
        description: note.title,
        order_id: orderData.id,
        handler: async function (response) {
          try {
            if (!user) {
              alert("User not logged in");
              return;
            }

            const res = await fetch("/api/record-purchase", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: user.id,
                noteId: note.id,
                paymentId: response.razorpay_payment_id,
              }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setPurchasedIds((prev) => [...prev, note.id]);
            openPDF(note);
              } catch (err: unknown) {
      if (err instanceof Error) {
        alert("Payment recorded, but failed to open PDF: " + err.message);
      } else {
        alert("Payment recorded, but failed to open PDF due to unknown error.");
      }
    }
        },
        theme: { color: "#F59E0B" }, // warm amber theme
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
} catch (err: unknown) {
  if (err instanceof Error) {
    alert("Payment failed: " + err.message);
  } else {
    alert("Payment failed due to unknown error.");
  }
}

  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-6 flex flex-col items-center">
      <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-5xl mb-8 text-center md:text-left">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4 md:mb-0">
          Welcome, {user.email}
        </h1>
        <button
          onClick={signOut}
          className="px-5 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
        >
          Sign Out
        </button>
      </div>

      <h2 className="text-2xl font-semibold mb-6 text-gray-900 text-center w-full max-w-5xl">
        Available Study Material
      </h2>

      {loading ? (
        <p className="text-gray-700">Loading notes...</p>
      ) : notes.length === 0 ? (
        <p className="text-gray-700">No notes available yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          {notes.map((note) => {
            const purchased = purchasedIds.includes(note.id);

            return (
              <div
                key={note.id}
                className="bg-white p-6 rounded-3xl shadow-md flex flex-col justify-between hover:shadow-xl transition"
              >
                <h3 className="text-xl font-bold mb-2 text-gray-900">{note.title}</h3>
                <p className="text-gray-800 mb-4 font-medium">₹{note.price}</p>

                {purchased ? (
                  <button
                    onClick={() => openPDF(note)}
                    className="w-full py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition"
                  >
                    View PDF
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuy(note)}
                    className="w-full py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
                  >
                    Buy Now
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
