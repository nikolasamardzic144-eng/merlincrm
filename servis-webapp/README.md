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

- `biznisi` — jedan red po tvom klijentu (firma), sadrži email/lozinku za login
- `demo_klijenti` — klijenti servisa, sada sa `biznis_id` kolonom koja ih vezuje za firmu

## Šta dalje (predlog)

- Dodavanje novog biznisa (trenutno se radi ručno preko SQL-a ili n8n Setup workflow-a — može se napraviti "signup" stranica ako zatreba)
- Podešavanja po biznisu (WhatsApp broj, template poruke) direktno iz webapp-a
- Prava trenutna (instant) automatika za "Pošalji podsetnik sad" dugme, preko posebnog n8n webhook-a, umesto čekanja na sledeću automatsku proveru
