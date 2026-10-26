// Google Apps Script: receives form POSTs and appends a row to the active sheet.
// Bind this script to your Google Sheet (Extensions > Apps Script).

const SHEET_NAME = "Responses";
const HEADERS = ["Timestamp", "Name", "Email", "Phone", "Age", "Gender", "City", "Message"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);

    const p = e.parameter || {};
    if (p.website) return json({ ok: false }); // honeypot

    // Prevent spreadsheet formula injection
    const clean = (v) => {
      v = String(v || "").trim();
      return /^[=+\-@]/.test(v) ? "'" + v : v;
    };

    sheet.appendRow([
      new Date(),
      clean(p.name), clean(p.email), clean(p.phone),
      clean(p.age), clean(p.gender), clean(p.city), clean(p.message)
    ]);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() { return json({ ok: true, status: "alive" }); }

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
