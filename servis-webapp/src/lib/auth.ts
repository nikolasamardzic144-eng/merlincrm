import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const COOKIE_NAME = "servis_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 dana

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET nije podesen. Postavi env varijablu JWT_SECRET (bilo koji dugačak nasumičan string) u Railway-u."
    );
  }
  return secret;
}

export type SessionPayload = {
  biznisId: number;
  email: string;
  naziv: string;
  // Dodato uz tabelu korisnika (multi-user po biznisu). Opciono je da stare
  // sesije iz prethodne verzije i dalje rade dok ne isteknu.
  korisnikId?: number;
  uloga?: string; // 'vlasnik' | 'clan'
};

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: MAX_AGE_SECONDS });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, getSecret()) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function setSessionCookie(payload: SessionPayload) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, signSession(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export { COOKIE_NAME };
