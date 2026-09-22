"use client";

import { useEffect, useState } from "react";
import { PREDLOSCI_META } from "@/lib/predlosci";

export default function PredlosciForm() {
  const [tekstovi, setTekstovi] = useState<Record<string, string>>({});
  const [ucitano, setUcitano] = useState(false);
  const [cuva, setCuva] = useState(false);
  const [poruka, setPoruka] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/predlosci")
      .then((r) => r.json())
      .then((data) => {
        const mapa: Record<string, string> = {};
        for (const p of data.predlosci ?? []) mapa[p.kljuc] = p.tekst;
        setTekstovi(mapa);
        setUcitano(true);
      })
      .catch(() => setUcitano(true));
  }, []);

  async function sacuvaj() {
    setCuva(true);
    setPoruka(null);
    try {
      const res = await fetch("/api/predlosci", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          predlosci: PREDLOSCI_META.map((m) => ({
            kljuc: m.kljuc,
            tekst: tekstovi[m.kljuc] ?? m.podrazumevano,
          })),
        }),
      });
      setPoruka(res.ok ? "Sačuvano — automatika odmah koristi nove tekstove." : "Greška pri čuvanju.");
    } finally {
      setCuva(false);
      setTimeout(() => setPoruka(null), 5000);
    }
  }

  function vratiPodrazumevano(kljuc: string) {
    const m = PREDLOSCI_META.find((x) => x.kljuc === kljuc);
    if (m) setTekstovi((prev) => ({ ...prev, [kljuc]: m.podrazumevano }));
  }

  if (!ucitano) {
    return <p className="text-sm text-gray-500">Učitavanje...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-900">
        <strong className="font-medium">Napomena:</strong> ovde menjaš samo
        slobodne odgovore koje sistem šalje kao reakciju na poruku klijenta.
        Prvi podsetnik i pitanje o obavljenom poslu idu kao WhatsApp „template“
        poruke koje Meta mora da odobri, pa se njihov tekst menja u Meta
        panelu, ne ovde.
      </div>

      {PREDLOSCI_META.map((m) => (
        <div
          key={m.kljuc}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
        >
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h3 className="text-sm font-medium text-gray-900">{m.naslov}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{m.opis}</p>
            </div>
            <button
              onClick={() => vratiPodrazumevano(m.kljuc)}
              className="text-xs text-gray-400 hover:text-gray-700 whitespace-nowrap"
            >
              Vrati podrazumevano
            </button>
          </div>
          <textarea
            value={tekstovi[m.kljuc] ?? m.podrazumevano}
            onChange={(e) =>
              setTekstovi((prev) => ({ ...prev, [m.kljuc]: e.target.value }))
            }
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-y"
          />
          <p className="text-xs text-gray-400 mt-1">
            {(tekstovi[m.kljuc] ?? m.podrazumevano).length} karaktera
          </p>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <button
          onClick={sacuvaj}
          disabled={cuva}
          className="bg-gray-900 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-gray-800 disabled:opacity-50"
        >
          {cuva ? "Čuvanje..." : "Sačuvaj sve"}
        </button>
        {poruka && <span className="text-sm text-blue-700">{poruka}</span>}
      </div>
    </div>
  );
}
