"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

type Note = {
  id: string;
  title: string;
  price: number;
  file_path: string;
};

export default function AdminPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (!user) return;
    if (user.email !== adminEmail) router.push("/auth");
  }, [user, router, adminEmail]);

  const fetchNotes = async () => {
    setLoadingNotes(true);
    const { data, error } = await supabase
      .from("notes")
      .select("id, title, price, file_path")
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching notes:", error.message);
    else setNotes(data || []);
    setLoadingNotes(false);
  };

  useEffect(() => {
    if (user?.email === adminEmail) fetchNotes();
  }, [user]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !price) {
      setMessage("Please fill all fields and select a PDF.");
      return;
    }

    try {
      setUploading(true);
      setMessage("");

      const fileName = `${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("notes")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from("notes").insert({
        title,
        price: Number(price),
        file_path: fileName,
      });

      if (dbError) throw dbError;

      setMessage("✅ Upload successful!");
      setTitle("");
      setPrice("");
      setFile(null);
      fetchNotes();
    } catch (err: any) {
      console.error(err);
      setMessage("❌ Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (note: Note) => {
    if (!confirm(`Delete "${note.title}"? This cannot be undone.`)) return;

    try {
      setMessage("");

      const { error: storageError } = await supabase.storage
        .from("notes")
        .remove([note.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("notes")
        .delete()
        .eq("id", note.id);

      if (dbError) throw dbError;

      setMessage(`✅ "${note.title}" deleted successfully.`);
      fetchNotes();
    } catch (err: any) {
      console.error(err);
      setMessage("❌ Delete failed: " + err.message);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-6 flex flex-col items-center">
      <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-5xl mb-8 text-center md:text-left">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 md:mb-0">Admin Panel</h1>
        <button
          onClick={signOut}
          className="px-5 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
        >
          Sign Out
        </button>
      </div>

      {/* Upload Form */}
      <form
        onSubmit={handleUpload}
        className="bg-white p-6 rounded-3xl shadow-md w-full max-w-md mb-8 text-center"
      >
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Upload New Note</h2>

        <div className="mb-4 text-left">
          <label className="block font-medium mb-1 text-gray-800">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title"
            className="w-full border border-gray-300 rounded-xl p-2 text-gray-900 focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div className="mb-4 text-left">
          <label className="block font-medium mb-1 text-gray-800">Price (₹)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price"
            className="w-full border border-gray-300 rounded-xl p-2 text-gray-900 focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div className="mb-4 text-left">
          <label className="block font-medium mb-1 text-gray-800">Upload PDF</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full"
          />
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload Note"}
        </button>
      </form>

      {message && <p className="mb-6 text-center text-gray-900">{message}</p>}

      {/* Existing Notes */}
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 text-center w-full max-w-5xl">
        Existing Notes
      </h2>

      {loadingNotes ? (
        <p className="text-gray-800">Loading notes...</p>
      ) : notes.length === 0 ? (
        <p className="text-gray-800">No notes uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          {notes.map((note) => {
            const { data } = supabase.storage.from("notes").getPublicUrl(note.file_path);
            const publicUrl = data?.publicUrl || "#";

            return (
              <div
                key={note.id}
                className="bg-white p-6 rounded-3xl shadow-md flex flex-col justify-between hover:shadow-xl transition text-center"
              >
                <div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900">{note.title}</h3>
                  <p className="text-gray-800 mb-2">Price: ₹{note.price}</p>
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-500 font-medium hover:underline"
                  >
                    View PDF
                  </a>
                </div>
                <button
                  onClick={() => handleDelete(note)}
                  className="mt-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
