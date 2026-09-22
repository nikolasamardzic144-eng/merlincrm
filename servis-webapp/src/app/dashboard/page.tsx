import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { Klijent } from "@/lib/types";
import DashboardKlijenti from "./DashboardKlijenti";
import DashboardStatistika from "./DashboardStatistika";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const pool = getPool();
  const result = await pool.query<Klijent>(
    `SELECT * FROM demo_klijenti WHERE biznis_id = $1 ORDER BY sledeci_servis ASC, ime ASC`,
    [session.biznisId]
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Klijenti</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Pregled klijenata i statusa servisa
        </p>
      </div>

      <DashboardStatistika klijenti={result.rows} />
      <DashboardKlijenti pocetniKlijenti={result.rows} />
    </div>
  );
}
