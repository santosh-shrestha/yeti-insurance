/* Yeti Insurance — site interactions (no dependencies). Content works without JS; this enhances it. */
(function () {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const desktop = () => window.innerWidth > 1080;

  /* ---------- Header: shadow, back-to-top ---------- */
  const hdr = $(".site-header"), toTop = $(".totop");
  const onScroll = () => {
    hdr && hdr.classList.toggle("scrolled", scrollY > 20);
    toTop && toTop.classList.toggle("show", scrollY > 700);
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  toTop && toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- Mobile menu ---------- */
  const menu = $("#menu"), burger = $(".burger");
  const closeMenu = () => { if (!menu) return; menu.classList.remove("open"); burger && burger.setAttribute("aria-expanded", "false"); };
  burger && burger.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
  });

  /* ---------- Dropdowns (hover-intent on desktop, tap on mobile, keyboard) ---------- */
  const dds = $$(".dd");
  const closeAll = (except) => dds.forEach(d => { if (d !== except) { d.classList.remove("open"); $(".dd-top", d).setAttribute("aria-expanded", "false"); } });
  dds.forEach(d => {
    const btn = $(".dd-top", d); let t, hoverAt = 0;
    const open = () => { clearTimeout(t); closeAll(d); d.classList.add("open"); btn.setAttribute("aria-expanded", "true"); };
    const close = () => { d.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); };
    d.addEventListener("mouseenter", () => { if (desktop()) { hoverAt = Date.now(); open(); } });
    d.addEventListener("mouseleave", () => { if (desktop()) t = setTimeout(close, 180); });
    btn.addEventListener("click", e => {
      e.preventDefault();
      // On desktop the menu is already open from hover; a click right after hovering should keep it open.
      if (desktop() && Date.now() - hoverAt < 600) return open(); // hover already opened it; don't toggle shut
      d.classList.contains("open") ? close() : open();
    });
    btn.addEventListener("keydown", e => { if (e.key === "ArrowDown") { e.preventDefault(); open(); const a = $(".dd-panel a", d); a && a.focus(); } });
    d.addEventListener("focusout", e => { if (desktop() && !d.contains(e.relatedTarget)) close(); });
  });
  document.addEventListener("click", e => { if (!e.target.closest(".dd")) closeAll(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") { closeAll(); closeMenu(); } });

  /* ---------- Reveal on scroll ---------- */
  // Content is always visible by default. Only elements BELOW the fold are hidden for the fade-in,
  // and a safety timer reveals everything if the observer never fires (e.g. embedded previews).
  const revealAll = () => $$(".rv").forEach(el => el.classList.add("in"));
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const vh = innerHeight || 800;
    $$(".rv").forEach(el => { if (el.getBoundingClientRect().top < vh) el.classList.add("in"); });
    document.documentElement.classList.add("rv-on");
    const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }), { threshold: 0, rootMargin: "0px 0px -40px 0px" });
    $$(".rv:not(.in)").forEach(el => io.observe(el));
    setTimeout(() => { if ($$(".rv:not(.in)").some(el => el.getBoundingClientRect().top < innerHeight)) revealAll(); }, 1200);
    setTimeout(revealAll, 4000);
  } else revealAll();

  /* ---------- Open-now indicator (Central Time) ---------- */
  function updateOpen() {
    let open = false;
    try {
      const p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", hourCycle: "h23" }).formatToParts(new Date());
      const wd = p.find(x => x.type === "weekday").value, h = +p.find(x => x.type === "hour").value % 24;
      const week = JSON.parse(document.body.dataset.hours || "{}"), day = week[wd];
      open = !!day && h >= day[0] && h < day[1];
    } catch (e) {}
    $$(".open-ind").forEach(el => { el.textContent = open ? "Open now · Call a licensed agent" : "Call a licensed agent"; el.classList.toggle("is-open", open); });
    $$(".open-dot").forEach(el => el.classList.toggle("is-open", open));
    $$(".open-status").forEach(el => { el.textContent = open ? "Open now" : "Closed now · we'll call you back next business day"; el.classList.toggle("is-open", open); });
  }
  updateOpen(); setInterval(updateOpen, 60000);

  /* ---------- Forms: validation, multi-step, submission ---------- */
  const RULES = {
    required: v => v.trim().length > 0,
    name: v => v.trim().length > 1,
    zip: v => /^\d{5}$/.test(v.trim()),
    phone: v => v.replace(/\D/g, "").length >= 10,
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  };
  const validField = el => {
    const rule = el.dataset.rule; if (!rule) return true;
    const ok = RULES[rule](el.value || "");
    const f = el.closest(".f"); f && f.classList.toggle("invalid", !ok);
    el.setAttribute("aria-invalid", String(!ok));
    return ok;
  };
  const ref = p => p + "-" + Math.random().toString(36).slice(2, 8).toUpperCase();

  function initForm(form) {
    if (form.dataset.ready) return; form.dataset.ready = "1";
    const pg = form.querySelector('input[name="page"]'); if (pg) pg.value = location.pathname;
    const steps = $$(".step", form), bar = $(".progress i", form);
    let cur = 0;
    const show = i => {
      cur = i; steps.forEach((s, n) => s.classList.toggle("on", n === i));
      if (bar) bar.style.width = ((i + 1) / steps.length) * 100 + "%";
    };
    if (steps.length) show(0);
    form._reset = () => { form.reset(); $$(".f.invalid", form).forEach(f => f.classList.remove("invalid")); const o = $(".opts", form); o && o.classList.remove("err"); const e = $(".form-error", form); e && e.classList.remove("show"); if (steps.length) show(0); };

    $$("[data-rule]", form).forEach(el => el.addEventListener("input", () => { if (el.closest(".f.invalid")) validField(el); }));
    $$('input[name="zip"]', form).forEach(el => el.addEventListener("input", () => { el.value = el.value.replace(/\D/g, "").slice(0, 5); }));
    $$('input[type="tel"]', form).forEach(el => el.addEventListener("input", e => {
      if (e.inputType && e.inputType.startsWith("delete")) return; // let users backspace freely
      const d = el.value.replace(/\D/g, "").slice(0, 10);
      el.value = d.length > 6 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : d.length > 3 ? `(${d.slice(0, 3)}) ${d.slice(3)}` : d;
    }));

    const radiosOk = scope => {
      const group = $(".opts", scope); if (!group) return true;
      const ok = !!$("input:checked", group); group.classList.toggle("err", !ok);
      if (!ok) group.animate && group.animate([{ transform: "translateX(-4px)" }, { transform: "translateX(4px)" }, { transform: "none" }], { duration: 250 });
      return ok;
    };
    const stepValid = scope => [radiosOk(scope), ...$$("[data-rule]", scope).map(validField)].every(Boolean);

    $$("[data-next]", form).forEach(b => b.addEventListener("click", () => {
      if (stepValid(steps[cur])) { show(cur + 1); const first = $("input:not([type=hidden]),select,textarea", steps[cur]); first && first.focus(); }
    }));
    $$("[data-back]", form).forEach(b => b.addEventListener("click", () => show(cur - 1)));
    $$(".opts input", form).forEach(r => r.addEventListener("change", () => $(".opts", form).classList.remove("err")));

    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (steps.length && cur < steps.length - 1) { const nx = $("[data-next]", steps[cur]); nx && nx.click(); return; }
      const scope = steps.length ? steps[cur] : form;
      if (!stepValid(scope)) { const bad = $(".invalid input,.invalid select,.invalid textarea", scope); bad && bad.focus(); return; }
      const errBox = $(".form-error", form); errBox && errBox.classList.remove("show");
      form.classList.add("sending");
      const fd = new FormData(form);
      const action = form.getAttribute("action") || "/";
      try {
        let res;
        if (!/^https?:$/.test(location.protocol)) res = { ok: true }; // offline/in-app preview: simulate success
        else if (/^https?:/.test(action)) res = await fetch(action, { method: "POST", body: fd, headers: { Accept: "application/json" } });
        else res = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(fd).toString() });
        if (!res.ok) throw new Error(res.status);
        const done = $(".done", form.parentElement) || $(".done", form);
        const first = (fd.get("name") || "").toString().trim().split(" ")[0];
        if (done) {
          const n = $(".fname", done); if (n && first) n.textContent = ", " + first;
          const r = $(".ref b", done); if (r) r.textContent = ref(form.dataset.ref || "YQ");
          form.hidden = true; done.hidden = false; done.focus && done.focus();
        }
        // Copy the submission to the Google Sheet (fire-and-forget; never blocks the visitor)
        const sh = document.body.dataset.sheets;
        if (sh && /^https?:$/.test(location.protocol)) {
          const p = new URLSearchParams(fd); p.set("token", document.body.dataset.sheetsToken || "");
          try { navigator.sendBeacon ? navigator.sendBeacon(sh, p) : fetch(sh, { method: "POST", mode: "no-cors", body: p }); } catch (e) {}
        }
        if (window.dataLayer) window.dataLayer.push({ event: "form_submit", form: form.getAttribute("name") });
        // Quote requests go to a dedicated confirmation page (used as the Google Ads "quote request" conversion page)
        if (form.getAttribute("name") === "quote" && /^https?:$/.test(location.protocol) && document.body.dataset.quoteThanks) {
          const q = new URLSearchParams({ ref: ($(".ref b", done || form) || {}).textContent || ref(form.dataset.ref || "YQ") });
          if (first) q.set("n", first);
          setTimeout(() => { location.href = document.body.dataset.quoteThanks + "?" + q.toString(); }, 150);
        }
      } catch (err) {
        errBox && errBox.classList.add("show");
      } finally { form.classList.remove("sending"); }
    });
  }
  $$("form.js-form").forEach(initForm);

  /* ---------- Quote confirmation page: show first name + reference from the URL ---------- */
  const tq = $(".tq-ref");
  if (tq) {
    const qs = new URLSearchParams(location.search), r = (qs.get("ref") || "").replace(/[^A-Z0-9-]/gi, "").slice(0, 16), n = (qs.get("n") || "").replace(/[^\p{L} '-]/gu, "").slice(0, 30);
    if (r) { $("b", tq).textContent = r; tq.hidden = false; }
    if (n) $$(".tq-name").forEach(e => e.textContent = ", " + n);
  }

  /* ---------- Modals (quote + claim) ---------- */
  let lastFocus = null, hideTimer = null;
  const openModal = (id, coverage) => {
    const m = document.getElementById(id); if (!m) return; clearTimeout(hideTimer);
    lastFocus = document.activeElement; closeMenu(); closeAll();
    const form = $("form", m), done = $(".done", m);
    if (form) { form.hidden = false; form._reset ? form._reset() : form.reset(); }
    if (done) done.hidden = true;
    const cov = coverage || document.body.dataset.coverage;
    if (cov && form) { const r = $(`input[name="coverage"][value="${cov}"]`, form); if (r) r.checked = true; }
    m.hidden = false; requestAnimationFrame(() => m.classList.add("on"));
    if (id === "quote-modal") $$(".mbar .q").forEach(b => b.classList.add("on"));
    document.body.style.overflow = "hidden";
    setTimeout(() => { const f = $("input:not([type=hidden]):not(.hp input),select,textarea,button", $(".modal-box", m)); f && f.focus(); }, 60);
  };
  const closeModal = m => { if (!m) return; m.classList.remove("on"); $$(".mbar .q").forEach(x => x.classList.remove("on")); hideTimer = setTimeout(() => { m.hidden = true; }, 200); document.body.style.overflow = ""; lastFocus && lastFocus.focus(); };
  document.addEventListener("click", e => {
    const o = e.target.closest("button[data-open], a[data-open]");
    if (o) { e.preventDefault(); openModal(o.dataset.open, o.dataset.coverage); return; }
    const c = e.target.closest("[data-close]");
    if (c) closeModal(c.closest(".modal"));
  });
  document.addEventListener("keydown", e => {
    const m = $(".modal.on"); if (!m) return;
    if (e.key === "Escape") closeModal(m);
    if (e.key === "Tab") { // focus trap
      const f = $$("a,button,input,select,textarea", $(".modal-box", m)).filter(x => !x.disabled && x.offsetParent !== null);
      if (!f.length) return; const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });

  /* ---------- Service center: preset request type ---------- */
  $$("[data-request]").forEach(b => b.addEventListener("click", () => {
    const sel = $("#svc-type"); if (!sel) return;
    sel.value = b.dataset.request; const form = sel.closest("form");
    scrollTo({ top: form.getBoundingClientRect().top + scrollY - 110, behavior: "smooth" });
    setTimeout(() => { const n = $('input[name="name"]', form); n && n.focus({ preventScroll: true }); }, 450);
  }));

  /* ---------- Tabs (industries) ---------- */
  $$("[role=tablist]").forEach(list => {
    const tabs = $$("[role=tab]", list);
    const select = t => tabs.forEach(x => { const on = x === t; x.setAttribute("aria-selected", String(on)); x.tabIndex = on ? 0 : -1; document.getElementById(x.getAttribute("aria-controls")).hidden = !on; });
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => select(t));
      t.addEventListener("keydown", e => { const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (d) { const n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); select(n); } });
    });
  });

  /* ---------- Reviews slider ---------- */
  $$(".slider").forEach(sl => {
    const track = $(".track", sl), n = $$(".slide", sl).length, wrap = sl.parentElement;
    let i = 0, timer;
    const per = () => innerWidth <= 600 ? 1 : innerWidth <= 1000 ? 2 : 3;
    const go = d => { const max = Math.max(0, n - per()); i = i + d > max ? 0 : i + d < 0 ? max : i + d; track.style.transform = `translateX(-${i * (100 / per())}%)`; };
    const next = $("[data-slide=next]", wrap), prev = $("[data-slide=prev]", wrap);
    next && next.addEventListener("click", () => go(1)); prev && prev.addEventListener("click", () => go(-1));
    const auto = () => { clearInterval(timer); if (!matchMedia("(prefers-reduced-motion: reduce)").matches) timer = setInterval(() => go(1), 7000); };
    sl.addEventListener("mouseenter", () => clearInterval(timer)); sl.addEventListener("mouseleave", auto);
    let sx = 0; track.addEventListener("touchstart", e => sx = e.touches[0].clientX, { passive: true });
    track.addEventListener("touchend", e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); });
    addEventListener("resize", () => go(0)); auto();
  });

  /* ---------- Coverage finder ---------- */
  const fq = $(".finder-q");
  if (fq) {
    const out = $(".finder-out"), data = JSON.parse(fq.dataset.map);
    fq.addEventListener("change", () => {
      const keys = [...new Set($$("input:checked", fq).flatMap(i => data.rules[+i.value]))];
      if (!keys.length) { out.innerHTML = '<p class="muted">Select one or more to see recommendations.</p>'; return; }
      const isCom = keys.some(k => data.pages[k].group === "commercial");
      const hasHome = keys.some(k => data.pages[k].group === "home");
      const cov = isCom ? "commercial" : keys.includes("auto") && hasHome ? "bundle" : keys.includes("auto") ? "auto" : "home";
      out.innerHTML = `<p class="muted" style="margin-bottom:12px">Recommended for you:</p><div class="chips">${keys.map(k => `<a class="chip-link" href="${data.pages[k].url}">${data.pages[k].label}</a>`).join("")}</div><button type="button" class="btn btn-maroon btn-block" style="margin-top:20px" data-open="quote-modal" data-coverage="${cov}">Get a quote for these</button>`;
    });
  }

  /* ---------- Texas map tooltips ---------- */
  const map = $(".tx-map");
  if (map) {
    const tip = $(".tx-tip", map);
    $$(".dot", map).forEach(d => {
      const show = () => { const r = map.getBoundingClientRect(), b = d.getBoundingClientRect(); tip.textContent = d.dataset.c; tip.style.left = b.left - r.left + b.width / 2 + "px"; tip.style.top = b.top - r.top + "px"; tip.style.opacity = 1; };
      const hide = () => tip.style.opacity = 0;
      d.addEventListener("mouseenter", show); d.addEventListener("focus", show); d.addEventListener("click", show);
      d.addEventListener("mouseleave", hide); d.addEventListener("blur", hide);
    });
  }

  /* ---------- Live Google reviews (Netlify function; section keeps its static badge if unavailable) ---------- */
  const live = $(".live-reviews");
  if (live && "fetch" in window) {
    fetch(live.dataset.src, { headers: { Accept: "application/json" } })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d || !d.ok) return;
        const sec = live.closest("section");
        if (d.count) $$(".g-count", sec).forEach(e => e.textContent = d.count + " reviews · ");
        if (d.rating) $$(".g-card b", sec).forEach(e => e.textContent = Number(d.rating).toFixed(1));
        if (d.url) $$(".g-card, .lr-foot a", sec).forEach(a => a.href = d.url);
        const list = $(".lr-list", live), el = (tag, cls, txt) => { const n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; };
        (d.reviews || []).slice(0, 3).forEach(rv => {
          const li = el("li", "lr-card"), stars = el("div", "lr-stars", "★★★★★".slice(0, Math.round(rv.rating)) + "☆☆☆☆☆".slice(0, 5 - Math.round(rv.rating)));
          stars.setAttribute("aria-label", rv.rating + " out of 5 stars");
          const txt = rv.text.length > 280 ? rv.text.slice(0, 280).replace(/\s+\S*$/, "") + "…" : rv.text;
          const who = el("div", "lr-who");
          if (rv.photo) { const img = el("img"); img.src = rv.photo; img.alt = ""; img.width = img.height = 36; img.loading = "lazy"; img.referrerPolicy = "no-referrer"; who.append(img); }
          const meta = el("div"), name = rv.authorUrl ? el("a", "lr-name", rv.author) : el("span", "lr-name", rv.author);
          if (rv.authorUrl) { name.href = rv.authorUrl; name.target = "_blank"; name.rel = "noopener"; }
          meta.append(name, el("small", null, (rv.when ? rv.when + " · " : "") + "Google review"));
          who.append(meta);
          li.append(stars, el("p", "lr-text", "“" + txt + "”"), who);
          list.append(li);
        });
        if (list.children.length) live.hidden = false;
      })
      .catch(() => {});
  }
})();
