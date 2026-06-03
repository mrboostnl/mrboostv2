# Boost CRM — leads centraal laten binnenkomen

De Boost Scan en het dashboard (`/bh33r`) werken meteen, maar bewaren leads dan
alleen in de browser waarin ze zijn ingevuld. Wil je dat élke aanvraag — vanaf
ieder apparaat — centraal binnenkomt (en in het dashboard verschijnt), koppel dan
de gratis Google-backend. Dit kost ~3 minuten en je hoeft daarna nooit meer iets
te doen.

## Stappen

1. **Maak een Spreadsheet** — ga naar <https://sheets.new> (leeg laten is prima).
2. **Open de scripteditor** — in dat Spreadsheet: `Extensies → Apps Script`.
   Verwijder de voorbeeldcode en plak de volledige inhoud van
   **`boost-crm-backend.gs`**. Wil je per lead een mailtje? Zet bovenin `NOTIFY`
   op het e-mailadres van Dennis, bv. `var NOTIFY = 'dennis@mrboost.nl';`
3. **Publiceer als web-app** — klik `Implementeren → Nieuwe implementatie`,
   kies type **Web-app**:
   - *Uitvoeren als:* **Ikzelf**
   - *Wie heeft toegang:* **Iedereen**
   - Klik **Implementeren**, geef toestemming, en **kopieer de "Web app URL"**
     (eindigt op `/exec`).
4. **Plak de URL** in de configuratieregel. Die staat als duidelijk gemarkeerd
   blok onderin **`boost-scan.html`** én **`bh33r.html`** (gebruik dezelfde URL
   in beide):
   ```html
   <script>window.BOOST_CONFIG = { endpoint: "https://script.google.com/macros/s/AK..../exec" };</script>
   ```

Klaar. Vanaf nu:

- elke ingevulde Boost Scan wordt als rij toegevoegd aan het tabblad **Leads**;
- het dashboard op `/bh33r` toont alle leads (knop **Vernieuwen** haalt de
  laatste op), met een **Live**-indicator als de koppeling actief is;
- statuswijzigingen (Nieuw / Gebeld / Gewonnen) en verwijderingen worden
  teruggeschreven naar de Sheet;
- (optioneel) Dennis krijgt per lead een e-mail.

## Goed om te weten

- Zolang `endpoint` leeg is (`""`), draait alles lokaal (geen koppeling nodig om te testen).
- De toegangscode van het dashboard (`84028402`) is een lichte beveiliging voor de
  front-end, geen volwaardige authenticatie. Wil je het echt afschermen, dan kan
  ik er later een wachtwoord-beveiligde laag of login-dienst voor zetten.
- Liever een ander systeem (HubSpot, Notion, Airtable, webhook naar Make/Zapier)?
  De koppeling zit op één plek (de `BOOST_CONFIG`-regel + de verzendfunctie); ik
  wissel het zo om.
