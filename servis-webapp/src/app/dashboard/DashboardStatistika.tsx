import { Klijent } from "@/lib/types";

const U_TOKU = new Set(["due", "reminded", "reschedule_requested"]);
const POTVRDJENO = new Set(["confirmed", "provera_poslata"]);
const CEKA_NAPLATU = new Set(["completed", "payment_reminded"]);

function Tile({
  broj,
  naslov,
  napomena,
}: {
  broj: number | string;
  naslov: string;
  napomena?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <p className="text-2xl font-semibold text-gray-900">{broj}</p>
      <p className="text-sm text-gray-500">{naslov}</p>
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
      <Tile broj={ukupno} naslov="Ukupno klijenata" />
      <Tile broj={uToku} naslov="Čeka podsetnik / potvrdu" />
      <Tile broj={potvrdjeno} naslov="Potvrđen termin" />
      <Tile
        broj={cekaNaplatu.length}
        naslov="Čeka naplatu"
        napomena={
          iznosNaplata > 0 ? `${iznosNaplata.toLocaleString("sr-RS")} RSD` : undefined
        }
      />
    </div>
  );
}
