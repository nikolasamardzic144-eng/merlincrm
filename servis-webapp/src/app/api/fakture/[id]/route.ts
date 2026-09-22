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
  const pool = getPool();

  if (typeof body.status === "string") {
    const naplaceno = body.status === "naplaceno";
    const result = await pool.query(
      `UPDATE fakture
       SET status = $1, naplaceno_at = CASE WHEN $1 = 'naplaceno' THEN NOW() ELSE NULL END
       WHERE id = $2 AND biznis_id = $3
       RETURNING *`,
      [naplaceno ? "naplaceno" : "nenaplaceno", id, session.biznisId]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Faktura nije nađena." }, { status: 404 });
    }
    return NextResponse.json({ faktura: result.rows[0] });
  }

  return NextResponse.json({ error: "Nema izmena." }, { status: 400 });
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
    `DELETE FROM fakture WHERE id = $1 AND biznis_id = $2 RETURNING id`,
    [id, session.biznisId]
  );
  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Faktura nije nađena." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
