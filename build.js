#!/usr/bin/env node
/**
 * Yeti Insurance — static site generator (zero dependencies).
 *   node build.js   → writes the full site to /dist
 */
const fs = require("fs");
const path = require("path");
const site = require("./src/site");
const { layout } = require("./src/layout");
const { pages } = require("./src/pages");

const ROOT = __dirname;
const DIST = path.join(ROOT, "dist");
const ASSETS = path.join(ROOT, "src", "assets");

function rmrf(p) { if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true }); }
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dest, e.name);
    e.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}
function write(rel, content) {
  const file = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

rmrf(DIST);
copyDir(ASSETS, path.join(DIST, "assets"));

// ---- Pages ----
const built = [];
for (const page of pages) {
  const html = layout(page);
  const rel = page.path === "/404" ? "404.html" : path.join(page.path, "index.html");
  write(rel, html);
  built.push(page);
}

// ---- sitemap.xml ----
const today = new Date().toISOString().slice(0, 10);
const urls = built
  .filter(p => !p.noindex && p.path !== "/404")
  .map(p => `  <url><loc>${site.url}${p.path}</loc><lastmod>${today}</lastmod><priority>${p.priority ?? 0.6}</priority></url>`)
  .join("\n");
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);

// ---- robots.txt ----
write("robots.txt", `User-agent: *\nAllow: /\nDisallow: /thank-you/\n\nSitemap: ${site.url}/sitemap.xml\n`);

// ---- Netlify redirects (old Wix URLs → new pages) ----
write("_redirects", [
  "/team        /about/team/   301",
  "/claim       /claims/       301",
  "/home        /              301",
  "/blank       /              301",
].join("\n") + "\n");

// ---- _headers (so security/caching headers also apply when dist is drag-and-dropped onto Netlify) ----
write("_headers", `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/assets/*
  Cache-Control: public, max-age=31536000, immutable
`);

// ---- Link check ----
const known = new Set(built.map(p => p.path === "/404" ? "/404.html" : p.path));
let broken = 0;
for (const p of built) {
  const html = layout(p);
  for (const m of html.matchAll(/href="(\/[^"#?]*)/g)) {
    let href = m[1];
    if (href.startsWith("/assets/") || href === "/sitemap.xml") continue;
    if (!href.endsWith("/") && !href.includes(".")) href += "/";
    if (!known.has(href)) { broken++; console.warn(`  ⚠ broken link on ${p.path}: ${m[1]}`); }
  }
}

// ---- Offline copy (/preview): double-click index.html, no server needed ----
// The live site uses root URLs like "/about/"; browsers opening files directly (file://) can't resolve those,
// so this copy rewrites every internal link to a relative path ending in index.html.
const PREVIEW = path.join(ROOT, "preview");
rmrf(PREVIEW);
copyDir(path.join(DIST, "assets"), path.join(PREVIEW, "assets"));
["sitemap.xml", "robots.txt"].forEach(f => fs.copyFileSync(path.join(DIST, f), path.join(PREVIEW, f)));
for (const p of built) {
  const rel = p.path === "/404" ? "404.html" : path.join(p.path, "index.html");
  const depth = p.path === "/404" ? 0 : p.path.split("/").filter(Boolean).length;
  const up = "../".repeat(depth);
  const fix = u => {
    const [base, hash = ""] = u.split("#");
    let out = up + base.replace(/^\//, "");
    if (base === "/" || base.endsWith("/")) out += "index.html";
    return out + (hash ? "#" + hash : "");
  };
  let html = fs.readFileSync(path.join(DIST, rel), "utf8")
    .replace(/(href|src|poster|action)="(\/(?!\/)[^"]*)"/g, (m, a, u) => `${a}="${fix(u)}"`)
    .replace(/&quot;url&quot;:&quot;(\/[^&]*)&quot;/g, (m, u) => `&quot;url&quot;:&quot;${fix(u)}&quot;`);
  const file = path.join(PREVIEW, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

// ---- Launch checklist: settings still using placeholders (hidden on the site, but should be filled in) ----
const { isPH } = require("./src/components");
const todo = [];
if (isPH(site.license)) todo.push("Agency license number (site.js → license)");
if (isPH(site.googleReviewCount) || isPH(site.googleRatingDate)) todo.push("Google review count & date (site.js)");
if (/maps\/search/.test(site.googleReviewsUrl)) todo.push("Direct Google reviews link (site.js → googleReviewsUrl)");
const realCarriers = site.carriers.filter(c => !isPH(c.name));
if (realCarriers.length < 3) todo.push(`Carriers: only ${realCarriers.length} listed — carrier strip is hidden until 3+ (site.js → carriers)`);
if (realCarriers.some(c => isPH(c.claims))) todo.push("Carrier claim phone numbers (site.js → carriers[].claims)");
if (!realCarriers.some(c => c.payUrl)) todo.push("Carrier payment links (site.js → carriers[].payUrl)");
if (site.team.some(t => isPH(t.license))) todo.push("Agent license numbers (site.js → team[].license)");
if (site.story.every(isPH)) todo.push("Founder story (site.js → story)");
if (require("./src/components").REVIEWS_REAL === 0) todo.push("Real Google reviews (components.js → REVIEWS) — slider hidden until added");
["logo-navy.png", "logo-white.png", "og-image.jpg", "hero-poster.jpg"].forEach(f => { if (!fs.existsSync(path.join(ASSETS, "img", f))) todo.push(`Image: src/assets/img/${f}`); });
if (todo.length) console.log("\n⚑ Launch checklist (" + todo.length + " items still placeholder — hidden on the site):\n  - " + todo.join("\n  - ") + "\n");

console.log(`✓ Built ${built.length} pages to /dist  (${broken} broken internal links)`);
console.log(`✓ Offline preview in /preview — open preview/index.html directly in a browser`);
if (broken) process.exitCode = 1;
