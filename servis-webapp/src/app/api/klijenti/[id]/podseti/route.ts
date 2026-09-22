import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { requireSession } from "@/lib/requireSession";

// Trenutno slanje: poziva n8n instant-send webhook koji ODMAH salje WhatsApp
// poruku klijentu i postavlja status na 'reminded'. Ako webhook nije podesen
// (env varijable nedostaju) ili n8n ne odgovori, vracamo se na stari nacin:
// oznacimo klijenta kao "due" da ga pokupi sledeca automatska provera (n8n
// schedule na svakih par minuta).
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSession();
  if ("errorResponse" in auth) return auth.errorResponse;
  const { session } = auth;
  const { id } = await params;

  const pool = getPool();
  const webhookUrl = process.env.N8N_INSTANT_WEBHOOK_URL;
  const webhookSecret = process.env.N8N_INSTANT_WEBHOOK_SECRET;

  if (webhookUrl && webhookSecret) {
    try {
      const resp = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-secret": webhookSecret,
        },
        body: JSON.stringify({
          klijent_id: Number(id),
          biznis_id: session.biznisId,
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (resp.ok) {
        const result = await pool.query(
          `SELECT * FROM demo_klijenti WHERE id = $1 AND biznis_id = $2`,
          [id, session.biznisId]
        );
        if (result.rows.length === 0) {
          return NextResponse.json(
            { error: "Klijent nije nađen." },
            { status: 404 }
          );
        }
        return NextResponse.json({ klijent: result.rows[0], instant: true });
      }
    } catch {
      // n8n nedostupan ili timeout — padamo na odloženi nacin ispod
    }
  }

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

  return NextResponse.json({ klijent: result.rows[0], instant: false });
}
