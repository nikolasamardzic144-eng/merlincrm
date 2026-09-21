import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { requireSession } from "@/lib/requireSession";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSession();
  if ("errorResponse" in auth) return auth.errorResponse;
  const { session } = auth;
  const { id } = await params;

  const body = await req.json();
  const dozvoljena: Record<string, string> = {
    ime: "ime",
    telefon: "telefon",
    usluga: "usluga",
    sledeci_servis: "sledeci_servis",
    interval_dana: "interval_dana",
    iznos: "iznos",
  };

  const polja: string[] = [];
  const vrednosti: unknown[] = [];
  let i = 1;
  for (const kljuc of Object.keys(dozvoljena)) {
    if (kljuc in body) {
      let vrednost = body[kljuc];
      if (kljuc === "telefon" && typeof vrednost === "string") {
        vrednost = vrednost.replace(/[^0-9]/g, "");
      }
      polja.push(`${kljuc} = $${i}`);
      vrednosti.push(vrednost);
      i++;
    }
  }

  if (polja.length === 0) {
    return NextResponse.json({ error: "Nema izmena." }, { status: 400 });
  }

  vrednosti.push(id, session.biznisId);

  const pool = getPool();
  const result = await pool.query(
    `UPDATE demo_klijenti SET ${polja.join(", ")}
     WHERE id = $${i} AND biznis_id = $${i + 1}
     RETURNING *`,
    vrednosti
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Klijent nije nađen." }, { status: 404 });
  }

  return NextResponse.json({ klijent: result.rows[0] });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSession();
  if ("errorResponse" in auth) return auth.errorResponse;
  const { session } = auth;
  const { id } = await params;

  const pool = getPool();
  const result = await pool.query(
    "DELETE FROM demo_klijenti WHERE id = $1 AND biznis_id = $2 RETURNING id",
    [id, session.biznisId]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Klijent nije nađen." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
