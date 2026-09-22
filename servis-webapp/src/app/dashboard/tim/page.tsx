import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { Korisnik } from "@/lib/types";
import TimLista from "./TimLista";
import { uObicanJson } from "@/lib/serijalizuj";

export const dynamic = "force-dynamic";

export default async function TimPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const pool = getPool();
  let korisnici: Korisnik[] = [];
  try {
    const result = await pool.query<Korisnik>(
      `SELECT id, biznis_id, ime, email, uloga, created_at FROM korisnici
       WHERE biznis_id = $1 ORDER BY created_at ASC`,
      [session.biznisId]
    );
    korisnici = result.rows;
  } catch {
    // tabela jos ne postoji
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Tim</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Ljudi koji mogu da se prijave i rade u ovom nalogu
        </p>
      </div>

      <div className="max-w-3xl">
        <TimLista
          pocetniKorisnici={uObicanJson(korisnici)}
          mojId={session.korisnikId ?? null}
          mojaUloga={session.uloga ?? "vlasnik"}
        />
      </div>
    </div>
  );
}
