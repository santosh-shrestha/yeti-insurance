/**
 * Yeti Insurance — Netlify form submissions → Google Sheet
 * ---------------------------------------------------------
 * Paste this into the Google Sheet's Apps Script editor (Extensions → Apps Script),
 * deploy it as a Web App, and add the Web App URL as a Netlify "Outgoing webhook".
 * Full steps: integrations/README.md
 *
 * - One tab per form: quote, claim-notice, contact, service-request (created automatically)
 * - Columns are created automatically from the form fields
 * - Requests without the secret token are rejected
 */

const SECRET_TOKEN = "CHANGE-ME-to-a-long-random-string"; // must match ?token=... in the Netlify webhook URL

// Only needed if this script was NOT created from the sheet (Extensions → Apps Script).
// Paste the ID from the sheet's URL: docs.google.com/spreadsheets/d/<THIS PART>/edit
const SHEET_ID = "";

// Friendly column order per form (any extra fields are appended at the end)
const COLUMNS = {
  "quote":           ["Received", "Name", "Phone", "Email", "Coverage", "ZIP", "Message", "Page", "Netlify ID"],
  "claim-notice":    ["Received", "Name", "Phone", "Claim type", "Policy number", "Description", "Page", "Netlify ID"],
  "contact":         ["Received", "Name", "Phone", "Email", "Message", "Page", "Netlify ID"],
  "service-request": ["Received", "Request type", "Name", "Phone", "Email", "Policy number", "Details", "Page", "Netlify ID"],
};
// Netlify field name → column name
const FIELD_LABELS = {
  name: "Name", phone: "Phone", email: "Email", coverage: "Coverage", zip: "ZIP", message: "Message",
  claim_type: "Claim type", policy_number: "Policy number", description: "Description",
  request_type: "Request type", details: "Details", page: "Page",
};
const COVERAGE_LABELS = { commercial: "Business", home: "Home", auto: "Auto", bundle: "Home + Auto" };

function doPost(e) {
  try {
    if (!e || !e.parameter || e.parameter.token !== SECRET_TOKEN) {
      console.warn("Rejected: token missing or wrong. Check ?token=... in the Netlify URL matches SECRET_TOKEN.");
      return json_({ ok: false, error: "unauthorized" });
    }

    // Two ways in: (1) directly from the website forms (form-encoded), (2) Netlify webhook (JSON)
    let body, data, form;
    if (e.postData && /json/i.test(e.postData.type || "")) {
      body = JSON.parse(e.postData.contents); data = body.data || {}; form = String(body.form_name || "unknown");
    } else {
      data = Object.assign({}, e.parameter); delete data.token;
      form = String(data["form-name"] || "unknown"); body = { created_at: new Date().toISOString(), id: "web" };
    }
    if (data.company_website) { console.log("Skipped: spam (honeypot)"); return json_({ ok: true, skipped: "spam" }); }
    if (!COLUMNS[form]) { console.warn("Skipped: unknown form name: " + form); return json_({ ok: false, error: "unknown form" }); }
    delete data["form-name"]; delete data.company_website; delete data.ip; delete data.user_agent; delete data.referrer;
    if (data.coverage) data.coverage = COVERAGE_LABELS[data.coverage] || data.coverage;

    const lock = LockService.getScriptLock(); lock.waitLock(10000);
    try {
      const ss = SHEET_ID && SHEET_ID.indexOf("PASTE") === -1 ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
      if (!ss) throw new Error("No spreadsheet found. Create the script from the sheet (Extensions → Apps Script) or set SHEET_ID.");
      const sheet = ss.getSheetByName(form) || ss.insertSheet(form);

      // Header row: preferred order + any new fields
      let headers = sheet.getLastRow() ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].filter(String) : [];
      if (!headers.length) headers = (COLUMNS[form] || ["Received"]).slice();
      Object.keys(data).forEach(k => { const label = FIELD_LABELS[k] || k; if (headers.indexOf(label) === -1) headers.push(label); });
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold").setBackground("#0f2a4a").setFontColor("#ffffff");
      sheet.setFrozenRows(1);

      const values = {};
      Object.keys(data).forEach(k => values[FIELD_LABELS[k] || k] = data[k]);
      values["Received"] = body.created_at ? new Date(body.created_at) : new Date();
      values["Netlify ID"] = body.id || "";
      Object.keys(values).forEach(k => { if (typeof values[k] === "string" && /^[=+\-@]/.test(values[k])) values[k] = "'" + values[k]; }); // block spreadsheet formula injection

      sheet.appendRow(headers.map(h => values[h] !== undefined ? values[h] : ""));
    } finally { lock.releaseLock(); }

    console.log("Saved row to tab: " + form);
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: String(err) });
  }
}

// Run this from the editor to test the sheet connection (adds one TEST row to the "quote" tab)
function testWrite() {
  const fake = { form_name: "quote", id: "test", created_at: new Date().toISOString(),
    data: { name: "TEST — delete me", phone: "(469) 555-0100", email: "test@example.com", coverage: "auto", zip: "75039", message: "Editor test", page: "/" } };
  const res = doPost({ parameter: { token: SECRET_TOKEN }, postData: { type: "application/json", contents: JSON.stringify(fake) } });
  console.log(res.getContent());
}

// Quick check in the browser: opening the Web App URL shows this message
function doGet() { return json_({ ok: true, message: "Yeti Insurance form webhook is running." }); }

function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
