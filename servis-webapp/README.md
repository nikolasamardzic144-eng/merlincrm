# Servis CRM

Mali webapp za praćenje klijenata servisa: login po firmi (biznisu), pregled klijenata i njihovih statusa (podsetnik poslat, potvrđeno, obavljeno, naplaćeno...), dodavanje/izmena klijenata, i ručno okidanje podsetnika. Koristi ISTU Postgres bazu koju koristi n8n workflow — n8n i dalje radi svu automatiku (slanje WhatsApp poruka, primanje odgovora), a ovaj webapp je samo pregled i upravljanje nad istim podacima.

## Pokretanje lokalno

```bash
npm install
cp .env.example .env
# upiši DATABASE_URL i JWT_SECRET u .env
npm run dev
```

## Deploy na Railway

1. Napravi novi **GitHub repozitorijum** (privatan) i pushuj ovaj kod u njega:
   ```bash
   git add -A
   git commit -m "Prva verzija Servis CRM webapp-a"
   git remote add origin https://github.com/<tvoj-nalog>/servis-crm.git
   git push -u origin main
   ```
2. U Railway-u, u istom projektu gde ti je Postgres baza, klikni **New -> GitHub Repo** i izaberi taj repo.
3. U podešavanjima novog servisa (Variables), dodaj:
   - `DATABASE_URL` — klikni "New Variable" -> "Add Reference" -> izaberi Postgres servis -> `DATABASE_PUBLIC_URL` (ovo automatski povezuje bazu, bez ručnog kucanja lozinke)
   - `JWT_SECRET` — nasumičan string (dobio si jedan od Klod-a u razgovoru, ili generiši svoj sa `openssl rand -base64 32`)
4. Railway automatski prepoznaje Next.js i pokreće build. Kad završi, dobićeš javni URL (ili poveži svoj domen u Settings -> Domains).
5. Uloguj se sa: `demo@merlingtm.com` / `servis2026` (demo nalog, promeni lozinku ili napravi novi biznis unosom direktno u `biznisi` tabelu).

## Šema baze koju koristi

- `biznisi` — jedan red po tvom klijentu (firma): email/lozinka za login, i WhatsApp podaci (`whatsapp_phone_number_id`, `whatsapp_waba_id`, `whatsapp_access_token`)
- `demo_klijenti` — klijenti servisa, sa `biznis_id` kolonom koja ih vezuje za firmu

**Pre prvog deploya ove verzije**, pokreni jednom u Railway → Postgres servis → tab **Data** (ili Query), da doda kolonu za token:

```sql
ALTER TABLE biznisi ADD COLUMN IF NOT EXISTS whatsapp_access_token TEXT;
ALTER TABLE biznisi ADD COLUMN IF NOT EXISTS whatsapp_app_id TEXT;
```

## Funkcije

- **Klijenti** (`/dashboard`) — pregled sa statistikom, dodavanje/izmena/brisanje, dugme „Pošalji podsetnik" koje preko n8n webhook-a odmah šalje WhatsApp poruku.
- **Fakture i naplata** (`/dashboard/fakture`) — sve fakture koje je automatika poslala (n8n ih upisuje sam), plus ručni unos; filter naplaćeno/nenaplaćeno, označavanje naplate, link ka PDF-u.
- **Izveštaji** (`/dashboard/izvestaji`) — naplaćen prihod po mesecima, broj izdatih faktura po mesecima, raspored klijenata po fazama procesa, plus tabelarni prikaz istih podataka.
- **Predlošci poruka** (`/dashboard/predlosci`) — tekst slobodnih odgovora koje sistem šalje (potvrda termina, izmena termina, odložena provera, molba za recenziju, tekst uz fakturu). n8n ih čita iz baze po biznisu; ako predložak ne postoji, koristi se podrazumevani tekst. WhatsApp „template" poruke (prvi podsetnik, pitanje o obavljenom poslu) se i dalje menjaju u Meta panelu jer ih Meta odobrava.
- **Tim** (`/dashboard/tim`) — više korisnika po biznisu, uloge vlasnik/član. Prijava ide preko tabele `korisnici` (sa fallback-om na `biznisi` za stare naloge).
- **Podešavanja** (`/dashboard/podesavanja`) — WhatsApp Phone Number ID, WABA ID i Access Token po biznisu.
- **Admin panel** (`/admin/novi-biznis`) — zaštićen Basic Auth-om (`ADMIN_USER` / `ADMIN_PASSWORD`), dodaje novi biznis i odmah mu kreira nalog za prijavu i podrazumevane predloške.

## Šema baze

- `biznisi` — jedan red po firmi (naziv, WhatsApp podaci)
- `korisnici` — nalozi za prijavu, vezani za biznis, uloga `vlasnik` ili `clan`
- `demo_klijenti` — klijenti servisa, sa `biznis_id`
- `fakture` — izdate fakture (broj, iznos, datum, status naplate, PDF link)
- `predlosci` — tekst automatskih poruka po biznisu (`kljuc` + `tekst`)

Migracije su već puštene na produkcijskoj bazi. Za novu bazu, SQL je:

```sql
ALTER TABLE biznisi ADD COLUMN IF NOT EXISTS whatsapp_access_token TEXT;
ALTER TABLE biznisi ADD COLUMN IF NOT EXISTS whatsapp_app_id TEXT;

CREATE TABLE IF NOT EXISTS fakture (
  id SERIAL PRIMARY KEY,
  biznis_id INTEGER NOT NULL REFERENCES biznisi(id),
  klijent_id INTEGER, broj TEXT, ime_klijenta TEXT, telefon TEXT, usluga TEXT,
  iznos NUMERIC, datum DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'nenaplaceno', pdf_url TEXT,
  naplaceno_at TIMESTAMP, created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS predlosci (
  id SERIAL PRIMARY KEY,
  biznis_id INTEGER NOT NULL REFERENCES biznisi(id),
  kljuc TEXT NOT NULL, tekst TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(), UNIQUE (biznis_id, kljuc)
);

CREATE TABLE IF NOT EXISTS korisnici (
  id SERIAL PRIMARY KEY,
  biznis_id INTEGER NOT NULL REFERENCES biznisi(id),
  ime TEXT, email TEXT NOT NULL UNIQUE, lozinka_hash TEXT NOT NULL,
  uloga TEXT NOT NULL DEFAULT 'clan', created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Šta dalje

- **Puno multi-tenant WhatsApp slanje** — svi biznisi i dalje šalju preko istog WhatsApp naloga (jedan n8n credential). Podaci koje biznis unese u Podešavanjima se čuvaju, ali automatika ih još ne koristi za slanje. Da svaki biznis šalje sa svog broja, WhatsApp send node-ovi u n8n moraju da pređu sa fiksnog kredencijala na HTTP Request node koji dinamički uzima token iz baze — namerno odloženo dok ne postoji drugi pravi klijent sa svojim WABA nalogom, da izmena može da se testira na stvarnom broju.
