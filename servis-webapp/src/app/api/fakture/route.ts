import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { requireSession } from "@/lib/requireSession";

export async function GET() {
  const auth = await requireSession();
  if ("errorResponse" in auth) return auth.errorResponse;
  const { session } = auth;

  const pool = getPool();
  const result = await pool.query(
    `SELECT * FROM fakture WHERE biznis_id = $1 ORDER BY datum DESC, id DESC`,
    [session.biznisId]
  );
  return NextResponse.json({ fakture: result.rows });
}

export async function POST(req: NextRequest) {
  const auth = await requireSession();
  if ("errorResponse" in auth) return auth.errorResponse;
  const { session } = auth;

  const body = await req.json();
  const { klijent_id, ime_klijenta, usluga, iznos, datum, status } = body;

  if (!ime_klijenta || !iznos) {
    return NextResponse.json(
      { error: "Popuni ime klijenta i iznos." },
      { status: 400 }
    );
  }

  const pool = getPool();

  // Broj fakture: redni broj u okviru godine, po biznisu (npr. 2026-014)
  const godina = new Date().getFullYear();
  const brojac = await pool.query(
    `SELECT COUNT(*)::int AS n FROM fakture
     WHERE biznis_id = $1 AND EXTRACT(YEAR FROM datum) = $2`,
    [session.biznisId, godina]
  );
  const broj = `${godina}-${String(brojac.rows[0].n + 1).padStart(3, "0")}`;

  const result = await pool.query(
    `INSERT INTO fakture (biznis_id, klijent_id, broj, ime_klijenta, usluga, iznos, datum, status)
     VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7::date, CURRENT_DATE), $8)
     RETURNING *`,
    [
      session.biznisId,
      klijent_id || null,
      broj,
      ime_klijenta,
      usluga || null,
      iznos,
      datum || null,
      status === "naplaceno" ? "naplaceno" : "nenaplaceno",
    ]
  );

  return NextResponse.json({ faktura: result.rows[0] });
}
