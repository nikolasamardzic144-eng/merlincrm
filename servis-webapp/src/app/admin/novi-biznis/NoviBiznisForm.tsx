"use client";

import { useState } from "react";

export default function NoviBiznisForm() {
  const [naziv, setNaziv] = useState("");
  const [email, setEmail] = useState("");
  const [lozinka, setLozinka] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [wabaId, setWabaId] = useState("");
  const [cuva, setCuva] = useState(false);
  const [poruka, setPoruka] = useState<string | null>(null);
  const [uspesno, setUspesno] = useState(false);

  async function posalji() {
    setCuva(true);
    setPoruka(null);
    try {
      const res = await fetch("/api/admin/biznisi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          naziv,
          email,
          lozinka,
          whatsapp_phone_number_id: phoneNumberId,
          whatsapp_waba_id: wabaId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUspesno(true);
        setPoruka(
          `Kreiran biznis "${data.biznis.naziv}". Prijava: ${data.biznis.email}`
        );
        setNaziv("");
        setEmail("");
        setLozinka("");
        setPhoneNumberId("");
        setWabaId("");
      } else {
        setPoruka(data.error ?? "Greška.");
      }
    } finally {
      setCuva(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Naziv firme
        </label>
        <input
          value={naziv}
          onChange={(e) => setNaziv(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email za login
        </label>
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
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          placeholder="Daj klijentu ovu lozinku, može je promeniti kasnije"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          WhatsApp Phone Number ID (opciono, može se popuniti kasnije iz Podešavanja)
        </label>
        <input
          value={phoneNumberId}
          onChange={(e) => setPhoneNumberId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          WABA ID (opciono)
        </label>
        <input
          value={wabaId}
          onChange={(e) => setWabaId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {poruka && (
        <p className={`text-sm ${uspesno ? "text-green-700" : "text-red-600"}`}>
          {poruka}
        </p>
      )}

      <button
        onClick={posalji}
        disabled={cuva || !naziv || !email || !lozinka}
        className="bg-gray-900 text-white text-sm rounded-lg px-4 py-2 hover:bg-gray-800 disabled:opacity-50"
      >
        {cuva ? "Kreiranje..." : "Kreiraj biznis"}
      </button>
    </div>
  );
}
