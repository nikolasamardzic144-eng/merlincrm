import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPool } from "@/lib/db";
import Grafikoni, { MesecniRed, StatusRed } from "./Grafikoni";
import { STATUS_LABELS } from "@/lib/statusi";

export const dynamic = "force-dynamic";

const MESECI = [
  "jan",
  "feb",
  "mar",
  "apr",
  "maj",
  "jun",
  "jul",
  "avg",
  "sep",
  "okt",
  "nov",
  "dec",
];

// Redosled faza u procesu (za prikaz levka)
const REDOSLED = [
  "due",
  "reminded",
  "confirmed",
  "reschedule_requested",
  "provera_poslata",
  "completed",
  "payment_reminded",
];

function poslednjih12Meseci(): { kljuc: string; label: string }[] {
  const danas = new Date();
  const lista: { kljuc: string; label: string }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(danas.getFullYear(), danas.getMonth() - i, 1);
    const kljuc = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    lista.push({ kljuc, label: MESECI[d.getMonth()] });
  }
  return lista;
}

export default async function IzvestajiPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const pool = getPool();

  let mesecniRedovi: MesecniRed[] = [];
  let statusRedovi: StatusRed[] = [];
  let kpi = { naplaceno: 0, nenaplaceno: 0, brojFaktura: 0, prosek: 0 };

  try {
    const [mesecni, statusi, ukupno] = await Promise.all([
      pool.query(
        `SELECT to_char(date_trunc('month', datum), 'YYYY-MM') AS mesec,
                COALESCE(SUM(CASE WHEN status = 'naplaceno' THEN iznos ELSE 0 END), 0)::float AS naplaceno,
                COUNT(*)::int AS broj
         FROM fakture
         WHERE biznis_id = $1
           AND datum >= date_trunc('month', CURRENT_DATE) - INTERVAL '11 months'
         GROUP BY 1`,
        [session.biznisId]
      ),
      pool.query(
        `SELECT status, COUNT(*)::int AS broj
         FROM demo_klijenti WHERE biznis_id = $1 GROUP BY status`,
        [session.biznisId]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS broj,
                COALESCE(SUM(CASE WHEN status = 'naplaceno' THEN iznos END), 0)::float AS naplaceno,
                COALESCE(SUM(CASE WHEN status <> 'naplaceno' THEN iznos END), 0)::float AS nenaplaceno
         FROM fakture WHERE biznis_id = $1`,
        [session.biznisId]
      ),
    ]);

    const mapa = new Map<string, { naplaceno: number; broj: number }>();
    for (const r of mesecni.rows) {
      mapa.set(r.mesec, { naplaceno: Number(r.naplaceno), broj: Number(r.broj) });
    }
    mesecniRedovi = poslednjih12Meseci().map((m) => ({
      kljuc: m.kljuc,
      label: m.label,
      naplaceno: mapa.get(m.kljuc)?.naplaceno ?? 0,
      broj: mapa.get(m.kljuc)?.broj ?? 0,
    }));

    const statusMapa = new Map<string, number>();
    for (const r of statusi.rows) statusMapa.set(r.status, Number(r.broj));
    statusRedovi = REDOSLED.filter((s) => statusMapa.has(s)).map((s) => ({
      status: s,
      label: STATUS_LABELS[s] ?? s,
      broj: statusMapa.get(s) ?? 0,
    }));

    const u = ukupno.rows[0];
    const brojFaktura = Number(u.broj);
    const naplaceno = Number(u.naplaceno);
    kpi = {
      naplaceno,
      nenaplaceno: Number(u.nenaplaceno),
      brojFaktura,
      prosek: brojFaktura > 0 ? (naplaceno + Number(u.nenaplaceno)) / brojFaktura : 0,
    };
  } catch {
    mesecniRedovi = poslednjih12Meseci().map((m) => ({
      kljuc: m.kljuc,
      label: m.label,
      naplaceno: 0,
      broj: 0,
    }));
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Izveštaji</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Prihod, servisi i stanje klijenata kroz vreme
        </p>
      </div>

      <Grafikoni mesecni={mesecniRedovi} statusi={statusRedovi} kpi={kpi} />
    </div>
  );
}
