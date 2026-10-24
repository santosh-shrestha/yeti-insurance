/* =====================================================================
   YETI INSURANCE — LIVE SITE QA
   How to run:
     1. Open the live site in Chrome (e.g. https://spiffy-cucurucho-e4bc88.netlify.app/)
     2. Press Cmd+Option+J to open the Console
     3. Paste this whole file and press Enter (if Chrome asks, type "allow pasting" first)
     4. Wait ~2–3 minutes. A report appears on the page. Screenshot it or click "Copy report".
   Note: it sends ONE test submission to each of the 4 Netlify forms (marked "QA TEST — ignore").
   ===================================================================== */
(async () => {
  const O = location.origin, out = [], fails = [];
  const P = (ok, m) => (ok ? out : fails).push((ok ? "PASS " : "FAIL ") + m);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const box = document.createElement("div");
  box.style.cssText = "position:fixed;inset:0;z-index:99999;background:#fff;color:#111;font:12px/1.4 Menlo,monospace;padding:16px;overflow:auto;white-space:pre-wrap";
  box.textContent = "Running live QA… (≈2–3 min)\n"; document.body.appendChild(box);
  const status = t => { box.textContent = "Running live QA… " + t; };

  // ---------- 1. Every page from the sitemap ----------
  const sm = await (await fetch("/sitemap.xml", { cache: "no-store" })).text();
  const paths = [...sm.matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map(m => m[1]);
  P(paths.length >= 30, `sitemap.xml lists ${paths.length} pages`);
  const parser = new DOMParser(), allLinks = new Set(), titles = new Map();
  for (const p of paths) {
    status("checking " + p);
    const r = await fetch(p, { cache: "no-store" });
    if (r.status !== 200) { P(false, `${p} → HTTP ${r.status}`); continue; }
    const html = await r.text(), d = parser.parseFromString(html, "text/html");
    const t = d.title, desc = d.querySelector('meta[name=description]')?.content || "";
    const h1 = d.querySelectorAll("h1").length, canon = d.querySelector('link[rel=canonical]')?.href || "";
    if (!t || !desc || h1 !== 1 || !canon) P(false, `${p}: title/desc/h1/canonical problem (h1=${h1})`);
    if (titles.has(t)) P(false, `${p}: duplicate title with ${titles.get(t)}`); titles.set(t, p);
    const txt = d.body.innerText || d.body.textContent;
    const ph = (txt.match(/\[[^\]\n]{2,60}\]/g) || []); if (ph.length) P(false, `${p}: placeholder text visible ${ph.slice(0, 3).join(" ")}`);
    d.querySelectorAll("script[type='application/ld+json']").forEach(s => { try { JSON.parse(s.textContent); } catch { P(false, `${p}: invalid JSON-LD`); } });
    d.querySelectorAll("a[href^='/']").forEach(a => allLinks.add(a.getAttribute("href").split("#")[0]));
    ["quote", "claim-notice"].forEach(n => { if (!d.querySelector(`form[name='${n}']`)) P(false, `${p}: missing ${n} form`); });
  }
  P(true, `${paths.length} pages fetched (HTTP 200, title, description, one H1, canonical, valid JSON-LD)`);

  // ---------- 2. Every internal link ----------
  let broken = 0;
  for (const l of allLinks) { if (!l) continue; const r = await fetch(l, { method: "HEAD", cache: "no-store" }); if (!r.ok) { broken++; P(false, `broken link ${l} → ${r.status}`); } }
  P(broken === 0, `${allLinks.size} unique internal links checked, ${broken} broken`);

  // ---------- 3. Assets, redirects, 404, headers, robots ----------
  for (const a of ["/assets/css/main.css", "/assets/js/main.js", "/assets/img/favicon.svg", "/robots.txt"]) { const r = await fetch(a, { cache: "no-store" }); P(r.ok, `${a} → ${r.status}`); }
  for (const [from, to] of [["/team", "/about/team/"], ["/claim", "/claims/"], ["/home", "/"]]) { const r = await fetch(from, { cache: "no-store" }); P(new URL(r.url).pathname === to, `redirect ${from} → ${new URL(r.url).pathname} (expected ${to})`); }
  { const r = await fetch("/qa-missing-page-xyz", { cache: "no-store" }); const t = await r.text(); P(r.status === 404 && /couldn.t find/i.test(t), `404 page → HTTP ${r.status}, branded page ${/couldn.t find/i.test(t) ? "yes" : "no"}`); }
  { const r = await fetch("/", { cache: "no-store" }); const h = k => r.headers.get(k);
    P(h("x-content-type-options") === "nosniff", `header X-Content-Type-Options: ${h("x-content-type-options")}`);
    P(!!h("x-frame-options"), `header X-Frame-Options: ${h("x-frame-options")}`);
    P(!!h("referrer-policy"), `header Referrer-Policy: ${h("referrer-policy")}`);
    P(location.protocol === "https:", "served over HTTPS"); }
  { const r = await fetch("/assets/css/main.css", { method: "HEAD" }); P(/max-age=31536000/.test(r.headers.get("cache-control") || ""), `asset caching: ${r.headers.get("cache-control")}`); }

  // ---------- 4. Netlify forms are registered (one real test submission each) ----------
  const forms = { "quote": { coverage: "auto", zip: "75039", name: "QA TEST — ignore", phone: "(469) 555-0100", email: "qa-test@example.com", message: "Automated live QA test" },
    "claim-notice": { name: "QA TEST — ignore", phone: "(469) 555-0100", claim_type: "Auto", description: "Automated live QA test" },
    "contact": { name: "QA TEST — ignore", phone: "(469) 555-0100", email: "qa-test@example.com", message: "Automated live QA test" },
    "service-request": { request_type: "Other", name: "QA TEST — ignore", phone: "(469) 555-0100", email: "qa-test@example.com", details: "Automated live QA test" } };
  for (const [n, f] of Object.entries(forms)) {
    status("testing form " + n);
    const r = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ "form-name": n, ...f }).toString() });
    P(r.ok, `Netlify form "${n}" accepts submissions → HTTP ${r.status}${r.ok ? "" : " (turn on Forms → Enable form detection, then redeploy)"}`);
  }

  // ---------- 5. In-browser behaviour: layout at 3 widths + interactions ----------
  const fr = document.createElement("iframe"); fr.style.cssText = "position:fixed;left:0;top:0;border:0;opacity:.01;pointer-events:none"; document.body.appendChild(fr);
  let errs = [];
  async function open(p, w, h = 900) {
    fr.style.width = w + "px"; fr.style.height = h + "px"; errs = [];
    await new Promise(r => { fr.onload = r; fr.src = p + (p.includes("?") ? "&" : "?") + "qa=" + Date.now(); });
    const win = fr.contentWindow; win.addEventListener("error", e => errs.push(e.message));
    win.fetch = async () => ({ ok: true }); // don't send real submissions during UI tests
    await sleep(250); return [win, fr.contentDocument];
  }
  const click = (w, el) => el && el.dispatchEvent(new w.MouseEvent("click", { bubbles: true, cancelable: true }));
  const vis = el => !!el && el.offsetParent !== null;
  for (const p of paths) for (const w of [1440, 1024, 390]) {
    status(`layout ${p} @${w}`);
    const [win, d] = await open(p, w); const de = d.documentElement;
    if (de.scrollWidth > de.clientWidth + 1) P(false, `${p} @${w}: page scrolls sideways (${de.scrollWidth - de.clientWidth}px)`);
    const hw = d.querySelector(".site-header .wrap"); if (hw && hw.getBoundingClientRect().height > 92) P(false, `${p} @${w}: header wraps`);
    if (errs.length) P(false, `${p} @${w}: JS error ${errs.join("; ")}`);
  }
  P(true, `layout checked: ${paths.length} pages × 3 widths`);
  { const [w, d] = await open("/", 1440); const dd = d.querySelector(".dd");
    dd.dispatchEvent(new w.MouseEvent("mouseenter")); P(dd.classList.contains("open"), "desktop dropdown opens on hover");
    click(w, dd.querySelector(".dd-top")); P(dd.classList.contains("open"), "desktop dropdown stays open on click");
    click(w, d.body); P(!dd.classList.contains("open"), "desktop dropdown closes on outside click"); }
  { const [w, d] = await open("/", 390); click(w, d.querySelector(".burger")); const m = d.getElementById("menu");
    P(m.classList.contains("open"), "mobile menu opens"); const dd = m.querySelector(".dd"); click(w, dd.querySelector(".dd-top"));
    P(dd.classList.contains("open") && vis(dd.querySelector(".dd-panel a")), "mobile Commercial section expands"); }
  for (const width of [1440, 390]) {
    const [w, d] = await open("/auto-insurance-texas/", width);
    click(w, [...d.querySelectorAll('[data-open="quote-modal"]')].find(vis)); await sleep(300);
    const m = d.getElementById("quote-modal"), f = m.querySelector("form");
    P(!m.hidden, `@${width} quote pop-up opens`); P(f.querySelector('input[value=auto]').checked, `@${width} coverage preselected on Auto page`);
    click(w, f.querySelector("[data-next]")); P(!!f.querySelector(".f.invalid"), `@${width} empty ZIP is blocked`);
    f.querySelector("[name=zip]").value = "75039"; click(w, f.querySelector("[data-next]")); P(f.querySelectorAll(".step")[1].classList.contains("on"), `@${width} moves to step 2`);
    f.querySelector("[name=name]").value = "QA Test"; f.querySelector("[name=phone]").value = "4695550100"; f.querySelector("[name=email]").value = "qa@example.com";
    f.requestSubmit(); await sleep(300); P(!m.querySelector(".done").hidden, `@${width} quote form shows thank-you + reference`);
  }
  { const [w, d] = await open("/", 1440); const cb = d.querySelectorAll(".finder-q input"); cb[0].checked = true; cb[0].dispatchEvent(new w.Event("change", { bubbles: true }));
    P(d.querySelectorAll(".finder-out .chip-link").length > 0, "coverage finder recommends coverage");
    const tabs = d.querySelectorAll("[role=tab]"); click(w, tabs[2]); P(!d.getElementById("panel-2").hidden, "industry tabs switch"); }
  { const [w, d] = await open("/client-service/", 1440); click(w, d.querySelector('[data-request="Certificate of insurance"]')); await sleep(100);
    P(d.getElementById("svc-type").value === "Certificate of insurance", "service card presets request type"); }
  fr.remove();

  const report = `LIVE QA — ${O}\n${new Date().toLocaleString()}\n${fails.length} failures, ${out.length} passes\n\n${fails.join("\n")}\n\n${out.join("\n")}\n\nNote: 4 test submissions named "QA TEST — ignore" were sent to Netlify Forms. You can delete them in Netlify → Forms.`;
  box.innerHTML = ""; const btn = document.createElement("button"); btn.textContent = "Copy report"; btn.style.cssText = "position:sticky;top:0;float:right;padding:8px 14px;background:#7a1f2b;color:#fff;border:0;border-radius:4px;cursor:pointer";
  btn.onclick = () => navigator.clipboard.writeText(report).then(() => btn.textContent = "Copied ✓");
  const pre = document.createElement("pre"); pre.textContent = report; pre.style.whiteSpace = "pre-wrap"; box.append(btn, pre);
  console.log(report);
})();
