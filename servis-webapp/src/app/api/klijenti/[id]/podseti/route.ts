import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { requireSession } from "@/lib/requireSession";

// Rucno okidanje: postavlja klijenta na "due" sa sledeci_servis = danas,
// tako da ga automatski n8n schedule pokupi na sledecoj proveri i posalje podsetnik.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSession();
  if ("errorResponse" in auth) return auth.errorResponse;
  const { session } = auth;
  const { id } = await params;

  const pool = getPool();
  const result = await pool.query(
    `UPDATE demo_klijenti
     SET status = 'due', sledeci_servis = CURRENT_DATE
     WHERE id = $1 AND biznis_id = $2
     RETURNING *`,
    [id, session.biznisId]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Klijent nije nađen." }, { status: 404 });
  }

  return NextResponse.json({ klijent: result.rows[0] });
}
