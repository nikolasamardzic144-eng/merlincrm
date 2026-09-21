import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getPool } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, lozinka } = await req.json();

  if (!email || !lozinka) {
    return NextResponse.json(
      { error: "Unesi email i lozinku." },
      { status: 400 }
    );
  }

  const pool = getPool();
  const result = await pool.query(
    "SELECT id, naziv, email, lozinka_hash FROM biznisi WHERE email = $1",
    [email.trim().toLowerCase()]
  );

  const biznis = result.rows[0];
  if (!biznis) {
    return NextResponse.json(
      { error: "Pogrešan email ili lozinka." },
      { status: 401 }
    );
  }

  const validna = await bcrypt.compare(lozinka, biznis.lozinka_hash);
  if (!validna) {
    return NextResponse.json(
      { error: "Pogrešan email ili lozinka." },
      { status: 401 }
    );
  }

  await setSessionCookie({
    biznisId: biznis.id,
    email: biznis.email,
    naziv: biznis.naziv,
  });

  return NextResponse.json({ ok: true });
}
