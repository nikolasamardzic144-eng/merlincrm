import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { requireSession } from "@/lib/requireSession";
import { PREDLOSCI_META } from "@/lib/predlosci";

export async function GET() {
  const auth = await requireSession();
  if ("errorResponse" in auth) return auth.errorResponse;
  const { session } = auth;

  const pool = getPool();
  const result = await pool.query(
    `SELECT kljuc, tekst FROM predlosci WHERE biznis_id = $1`,
    [session.biznisId]
  );

  const mapa: Record<string, string> = {};
  for (const red of result.rows) mapa[red.kljuc] = red.tekst;

  // Ako neki predlozak jos ne postoji u bazi, vracamo podrazumevani tekst
  const predlosci = PREDLOSCI_META.map((m) => ({
    kljuc: m.kljuc,
    tekst: mapa[m.kljuc] ?? m.podrazumevano,
  }));

  return NextResponse.json({ predlosci });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireSession();
  if ("errorResponse" in auth) return auth.errorResponse;
  const { session } = auth;

  const body = await req.json();
  const izmene: { kljuc: string; tekst: string }[] = body.predlosci ?? [];
  const dozvoljeni = new Set(PREDLOSCI_META.map((m) => m.kljuc));

  const pool = getPool();
  for (const iz of izmene) {
    if (!dozvoljeni.has(iz.kljuc)) continue;
    if (typeof iz.tekst !== "string" || iz.tekst.trim() === "") continue;
    await pool.query(
      `INSERT INTO predlosci (biznis_id, kljuc, tekst, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (biznis_id, kljuc)
       DO UPDATE SET tekst = EXCLUDED.tekst, updated_at = NOW()`,
      [session.biznisId, iz.kljuc, iz.tekst.trim()]
    );
  }

  return NextResponse.json({ ok: true });
}
