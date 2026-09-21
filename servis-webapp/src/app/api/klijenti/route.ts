import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { requireSession } from "@/lib/requireSession";

export async function POST(req: NextRequest) {
  const auth = await requireSession();
  if ("errorResponse" in auth) return auth.errorResponse;
  const { session } = auth;

  const body = await req.json();
  const { ime, telefon, usluga, sledeci_servis, interval_dana, iznos } = body;

  if (!ime || !telefon || !usluga || !sledeci_servis || !interval_dana) {
    return NextResponse.json(
      { error: "Popuni sva obavezna polja (ime, telefon, usluga, datum, interval)." },
      { status: 400 }
    );
  }

  const pool = getPool();
  const result = await pool.query(
    `INSERT INTO demo_klijenti (biznis_id, ime, telefon, usluga, status, sledeci_servis, interval_dana, iznos)
     VALUES ($1, $2, $3, $4, 'due', $5, $6, $7)
     RETURNING *`,
    [
      session.biznisId,
      ime,
      telefon.replace(/[^0-9]/g, ""),
      usluga,
      sledeci_servis,
      interval_dana,
      iznos || null,
    ]
  );

  return NextResponse.json({ klijent: result.rows[0] });
}
