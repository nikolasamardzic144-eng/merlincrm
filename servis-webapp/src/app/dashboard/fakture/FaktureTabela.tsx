"use client";

import { useMemo, useState } from "react";
import { Faktura, Klijent } from "@/lib/types";

function formatDatum(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatNovac(v: string | number | null) {
  const n = Number(v);
  if (!v || Number.isNaN(n)) return "—";
  return `${n.toLocaleString("sr-RS")} RSD`;
}

type Filter = "sve" | "nenaplaceno" | "naplaceno";

export default function FaktureTabela({
  pocetneFakture,
  klijenti,
}: {
  pocetneFakture: Faktura[];
  klijenti: Klijent[];
}) {
  const [fakture, setFakture] = useState<Faktura[]>(pocetneFakture);
  const [filter, setFilter] = useState<Filter>("sve");
  const [modalOtvoren, setModalOtvoren] = useState(false);
  const [zauzet, setZauzet] = useState<number | null>(null);

  const prikazane = useMemo(
    () =>
      filter === "sve" ? fakture : fakture.filter((f) => f.status === filter),
    [fakture, filter]
  );

  const zbir = useMemo(() => {
    const naplaceno = fakture
      .filter((f) => f.status === "naplaceno")
      .reduce((s, f) => s + (Number(f.iznos) || 0), 0);
    const nenaplaceno = fakture
      .filter((f) => f.status !== "naplaceno")
      .reduce((s, f) => s + (Number(f.iznos) || 0), 0);
    return { naplaceno, nenaplaceno };
  }, [fakture]);

  async function promeniStatus(f: Faktura) {
    setZauzet(f.id);
    try {
      const noviStatus = f.status === "naplaceno" ? "nenaplaceno" : "naplaceno";
      const res = await fetch(`/api/fakture/${f.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: noviStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setFakture((prev) =>
          prev.map((p) => (p.id === f.id ? data.faktura : p))
        );
      }
    } finally {
      setZauzet(null);
    }
  }

  async function obrisi(f: Faktura) {
    if (!confirm(`Obrisati fakturu ${f.broj ?? f.id}?`)) return;
    const res = await fetch(`/api/fakture/${f.id}`, { method: "DELETE" });
    if (res.ok) setFakture((prev) => prev.filter((p) => p.id !== f.id));
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1 bg-green-400" />
          <p className="text-2xl font-semibold text-gray-900">
            {zbir.naplaceno.toLocaleString("sr-RS")} <span className="text-base text-gray-400">RSD</span>
          </p>
          <p className="text-sm text-gray-500 mt-0.5">Naplaćeno ukupno</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1 bg-red-400" />
          <p className="text-2xl font-semibold text-gray-900">
            {zbir.nenaplaceno.toLocaleString("sr-RS")} <span className="text-base text-gray-400">RSD</span>
          </p>
          <p className="text-sm text-gray-500 mt-0.5">Čeka naplatu</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5">
          {(
            [
              ["sve", "Sve"],
              ["nenaplaceno", "Nenaplaćeno"],
              ["naplaceno", "Naplaćeno"],
            ] as [Filter, string][]
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                filter === k
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setModalOtvoren(true)}
          className="bg-gray-900 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-gray-800 transition-colors"
        >
          + Nova faktura
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm min-w-[860px]">
          <thead className="bg-gray-50/80 text-gray-500 text-left border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 font-medium">Broj</th>
              <th className="px-4 py-3 font-medium">Klijent</th>
              <th className="px-4 py-3 font-medium">Usluga</th>
              <th className="px-4 py-3 font-medium">Datum</th>
              <th className="px-4 py-3 font-medium">Iznos</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {prikazane.map((f) => (
              <tr key={f.id} className="hover:bg-gray-50/70 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900 tabular-nums">
                  {f.broj ?? `#${f.id}`}
                </td>
                <td className="px-4 py-3 text-gray-600">{f.ime_klijenta ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{f.usluga ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600 tabular-nums">
                  {formatDatum(f.datum)}
                </td>
                <td className="px-4 py-3 text-gray-900 tabular-nums">
                  {formatNovac(f.iznos)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                      f.status === "naplaceno"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {f.status === "naplaceno" ? "Naplaćeno" : "Čeka naplatu"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {f.pdf_url && (
                    <a
                      href={f.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-gray-500 hover:text-gray-900 mr-3"
                    >
                      PDF
                    </a>
                  )}
                  <button
                    onClick={() => promeniStatus(f)}
                    disabled={zauzet === f.id}
                    className="text-xs text-gray-500 hover:text-gray-900 mr-3 disabled:opacity-40"
                  >
                    {f.status === "naplaceno" ? "Vrati u nenaplaćeno" : "Označi naplaćeno"}
                  </button>
                  <button
                    onClick={() => obrisi(f)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Obriši
                  </button>
                </td>
              </tr>
            ))}
            {prikazane.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  {fakture.length === 0
                    ? "Još nema faktura. Sistem je upisuje automatski kad pošalje fakturu klijentu, a možeš dodati i ručno."
                    : "Nema faktura u ovom filteru."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOtvoren && (
        <NovaFakturaModal
          klijenti={klijenti}
          onZatvori={() => setModalOtvoren(false)}
          onSacuvano={(f) => {
            setFakture((prev) => [f, ...prev]);
            setModalOtvoren(false);
          }}
        />
      )}
    </div>
  );
}

function NovaFakturaModal({
  klijenti,
  onZatvori,
  onSacuvano,
}: {
  klijenti: Klijent[];
  onZatvori: () => void;
  onSacuvano: (f: Faktura) => void;
}) {
  const [klijentId, setKlijentId] = useState("");
  const [ime, setIme] = useState("");
  const [usluga, setUsluga] = useState("");
  const [iznos, setIznos] = useState("");
  const [datum, setDatum] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState("nenaplaceno");
  const [cuva, setCuva] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);

  function izaberiKlijenta(id: string) {
    setKlijentId(id);
    const k = klijenti.find((x) => String(x.id) === id);
    if (k) {
      setIme(k.ime);
      setUsluga(k.usluga);
      if (k.iznos) setIznos(String(k.iznos));
    }
  }

  async function sacuvaj() {
    setCuva(true);
    setGreska(null);
    try {
      const res = await fetch("/api/fakture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          klijent_id: klijentId ? Number(klijentId) : null,
          ime_klijenta: ime,
          usluga,
          iznos,
          datum,
          status,
        }),
      });
      const data = await res.json();
      if (res.ok) onSacuvano(data.faktura);
      else setGreska(data.error ?? "Greška.");
    } finally {
      setCuva(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h3 className="text-base font-medium text-gray-900">Nova faktura</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Klijent iz baze (opciono)
          </label>
          <select
            value={klijentId}
            onChange={(e) => izaberiKlijenta(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">— ručni unos —</option>
            {klijenti.map((k) => (
              <option key={k.id} value={k.id}>
                {k.ime} ({k.usluga})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ime klijenta
          </label>
          <input
            value={ime}
            onChange={(e) => setIme(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Usluga
          </label>
          <input
            value={usluga}
            onChange={(e) => setUsluga(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Iznos (RSD)
            </label>
            <input
              value={iznos}
              onChange={(e) => setIznos(e.target.value)}
              type="number"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Datum
            </label>
            <input
              value={datum}
              onChange={(e) => setDatum(e.target.value)}
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="nenaplaceno">Čeka naplatu</option>
            <option value="naplaceno">Naplaćeno</option>
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
            disabled={cuva || !ime || !iznos}
            className="bg-gray-900 text-white text-sm rounded-lg px-4 py-2 hover:bg-gray-800 disabled:opacity-50"
          >
            {cuva ? "Čuvanje..." : "Sačuvaj"}
          </button>
        </div>
      </div>
    </div>
  );
}
