"use client";

import { useState, useEffect } from "react";
import { validateHisenseCookie } from "@/helpers/HisenseCookie";

export default function HisenseCookieInput({ onSuccess }: { onSuccess?: () => void }) {
  const [cookie, setCookie] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("hisense_cookie");
    if (saved) setCookie(saved);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const buttonValue = await validateHisenseCookie(cookie);
    setLoading(false);

    if (!buttonValue) {
      alert("Cookie tidak valid atau button tidak ditemukan!");
      return;
    }

    localStorage.setItem("hisense_cookie", cookie);
    localStorage.setItem("nama", buttonValue);

    alert(`PHPSESSID valid & disimpan!\nnama: ${buttonValue}`);
    onSuccess?.(); // ✅ modal baru bisa ditutup kalau valid
  };

  return (
    <div className="flex gap-2 items-center">
      <input
        type="text"
        value={cookie}
        onChange={(e) => setCookie(e.target.value)}
        placeholder="Masukkan PHPSESSID"
        className="border px-2 py-1 rounded w-full text-black"
      />
      <button
        onClick={handleSave}
        disabled={loading}
        className="bg-purple-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Mengecek..." : "Simpan"}
      </button>
    </div>
  );
}
