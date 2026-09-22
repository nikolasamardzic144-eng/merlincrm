import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import PredlosciForm from "./PredlosciForm";

export const dynamic = "force-dynamic";

export default async function PredlosciPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Predlošci poruka</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Tekst automatskih odgovora koje sistem šalje tvojim klijentima
        </p>
      </div>

      <div className="max-w-3xl">
        <PredlosciForm />
      </div>
    </div>
  );
}
