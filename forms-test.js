/* =====================================================================
   YETI INSURANCE — FORMS & NOTIFICATIONS TEST
   1. Open the live site in Chrome (any page)
   2. Cmd+Option+J → Console → paste this file → Enter
      (if Chrome warns about pasting, type: allow pasting  → Enter, then paste again)
   It sends ONE test submission to each of the 4 forms and shows the result.
   Then check: Netlify → Forms (4 entries) and your inbox (4 emails).
   ===================================================================== */
(async () => {
  const stamp = new Date().toLocaleString();
  const tests = {
    "quote":           { coverage: "auto", zip: "75039", name: "TEST Quote", phone: "(469) 555-0100", email: "test@example.com", message: "Form test " + stamp },
    "claim-notice":    { name: "TEST Claim", phone: "(469) 555-0100", claim_type: "Auto", policy_number: "TEST-123", description: "Form test " + stamp },
    "contact":         { name: "TEST Contact", phone: "(469) 555-0100", email: "test@example.com", message: "Form test " + stamp },
    "service-request": { request_type: "Certificate of insurance", name: "TEST Service", phone: "(469) 555-0100", email: "test@example.com", details: "Form test " + stamp },
  };
  const rows = [];
  for (const [form, fields] of Object.entries(tests)) {
    try {
      const r = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ "form-name": form, ...fields }).toString() });
      rows.push({ form, result: r.ok ? "✅ accepted" : `❌ HTTP ${r.status}`, fix: r.ok ? "" : "Netlify → Forms → Enable form detection, then Deploys → Trigger deploy" });
    } catch (e) { rows.push({ form, result: "❌ " + e.message, fix: "" }); }
  }
  console.table(rows);
  alert(rows.map(r => `${r.form}: ${r.result}`).join("\n") + "\n\nNow check Netlify → Forms and your email inbox.");
})();
