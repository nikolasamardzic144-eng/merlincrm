"use client";

import { useEffect, useState } from "react";

type Podesavanja = {
  naziv: string;
  email: string;
  whatsapp_phone_number_id: string;
  whatsapp_waba_id: string;
  whatsapp_access_token_set: boolean;
};

export default function PodesavanjaForm() {
  const [ucitano, setUcitano] = useState(false);
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [wabaId, setWabaId] = useState("");
  const [tokenSet, setTokenSet] = useState(false);
  const [noviToken, setNoviToken] = useState("");
  const [cuva, setCuva] = useState(false);
  const [poruka, setPoruka] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/podesavanja")
      .then((r) => r.json())
      .then((data: Podesavanja) => {
        setPhoneNumberId(data.whatsapp_phone_number_id);
        setWabaId(data.whatsapp_waba_id);
        setTokenSet(data.whatsapp_access_token_set);
        setUcitano(true);
      });
  }, []);

  async function sacuvaj() {
    setCuva(true);
    setPoruka(null);
    try {
      const res = await fetch("/api/podesavanja", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsapp_phone_number_id: phoneNumberId,
          whatsapp_waba_id: wabaId,
          whatsapp_access_token: noviToken,
        }),
      });
      if (res.ok) {
        setPoruka("Sačuvano.");
        if (noviToken) {
          setTokenSet(true);
          setNoviToken("");
        }
      } else {
        const data = await res.json();
        setPoruka(data.error ?? "Greška pri čuvanju.");
      }
    } finally {
      setCuva(false);
      setTimeout(() => setPoruka(null), 4000);
    }
  }

  if (!ucitano) {
    return <p className="text-sm text-gray-500">Učitavanje...</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-5">
      <div>
        <h2 className="text-base font-medium text-gray-900 mb-1">
          WhatsApp nalog
        </h2>
        <p className="text-sm text-gray-500">
          Ovi podaci povezuju tvoj WhatsApp Business nalog sa automatikom.
          Broj i ID nalazi se u Meta for Developers, pod WhatsApp &gt;
          Configuration.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number ID
        </label>
        <input
          value={phoneNumberId}
          onChange={(e) => setPhoneNumberId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          placeholder="npr. 1464591083402625"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          WhatsApp Business Account ID (WABA)
        </label>
        <input
          value={wabaId}
          onChange={(e) => setWabaId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          placeholder="npr. 2561517297669239"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Access Token{" "}
          {tokenSet && (
            <span className="text-xs text-green-600 font-normal">
              (već podešen — upiši samo ako želiš da ga promeniš)
            </span>
          )}
        </label>
        <input
          value={noviToken}
          onChange={(e) => setNoviToken(e.target.value)}
          type="password"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          placeholder={tokenSet ? "•••••••• (ostavi prazno da ne menjaš)" : "Unesi token"}
        />
      </div>

      {poruka && <p className="text-sm text-blue-700">{poruka}</p>}

      <button
        onClick={sacuvaj}
        disabled={cuva}
        className="bg-gray-900 text-white text-sm rounded-lg px-4 py-2 hover:bg-gray-800 disabled:opacity-50"
      >
        {cuva ? "Čuvanje..." : "Sačuvaj"}
      </button>
    </div>
  );
}
