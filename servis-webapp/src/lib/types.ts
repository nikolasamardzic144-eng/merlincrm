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

export type Faktura = {
  id: number;
  biznis_id: number;
  klijent_id: number | null;
  broj: string | null;
  ime_klijenta: string | null;
  telefon: string | null;
  usluga: string | null;
  iznos: string | null;
  datum: string;
  status: string; // 'nenaplaceno' | 'naplaceno'
  pdf_url: string | null;
  naplaceno_at: string | null;
  created_at: string;
};

export type Predlozak = {
  id: number;
  biznis_id: number;
  kljuc: string;
  tekst: string;
};

export type Korisnik = {
  id: number;
  biznis_id: number;
  ime: string | null;
  email: string;
  uloga: string; // 'vlasnik' | 'clan'
  created_at: string;
};
