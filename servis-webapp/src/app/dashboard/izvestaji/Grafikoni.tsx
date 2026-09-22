"use client";

import { useState } from "react";

export type MesecniRed = {
  kljuc: string;
  label: string;
  naplaceno: number;
  broj: number;
};

export type StatusRed = {
  status: string;
  label: string;
  broj: number;
};

type Kpi = {
  naplaceno: number;
  nenaplaceno: number;
  brojFaktura: number;
  prosek: number;
};

// Boje: jedna sekvencijalna plava rampa (prihod) i narandzasta za drugi
// sekvencijalni kontekst (broj servisa). Tekst nikad ne nosi boju serije.
const PLAVA = "#2a78d6";
const NARANDZASTA = "#eb6834";
const PLAVA_RAMPA = ["#86b6ef", "#5598e7", "#2a78d6", "#1c5cab", "#184f95", "#104281", "#0d366b"];
const MREZA = "#e5e7eb";

function lepMaksimum(v: number): number {
  if (v <= 0) return 1;
  const red = Math.pow(10, Math.floor(Math.log10(v)));
  const norm = v / red;
  const korak = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return korak * red;
}

function kolonaPath(x: number, y: number, w: number, h: number, r = 4) {
  const rr = Math.max(0, Math.min(r, w / 2, h));
  if (h <= 0) return "";
  return `M${x},${y + h} L${x},${y + rr} Q${x},${y} ${x + rr},${y} L${x + w - rr},${y} Q${x + w},${y} ${x + w},${y + rr} L${x + w},${y + h} Z`;
}

function trakaPath(x: number, y: number, w: number, h: number, r = 4) {
  const rr = Math.max(0, Math.min(r, h / 2, w));
  if (w <= 0) return "";
  return `M${x},${y} L${x + w - rr},${y} Q${x + w},${y} ${x + w},${y + rr} L${x + w},${y + h - rr} Q${x + w},${y + h} ${x + w - rr},${y + h} L${x},${y + h} Z`;
}

function formatBroj(n: number) {
  return Math.round(n).toLocaleString("sr-RS");
}

function formatKratko(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".0", "")}K`;
  return String(Math.round(n));
}

function Kartica({
  naslov,
  podnaslov,
  children,
}: {
  naslov: string;
  podnaslov?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h2 className="text-sm font-medium text-gray-900">{naslov}</h2>
      {podnaslov && <p className="text-xs text-gray-500 mt-0.5">{podnaslov}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function KolonskiGrafikon({
  redovi,
  vrednost,
  boja,
  jedinica,
}: {
  redovi: MesecniRed[];
  vrednost: (r: MesecniRed) => number;
  boja: string;
  jedinica: string;
}) {
  const [aktivan, setAktivan] = useState<number | null>(null);

  const W = 720;
  const H = 220;
  const M = { top: 24, right: 8, bottom: 26, left: 44 };
  const innerW = W - M.left - M.right;
  const innerH = H - M.top - M.bottom;

  const vrednosti = redovi.map(vrednost);
  const maxVrednost = Math.max(...vrednosti, 0);
  const prazno = maxVrednost <= 0;
  const maxY = lepMaksimum(maxVrednost);
  const indexMaksimuma = vrednosti.indexOf(maxVrednost);

  const band = innerW / redovi.length;
  // viewBox se skalira na sirinu kartice (~1.5x), pa je 16 ovde ~24px na ekranu
  const sirinaKolone = Math.min(16, band * 0.5);

  const tikovi = [0, maxY / 2, maxY];

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img">
        {/* mreza + y ose */}
        {tikovi.map((t, i) => {
          const y = M.top + innerH - (t / maxY) * innerH;
          return (
            <g key={i}>
              <line
                x1={M.left}
                x2={W - M.right}
                y1={y}
                y2={y}
                stroke={MREZA}
                strokeWidth="1"
              />
              <text
                x={M.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-gray-400"
                style={{ fontSize: 11, fontVariantNumeric: "tabular-nums" }}
              >
                {formatKratko(t)}
              </text>
            </g>
          );
        })}

        {/* kolone */}
        {redovi.map((r, i) => {
          const v = vrednost(r);
          const h = prazno ? 0 : (v / maxY) * innerH;
          const x = M.left + i * band + (band - sirinaKolone) / 2;
          const y = M.top + innerH - h;
          const istaknut = aktivan === i;
          return (
            <g key={r.kljuc}>
              {/* siroka nevidljiva zona za hover */}
              <rect
                x={M.left + i * band}
                y={M.top}
                width={band}
                height={innerH}
                fill="transparent"
                onMouseEnter={() => setAktivan(i)}
                onMouseLeave={() => setAktivan(null)}
              />
              {h > 0 && (
                <path
                  d={kolonaPath(x, y, sirinaKolone, h)}
                  fill={boja}
                  opacity={aktivan === null || istaknut ? 1 : 0.55}
                  pointerEvents="none"
                />
              )}
              <text
                x={M.left + i * band + band / 2}
                y={H - 8}
                textAnchor="middle"
                className="fill-gray-400"
                style={{ fontSize: 11 }}
                pointerEvents="none"
              >
                {r.label}
              </text>
              {/* direktna oznaka samo na najvecoj koloni */}
              {!prazno && i === indexMaksimuma && h > 0 && (
                <text
                  x={x + sirinaKolone / 2}
                  y={y - 6}
                  textAnchor="middle"
                  className="fill-gray-700"
                  style={{ fontSize: 11, fontWeight: 500 }}
                  pointerEvents="none"
                >
                  {formatKratko(v)}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {prazno && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-gray-400 bg-white/80 px-3 py-1.5 rounded-lg">
            Još nema podataka za ovaj period
          </p>
        </div>
      )}

      {aktivan !== null && !prazno && (
        <div
          className="absolute -translate-x-1/2 -translate-y-full pointer-events-none bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap"
          style={{
            left: `${((M.left + aktivan * band + band / 2) / W) * 100}%`,
            top: "38%",
          }}
        >
          <span className="text-gray-300">{redovi[aktivan].label}: </span>
          <span className="font-medium tabular-nums">
            {formatBroj(vrednost(redovi[aktivan]))} {jedinica}
          </span>
        </div>
      )}
    </div>
  );
}

function LevakGrafikon({ redovi }: { redovi: StatusRed[] }) {
  const [aktivan, setAktivan] = useState<number | null>(null);

  if (redovi.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-8 text-center">
        Nema klijenata za prikaz.
      </p>
    );
  }

  const W = 720;
  const visinaReda = 34;
  const H = redovi.length * visinaReda + 8;
  const levo = 230;
  const desno = 44;
  const innerW = W - levo - desno;
  const maxBroj = Math.max(...redovi.map((r) => r.broj), 1);
  const debljinaTrake = 18;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img">
        {redovi.map((r, i) => {
          const y = i * visinaReda + 6;
          const w = (r.broj / maxBroj) * innerW;
          const boja = PLAVA_RAMPA[Math.min(i, PLAVA_RAMPA.length - 1)];
          const istaknut = aktivan === i;
          return (
            <g
              key={r.status}
              onMouseEnter={() => setAktivan(i)}
              onMouseLeave={() => setAktivan(null)}
            >
              <rect x={0} y={y} width={W} height={visinaReda} fill="transparent" />
              <text
                x={levo - 12}
                y={y + debljinaTrake / 2 + 5}
                textAnchor="end"
                className="fill-gray-600"
                style={{ fontSize: 12 }}
              >
                {r.label}
              </text>
              <path
                d={trakaPath(levo, y, Math.max(w, 2), debljinaTrake)}
                fill={boja}
                opacity={aktivan === null || istaknut ? 1 : 0.55}
              />
              <text
                x={levo + Math.max(w, 2) + 8}
                y={y + debljinaTrake / 2 + 5}
                className="fill-gray-700"
                style={{ fontSize: 12, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}
              >
                {r.broj}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function Grafikoni({
  mesecni,
  statusi,
  kpi,
}: {
  mesecni: MesecniRed[];
  statusi: StatusRed[];
  kpi: Kpi;
}) {
  const imaFaktura = kpi.brojFaktura > 0;

  return (
    <div className="space-y-6">
      {/* KPI red */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Naplaćeno ukupno</p>
          <p className="text-3xl font-semibold text-gray-900 mt-1">
            {formatBroj(kpi.naplaceno)}{" "}
            <span className="text-base text-gray-400 font-normal">RSD</span>
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Čeka naplatu</p>
          <p className="text-3xl font-semibold text-gray-900 mt-1">
            {formatBroj(kpi.nenaplaceno)}{" "}
            <span className="text-base text-gray-400 font-normal">RSD</span>
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Broj faktura</p>
          <p className="text-3xl font-semibold text-gray-900 mt-1">
            {kpi.brojFaktura}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Prosečna faktura</p>
          <p className="text-3xl font-semibold text-gray-900 mt-1">
            {formatBroj(kpi.prosek)}{" "}
            <span className="text-base text-gray-400 font-normal">RSD</span>
          </p>
        </div>
      </div>

      <Kartica
        naslov="Naplaćeni prihod po mesecima"
        podnaslov="Poslednjih 12 meseci, u dinarima"
      >
        <KolonskiGrafikon
          redovi={mesecni}
          vrednost={(r) => r.naplaceno}
          boja={PLAVA}
          jedinica="RSD"
        />
      </Kartica>

      <Kartica
        naslov="Broj izdatih faktura po mesecima"
        podnaslov="Koliko je servisa fakturisano svakog meseca"
      >
        <KolonskiGrafikon
          redovi={mesecni}
          vrednost={(r) => r.broj}
          boja={NARANDZASTA}
          jedinica="faktura"
        />
      </Kartica>

      <Kartica
        naslov="Klijenti po fazi procesa"
        podnaslov="Gde se tvoji klijenti trenutno nalaze"
      >
        <LevakGrafikon redovi={statusi} />
      </Kartica>

      {/* Tabelarni prikaz istih podataka */}
      <details className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <summary className="text-sm font-medium text-gray-900 cursor-pointer">
          Prikaži podatke kao tabelu
        </summary>
        <table className="w-full text-sm mt-4">
          <thead className="text-gray-500 text-left border-b border-gray-100">
            <tr>
              <th className="py-2 font-medium">Mesec</th>
              <th className="py-2 font-medium">Naplaćeno (RSD)</th>
              <th className="py-2 font-medium">Broj faktura</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mesecni.map((m) => (
              <tr key={m.kljuc}>
                <td className="py-2 text-gray-600">{m.kljuc}</td>
                <td className="py-2 text-gray-900 tabular-nums">
                  {formatBroj(m.naplaceno)}
                </td>
                <td className="py-2 text-gray-900 tabular-nums">{m.broj}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      {!imaFaktura && (
        <p className="text-sm text-gray-500">
          Grafikoni prihoda se pune automatski — svaki put kad sistem pošalje
          fakturu klijentu, ona se upiše i pojavi ovde. Možeš i ručno dodati
          fakturu na stranici „Fakture i naplata“.
        </p>
      )}
    </div>
  );
}
