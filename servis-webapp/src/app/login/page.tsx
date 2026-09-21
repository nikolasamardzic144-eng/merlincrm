"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [lozinka, setLozinka] = useState("");
  const [greska, setGreska] = useState<string | null>(null);
  const [ucitava, setUcitava] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGreska(null);
    setUcitava(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lozinka }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGreska(data.error ?? "Greška pri prijavi.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setGreska("Greška pri povezivanju sa serverom.");
    } finally {
      setUcitava(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow p-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Prijava</h1>
        <p className="text-sm text-gray-500 mb-6">
          Kontrolni panel za praćenje klijenata i servisa.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="ime@firma.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lozinka
            </label>
            <input
              type="password"
              required
              value={lozinka}
              onChange={(e) => setLozinka(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="••••••••"
            />
          </div>
          {greska && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {greska}
            </p>
          )}
          <button
            type="submit"
            disabled={ucitava}
            className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {ucitava ? "Prijavljivanje..." : "Prijavi se"}
          </button>
        </form>
      </div>
    </div>
  );
}
