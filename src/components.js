/** Reusable HTML components. Every component returns a string of static HTML. */
const site = require("./site");

/** A value is a placeholder if it's empty or still wrapped in [brackets]. Placeholders are never shown on the live site. */
const isPH = v => v == null || String(v).trim() === "" || /\[[^\]]*\]/.test(String(v));
const fs = require("fs"), path = require("path");
/** True if an /assets/... file exists in src (so we never output links to missing images) */
const hasAsset = url => !!url && fs.existsSync(path.join(__dirname, "assets", url.replace(/^\/assets\//, "")));
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const tel = `<a href="tel:${site.phoneE164}">${site.phone}</a>`;
const formAction = site.formEndpoint ? ` action="${site.formEndpoint}"` : ` action="/thank-you/"`;
const netlify = site.formEndpoint ? "" : ` data-netlify="true" netlify-honeypot="company_website"`;
const honeypot = `<p class="hp" aria-hidden="true"><label>Leave this field empty <input name="company_website" tabindex="-1" autocomplete="off"></label></p>`;

const icon = {
  commercial: '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="#0f2a4a" stroke-width="1.5" aria-hidden="true"><rect x="5" y="9" width="26" height="22"/><path d="M13 9V5h10v4M5 18h26M16 18v3h4v-3"/></svg>',
  home: '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="#0f2a4a" stroke-width="1.5" aria-hidden="true"><path d="M4 17L18 6l14 11"/><path d="M8 14v17h20V14"/><path d="M15 31v-9h6v9"/></svg>',
  auto: '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="#0f2a4a" stroke-width="1.5" aria-hidden="true"><path d="M4 24h28v-6l-4-8H8l-4 8z"/><path d="M4 18h28"/><circle cx="10" cy="26" r="3"/><circle cx="26" cy="26" r="3"/></svg>',
  check: '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#7a1f2b" stroke-width="1.5" aria-hidden="true"><circle cx="14" cy="14" r="11"/><path d="M9 14l3.5 3.5L19 11"/></svg>',
  person: '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#7a1f2b" stroke-width="1.5" aria-hidden="true"><circle cx="14" cy="10" r="5"/><path d="M4 25c1.5-5 5.5-7 10-7s8.5 2 10 7"/></svg>',
  shield: '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#7a1f2b" stroke-width="1.5" aria-hidden="true"><path d="M14 3l9 4v7c0 6-4 9.5-9 11-5-1.5-9-5-9-11V7z"/></svg>',
  cycle: '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#7a1f2b" stroke-width="1.5" aria-hidden="true"><path d="M4 14a10 10 0 0 1 17-7l3 3M24 14a10 10 0 0 1-17 7l-3-3"/><path d="M24 4v6h-6M4 24v-6h6"/></svg>',
  mark: '<svg width="26" height="20" viewBox="0 0 26 20" aria-hidden="true"><path d="M0 20 L9 4 L13 11 L17 6 L26 20 Z" fill="#fff"/><path d="M9 4 L11.6 8.6 L9.8 8 L8 9.4 L6.8 7.6 Z" fill="#7a1f2b"/></svg>',
};

function brand(variant = "navy") {
  return `<a class="brand" href="/" aria-label="${site.name} — home">
    <img src="/assets/img/logo-${variant}.png" alt="${site.name}" width="109" height="60" onerror="this.closest('.brand').classList.add('no-img')">
    <span class="fallback"><span class="mark">${icon.mark}</span><span><span class="name" style="display:block">${site.shortName}</span><span class="sub" style="display:block">Agency · Est. ${site.founded}</span></span></span>
  </a>`;
}

const googleBadge = () => `<a class="g-inline" href="${site.googleReviewsUrl}" target="_blank" rel="noopener"><span class="g-logo" aria-hidden="true">G</span><span><b>${site.googleRating}</b> <span class="gstars" aria-hidden="true">★★★★★</span><span class="sr-only"> out of 5 stars</span></span><span style="opacity:.85">Google reviews →</span></a>`;

/* ---------- Forms ---------- */
const COVERAGES = [["commercial", "Business"], ["home", "Home"], ["auto", "Auto"], ["bundle", "Home + Auto"]];

function quoteForm({ id = "q", coverage = "", heading = "Request a quote", tag = "h2" } = {}) {
  return `<div class="card-form" ${id === "qf" ? 'id="qf"' : ""}>
  <form class="js-form" name="quote" method="POST"${formAction}${netlify} data-ref="YQ" novalidate>
    <input type="hidden" name="form-name" value="quote">
    <input type="hidden" name="page" value="">
    ${honeypot}
    <div class="progress" aria-hidden="true"><i></i></div>
    <div class="step on">
      <${tag} class="h">${heading}</${tag}><p class="note">Step 1 of 2 · What would you like to insure?</p>
      <fieldset class="opts"><legend class="sr-only">Coverage type</legend>
        ${COVERAGES.map(([v, l]) => `<label class="opt"><input type="radio" name="coverage" value="${v}"${v === coverage ? " checked" : ""}><span>${l}</span></label>`).join("")}
      </fieldset>
      <div class="f"><label for="${id}-zip">ZIP code</label><input id="${id}-zip" name="zip" inputmode="numeric" maxlength="5" autocomplete="postal-code" placeholder="e.g. 75039" data-rule="zip"><span class="err-msg">Enter a 5-digit ZIP code.</span></div>
      <button class="btn btn-maroon btn-block" type="button" data-next>Continue</button>
    </div>
    <div class="step">
      <p class="h" style="font-family:var(--serif);font-size:24px;color:var(--blue)">Your contact details</p><p class="note">Step 2 of 2 · A licensed agent will follow up within one business day.</p>
      <div class="f"><label for="${id}-name">Full name</label><input id="${id}-name" name="name" autocomplete="name" data-rule="name"><span class="err-msg">Please enter your name.</span></div>
      <div class="two">
        <div class="f"><label for="${id}-phone">Phone</label><input id="${id}-phone" name="phone" type="tel" autocomplete="tel" data-rule="phone"><span class="err-msg">Enter a 10-digit phone number.</span></div>
        <div class="f"><label for="${id}-email">Email</label><input id="${id}-email" name="email" type="email" autocomplete="email" data-rule="email"><span class="err-msg">Enter a valid email.</span></div>
      </div>
      <div class="f"><label for="${id}-msg">Anything we should know? (optional)</label><input id="${id}-msg" name="message" placeholder="e.g. 2 vehicles, restaurant with 8 employees"></div>
      <div class="form-error" role="alert">Sorry, something went wrong. Please call us at ${site.phone}.</div>
      <button class="btn btn-maroon btn-block" type="submit">Submit Request</button>
      <button class="back" type="button" data-back>← Back</button>
      <p class="trust-note"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>Secure form · Free, no-obligation quote · We never sell your information</p>
      <p class="legal">By submitting, you agree to be contacted about your request. See our <a href="/privacy/">Privacy Policy</a>.</p>
    </div>
  </form>
  <div class="done" hidden tabindex="-1"><div class="ck" aria-hidden="true">✓</div><p style="font-family:var(--serif);font-size:24px;color:var(--blue)">Thank you<span class="fname"></span>.</p><p class="note" style="margin-top:8px">Your request was received. An agent will contact you within one business day. For immediate help call ${tel}.</p><p class="ref">Reference <b></b></p></div>
</div>`;
}

function claimForm() {
  return `<div class="card-form">
  <form class="js-form" name="claim-notice" method="POST"${formAction}${netlify} data-ref="YC" novalidate>
    <input type="hidden" name="form-name" value="claim-notice">
    <input type="hidden" name="page" value="">
    ${honeypot}
    <h2 id="claim-title" style="font-size:24px">Notify us of a claim</h2>
    <p class="note">For emergencies or after hours, call your carrier's 24/7 claims line first. We'll follow up during business hours.</p>
    <div class="two">
      <div class="f"><label for="c-name">Full name</label><input id="c-name" name="name" autocomplete="name" data-rule="name"><span class="err-msg">Please enter your name.</span></div>
      <div class="f"><label for="c-phone">Phone</label><input id="c-phone" name="phone" type="tel" autocomplete="tel" data-rule="phone"><span class="err-msg">Enter a 10-digit phone number.</span></div>
    </div>
    <div class="two">
      <div class="f"><label for="c-type">Claim type</label><select id="c-type" name="claim_type" data-rule="required"><option value="">Select…</option><option>Commercial</option><option>Home / Property</option><option>Auto</option></select><span class="err-msg">Choose a claim type.</span></div>
      <div class="f"><label for="c-policy">Policy number (if known)</label><input id="c-policy" name="policy_number"></div>
    </div>
    <div class="f"><label for="c-desc">What happened?</label><textarea id="c-desc" name="description" rows="3" data-rule="required"></textarea><span class="err-msg">Please describe what happened.</span></div>
    <div class="form-error" role="alert">Sorry, something went wrong. Please call us at ${site.phone}.</div>
    <button class="btn btn-maroon btn-block" type="submit">Submit</button>
  </form>
  <div class="done" hidden tabindex="-1"><div class="ck" aria-hidden="true">✓</div><p style="font-family:var(--serif);font-size:24px;color:var(--blue)">Claim notice received.</p><p class="note" style="margin-top:8px">Your agent will contact you during business hours. For emergencies, call your carrier's 24/7 claims line.</p><p class="ref">Reference <b></b></p></div>
</div>`;
}

function contactForm() {
  return `<div class="card-form">
  <form class="js-form" name="contact" method="POST"${formAction}${netlify} data-ref="YM" novalidate>
    <input type="hidden" name="form-name" value="contact">
    <input type="hidden" name="page" value="">
    ${honeypot}
    <h2 style="font-size:24px">Send us a message</h2><p class="note">We reply within one business day. Looking for a quote? <button type="button" class="link" style="background:none;border:0;border-bottom:1px solid;cursor:pointer;padding:0;font-size:inherit" data-open="quote-modal">Start a quote</button>.</p>
    <div class="f"><label for="m-name">Full name</label><input id="m-name" name="name" autocomplete="name" data-rule="name"><span class="err-msg">Please enter your name.</span></div>
    <div class="two">
      <div class="f"><label for="m-phone">Phone</label><input id="m-phone" name="phone" type="tel" autocomplete="tel" data-rule="phone"><span class="err-msg">Enter a 10-digit phone number.</span></div>
      <div class="f"><label for="m-email">Email</label><input id="m-email" name="email" type="email" autocomplete="email" data-rule="email"><span class="err-msg">Enter a valid email.</span></div>
    </div>
    <div class="f"><label for="m-msg">How can we help?</label><textarea id="m-msg" name="message" rows="4" data-rule="required"></textarea><span class="err-msg">Please enter a message.</span></div>
    <div class="form-error" role="alert">Sorry, something went wrong. Please call us at ${site.phone}.</div>
    <button class="btn btn-maroon btn-block" type="submit">Send Message</button>
    <p class="legal">See our <a href="/privacy/">Privacy Policy</a>.</p>
  </form>
  <div class="done" hidden tabindex="-1"><div class="ck" aria-hidden="true">✓</div><p style="font-family:var(--serif);font-size:24px;color:var(--blue)">Message sent.</p><p class="note" style="margin-top:8px">Thanks for reaching out. We'll reply within one business day.</p><p class="ref">Reference <b></b></p></div>
</div>`;
}

function serviceForm() {
  const types = ["Certificate of insurance", "Auto ID cards", "Policy change", "Coverage review", "Billing question", "Mortgagee / lender request", "Other"];
  return `<div class="card-form">
  <form class="js-form" name="service-request" method="POST"${formAction}${netlify} data-ref="YS" novalidate>
    <input type="hidden" name="form-name" value="service-request">
    <input type="hidden" name="page" value="">
    ${honeypot}
    <div class="f"><label for="svc-type">Request type</label><select id="svc-type" name="request_type" data-rule="required"><option value="">Select…</option>${types.map(t => `<option>${t}</option>`).join("")}</select><span class="err-msg">Choose a request type.</span></div>
    <div class="two">
      <div class="f"><label for="svc-name">Name / business</label><input id="svc-name" name="name" data-rule="name"><span class="err-msg">Please enter your name.</span></div>
      <div class="f"><label for="svc-phone">Phone</label><input id="svc-phone" name="phone" type="tel" data-rule="phone"><span class="err-msg">Enter a 10-digit phone number.</span></div>
    </div>
    <div class="two">
      <div class="f"><label for="svc-email">Email</label><input id="svc-email" name="email" type="email" data-rule="email"><span class="err-msg">Enter a valid email.</span></div>
      <div class="f"><label for="svc-policy">Policy number (if known)</label><input id="svc-policy" name="policy_number"></div>
    </div>
    <div class="f"><label for="svc-details">Details</label><textarea id="svc-details" name="details" rows="3" placeholder="e.g. COI for ABC Builders, job at 123 Main St, Dallas"></textarea></div>
    <div class="form-error" role="alert">Sorry, something went wrong. Please call us at ${site.phone}.</div>
    <button class="btn btn-maroon btn-block" type="submit">Submit Request</button>
  </form>
  <div class="done" hidden tabindex="-1"><div class="ck" aria-hidden="true">✓</div><p style="font-family:var(--serif);font-size:24px;color:var(--blue)">Request received.</p><p class="note" style="margin-top:8px">We'll confirm by phone or email, usually the same business day.</p><p class="ref">Reference <b></b></p></div>
</div>`;
}

/* ---------- Page sections ---------- */
function smallHero({ kicker, h1, sub = "", ctas = true }) {
  return `<section class="hero hero-sm" style="padding:0"><div class="hero-bg"></div><div class="wrap"><div>
    {{CRUMBS}}
    <p class="kicker">${kicker}</p><h1>${h1}</h1>${sub ? `<p class="sub">${sub}</p>` : ""}
    ${ctas ? `<div class="ctas"><button type="button" class="btn btn-maroon" data-open="quote-modal">Start a Quote</button><a class="btn btn-ghost" href="tel:${site.phoneE164}">Call ${site.phone}</a></div>${googleBadge()}` : ""}
  </div></div></section>${ctas ? trustBar() : ""}`;
}

function faqSection(items, title = "Frequently asked questions", bg = true) {
  return `<section${bg ? ' style="background:var(--bg)"' : ""}><div class="wrap"><p class="kicker rv">FAQ</p><h2 class="rv">${title}</h2>
  <div class="faq rv">${items.map(([q, a], i) => `<details${i === 0 ? " open" : ""}><summary>${q}</summary><p>${a}</p></details>`).join("")}</div></div></section>`;
}
const faqSchema = items => ({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a.replace(/<[^>]+>/g, "") } })) });

const REVIEWS = [
  ["[Paste a real Google review about commercial coverage and service.]", "Client Name", "Business owner, Irving"],
  ["[Paste a real Google review about bundling home and auto.]", "Client Name", "Homeowner, Houston"],
  ["[Paste a real Google review about help during a claim.]", "Client Name", "Client, Austin"],
  ["[Paste a real Google review about fast certificates of insurance.]", "Client Name", "Contractor, Fort Worth"],
  ["[Paste a real Google review about responsive agents.]", "Client Name", "Client, San Antonio"],
];
function reviewsSection() {
  const real = REVIEWS.filter(r => !isPH(r[0]) && !isPH(r[1]));
  if (!real.length) return `<section class="testi" aria-labelledby="reviews-h"><div class="wrap"><div class="rv-head rv">
    <div><p class="kicker">Client reviews</p><h2 id="reviews-h">Rated ${site.googleRating} by our clients on Google</h2><p class="lead" style="color:#c9d3df">See what Texas business owners, homeowners and drivers say about working with our team.</p></div>
    <a class="g-card" href="${site.googleReviewsUrl}" target="_blank" rel="noopener"><span class="g-logo" aria-hidden="true">G</span><span><b>${site.googleRating}</b> <span class="gstars" aria-hidden="true">★★★★★</span><small>Read our reviews on Google →</small></span></a>
  </div></div></section>`;
  return `<section class="testi" aria-labelledby="reviews-h"><div class="wrap">
  <div class="rv-head rv"><div><p class="kicker">Client reviews</p><h2 id="reviews-h">Rated ${site.googleRating} by our clients on Google</h2></div>
   <a class="g-card" href="${site.googleReviewsUrl}" target="_blank" rel="noopener"><span class="g-logo" aria-hidden="true">G</span><span><b>${site.googleRating}</b> <span class="gstars" aria-hidden="true">★★★★★</span><small>Read all reviews on Google →</small></span></a></div>
  <div class="slider rv" aria-roledescription="carousel"><ul class="track">
   ${real.map(r => `<li class="slide"><blockquote><div class="stars" aria-label="5 out of 5 stars">★★★★★</div><p class="q">“${r[0]}”</p><cite><b>${r[1]}</b>${r[2]}</cite><span class="src"><span class="g-logo" style="width:16px;height:16px;font-size:10px" aria-hidden="true">G</span>Google review</span></blockquote></li>`).join("")}
  </ul></div>
  <div class="sl-ctrl"><button type="button" data-slide="prev" aria-label="Previous review">←</button><button type="button" data-slide="next" aria-label="Next review">→</button></div>
</div></section>`;
}

const credStrip = () => `<div class="cred"><div class="wrap">
  <div class="c rv"><b>${new Date().getFullYear() - site.founded} years</b><span>Serving Texas since ${site.founded}</span></div>
  <div class="c rv"><a href="${site.googleReviewsUrl}" target="_blank" rel="noopener"><b>${site.googleRating} ★</b><span>Google rating · read reviews</span></a></div>
  <div class="c rv"><a href="${site.licenseVerifyUrl}" target="_blank" rel="noopener"><b>Licensed</b><span>Texas Dept. of Insurance · verify</span></a></div>
  <div class="c rv"><b>Independent</b><span>Multiple carriers compared</span></div>
</div></div>`;

const carrierStrip = () => site.carriers.filter(c => !isPH(c.name)).length < 3 ? "" : `<div class="carriers"><div class="wrap"><p>We compare coverage from leading insurance companies, including</p>
  <ul class="logos">${site.carriers.filter(c => !isPH(c.name)).map(c => c.logo ? `<li><img src="${c.logo}" alt="${c.name}" width="140" height="36" loading="lazy"></li>` : `<li>${c.name}</li>`).join("")}</ul></div></div>`;

const teamGrid = (h = "h3") => `<ul class="team-grid">${site.team.map(t => `<li class="person rv"><div class="ph"><span aria-hidden="true">${t.initials}</span>${hasAsset(t.photo) ? `<img src="${t.photo}" alt="${t.name}, ${t.role}" loading="lazy" width="400" height="400">` : ""}</div><${h}>${t.name}</${h}><p class="role">${t.role}</p>${isPH(t.license) ? "" : `<p class="lic">TX License #${t.license}</p>`}<a href="tel:${t.tel}">${t.phone}</a><a href="mailto:${t.email}">${t.email}</a></li>`).join("")}</ul>`;

const trustBar = () => `<div class="trustbar"><div class="wrap">
  <span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7a1f2b" stroke-width="2" aria-hidden="true"><path d="M12 3l8 3.5v5.5c0 5-3.5 8-8 9.5-4.5-1.5-8-4.5-8-9.5V6.5z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg>Licensed by the Texas Department of Insurance · <a href="${site.licenseVerifyUrl}" target="_blank" rel="noopener">Verify</a></span>
  <span><span class="gstars" aria-hidden="true">★★★★★</span> ${site.googleRating} on Google · <a href="${site.googleReviewsUrl}" target="_blank" rel="noopener">Read reviews</a></span>
  <span>Independent agency since ${site.founded}</span>
  <span>Local office: ${site.address.city}, TX</span>
</div>${site.affiliations.length ? `<ul class="affil wrap">${site.affiliations.map(a => `<li>${a}</li>`).join("")}</ul>` : ""}</div>`;

const ctaBand = () => `<div class="cta"><div class="wrap"><div><h2>Let's review your coverage.</h2><p>Free, no-obligation quotes for businesses, homes and vehicles across Texas.</p></div><button type="button" class="btn btn-white" data-open="quote-modal">Start a Quote</button></div></div>`;

function pointsList(items, ic = icon.check, h = "h3") {
  return `<ul class="points">${items.map(([t, d]) => `<li class="rv">${ic}<div><${h}>${t}</${h}><p>${d}</p></div></li>`).join("")}</ul>`;
}

module.exports = { hasAsset, REVIEWS_REAL: REVIEWS.filter(r => !isPH(r[0])).length, isPH, trustBar, esc, tel, icon, brand, googleBadge, quoteForm, claimForm, serviceForm, contactForm, smallHero, faqSection, faqSchema, reviewsSection, credStrip, carrierStrip, teamGrid, ctaBand, pointsList };
