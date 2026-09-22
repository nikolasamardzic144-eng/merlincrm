"use client";

import { useState } from "react";
import { Korisnik } from "@/lib/types";

export default function TimLista({
  pocetniKorisnici,
  mojId,
  mojaUloga,
}: {
  pocetniKorisnici: Korisnik[];
  mojId: number | null;
  mojaUloga: string;
}) {
  const [korisnici, setKorisnici] = useState<Korisnik[]>(pocetniKorisnici);
  const [modalOtvoren, setModalOtvoren] = useState(false);
  const jeVlasnik = mojaUloga === "vlasnik";

  async function ukloni(k: Korisnik) {
    if (!confirm(`Ukloniti ${k.email} iz tima?`)) return;
    const res = await fetch(`/api/tim/${k.id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      setKorisnici((prev) => prev.filter((p) => p.id !== k.id));
    } else {
      alert(data.error ?? "Greška.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-medium text-gray-900">
          Članovi <span className="text-gray-400 font-normal">({korisnici.length})</span>
        </h2>
        {jeVlasnik && (
          <button
            onClick={() => setModalOtvoren(true)}
            className="bg-gray-900 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-gray-800 transition-colors"
          >
            + Dodaj člana
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead className="bg-gray-50/80 text-gray-500 text-left border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 font-medium">Ime</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Uloga</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {korisnici.map((k) => (
              <tr key={k.id} className="hover:bg-gray-50/70 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {k.ime ?? "—"}
                  {mojId === k.id && (
                    <span className="ml-2 text-xs text-gray-400">(ti)</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">{k.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                      k.uloga === "vlasnik"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {k.uloga === "vlasnik" ? "Vlasnik" : "Član"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {jeVlasnik && mojId !== k.id && (
                    <button
                      onClick={() => ukloni(k)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Ukloni
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {korisnici.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-gray-400">
                  Još nema članova tima.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!jeVlasnik && (
        <p className="text-xs text-gray-400 mt-3">
          Samo vlasnik naloga može da dodaje i uklanja članove tima.
        </p>
      )}

      {modalOtvoren && (
        <NoviClanModal
          onZatvori={() => setModalOtvoren(false)}
          onSacuvano={(k) => {
            setKorisnici((prev) => [...prev, k]);
            setModalOtvoren(false);
          }}
        />
      )}
    </div>
  );
}

function NoviClanModal({
  onZatvori,
  onSacuvano,
}: {
  onZatvori: () => void;
  onSacuvano: (k: Korisnik) => void;
}) {
  const [ime, setIme] = useState("");
  const [email, setEmail] = useState("");
  const [lozinka, setLozinka] = useState("");
  const [uloga, setUloga] = useState("clan");
  const [cuva, setCuva] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);

  async function sacuvaj() {
    setCuva(true);
    setGreska(null);
    try {
      const res = await fetch("/api/tim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ime, email, lozinka, uloga }),
      });
      const data = await res.json();
      if (res.ok) onSacuvano(data.korisnik);
      else setGreska(data.error ?? "Greška.");
    } finally {
      setCuva(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h3 className="text-base font-medium text-gray-900">Novi član tima</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ime</label>
          <input
            value={ime}
            onChange={(e) => setIme(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lozinka
          </label>
          <input
            value={lozinka}
            onChange={(e) => setLozinka(e.target.value)}
            type="text"
            placeholder="Bar 6 karaktera — daj je članu tima"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Uloga
          </label>
          <select
            value={uloga}
            onChange={(e) => setUloga(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="clan">Član (koristi sistem)</option>
            <option value="vlasnik">Vlasnik (može i da upravlja timom)</option>
          </select>
        </div>

        {greska && <p className="text-sm text-red-600">{greska}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onZatvori}
            className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2"
          >
            Otkaži
          </button>
          <button
            onClick={sacuvaj}
            disabled={cuva || !email || !lozinka}
            className="bg-gray-900 text-white text-sm rounded-lg px-4 py-2 hover:bg-gray-800 disabled:opacity-50"
          >
            {cuva ? "Dodavanje..." : "Dodaj"}
          </button>
        </div>
      </div>
    </div>
  );
}
