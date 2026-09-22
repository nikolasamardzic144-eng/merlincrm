import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getPool } from "@/lib/db";

// Zasticeno preko middleware.ts (Basic Auth, /api/admin/*).
export async function GET() {
  const pool = getPool();
  const result = await pool.query(
    `SELECT id, naziv, email, whatsapp_phone_number_id, created_at
     FROM biznisi ORDER BY created_at DESC`
  );
  return NextResponse.json({ biznisi: result.rows });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { naziv, email, lozinka, whatsapp_phone_number_id, whatsapp_waba_id } =
    body;

  if (!naziv || !email || !lozinka) {
    return NextResponse.json(
      { error: "Popuni naziv, email i lozinku." },
      { status: 400 }
    );
  }

  const pool = getPool();
  const hash = await bcrypt.hash(lozinka, 10);

  try {
    const result = await pool.query(
      `INSERT INTO biznisi (naziv, email, lozinka_hash, whatsapp_phone_number_id, whatsapp_waba_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, naziv, email`,
      [
        naziv,
        email.trim().toLowerCase(),
        hash,
        whatsapp_phone_number_id || null,
        whatsapp_waba_id || null,
      ]
    );
    return NextResponse.json({ biznis: result.rows[0] });
  } catch (err: unknown) {
    const message =
      err instanceof Error && err.message.includes("duplicate")
        ? "Već postoji biznis sa tim emailom."
        : "Greška pri kreiranju biznisa.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
