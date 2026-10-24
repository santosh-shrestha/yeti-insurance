/**
 * Netlify runs this automatically after every VERIFIED form submission (spam is filtered out first).
 * It forwards the submission to the Google Sheet (Apps Script web app).
 *
 * Why a function instead of Netlify's "HTTP POST" notification:
 * Apps Script always answers with a redirect, which Netlify's webhook treats as a failure and
 * eventually disables. This function follows the redirect correctly, so it never gets disabled.
 *
 * Setup: Netlify → Site configuration → Environment variables → add
 *   SHEETS_WEBHOOK_URL = https://script.google.com/macros/s/XXXX/exec?token=YOUR-TOKEN
 */
exports.handler = async (event) => {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) { console.log("SHEETS_WEBHOOK_URL not set — skipping Google Sheet"); return { statusCode: 200, body: "skipped" }; }

  let payload;
  try { payload = JSON.parse(event.body || "{}").payload; } catch (e) { payload = null; }
  if (!payload) { console.log("No submission payload"); return { statusCode: 200, body: "no payload" }; }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });
    const text = await res.text();
    console.log(`Google Sheet → ${res.status} ${text.slice(0, 200)}`);
  } catch (err) {
    console.error("Google Sheet request failed:", err.message);
  }
  // Always 200 so a temporary Google hiccup never blocks or retries the visitor's submission
  return { statusCode: 200, body: "ok" };
};
