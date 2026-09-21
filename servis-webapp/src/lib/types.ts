export type Klijent = {
  id: number;
  biznis_id: number;
  ime: string;
  telefon: string;
  usluga: string;
  status: string;
  sledeci_servis: string; // ISO date string
  interval_dana: number;
  iznos: string | null;
  faktura_datum: string | null;
  potvrdjeno_at: string | null;
};
