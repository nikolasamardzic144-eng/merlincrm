import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { Klijent } from "@/lib/types";
import DashboardKlijenti from "./DashboardKlijenti";
import LogoutButton from "./LogoutButton";

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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {session.naziv}
            </h1>
            <p className="text-sm text-gray-500">Pregled klijenata i servisa</p>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <DashboardKlijenti pocetniKlijenti={result.rows} />
      </main>
    </div>
  );
}
