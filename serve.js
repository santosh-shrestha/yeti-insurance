#!/usr/bin/env node
/**
 * Local development server for the Yeti Insurance site.
 *   node serve.js            → http://localhost:8080
 *   node serve.js --watch    → also rebuilds automatically when files in /src change
 *
 * Forms work locally: submissions are saved to /submissions/<form-name>.jsonl
 * and listed at http://localhost:8080/_submissions (local only, never deployed).
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = __dirname;
const DIST = path.join(ROOT, "dist");
const SUBS = path.join(ROOT, "submissions");
const PORT = Number(process.env.PORT) || 8080;
const WATCH = process.argv.includes("--watch");
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif", ".mp4": "video/mp4", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8", ".ico": "image/x-icon", ".json": "application/json" };

function build() {
  const r = spawnSync(process.execPath, [path.join(ROOT, "build.js")], { stdio: "inherit" });
  return r.status === 0;
}
if (!fs.existsSync(path.join(DIST, "index.html"))) build();

const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function saveSubmission(body, type) {
  let data = {};
  try {
    if (type.includes("application/json")) data = JSON.parse(body);
    else data = Object.fromEntries(new URLSearchParams(body));
  } catch { data = { raw: body }; }
  if (data.company_website) return { spam: true }; // honeypot filled → bot
  const form = (data["form-name"] || "unknown").replace(/[^a-z0-9-]/gi, "");
  delete data["form-name"]; delete data.company_website;
  const entry = { received: new Date().toISOString(), ...data };
  fs.mkdirSync(SUBS, { recursive: true });
  fs.appendFileSync(path.join(SUBS, form + ".jsonl"), JSON.stringify(entry) + "\n");
  console.log(`\n📨  New "${form}" submission:`, entry);
  return { form };
}

function submissionsPage() {
  const files = fs.existsSync(SUBS) ? fs.readdirSync(SUBS).filter(f => f.endsWith(".jsonl")) : [];
  const sections = files.map(f => {
    const rows = fs.readFileSync(path.join(SUBS, f), "utf8").trim().split("\n").filter(Boolean).map(l => JSON.parse(l)).reverse();
    const keys = [...new Set(rows.flatMap(Object.keys))];
    return `<h2>${esc(f.replace(".jsonl", ""))} <small>(${rows.length})</small></h2><div class="t"><table><thead><tr>${keys.map(k => `<th>${esc(k)}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${keys.map(k => `<td>${esc(r[k] ?? "")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }).join("") || "<p>No submissions yet. Submit a form on the site and refresh this page.</p>";
  return `<!doctype html><meta charset="utf-8"><title>Form submissions (local)</title><style>body{font:14px -apple-system,Segoe UI,Arial;margin:32px;color:#1c2430}h1{color:#0f2a4a}h2{color:#7a1f2b;margin-top:32px}small{color:#6b7480}.t{overflow:auto}table{border-collapse:collapse;min-width:100%}th,td{border:1px solid #d9dee5;padding:8px 10px;text-align:left;vertical-align:top}th{background:#eef2f7}</style><h1>Form submissions <small>local only · saved in /submissions</small></h1><p><a href="/">← Back to site</a></p>${sections}`;
}

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);

  if (req.method === "POST") {
    let body = "";
    req.on("data", c => { body += c; if (body.length > 1e6) req.destroy(); });
    req.on("end", () => {
      saveSubmission(body, req.headers["content-type"] || "");
      const wantsHtml = (req.headers.accept || "").includes("text/html"); // true for a normal (no-JS) form post
      if (wantsHtml) { res.writeHead(303, { Location: "/thank-you/" }); return res.end(); } // no-JS fallback
      res.writeHead(200, { "Content-Type": "application/json" }); res.end('{"ok":true}');
    });
    return;
  }

  if (url === "/_submissions") { res.writeHead(200, { "Content-Type": TYPES[".html"] }); return res.end(submissionsPage()); }

  let file = path.join(DIST, url);
  if (!file.startsWith(DIST)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    if (!url.endsWith("/")) { res.writeHead(301, { Location: url + "/" }); return res.end(); }
    file = path.join(file, "index.html");
  }
  if (!fs.existsSync(file)) {
    res.writeHead(404, { "Content-Type": TYPES[".html"] });
    return fs.createReadStream(path.join(DIST, "404.html")).pipe(res);
  }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => {
  console.log(`\n  Yeti Insurance site running at  http://localhost:${PORT}`);
  console.log(`  Form submissions:                http://localhost:${PORT}/_submissions`);
  console.log(WATCH ? "  Watching /src for changes — edits rebuild automatically.\n" : "  Tip: run with --watch to rebuild automatically on edits.\n");
  console.log("  Press Ctrl+C to stop.\n");
});

if (WATCH) {
  let t;
  fs.watch(path.join(ROOT, "src"), { recursive: true }, (ev, name) => {
    clearTimeout(t);
    t = setTimeout(() => { console.log(`\n↻  ${name} changed — rebuilding…`); build(); }, 200);
  });
}
