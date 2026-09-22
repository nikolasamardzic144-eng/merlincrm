import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getPool } from "@/lib/db";
import { requireSession } from "@/lib/requireSession";

export async function GET() {
  const auth = await requireSession();
  if ("errorResponse" in auth) return auth.errorResponse;
  const { session } = auth;

  const pool = getPool();
  const result = await pool.query(
    `SELECT id, ime, email, uloga, created_at FROM korisnici
     WHERE biznis_id = $1 ORDER BY created_at ASC`,
    [session.biznisId]
  );
  return NextResponse.json({ korisnici: result.rows });
}

export async function POST(req: NextRequest) {
  const auth = await requireSession();
  if ("errorResponse" in auth) return auth.errorResponse;
  const { session } = auth;

  if (session.uloga && session.uloga !== "vlasnik") {
    return NextResponse.json(
      { error: "Samo vlasnik naloga može da dodaje članove tima." },
      { status: 403 }
    );
  }

  const { ime, email, lozinka, uloga } = await req.json();
  if (!email || !lozinka) {
    return NextResponse.json(
      { error: "Popuni email i lozinku." },
      { status: 400 }
    );
  }
  if (String(lozinka).length < 6) {
    return NextResponse.json(
      { error: "Lozinka mora imati bar 6 karaktera." },
      { status: 400 }
    );
  }

  const pool = getPool();
  const hash = await bcrypt.hash(lozinka, 10);

  try {
    const result = await pool.query(
      `INSERT INTO korisnici (biznis_id, ime, email, lozinka_hash, uloga)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, ime, email, uloga, created_at`,
      [
        session.biznisId,
        ime || null,
        String(email).trim().toLowerCase(),
        hash,
        uloga === "vlasnik" ? "vlasnik" : "clan",
      ]
    );
    return NextResponse.json({ korisnik: result.rows[0] });
  } catch (err: unknown) {
    const poruka =
      err instanceof Error && err.message.includes("duplicate")
        ? "Taj email već ima nalog."
        : "Greška pri dodavanju korisnika.";
    return NextResponse.json({ error: poruka }, { status: 400 });
  }
}
