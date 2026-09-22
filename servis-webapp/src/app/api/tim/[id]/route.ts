import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { requireSession } from "@/lib/requireSession";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSession();
  if ("errorResponse" in auth) return auth.errorResponse;
  const { session } = auth;
  const { id } = await params;

  if (session.uloga && session.uloga !== "vlasnik") {
    return NextResponse.json(
      { error: "Samo vlasnik naloga može da uklanja članove tima." },
      { status: 403 }
    );
  }

  if (session.korisnikId && String(session.korisnikId) === String(id)) {
    return NextResponse.json(
      { error: "Ne možeš ukloniti sopstveni nalog." },
      { status: 400 }
    );
  }

  const pool = getPool();

  // Poslednji vlasnik ne sme da ostane bez naloga
  const vlasnici = await pool.query(
    `SELECT COUNT(*)::int AS n FROM korisnici WHERE biznis_id = $1 AND uloga = 'vlasnik'`,
    [session.biznisId]
  );
  const meta = await pool.query(
    `SELECT uloga FROM korisnici WHERE id = $1 AND biznis_id = $2`,
    [id, session.biznisId]
  );
  if (meta.rows.length === 0) {
    return NextResponse.json({ error: "Korisnik nije nađen." }, { status: 404 });
  }
  if (meta.rows[0].uloga === "vlasnik" && vlasnici.rows[0].n <= 1) {
    return NextResponse.json(
      { error: "Mora postojati bar jedan vlasnik naloga." },
      { status: 400 }
    );
  }

  await pool.query(`DELETE FROM korisnici WHERE id = $1 AND biznis_id = $2`, [
    id,
    session.biznisId,
  ]);

  return NextResponse.json({ ok: true });
}
