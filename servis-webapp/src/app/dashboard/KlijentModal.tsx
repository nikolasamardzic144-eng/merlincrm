"use client";

import { useState } from "react";
import { Klijent } from "@/lib/types";

function danas(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function KlijentModal({
  klijent,
  onZatvori,
  onSacuvano,
}: {
  klijent: Klijent | null;
  onZatvori: () => void;
  onSacuvano: (k: Klijent) => void;
}) {
  const [ime, setIme] = useState(klijent?.ime ?? "");
  const [telefon, setTelefon] = useState(klijent?.telefon ?? "");
  const [usluga, setUsluga] = useState(klijent?.usluga ?? "");
  const [sledeciServis, setSledeciServis] = useState(
    klijent?.sledeci_servis?.slice(0, 10) ?? danas()
  );
  const [intervalDana, setIntervalDana] = useState(
    String(klijent?.interval_dana ?? 90)
  );
  const [iznos, setIznos] = useState(klijent?.iznos ?? "");
  const [greska, setGreska] = useState<string | null>(null);
  const [cuva, setCuva] = useState(false);

  const jeIzmena = !!klijent;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGreska(null);
    setCuva(true);
    try {
      const telo = {
        ime,
        telefon,
        usluga,
        sledeci_servis: sledeciServis,
        interval_dana: Number(intervalDana),
        iznos: iznos ? Number(iznos) : null,
      };
      const url = jeIzmena ? `/api/klijenti/${klijent!.id}` : "/api/klijenti";
      const metoda = jeIzmena ? "PATCH" : "POST";
      const res = await fetch(url, {
        method: metoda,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(telo),
      });
      const data = await res.json();
      if (!res.ok) {
        setGreska(data.error ?? "Greška pri čuvanju.");
        return;
      }
      onSacuvano(data.klijent);
    } catch {
      setGreska("Greška pri povezivanju sa serverom.");
    } finally {
      setCuva(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          {jeIzmena ? "Izmeni klijenta" : "Novi klijent"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Ime i prezime
            </label>
            <input
              required
              value={ime}
              onChange={(e) => setIme(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Telefon (WhatsApp, sa pozivnim brojem, bez +)
            </label>
            <input
              required
              value={telefon}
              onChange={(e) => setTelefon(e.target.value)}
              placeholder="381601234567"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Usluga
            </label>
            <input
              required
              value={usluga}
              onChange={(e) => setUsluga(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Sledeći servis
              </label>
              <input
                type="date"
                required
                value={sledeciServis}
                onChange={(e) => setSledeciServis(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Interval (dana)
              </label>
              <input
                type="number"
                required
                value={intervalDana}
                onChange={(e) => setIntervalDana(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Iznos (RSD, opciono)
            </label>
            <input
              type="number"
              value={iznos ?? ""}
              onChange={(e) => setIznos(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {greska && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {greska}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onZatvori}
              className="text-sm text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              Otkaži
            </button>
            <button
              type="submit"
              disabled={cuva}
              className="bg-gray-900 text-white text-sm rounded-lg px-4 py-2 hover:bg-gray-800 disabled:opacity-50"
            >
              {cuva ? "Čuvanje..." : "Sačuvaj"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
