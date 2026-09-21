import { NextResponse } from "next/server";
import { getSession, SessionPayload } from "@/lib/auth";

export async function requireSession(): Promise<
  { session: SessionPayload } | { errorResponse: NextResponse }
> {
  const session = await getSession();
  if (!session) {
    return {
      errorResponse: NextResponse.json(
        { error: "Nisi prijavljen." },
        { status: 401 }
      ),
    };
  }
  return { session };
}
