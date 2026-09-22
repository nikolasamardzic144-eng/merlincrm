import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { Faktura, Klijent } from "@/lib/types";
import FaktureTabela from "./FaktureTabela";
import { uObicanJson } from "@/lib/serijalizuj";

export const dynamic = "force-dynamic";

export default async function FakturePage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const pool = getPool();
  let fakture: Faktura[] = [];
  let klijenti: Klijent[] = [];

  try {
    const [f, k] = await Promise.all([
      pool.query<Faktura>(
        `SELECT * FROM fakture WHERE biznis_id = $1 ORDER BY datum DESC, id DESC`,
        [session.biznisId]
      ),
      pool.query<Klijent>(
        `SELECT * FROM demo_klijenti WHERE biznis_id = $1 ORDER BY ime ASC`,
        [session.biznisId]
      ),
    ]);
    fakture = f.rows;
    klijenti = k.rows;
  } catch {
    // tabela jos ne postoji - prikazujemo prazno stanje
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Fakture i naplata</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Sve fakture koje je sistem poslao, plus one koje dodaš ručno
        </p>
      </div>

      <FaktureTabela
        pocetneFakture={uObicanJson(fakture)}
        klijenti={uObicanJson(klijenti)}
      />
    </div>
  );
}
