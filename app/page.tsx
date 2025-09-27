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

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [popularNotes, setPopularNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("notes")
        .select("id, title, price, file_path")
        .order("price", { ascending: false })
        .limit(6);
      if (error) console.error("Error fetching notes:", error.message);
      else setPopularNotes(data || []);
      setLoading(false);
    };
    fetchNotes();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-300 text-gray-900 py-24 px-6 text-center rounded-b-3xl shadow-md">
        <h1 className="text-5xl font-extrabold mb-4">Welcome to StudyHub!</h1>
        <p className="text-xl mb-8">Your one-stop platform for all your study materials and notes.</p>
        <div className="flex justify-center gap-4 flex-wrap">
          {!user && (
            <button
              onClick={() => router.push("/auth")}
              className="px-6 py-3 bg-white text-amber-600 font-semibold rounded-full hover:bg-gray-100 transition"
            >
              Sign In / Sign Up
            </button>
          )}
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-amber-600 text-white font-semibold rounded-full hover:bg-amber-700 transition"
          >
            Explore Notes
          </button>
        </div>
      </section>

      {/* Popular Notes */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">Most Popular Notes</h2>
        {loading ? (
          <p className="text-gray-600 text-center">Loading notes...</p>
        ) : popularNotes.length === 0 ? (
          <p className="text-gray-600 text-center">No notes available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularNotes.map((note) => {
              const { data } = supabase.storage.from("notes").getPublicUrl(note.file_path);
              const publicUrl = data?.publicUrl || "#";

              return (
                <div
                  key={note.id}
                  className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition flex flex-col justify-between"
                >
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{note.title}</h3>
                  <p className="text-gray-700 mb-4">₹{note.price}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(publicUrl, "_blank")}
                      className="w-full px-4 py-2 bg-amber-400 text-white rounded-full hover:bg-amber-500 transition"
                    >
                      Preview
                    </button>
                    {user && (
                      <button
                        onClick={() => router.push("/dashboard")}
                        className="w-full px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition"
                      >
                        Buy / View
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-amber-50 py-16 px-6 text-center rounded-t-3xl shadow-inner">
        <h2 className="text-3xl font-bold mb-4 text-gray-900">Start Learning Today!</h2>
        <p className="text-lg mb-6 text-gray-700">Sign up now and unlock all your study materials instantly.</p>
        <button
          onClick={() => router.push("/auth")}
          className="px-8 py-3 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 transition"
        >
          Get Started
        </button>
      </section>
    </div>
  );
}
