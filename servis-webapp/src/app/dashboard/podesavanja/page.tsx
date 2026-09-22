import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import PodesavanjaForm from "./PodesavanjaForm";

export const dynamic = "force-dynamic";

export default async function PodesavanjaPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {session.naziv}
            </h1>
            <p className="text-sm text-gray-500">Podešavanja WhatsApp naloga</p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            ← Nazad na klijente
          </Link>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <PodesavanjaForm />
      </main>
    </div>
  );
}
