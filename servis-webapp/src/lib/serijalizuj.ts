// Redovi iz Postgresa mogu da sadrze vrednosti koje nisu obicni JS objekti
// (npr. INTERVAL kolona stize kao instanca klase), a takve vrednosti Next.js
// ne moze da prosledi iz server komponente u klijentsku - stranica pukne.
// Ovim ih pretvaramo u obican JSON pre prosledjivanja.
export function uObicanJson<T>(vrednost: T): T {
  return JSON.parse(JSON.stringify(vrednost)) as T;
}
