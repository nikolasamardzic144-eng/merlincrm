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

## Nove funkcije

- **Instant slanje podsetnika** — dugme "Pošalji podsetnik" sad odmah zove n8n webhook koji šalje WhatsApp poruku u sekundi, umesto da čeka sledeću automatsku proveru. Radi kad su `N8N_INSTANT_WEBHOOK_URL` i `N8N_INSTANT_WEBHOOK_SECRET` podešeni (vidi `.env.example`); ako nisu, dugme se ponaša kao pre.
- **Podešavanja** (`/dashboard/podešavanja`) — svaki biznis sad može sam da unese svoj WhatsApp Phone Number ID, WABA ID i Access Token.
- **Statistika** na vrhu dashboarda — ukupno klijenata, koliko čeka podsetnik/potvrdu, koliko je potvrđeno, koliko čeka naplatu (sa iznosom).
- **Admin panel** (`/admin/novi-biznis`) — zaštićen Basic Auth-om (`ADMIN_USER`/`ADMIN_PASSWORD` u Railway Variables), za dodavanje novog biznisa (klijenta) bez ručnog SQL-a.

## Šta dalje (predlog)

- **Puno multi-tenant WhatsApp slanje** — trenutno SVI biznisi i dalje šalju preko istog WhatsApp naloga (jedan n8n credential/token), čak i kad svaki unese svoje podatke u Podešavanjima — ti podaci se čuvaju, ali automatika ih još ne koristi za slanje. Da svaki biznis stvarno šalje sa svog broja, WhatsApp send node-ovi u n8n moraju da pređu sa fiksnog kredencijala na HTTP Request node koji dinamički uzima token iz baze. Ovo namerno nije urađeno dok ne dobiješ drugog pravog klijenta sa svojim WABA nalogom — prevelika je i rizična izmena da se testira samo na demo podacima.
- Multi-user po biznisu (više zaposlenih istog klijenta sa svojim login-om)
