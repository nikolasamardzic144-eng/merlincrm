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
  const cistEmail = email.trim().toLowerCase();

  // 1) Novi nacin: nalozi iz tabele korisnici (vise ljudi po biznisu)
  try {
    const korisnik = await pool.query(
      `SELECT k.id, k.ime, k.email, k.lozinka_hash, k.uloga, k.biznis_id, b.naziv
       FROM korisnici k
       JOIN biznisi b ON b.id = k.biznis_id
       WHERE k.email = $1`,
      [cistEmail]
    );

    if (korisnik.rows.length > 0) {
      const red = korisnik.rows[0];
      const validna = await bcrypt.compare(lozinka, red.lozinka_hash);
      if (!validna) {
        return NextResponse.json(
          { error: "Pogrešan email ili lozinka." },
          { status: 401 }
        );
      }
      await setSessionCookie({
        biznisId: red.biznis_id,
        email: red.email,
        naziv: red.naziv,
        korisnikId: red.id,
        uloga: red.uloga,
      });
      return NextResponse.json({ ok: true });
    }
  } catch {
    // Tabela korisnici jos ne postoji (migracija nije pustena) - padamo na stari nacin
  }

  // 2) Stari nacin: login direktno iz tabele biznisi
  const result = await pool.query(
    "SELECT id, naziv, email, lozinka_hash FROM biznisi WHERE email = $1",
    [cistEmail]
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
    uloga: "vlasnik",
  });

  return NextResponse.json({ ok: true });
}
