# Boost CRM — leads automatisch in Notion

De Boost Scan en het dashboard (`/bh33r`) werken meteen, maar bewaren leads dan
alleen in de browser waarin ze zijn ingevuld. Wil je dat **élke aanvraag — vanaf
ieder apparaat — automatisch in je Notion-database komt** (en in het dashboard
verschijnt), koppel dan de gratis Google-relay. Dit is eenmalig ~5 minuten werk;
daarna hoef je nooit meer iets te doen.

> Waarom een tussenstap? De browser mag de Notion-API niet rechtstreeks aanroepen
> (CORS), en je geheime Notion-token mag nooit in de live site-code staan. De
> Google-relay draait verborgen bij Google en zet de lead namens jou in Notion.

## Stap 1 — Maak de Notion-database

Maak in Notion een nieuwe database (tabel) met **precies deze kolommen** (naam +
type moeten kloppen, anders weigert Notion de lead):

| Kolomnaam   | Type             |
|-------------|------------------|
| `Naam`      | Title (de standaard titelkolom — hernoem die naar `Naam`) |
| `Bedrijf`   | Text             |
| `E-mail`    | Email            |
| `Telefoon`  | Phone            |
| `Herkenning`| Multi-select     |
| `Ambitie`   | Multi-select     |
| `Risico`    | Multi-select     |
| `Waarde`    | Select           |
| `Status`    | Select           |
| `Lead ID`   | Text             |
| `Datum`     | Date             |

De opties binnen de select/multi-select kolommen worden vanzelf aangemaakt zodra
de eerste lead binnenkomt — die hoef je niet vooraf in te vullen.

## Stap 2 — Maak een Notion-integratie (token)

1. Ga naar <https://www.notion.so/my-integrations> → **New integration**.
2. Geef een naam (bv. "Boost Scan"), koppel je workspace, **Save**.
3. Kopieer de **Internal Integration Secret** (begint met `ntn_` of `secret_`).
4. Open je database in Notion → menu rechtsboven (`•••`) → **Connections** →
   **Connect to** → kies je net gemaakte integratie. (Zonder deze stap mag het
   script niet bij je database.)

## Stap 3 — Pak het database-ID

Open de database als volledige pagina. De URL ziet er zo uit:

```
https://www.notion.so/<werkruimte>/<DATABASE_ID>?v=<view_id>
```

Het `DATABASE_ID` is het blok van 32 tekens vóór de `?`. Kopieer dat.

## Stap 4 — Zet de Google-relay neer

1. Ga naar <https://script.google.com> → **Nieuw project**.
2. Verwijder de voorbeeldcode en plak de volledige inhoud van
   **`boost-notion-backend.gs`** (staat in het project).
3. Vul bovenin in:
   ```js
   var NOTION_TOKEN = 'ntn_xxxxxxxxxxxxxxxx';   // uit stap 2
   var NOTION_DB_ID = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // uit stap 3
   var NOTIFY       = 'dennis@mrboost.nl';       // optioneel: mail per lead
   ```
4. **Implementeren → Nieuwe implementatie → type "Web-app"**:
   - *Uitvoeren als:* **Ikzelf**
   - *Wie heeft toegang:* **Iedereen**
   - Klik **Implementeren**, geef toestemming, en **kopieer de "Web app URL"**
     (eindigt op `/exec`).

## Stap 5 — Koppel de URL aan de site

Geef de Web app URL aan mij, dan zet ik hem op de juiste plek in **`boost-scan.html`**
én **`bh33r.html`**:

```html
<script>window.BOOST_CONFIG = { endpoint: "https://script.google.com/macros/s/AK..../exec" };</script>
```

Klaar. Vanaf nu:

- elke ingevulde Boost Scan verschijnt automatisch als rij in je **Notion-database**;
- het dashboard op `/bh33r` toont alle leads (knop **Vernieuwen** haalt de laatste
  op uit Notion), met een groene **Live**-indicator;
- statuswijzigingen (Nieuw / Gebeld / Gewonnen) en verwijderingen in het dashboard
  worden teruggeschreven naar Notion;
- (optioneel) Dennis krijgt per lead een e-mail.

## Goed om te weten

- Zolang `endpoint` leeg is (`""`), draait alles lokaal in de browser (handig om
  te testen, maar niet centraal).
- De toegangscode van het dashboard (`84028402`) is een lichte beveiliging voor de
  front-end, geen volwaardige authenticatie. Wil je het echt afschermen, dan kan
  ik er later een wachtwoord-beveiligde laag of login-dienst voor zetten.
- Liever rechtstreeks zonder Google — bijvoorbeeld via een Make/Zapier-webhook naar
  Notion? Dat kan ook; de koppeling zit op één plek (de `BOOST_CONFIG`-regel), dus
  ik wissel het zo om.
