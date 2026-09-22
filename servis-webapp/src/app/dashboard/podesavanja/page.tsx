import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import PodesavanjaForm from "./PodesavanjaForm";

export const dynamic = "force-dynamic";

export default async function PodesavanjaPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Podešavanja</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          WhatsApp nalog i osnovni podaci o biznisu
        </p>
      </div>

      <div className="max-w-2xl">
        <PodesavanjaForm />
      </div>
    </div>
  );
}
