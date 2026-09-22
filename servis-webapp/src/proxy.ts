import { NextRequest, NextResponse } from "next/server";

// Basic Auth zastita za /admin* i /api/admin* rute.
// Podesi ADMIN_USER i ADMIN_PASSWORD u Railway Variables da ukljucis pristup.
// Dok ti env varijable nisu podesene, admin rute su zakljucane (nema pristupa).
export function proxy(req: NextRequest) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;

  if (!user || !pass) {
    return new NextResponse("Admin panel nije podesen.", { status: 503 });
  }

  const auth = req.headers.get("authorization");
  if (auth) {
    const [scheme, encoded] = auth.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = Buffer.from(encoded, "base64").toString("utf-8");
      const sepIndex = decoded.indexOf(":");
      const u = decoded.slice(0, sepIndex);
      const p = decoded.slice(sepIndex + 1);
      if (u === user && p === pass) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse("Autentifikacija potrebna.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Servis CRM Admin"' },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
