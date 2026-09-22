import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { requireSession } from "@/lib/requireSession";

export async function GET() {
  const auth = await requireSession();
  if ("errorResponse" in auth) return auth.errorResponse;
  const { session } = auth;

  const pool = getPool();
  const result = await pool.query(
    `SELECT naziv, email, whatsapp_phone_number_id, whatsapp_waba_id, whatsapp_access_token
     FROM biznisi WHERE id = $1`,
    [session.biznisId]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Biznis nije nađen." }, { status: 404 });
  }

  const row = result.rows[0];
  return NextResponse.json({
    naziv: row.naziv,
    email: row.email,
    whatsapp_phone_number_id: row.whatsapp_phone_number_id ?? "",
    whatsapp_waba_id: row.whatsapp_waba_id ?? "",
    // token se nikad ne vraca u punom obliku, samo da li je podesen
    whatsapp_access_token_set: Boolean(row.whatsapp_access_token),
  });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireSession();
  if ("errorResponse" in auth) return auth.errorResponse;
  const { session } = auth;

  const body = await req.json();
  const updates: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (typeof body.whatsapp_phone_number_id === "string") {
    updates.push(`whatsapp_phone_number_id = $${i++}`);
    values.push(body.whatsapp_phone_number_id.trim() || null);
  }
  if (typeof body.whatsapp_waba_id === "string") {
    updates.push(`whatsapp_waba_id = $${i++}`);
    values.push(body.whatsapp_waba_id.trim() || null);
  }
  // token se azurira samo ako je korisnik uneo nesto novo (prazno polje = ne diraj postojeci)
  if (typeof body.whatsapp_access_token === "string" && body.whatsapp_access_token.trim() !== "") {
    updates.push(`whatsapp_access_token = $${i++}`);
    values.push(body.whatsapp_access_token.trim());
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: "Nema izmena." }, { status: 400 });
  }

  values.push(session.biznisId);
  const pool = getPool();
  await pool.query(
    `UPDATE biznisi SET ${updates.join(", ")} WHERE id = $${i}`,
    values
  );

  return NextResponse.json({ ok: true });
}
