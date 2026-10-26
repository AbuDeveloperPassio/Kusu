# Kusu – Form to Google Sheets

A static HTML form that saves each submission as a new row in a Google Sheet.

## Files
- `index.html` – the form
- `Code.gs` – Google Apps Script that writes to the sheet

## Setup
1. Create a new Google Sheet.
2. Open **Extensions → Apps Script**, paste the contents of `Code.gs`, save.
3. Click **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Authorize, then copy the **Web app URL**.
5. In `index.html`, replace `PASTE_YOUR_WEB_APP_URL_HERE` with that URL.
6. Open `index.html` (or host it with GitHub Pages) and submit a test entry.

A `Responses` tab with headers is created automatically on first submit.

## Hosting on GitHub Pages
Repo **Settings → Pages → Deploy from branch → main / root**.
