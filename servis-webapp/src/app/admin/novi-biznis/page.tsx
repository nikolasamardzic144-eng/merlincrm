import NoviBiznisForm from "./NoviBiznisForm";

export const dynamic = "force-dynamic";

export default function NoviBiznisPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-lg font-semibold text-gray-900">
            Admin — Novi biznis
          </h1>
          <p className="text-sm text-gray-500">
            Dodaj novog klijenta (firmu) koja koristi Servis CRM.
          </p>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <NoviBiznisForm />
      </main>
    </div>
  );
}
