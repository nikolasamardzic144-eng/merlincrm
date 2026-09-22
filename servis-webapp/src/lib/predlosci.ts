export const PREDLOSCI_META: {
  kljuc: string;
  naslov: string;
  opis: string;
  podrazumevano: string;
}[] = [
  {
    kljuc: "potvrda",
    naslov: "Klijent je potvrdio termin",
    opis: "Šalje se odmah pošto klijent klikne „Potvrdi“ na podsetnik.",
    podrazumevano:
      "Hvala, termin je potvrdjen! Nas tehnicar dolazi na dogovoreni datum.",
  },
  {
    kljuc: "izmena_termina",
    naslov: "Klijent traži drugi termin",
    opis: "Šalje se kad klijent klikne „Promeni termin“.",
    podrazumevano:
      "Nema problema. Javite nam zeljeni datum za servis, pa cemo prilagoditi raspored.",
  },
  {
    kljuc: "odlozena_provera",
    naslov: "Posao još nije obavljen",
    opis: "Šalje se kad klijent na pitanje o obavljenom poslu odgovori „Ne“.",
    podrazumevano: "U redu, javicemo se ponovo kasnije da proverimo.",
  },
  {
    kljuc: "recenzija",
    naslov: "Molba za recenziju posle plaćanja",
    opis: "Šalje se kad se plaćanje evidentira.",
    podrazumevano:
      "Hvala na placanju! Ako ste zadovoljni uslugom, ostavite nam kratku Google recenziju - mnogo nam znaci.",
  },
  {
    kljuc: "faktura_caption",
    naslov: "Tekst uz fakturu",
    opis: "Kratak opis koji ide uz PDF fakturu na WhatsApp-u.",
    podrazumevano: "Faktura za izvrsenu uslugu.",
  },
];
