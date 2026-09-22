"use client";

import { useState } from "react";
import { Klijent } from "@/lib/types";
import { statusLabel, statusColor } from "@/lib/statusi";
import KlijentModal from "./KlijentModal";

function formatDatum(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function DashboardKlijenti({
  pocetniKlijenti,
}: {
  pocetniKlijenti: Klijent[];
}) {
  const [klijenti, setKlijenti] = useState<Klijent[]>(pocetniKlijenti);
  const [modalOtvoren, setModalOtvoren] = useState(false);
  const [izabranKlijent, setIzabranKlijent] = useState<Klijent | null>(null);
  const [porukaId, setPorukaId] = useState<number | null>(null);
  const [poruka, setPoruka] = useState<string | null>(null);

  function otvoriNovi() {
    setIzabranKlijent(null);
    setModalOtvoren(true);
  }

  function otvoriIzmenu(k: Klijent) {
    setIzabranKlijent(k);
    setModalOtvoren(true);
  }

  function naSacuvano(k: Klijent) {
    setKlijenti((prev) => {
      const postoji = prev.some((p) => p.id === k.id);
      if (postoji) return prev.map((p) => (p.id === k.id ? k : p));
      return [...prev, k];
    });
    setModalOtvoren(false);
  }

  async function obrisi(k: Klijent) {
    if (!confirm(`Obrisati klijenta ${k.ime}?`)) return;
    const res = await fetch(`/api/klijenti/${k.id}`, { method: "DELETE" });
    if (res.ok) {
      setKlijenti((prev) => prev.filter((p) => p.id !== k.id));
    }
  }

  async function posaljiPodsetnikSad(k: Klijent) {
    setPorukaId(k.id);
    setPoruka(null);
    try {
      const res = await fetch(`/api/klijenti/${k.id}/podseti`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setKlijenti((prev) =>
          prev.map((p) => (p.id === k.id ? data.klijent : p))
        );
        setPoruka(
          data.instant
            ? `Podsetnik je odmah poslat klijentu ${k.ime} na WhatsApp.`
            : `Klijent ${k.ime} je označen kao spreman za podsetnik — n8n će mu poslati poruku na sledećoj automatskoj proveri (instant slanje trenutno nije podešeno).`
        );
      } else {
        setPoruka(data.error ?? "Greška.");
      }
    } finally {
      setTimeout(() => setPoruka(null), 6000);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-medium text-gray-900">
          Svi klijenti <span className="text-gray-400 font-normal">({klijenti.length})</span>
        </h2>
        <button
          onClick={otvoriNovi}
          className="bg-gray-900 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-gray-800 transition-colors"
        >
          + Novi klijent
        </button>
      </div>

      {poruka && (
        <div className="mb-4 text-sm bg-blue-50 text-blue-800 rounded-lg px-3 py-2 border border-blue-100">
          {poruka}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead className="bg-gray-50/80 text-gray-500 text-left border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 font-medium">Ime</th>
              <th className="px-4 py-3 font-medium">Telefon</th>
              <th className="px-4 py-3 font-medium">Usluga</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Sledeći servis</th>
              <th className="px-4 py-3 font-medium">Iznos</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {klijenti.map((k) => (
              <tr key={k.id} className="hover:bg-gray-50/70 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {k.ime}
                </td>
                <td className="px-4 py-3 text-gray-600">{k.telefon}</td>
                <td className="px-4 py-3 text-gray-600">{k.usluga}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(
                      k.status
                    )}`}
                  >
                    {statusLabel(k.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {formatDatum(k.sledeci_servis)}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {k.iznos ? `${k.iznos} RSD` : "—"}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => posaljiPodsetnikSad(k)}
                    disabled={porukaId === k.id}
                    className="text-xs text-gray-500 hover:text-gray-900 mr-3"
                  >
                    Pošalji podsetnik
                  </button>
                  <button
                    onClick={() => otvoriIzmenu(k)}
                    className="text-xs text-gray-500 hover:text-gray-900 mr-3"
                  >
                    Izmeni
                  </button>
                  <button
                    onClick={() => obrisi(k)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Obriši
                  </button>
                </td>
              </tr>
            ))}
            {klijenti.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                  Nema klijenata. Dodaj prvog dugmetom iznad.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOtvoren && (
        <KlijentModal
          klijent={izabranKlijent}
          onZatvori={() => setModalOtvoren(false)}
          onSacuvano={naSacuvano}
        />
      )}
    </div>
  );
}
