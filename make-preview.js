#!/usr/bin/env node
/**
 * Builds ONE self-contained file (site-preview.html) containing every page, for previewing
 * inside apps/tools that can't run a web server. Run after build.js:  node make-preview.js
 * Not for production — deploy /dist instead.
 */
const fs = require("fs");
const path = require("path");
const { pages } = require("./src/pages");
const DIST = path.join(__dirname, "dist");

const CSS = fs.readFileSync(path.join(DIST, "assets/css/main.css"), "utf8");
const JS = fs.readFileSync(path.join(DIST, "assets/js/main.js"), "utf8");
const SHIM = `window.onerror=function(m,u,l){parent.postMessage({err:m+' (line '+l+')'},'*')};document.addEventListener('click',function(e){var a=e.target.closest('a[href]');if(!a)return;var h=a.getAttribute('href');if(/^(mailto:|tel:)/.test(h))return;if(/^https?:/.test(h)){a.target='_blank';return;}if(h.charAt(0)==='#')return;e.preventDefault();e.stopPropagation();parent.postMessage({nav:h},'*');},true);`;

const map = {};
const list = [];
for (const p of pages) {
  const rel = p.path === "/404" ? "404.html" : path.join(p.path, "index.html");
  let html = fs.readFileSync(path.join(DIST, rel), "utf8")
    .replace('<link rel="stylesheet" href="/assets/css/main.css">', "<!--CSS-->")
    .replace('<script src="/assets/js/main.js" defer></script>', "<!--JS-->");
  map[p.path] = html;
  if (!p.noindex) list.push([p.path, (p.title.split(" | ")[0])]);
}
const data = JSON.stringify({ map, list, css: CSS, js: JS, shim: SHIM }).replace(/<\/(script)/gi, "<\\/$1").replace(/<!--/g, "<\\!--");

const out = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Yeti Insurance — Site Preview</title>
<style>
html,body{margin:0;height:100%;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif}
.pv-bar{height:40px;display:flex;align-items:center;gap:10px;padding:0 12px;background:#1c2430;color:#fff;font-size:13px}
.pv-bar b{color:#e3b9bf;font-weight:600;white-space:nowrap}
.pv-bar select{flex:1;max-width:420px;height:28px;font-size:13px;border-radius:3px;border:0;padding:0 6px}
.pv-bar button{height:28px;border:0;border-radius:3px;background:#7a1f2b;color:#fff;padding:0 10px;cursor:pointer;font-size:13px}
.pv-bar .w{display:flex;gap:4px;margin-left:auto}
.pv-bar .w button{background:#3d4754}.pv-bar .w button.on{background:#7a1f2b}
.pv-stage{height:calc(100% - 40px);background:#e9edf2;display:flex;justify-content:center}
iframe{border:0;width:100%;height:100%;background:#fff;transition:width .2s}
</style></head><body>
<div class="pv-bar"><b>PREVIEW</b><button type="button" id="pv-back" title="Back">←</button><select id="pv-sel" aria-label="Jump to page"></select>
<span id="pv-err" style="display:none;color:#ffb4b4"></span><span class="w"><button type="button" data-w="100%" class="on">Desktop</button><button type="button" data-w="820px">Tablet</button><button type="button" data-w="390px">Mobile</button></span></div>
<div class="pv-stage"><iframe id="pv" title="Site preview"></iframe></div>
<script>
var D=${data};
var fr=document.getElementById('pv'),sel=document.getElementById('pv-sel'),hist=[],cur='/';
D.list.forEach(function(x){var o=document.createElement('option');o.value=x[0];o.textContent=x[1]+'  ('+x[0]+')';sel.appendChild(o);});
function load(href,push){
  var parts=href.split('#'),p=parts[0]||'/',hash=parts[1];
  if(p.slice(-1)!=='/'&&p.indexOf('.')<0)p+='/';
  var html=D.map[p]||D.map['/404'];
  if(push!==false&&cur!==p)hist.push(cur);
  cur=p;sel.value=p;
  html=html.replace('<!--CSS-->',function(){return '<style>'+D.css+'</style>';}).replace('<!--JS-->',function(){return '<script>'+D.shim+'<\\/script><script>'+D.js+'<\\/script>';});
  fr.onload=function(){try{var d=fr.contentDocument;if(hash){var el=d.getElementById(hash);if(el)el.scrollIntoView();}else fr.contentWindow.scrollTo(0,0);}catch(e){}};
  fr.srcdoc=html;
}
window.addEventListener('message',function(e){if(e.data&&e.data.nav)load(e.data.nav);if(e.data&&e.data.err){var b=document.getElementById('pv-err');b.textContent='JS error: '+e.data.err;b.style.display='inline';}});
sel.onchange=function(){load(sel.value);};
document.getElementById('pv-back').onclick=function(){if(hist.length)load(hist.pop(),false);};
document.querySelectorAll('.w button').forEach(function(b){b.onclick=function(){document.querySelectorAll('.w button').forEach(function(x){x.classList.remove('on')});b.classList.add('on');fr.style.width=b.dataset.w;};});
load('/',false);
</script></body></html>`;

fs.writeFileSync(path.join(__dirname, "site-preview.html"), out);
console.log(`✓ site-preview.html (${(out.length / 1024).toFixed(0)} KB, ${Object.keys(map).length} pages)`);
