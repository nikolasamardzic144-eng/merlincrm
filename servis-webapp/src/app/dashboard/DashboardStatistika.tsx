import { Klijent } from "@/lib/types";

const U_TOKU = new Set(["due", "reminded", "reschedule_requested"]);
const POTVRDJENO = new Set(["confirmed", "provera_poslata"]);
const CEKA_NAPLATU = new Set(["completed", "payment_reminded"]);

function Tile({
  broj,
  naslov,
  napomena,
  accent,
}: {
  broj: number | string;
  naslov: string;
  napomena?: string;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 relative overflow-hidden">
      <div className={`absolute inset-y-0 left-0 w-1 ${accent}`} />
      <p className="text-2xl font-semibold text-gray-900 tabular-nums">{broj}</p>
      <p className="text-sm text-gray-500 mt-0.5">{naslov}</p>
      {napomena && <p className="text-xs text-gray-400 mt-1">{napomena}</p>}
    </div>
  );
}

export default function DashboardStatistika({
  klijenti,
}: {
  klijenti: Klijent[];
}) {
  const ukupno = klijenti.length;
  const uToku = klijenti.filter((k) => U_TOKU.has(k.status)).length;
  const potvrdjeno = klijenti.filter((k) => POTVRDJENO.has(k.status)).length;
  const cekaNaplatu = klijenti.filter((k) => CEKA_NAPLATU.has(k.status));
  const iznosNaplata = cekaNaplatu.reduce(
    (zbir, k) => zbir + (Number(k.iznos) || 0),
    0
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Tile broj={ukupno} naslov="Ukupno klijenata" accent="bg-gray-300" />
      <Tile
        broj={uToku}
        naslov="Čeka podsetnik / potvrdu"
        accent="bg-blue-400"
      />
      <Tile broj={potvrdjeno} naslov="Potvrđen termin" accent="bg-green-400" />
      <Tile
        broj={cekaNaplatu.length}
        naslov="Čeka naplatu"
        accent="bg-red-400"
        napomena={
          iznosNaplata > 0 ? `${iznosNaplata.toLocaleString("sr-RS")} RSD` : undefined
        }
      />
    </div>
  );
}
