/** Assembles every page on the site. Each object = one URL. */
const site = require("./site");
const C = require("./components");
const { hubs, subs } = require("./content/coverage");
const posts = require("./content/posts");

const pages = [];
const add = p => pages.push(p);
const serviceSchema = (name, url, description) => ({ "@context": "https://schema.org", "@type": "Service", name, serviceType: name, description, url: site.url + url, areaServed: { "@type": "State", name: "Texas" }, provider: { "@id": site.url + "/#agency" } });
const fmtDate = d => new Date(d + "T12:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
const subUrl = s => hubs[s.parent].path + s.slug + "/";

/* ================= HOME ================= */
const INDUSTRIES = [
  ["Restaurants", "Restaurants & Food Service", "Liability, property, equipment breakdown, food spoilage and liquor liability for Texas restaurants.", ["General Liability", "Liquor Liability", "Commercial Property", "Workers' Comp"]],
  ["Retail", "Retail & Convenience Stores", "Storefronts, convenience stores and gas stations, with inventory and crime protection.", ["Business Owner's Policy", "Commercial Property", "Crime", "Commercial Auto"]],
  ["Contractors", "Contractors & Trades", "Coverage that meets job-site and contract requirements, with same-day certificates.", ["General Liability", "Tools & Equipment", "Builder's Risk", "Workers' Comp"]],
  ["Hospitality", "Hotels & Motels", "Protects your property and guests and helps keep you open after a loss.", ["Commercial Property", "General Liability", "Business Income", "Umbrella"]],
  ["Transportation", "Trucking & Transportation", "Commercial auto and fleet coverage for Texas roads.", ["Commercial Auto", "Cargo", "Physical Damage", "Umbrella"]],
  ["Uber Black", "Uber Black & Livery", "Commercial auto (livery) coverage for Uber Black, Black SUV, limo and black car drivers and fleets.", ["Commercial Auto (Livery)", "Physical Damage", "Uninsured Motorist", "Platform Certificates"]],
  ["Real Estate", "Landlords & Property Owners", "Commercial and residential rental property owners.", ["Commercial Property", "Landlord Policies", "General Liability", "Umbrella"]],
];
const FINDER = [
  ["I own or rent the home I live in", ["home", "renters-condo"]],
  ["I own a rental property", ["landlord"]],
  ["My household has personal vehicles", ["auto"]],
  ["I own a business", ["general-liability"]],
  ["My business has employees", ["workers-compensation"]],
  ["My business owns a building, equipment or inventory", ["commercial-property"]],
  ["My business uses vehicles", ["commercial-auto"]],
  ["I'm a contractor or work on job sites", ["contractors"]],
  ["I drive for Uber Black or a limo / black car service", ["uber-black-livery"]],
  ["I want extra liability protection", ["personal-umbrella", "commercial-umbrella"]],
];
const finderPages = { home: { url: hubs.home.path, label: "Homeowners", group: "home" }, auto: { url: hubs.auto.path, label: "Auto", group: "auto" } };
subs.forEach(s => finderPages[s.slug] = { url: subUrl(s), label: s.short, group: s.parent });
const finderData = C.esc(JSON.stringify({ rules: FINDER.map(f => f[1]), pages: finderPages }));

/* Texas outline projected from real lon/lat border points (simplified) */
const TX_BORDER = [[-103.04,36.5],[-100,36.5],[-100,34.56],[-99.5,34.41],[-99.19,34.21],[-98.6,34.15],[-98.09,34.13],[-97.6,33.96],[-97.15,33.72],[-96.6,33.85],[-96.15,33.84],[-95.6,33.92],[-95.15,33.94],[-94.6,33.68],[-94.04,33.55],[-94.04,33.0],[-94.04,32.0],[-93.82,31.6],[-93.55,31.18],[-93.6,30.65],[-93.72,30.3],[-93.84,29.7],[-94.4,29.55],[-94.76,29.33],[-95.1,29.1],[-95.5,28.82],[-96.0,28.6],[-96.5,28.35],[-96.88,28.05],[-97.15,27.7],[-97.35,27.3],[-97.42,26.8],[-97.3,26.25],[-97.15,25.96],[-97.55,26.0],[-97.95,26.07],[-98.35,26.2],[-98.8,26.36],[-99.1,26.55],[-99.3,27.0],[-99.5,27.5],[-99.85,27.95],[-100.3,28.4],[-100.65,29.05],[-101.05,29.5],[-101.45,29.78],[-101.95,29.8],[-102.4,29.78],[-102.7,29.55],[-102.9,29.2],[-103.15,28.98],[-103.55,29.15],[-104.0,29.4],[-104.5,29.75],[-104.7,30.2],[-105.0,30.68],[-105.55,31.1],[-106.0,31.4],[-106.4,31.75],[-106.63,31.98],[-103.06,32.0]];
const txProj = ([lon, lat]) => [((lon + 106.7) * 0.857 * 34 + 7).toFixed(1), ((36.55 - lat) * 34 + 16).toFixed(1)];
const TX_PATH = "M" + TX_BORDER.map(p => txProj(p).join(" ")).join(" L") + " Z";
// [name, lon, lat, label side ("r" | "l"), hq]. Dallas and Fort Worth share the office marker so dots don't overlap.
const TX_CITIES = [["Amarillo", -101.83, 35.22, "r"], ["Lubbock", -101.85, 33.58, "r"], ["El Paso", -106.44, 31.76, "r"], ["Tyler", -95.3, 32.35, "l"], ["Austin", -97.74, 30.27, "l"], ["Houston", -95.37, 29.76, "l"], ["San Antonio", -98.49, 29.42, "l"], ["Corpus Christi", -97.4, 27.8, "r"], ["Laredo", -99.51, 27.53, "l"], ["Dallas–Fort Worth", -96.95, 32.81, "l", 1]];
const texasMap = `<div class="tx-map rv">
  <svg viewBox="0 0 400 400" role="img" aria-label="Map of Texas: our office is in Irving, in Dallas–Fort Worth, and we serve clients statewide including Houston, Austin, San Antonio, El Paso, Lubbock, Amarillo, Corpus Christi, Laredo and Tyler">
    <path d="${TX_PATH}" fill="#eef2f7" stroke="#0f2a4a" stroke-width="1.6" stroke-linejoin="round"/>
    ${TX_CITIES.map(([c, lon, lat, side, hq]) => { const [x, y] = txProj([lon, lat]).map(Number);
      const lx = side === "l" ? x - (hq ? 14 : 10) : x + (hq ? 14 : 10), anchor = side === "l" ? "end" : "start";
      const label = `<text class="tx-l${hq ? " hq" : ""}" x="${lx}" y="${y + 4}" text-anchor="${anchor}">${hq ? "Irving · Dallas–Fort Worth" : c}</text>`;
      return hq
      ? `<g class="dot-g"><circle cx="${x}" cy="${y}" r="15" fill="#0f2a4a" opacity=".12"/><circle class="dot hq" cx="${x}" cy="${y}" r="7" data-c="Our office: Irving (Dallas–Fort Worth)" tabindex="0"><title>Our office: Irving (Dallas–Fort Worth)</title></circle>${label}</g>`
      : `<circle class="dot" cx="${x}" cy="${y}" r="5" data-c="${c}" tabindex="0"><title>${c}</title></circle>${label}`; }).join("")}
  </svg><div class="tx-tip" aria-hidden="true"></div>
  <p class="tx-legend"><span class="lg hq"></span>Our Irving office <span class="lg"></span>Cities we serve</p></div>`;

const postCards = list => `<div class="blog-grid">${list.map(p => `<article class="post rv"><div class="post-img"><span>${p.category}</span></div><div class="post-body"><small>${p.category} · ${p.readTime}</small><h3><a href="/resources/${p.slug}/">${p.title}</a></h3><p>${p.description}</p><span class="link">Read article →</span></div></article>`).join("")}</div>`;

const homeFaq = [
  ["Does Yeti Insurance serve all of Texas?", "Yes. Our office is in Irving, and we write commercial, home and auto policies for clients throughout Texas. Most service is handled by phone and email, and you're always welcome at our Las Colinas office."],
  ["What is an independent insurance agency?", "An independent agency works with multiple insurance companies, so we can compare options and recommend the best fit rather than selling one company's products."],
  ["Can I bundle home and auto insurance?", "Yes. Most carriers offer a multi-policy discount when you bundle home and auto, and you'll have one agent for both."],
  ["How fast can I get a quote?", "Many quotes are ready within one business day. Timing depends on the coverage and how quickly carriers respond."],
];

add({
  path: "/", priority: 1.0,
  title: "Commercial, Home & Auto Insurance in Texas | Yeti Insurance Agency",
  description: "Independent Texas insurance agency since 2016. Commercial, home and auto insurance from leading carriers. Rated 4.9 on Google. Serving all of Texas.",
  schema: [C.faqSchema(homeFaq), { "@context": "https://schema.org", "@type": "WebSite", name: site.name, url: site.url + "/" }],
  body: `
<section class="hero" style="padding:0">
  <div class="hero-bg"></div>
  <div class="wrap">
    <div>
      <p class="kicker">Serving all of Texas · Since ${site.founded}</p>
      <h1>Commercial, home and auto insurance for Texas businesses and families.</h1>
      <p class="sub">For ${new Date().getFullYear() - site.founded} years, Yeti Insurance has helped Texans find the right coverage from leading carriers, with personal service from a dedicated agent.</p>
      <div class="ctas"><a class="btn btn-maroon" href="#qf">Start a Quote</a><a class="btn btn-ghost" href="/commercial-insurance-texas/">Commercial Insurance</a></div>
      ${C.googleBadge()}
    </div>
    ${C.quoteForm({ id: "qf", heading: "Request a quote" })}
  </div>
</section>

<div class="paths"><div class="wrap">
  <div class="path rv"><small>New client</small><h2>Get insured</h2><p>We shop multiple carriers to find the right coverage for your business, home or vehicles.</p><button type="button" class="btn btn-maroon" data-open="quote-modal">Start a Quote</button></div>
  <div class="path rv"><small>Existing client</small><h2>Manage your policy</h2><p>Make a payment, request ID cards or a certificate, change a policy or report a claim.</p><a class="btn btn-line" href="/client-service/">Client Service Center</a></div>
  <div class="path rv"><small>Lender, realtor or partner</small><h2>Service a client</h2><p>Request evidence of insurance, mortgagee changes or a fast quote for a closing.</p><a class="btn btn-line" href="/partners/">Partner Requests</a></div>
</div></div>

${C.credStrip()}

<section id="coverage"><div class="wrap">
  <div class="svc-head rv"><div><p class="kicker">What we insure</p><h2>Commercial, home and auto insurance for Texans</h2></div>
  <p class="lead">As an independent agency, we're not tied to one company. We compare carriers and recommend the coverage that fits.</p></div>
  <div class="svc rv">
   ${["commercial", "home", "auto"].map((k, i) => { const h = hubs[k]; return `<article>
     <p class="num">0${i + 1}</p>${C.icon[k]}<h3><a href="${h.path}">${h.short}</a></h3>
     <p>${h.cardText}</p>
     <ul>${h.cardList.map(c => `<li>${c}</li>`).join("")}</ul>
     <span class="link" style="align-self:start">Explore ${h.label.toLowerCase()} <span class="arrow">→</span></span></article>`; }).join("")}
  </div>
</div></section>

${C.carrierStrip()}

<section class="finder" id="finder"><div class="wrap split top">
  <div class="rv"><p class="kicker">Coverage finder</p><h2>Not sure what you need? Find out in 20 seconds.</h2>
   <p class="lead">Check everything that applies and we'll show the coverage most Texans in your situation consider. Then talk it through with an agent.</p>
   <p class="fine-print">For guidance only. Your agent will confirm the right coverage for you.</p></div>
  <div class="finder-box rv">
   <fieldset class="finder-q" data-map="${finderData}"><legend class="sr-only">Select all that apply</legend>
    ${FINDER.map((q, i) => `<label class="chk"><input type="checkbox" value="${i}"><span>${q[0]}</span></label>`).join("")}
   </fieldset>
   <div class="finder-out" aria-live="polite"><p class="muted">Select one or more to see recommendations.</p></div>
  </div>
</div></section>

${C.reviewsSection()}

<section class="commercial-band"><div class="wrap">
  <div class="rv"><p class="kicker">Commercial specialists</p><h2>Coverage that understands how your business runs</h2>
   <p class="lead" style="margin-bottom:28px">From single-location shops to growing companies with fleets and payroll, we review your risks and build a policy package that protects what you've built.</p>
   <a class="btn btn-line" href="/commercial-insurance-texas/">Commercial Insurance</a></div>
  <div class="rv">
   <div class="tabs" role="tablist" aria-label="Industries">${INDUSTRIES.map((x, i) => `<button type="button" role="tab" id="tab-${i}" aria-controls="panel-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${x[0]}</button>`).join("")}</div>
   ${INDUSTRIES.map((x, i) => `<div class="tabpanel" role="tabpanel" id="panel-${i}" aria-labelledby="tab-${i}"${i ? " hidden" : ""}><h3>${x[1]}</h3><p>${x[2]}</p><ul class="chips">${x[3].map(c => `<li>${c}</li>`).join("")}</ul><p style="margin:22px 0 0"><a class="link" href="${x[0] === "Uber Black" ? "/commercial-insurance-texas/uber-black-livery/" : "/commercial-insurance-texas/"}">See ${x[0] === "Uber Black" ? "Uber Black coverage" : "commercial coverage"} →</a></p></div>`).join("")}
  </div>
</div></section>

<section><div class="wrap split">
  <div class="photo land fill rv"><img src="/assets/img/office-urban-towers.jpg" srcset="/assets/img/office-urban-towers-800.jpg 800w, /assets/img/office-urban-towers.jpg 1600w" sizes="(max-width:1000px) 92vw, 600px" alt="Urban Towers in Las Colinas, home of the Yeti Insurance office in Irving, Texas" loading="lazy" width="1600" height="889"><div class="badge"><b>${site.founded}</b><small>A decade of serving Texas businesses and families</small></div></div>
  <div class="rv"><p class="kicker">Why Yeti Insurance</p><h2>A local agency with statewide reach</h2>
   <p class="lead">For ${new Date().getFullYear() - site.founded} years we've helped Texans make clear, confident decisions about their coverage.</p>
   ${C.pointsList([["We work for you, not the carrier", "We compare multiple carriers and recommend what fits your needs and budget."], ["One dedicated agent", "You'll know who to call, and that person will know your account."], ["Support at claim time", "We help you report claims and follow up with the carrier until they're resolved."], ["Annual coverage reviews", "Each year we review your policies as your business, home and family change."]], C.icon.check)}
   <p style="margin-top:24px"><a class="link" href="/about/">More about our agency →</a></p></div>
</div></section>

<section style="background:var(--bg)"><div class="wrap">
  <div class="svc-head rv" style="margin-bottom:0"><div><p class="kicker">How it works</p><h2>Our process is simple</h2></div><button type="button" class="btn btn-maroon" data-open="quote-modal">Start a Quote</button></div>
  <ol class="process">
   <li class="rv"><b>01</b><h3>Tell us what you need</h3><p>Start a quote online or call us. It takes about two minutes.</p></li>
   <li class="rv"><b>02</b><h3>We compare carriers</h3><p>Your agent shops multiple carriers and explains the differences.</p></li>
   <li class="rv"><b>03</b><h3>You choose</h3><p>Pick the coverage you like best, and we'll help you put it in place.</p></li>
  </ol>
</div></section>

<section class="texas"><div class="wrap">
  <div class="rv"><p class="kicker">Areas we serve</p><h2>Serving clients across the state of Texas</h2>
   <p class="lead">Our office is in Irving, but our clients are everywhere from El Paso to Houston. Quotes, service and claim support are handled by phone, email or in person.</p>
   <ul class="cities">${site.cities.map(c => `<li>${c}</li>`).join("")}</ul>
   <p style="margin-top:22px"><a class="link" href="/areas-we-serve/">See all areas we serve →</a></p></div>
  ${texasMap}
</div></section>

<section><div class="wrap">
  <div class="svc-head rv"><div><p class="kicker">Resources</p><h2>Guides for Texas business owners, homeowners and drivers</h2></div><a class="link" href="/resources/">View all resources →</a></div>
  ${postCards(posts)}
</div></section>

${C.faqSection(homeFaq)}
`});

/* ================= COVERAGE HUBS & SUB-PAGES ================= */
function coverageBody({ h1, intro, crumbsLabel, covers, sections = [], body = "", who, faq, coverage, kicker, children = [], related = [] }) {
  return `${C.smallHero({ kicker, h1, sub: intro })}
<section><div class="wrap split top wide-left">
  <div>
    <p class="kicker rv">What's covered</p><h2 class="rv">${crumbsLabel} coverage options</h2>
    <ul class="points">${covers.map(([t, d, url]) => `<li class="rv">${C.icon.check}<div><h3>${url ? `<a href="${url}">${t}</a>` : t}</h3><p>${d}</p></div></li>`).join("")}</ul>
    ${body ? `<div class="prose rv" style="margin-top:40px">${body}</div>` : ""}
    ${sections.map(([t, html]) => `<div class="prose rv"><h2>${t}</h2>${html}</div>`).join("")}
    <div class="rv" style="margin-top:40px"><p class="kicker">Who we insure</p><ul class="chips">${who.map(w => `<li>${w}</li>`).join("")}</ul></div>
    ${related.length ? `<div class="rv related"><p class="kicker">Related coverage</p><div class="chips">${related.map(([u, l]) => `<a class="chip-link" href="${u}">${l}</a>`).join("")}</div></div>` : ""}
  </div>
  <div class="sticky rv">${C.quoteForm({ id: "pq", coverage, heading: `Get a ${crumbsLabel.toLowerCase()} quote` })}
    <p class="muted" style="margin-top:16px;text-align:center">Prefer to talk? Call ${C.tel} · <span class="open-ind">${site.hours.label}</span></p></div>
</div></section>
${children.length ? `<section style="background:var(--bg)"><div class="wrap"><p class="kicker rv">Explore</p><h2 class="rv">${crumbsLabel} insurance by type</h2><div class="actions" style="margin-top:32px">${children.map(([u, t, d]) => `<a class="action rv" href="${u}"><span class="action-t">${t}</span><p>${d}</p><span class="arrow" aria-hidden="true">→</span></a>`).join("")}</div></div></section>` : ""}
${C.reviewsSection()}
${C.faqSection(faq, `${crumbsLabel.replace(/ Insurance$/, "")} insurance FAQ`)}`;
}

for (const key of Object.keys(hubs)) {
  const h = hubs[key];
  const kids = subs.filter(s => s.parent === key);
  add({
    path: h.path, priority: 0.9, title: h.title, description: h.description, coverage: h.coverage,
    breadcrumbs: [[h.path, h.label]],
    schema: [serviceSchema(h.label, h.path, h.description), C.faqSchema(h.faq)],
    body: coverageBody({ h1: h.h1, intro: h.intro, crumbsLabel: h.short, covers: h.covers, sections: h.sections, who: h.who, faq: h.faq, coverage: h.coverage, kicker: `${h.label} · Statewide`,
      children: kids.map(s => [subUrl(s), s.short, s.intro.split(". ")[0].replace(/\.$/, "") + "."]),
      related: Object.values(hubs).filter(x => x !== h).map(x => [x.path, x.label]) }),
  });
}
for (const s of subs) {
  const h = hubs[s.parent], url = subUrl(s);
  add({
    path: url, priority: 0.8, title: s.title, description: s.description, coverage: h.coverage,
    breadcrumbs: [[h.path, h.label], [url, s.short]],
    schema: [serviceSchema(s.label, url, s.description), C.faqSchema(s.faq)],
    body: coverageBody({ h1: s.title.split(" | ")[0], intro: s.intro, crumbsLabel: s.short, covers: s.covers, body: s.body, who: s.who, faq: s.faq, coverage: h.coverage, kicker: `${h.label} · Texas`,
      related: [[h.path, "All " + h.label.toLowerCase()], ...subs.filter(x => x.parent === s.parent && x !== s).map(x => [subUrl(x), x.short])] }),
  });
}

/* ================= ABOUT ================= */
add({
  path: "/about/", priority: 0.7,
  title: "About Yeti Insurance | Independent Texas Insurance Agency Since 2016",
  description: "Meet Yeti Insurance Agency, an independent insurance agency in Irving serving all of Texas since 2016. Our story, our team and how we work.",
  breadcrumbs: [["/about/", "About"]],
  body: `${C.smallHero({ kicker: "About us", h1: `An independent Texas agency, built on relationships since ${site.founded}.`, sub: "We started in Irving with a simple idea: give business owners and families honest advice and real choices. Today we serve clients across Texas." })}
<section><div class="wrap split top">
  <div class="rv"><p class="kicker">Our story</p><h2>${new Date().getFullYear() - site.founded} years of protecting Texans</h2>
   <div class="prose">${site.story.filter(p => !C.isPH(p)).map(p => `<p>${p}</p>`).join("")}
   <p>Today we partner with leading insurance companies to provide commercial, home and auto insurance throughout Texas. Every client has a dedicated agent who knows their account, and we review coverage every year as your business and family change.</p></div>
   <ol class="steps-list" style="margin-top:32px">
    <li><div><strong>${site.founded}.</strong> Yeti Insurance Agency founded in Irving, Texas.</div></li>
    ${site.milestones.filter(([y, t]) => !C.isPH(y) && !C.isPH(t)).map(([y, t]) => `<li><div><strong>${y}.</strong> ${t}</div></li>`).join("")}
    <li><div><strong>${new Date().getFullYear()}.</strong> A decade of service, rated ${site.googleRating} on Google.</div></li>
   </ol></div>
  <div class="photo land rv"><img src="/assets/img/community/booth.jpg" srcset="/assets/img/community/booth-600.jpg 600w, /assets/img/community/booth.jpg 1200w" sizes="(max-width:1000px) 92vw, 600px" alt="Yeti Insurance agents at the agency's booth at a community event" loading="lazy" width="1200" height="900"><div class="badge"><b>${new Date().getFullYear() - site.founded}</b><small>years serving Texas</small></div></div>
</div></section>
<section style="background:var(--bg)"><div class="wrap"><p class="kicker rv">How we work</p><h2 class="rv">What you can expect from us</h2>
  ${C.pointsList([["Honest advice", "We explain coverage in plain English, including what isn't covered."], ["Real choices", "We compare multiple carriers instead of selling one company's products."], ["Responsive service", "Certificates, ID cards and policy changes are handled promptly, often the same business day."], ["Claim advocacy", "We help you report claims and follow up with the carrier."]])}
</div></section>
<section><div class="wrap"><p class="kicker rv">In the community</p><h2 class="rv">Proud to be part of DFW</h2>
  <p class="lead rv" style="max-width:640px">You'll find our team at festivals, fundraisers and neighborhood events across the Metroplex, not just behind a desk.</p>
  <div class="gallery" role="region" aria-label="Community photos" tabindex="0">${[
   ["foundation-tent.jpg", 1200, 739, "Community day with the Yeti Foundation", "center"],
   ["cycling-for-a-cause.jpg", 1200, 900, "Cycling for a Cause fundraiser", "center 40%"],
   ["cycling-riders.jpg", 1200, 904, "Riders gathering before Cycling for a Cause", "center 70%"],
  ].map(([f, w, h, cap, pos]) => `<figure class="rv"><img src="/assets/img/community/${f}" srcset="/assets/img/community/${f.replace(".jpg", "-600.jpg")} 600w, /assets/img/community/${f} 1200w" sizes="(max-width:640px) 84vw, 33vw" alt="${cap}" loading="lazy" width="${w}" height="${h}" style="object-position:${pos}"><figcaption>${cap}</figcaption></figure>`).join("")}</div>
</div></section>
<section><div class="wrap"><p class="kicker rv">Our team</p><h2 class="rv">Meet your agents</h2>${C.teamGrid()}<p style="margin-top:28px"><a class="link" href="/about/team/">Full team page →</a></p></div></section>
${C.credStrip()}
${C.reviewsSection()}`,
});

add({
  path: "/about/team/", priority: 0.6,
  title: "Meet the Team | Yeti Insurance Agency, Irving TX",
  description: "Meet the licensed agents at Yeti Insurance Agency. Contact any of our team directly for commercial, home and auto insurance across Texas.",
  breadcrumbs: [["/about/", "About"], ["/about/team/", "Team"]],
  schema: [{ "@context": "https://schema.org", "@type": "ItemList", itemListElement: site.team.map((t, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "Person", name: t.name, jobTitle: t.role, telephone: t.tel, email: t.email, worksFor: { "@id": site.url + "/#agency" }, sameAs: [t.linkedin] } })) }],
  body: `${C.smallHero({ kicker: "Our team", h1: "Meet the Yeti Insurance team", sub: "Licensed, local and easy to reach. Contact any of our agents directly." })}
<section><div class="wrap">${C.teamGrid("h2")}</div></section>`,
});

/* ================= CLAIMS ================= */
add({
  path: "/claims/", priority: 0.7,
  title: "Report an Insurance Claim | Claims Center | Yeti Insurance Agency",
  description: "How to report a commercial, home or auto insurance claim in Texas. Carrier 24/7 claim numbers and help from your Yeti Insurance agent.",
  breadcrumbs: [["/claims/", "Claims"]],
  body: `${C.smallHero({ kicker: "Claims center", h1: "Reporting a claim", sub: "For the fastest response, contact your carrier's 24/7 claims line, then let our office know so we can help.", ctas: false })}
<section style="padding-bottom:0"><div class="wrap"><div class="actions">
  <button type="button" class="action rv" data-open="claim-modal"><span class="action-t">Notify our office</span><p>Tell us what happened. We'll follow up with the carrier.</p><span class="arrow" aria-hidden="true">→</span></button>
  <a class="action rv" href="#carrier-claims"><span class="action-t">Carrier claim numbers</span><p>Call your carrier's 24/7 claims line directly.</p><span class="arrow" aria-hidden="true">→</span></a>
  <a class="action rv" href="tel:${site.phoneE164}"><span class="action-t">Talk to your agent</span><p>${site.phone} · ${site.hours.label}</p><span class="arrow" aria-hidden="true">→</span></a>
</div></div></section>
<section><div class="wrap split top">
  <div class="rv"><p class="kicker">What to do</p><h2>Steps after a loss</h2>
   <ol class="steps-list"><li>Make sure everyone is safe. Contact emergency services if needed.</li><li>Prevent further damage if it's safe to do so (for example, tarp a damaged roof) and keep receipts.</li><li>Document the damage with photos and video, and collect the other party's information.</li><li>Call your carrier's 24/7 claims line, listed here.</li><li>Notify Yeti Insurance so your agent can follow up on your behalf.</li></ol>
   <div class="ctas" style="margin-top:28px"><button type="button" class="btn btn-maroon" data-open="claim-modal">Notify Our Office</button><a class="btn btn-line" href="tel:${site.phoneE164}">Call ${site.phone}</a></div></div>
  <div class="ctable rv" id="carrier-claims"><div class="h">Carrier claims contacts</div>
   <table><tbody>${site.carriers.filter(c => !C.isPH(c.name)).map(c => `<tr><td>${c.url ? `<a href="${c.url}" target="_blank" rel="noopener">${c.name}</a>` : c.name}</td><td>${C.isPH(c.claims) ? "See your policy ID card" : `<a href="tel:${c.claims.replace(/[^0-9+]/g, "")}">${c.claims}</a>`}</td></tr>`).join("")}</tbody></table>
   <div class="n">Your carrier is listed on your declarations page and ID card. Not sure? Call us at ${site.phone}.</div></div>
</div></section>
${C.faqSection([["Should I call my carrier or my agent first?", "For emergencies and after hours, call your carrier's 24/7 claims line first. Then let us know so we can follow up for you."], ["Will filing a claim raise my premium?", "It can, depending on the type of claim and your history. If you're unsure whether to file, call us and we'll talk it through."], ["How long do I have to report a claim?", "Report as soon as possible. Many policies set deadlines for reporting, especially for wind and hail damage."]], "Claims FAQ")}`,
  schema: [C.faqSchema([["Should I call my carrier or my agent first?", "For emergencies and after hours, call your carrier's 24/7 claims line first. Then let us know so we can follow up for you."], ["Will filing a claim raise my premium?", "It can, depending on the type of claim and your history. If you're unsure whether to file, call us and we'll talk it through."], ["How long do I have to report a claim?", "Report as soon as possible. Many policies set deadlines for reporting, especially for wind and hail damage."]])],
});

/* ================= CLIENT SERVICE ================= */
const ACTIONS = [["Make a payment", "Pay your carrier directly or ask us for help.", "/client-service/payments/"], ["Certificate of insurance", "Request a COI or add an additional insured.", "Certificate of insurance"], ["ID cards", "Get auto ID cards sent to you.", "Auto ID cards"], ["Policy change", "Add a driver, vehicle or location, or update coverage.", "Policy change"], ["Report a claim", "Notify us and get carrier claim numbers.", "claim"], ["Coverage review", "Schedule your annual review with your agent.", "Coverage review"]];
add({
  path: "/client-service/", priority: 0.6,
  title: "Client Service Center | Payments, COIs, ID Cards | Yeti Insurance",
  description: "Existing Yeti Insurance clients: make a payment, request a certificate of insurance or ID cards, change your policy or report a claim.",
  breadcrumbs: [["/client-service/", "Client Service"]],
  body: `${C.smallHero({ kicker: "Client service", h1: "Client Service Center", sub: "Everything existing clients need in one place. We handle most requests promptly, often the same business day.", ctas: false })}
<section><div class="wrap">
  <div class="actions">${ACTIONS.map(([t, d, a]) => a.startsWith("/") ? `<a class="action rv" href="${a}"><span class="action-t">${t}</span><p>${d}</p><span class="arrow" aria-hidden="true">→</span></a>` : a === "claim" ? `<button type="button" class="action rv" data-open="claim-modal"><span class="action-t">${t}</span><p>${d}</p><span class="arrow" aria-hidden="true">→</span></button>` : `<button type="button" class="action rv" data-request="${a}"><span class="action-t">${t}</span><p>${d}</p><span class="arrow" aria-hidden="true">→</span></button>`).join("")}</div>
  <div class="split top" style="margin-top:72px">
    <div class="rv"><p class="kicker">Service request</p><h2>Send us a request</h2><p class="lead">Your agent will confirm by phone or email. Need an urgent certificate for a job today? Call ${C.tel}.</p></div>
    <div class="rv">${C.serviceForm()}</div>
  </div>
</div></section>`,
});
add({
  path: "/client-service/payments/", priority: 0.5,
  title: "Make a Payment | Yeti Insurance Agency",
  description: "Pay your insurance premium. Most Yeti Insurance policies are billed and paid directly through the insurance company.",
  breadcrumbs: [["/client-service/", "Client Service"], ["/client-service/payments/", "Payments"]],
  body: `${C.smallHero({ kicker: "Payments", h1: "Make a payment", sub: "Most policies are billed and paid directly through your insurance company. Choose your carrier below.", ctas: false })}
<section><div class="wrap"><div class="actions">${site.carriers.filter(c => !C.isPH(c.name) && c.payUrl).map(c => `<a class="action rv" href="${c.payUrl}" target="_blank" rel="noopener"><span class="action-t">${c.name}</span><p>Pay online with ${c.name}</p><span class="arrow" aria-hidden="true">→</span></a>`).join("") || `<div class="action"><span class="action-t">Pay your carrier directly</span><p>Your bill and ID card list your insurance company and how to pay. We're happy to help. Call ${site.phone}.</p></div>`}</div>
<p class="lead" style="margin-top:32px">Not sure who your carrier is, or need help with a bill? Call ${C.tel} or <a class="link" href="/client-service/">send a billing question</a>.</p></div></section>`,
});

/* ================= PARTNERS ================= */
add({
  path: "/partners/", priority: 0.5,
  title: "Lender & Realtor Partners | Evidence of Insurance | Yeti Insurance",
  description: "Mortgage lenders, realtors and title companies: request evidence of insurance, binders, mortgagee changes or a fast home insurance quote for your Texas clients.",
  breadcrumbs: [["/partners/", "Partners"]],
  body: `${C.smallHero({ kicker: "Partners", h1: "For lenders, realtors and title companies", sub: "Fast quotes and documents to keep your Texas closings on schedule.", ctas: false })}
<section><div class="wrap split top">
  <div class="rv"><p class="kicker">How we help</p><h2>Closing support</h2>
   ${C.pointsList([["Quick quotes for buyers", "Home and auto quotes from multiple carriers to support closing timelines."], ["Evidence of insurance & binders", "Declarations pages, binders and paid receipts sent directly to you."], ["Mortgagee changes", "Refinance and mortgagee clause updates handled quickly."]])}
   <p class="lead" style="margin-top:24px">For existing policies, use the request form on our <a class="link" href="/client-service/">Client Service Center</a> and choose "Mortgagee / lender request."</p></div>
  <div class="rv">${C.quoteForm({ id: "pt", coverage: "home", heading: "Refer a client for a quote" })}</div>
</div></section>`,
});

/* ================= CONTACT ================= */
add({
  path: "/contact/", priority: 0.7,
  title: "Contact Yeti Insurance | Irving, TX Agency Serving Texas",
  description: `Contact Yeti Insurance Agency at ${site.address.street}, ${site.address.city}, TX ${site.address.zip}. Call ${site.phone}. Serving all of Texas.`,
  breadcrumbs: [["/contact/", "Contact"]],
  body: `${C.smallHero({ kicker: "Contact", h1: "Talk to a Texas insurance agent", sub: "Call, email or visit our Las Colinas office. We serve clients across the entire state.", ctas: false })}
<section><div class="wrap split top">
  <div class="rv"><p class="kicker">Office</p><h2>${site.name}</h2>
   <ul class="cinfo" style="margin-top:24px">
    <li><small>Address</small><p>${site.address.street}<br>${site.address.city}, ${site.address.state} ${site.address.zip}</p></li>
    <li><small>Phone</small><p>${C.tel}</p></li>
    <li><small>Email</small><p><a href="mailto:${site.email}">${site.email}</a></p></li>
    <li><small>Hours</small><p>${site.hours.label} · <span class="open-ind"></span></p></li>
    <li><small>Service area</small><p>All of Texas</p></li>
   </ul></div>
  <div class="rv">${C.contactForm()}</div>
</div></section>
<section style="padding-top:0"><div class="wrap visit"><figure class="rv"><img src="/assets/img/office-urban-towers.jpg" srcset="/assets/img/office-urban-towers-800.jpg 800w, /assets/img/office-urban-towers.jpg 1600w" sizes="(max-width:1000px) 92vw, 600px" alt="Urban Towers at 222 W Las Colinas Blvd, Irving, Texas" loading="lazy" width="1600" height="889"><figcaption>Our office is in Urban Towers, Suite 1650E, in Las Colinas.</figcaption></figure><div class="map rv"><iframe title="Map to ${site.name}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${site.googleMapEmbed}"></iframe></div></div></section>`,
});

/* ================= AREAS WE SERVE ================= */
add({
  path: "/areas-we-serve/", priority: 0.6,
  title: "Areas We Serve | Insurance Across Texas | Yeti Insurance",
  description: "Yeti Insurance serves businesses and families across Texas, including Dallas, Fort Worth, Houston, Austin, San Antonio, El Paso and more.",
  breadcrumbs: [["/areas-we-serve/", "Areas We Serve"]],
  body: `${C.smallHero({ kicker: "Areas we serve", h1: "Insurance for businesses and families across Texas", sub: "Our office is in Irving, in the heart of Dallas–Fort Worth. We write commercial, home and auto policies for clients statewide." })}
<section class="texas"><div class="wrap">
  <div class="rv"><p class="kicker">Statewide</p><h2>From the Panhandle to the Gulf Coast</h2>
   <div class="prose"><p>Because we're licensed across Texas and work with multiple carriers, location is rarely a barrier. Quotes, policy service and claim support are handled by phone and email, and clients in Dallas–Fort Worth are always welcome at our Las Colinas office.</p>
   <p>Texas risks vary by region: hail in North Texas and the Panhandle, hurricanes and flooding on the Gulf Coast, and rapid growth in Central Texas. We help match your coverage to where you live and work.</p></div>
   <ul class="cities">${site.cities.map(c => `<li>${c}</li>`).join("")}</ul></div>
  ${texasMap}
</div></section>`,
});

/* ================= RESOURCES ================= */
add({
  path: "/resources/", priority: 0.7,
  title: "Insurance Resources & Guides for Texans | Yeti Insurance Agency",
  description: "Plain-English guides to Texas commercial, home and auto insurance: hail season, SR-22, workers' comp and more.",
  breadcrumbs: [["/resources/", "Resources"]],
  body: `${C.smallHero({ kicker: "Resources", h1: "Insurance guides for Texans", sub: "Plain-English answers to common commercial, home and auto insurance questions.", ctas: false })}
<section><div class="wrap"><h2 class="sr-only">All articles</h2>${postCards(posts)}</div></section>`,
});
for (const p of posts) {
  const url = `/resources/${p.slug}/`;
  add({
    path: url, priority: 0.6, ogType: "article", title: `${p.seoTitle || p.title} | Yeti Insurance`, description: p.description,
    breadcrumbs: [["/resources/", "Resources"], [url, p.category]],
    schema: [{ "@context": "https://schema.org", "@type": "Article", headline: p.title, description: p.description, datePublished: p.date, dateModified: p.date, author: { "@type": "Organization", name: site.name }, publisher: { "@id": site.url + "/#agency" }, mainEntityOfPage: site.url + url, image: site.url + "/assets/img/og-image.jpg" }],
    body: `${C.smallHero({ kicker: `${p.category} · ${p.readTime}`, h1: p.title, sub: p.description, ctas: false })}
<section><div class="wrap split top wide-left">
  <article class="prose"><p class="muted">Published ${fmtDate(p.date)} by the ${site.name} team</p>${p.html}
   <p class="muted" style="margin-top:32px;font-size:13px">This article is general information, not legal advice or a guarantee of coverage. Coverage depends on the terms of your policy.</p></article>
  <aside class="sticky">${C.quoteForm({ id: "aq", coverage: { Home: "home", Auto: "auto", Commercial: "commercial" }[p.category], heading: "Talk to an agent" })}
   <p style="margin-top:20px"><a class="link" href="${p.related[0]}">${p.related[1]} →</a></p></aside>
</div></section>
<section style="background:var(--bg)"><div class="wrap"><p class="kicker">More resources</p>${postCards(posts.filter(x => x !== p))}</div></section>`,
  });
}

/* ================= QUOTE & THANK YOU ================= */
add({
  path: "/quote/", priority: 0.9,
  title: "Get a Free Insurance Quote | Commercial, Home & Auto | Yeti Insurance",
  description: "Request a free, no-obligation commercial, home or auto insurance quote from Yeti Insurance. We compare multiple carriers for Texans.",
  breadcrumbs: [["/quote/", "Get a Quote"]],
  body: `${C.smallHero({ kicker: "Free quote", h1: "Get a free insurance quote", sub: "Tell us what you'd like to insure. A licensed agent will compare carriers and follow up within one business day.", ctas: false })}
<section><div class="wrap split top">
  <div class="rv"><h2>What happens next</h2><ol class="steps-list"><li>We review your request and may call with a few quick questions.</li><li>Your agent compares quotes from multiple carriers.</li><li>We walk you through the options. You choose, with no obligation.</li></ol>
  <p class="lead" style="margin-top:24px">Prefer to talk? Call ${C.tel}.</p></div>
  <div class="rv">${C.quoteForm({ id: "qp", heading: "Request a quote" })}</div>
</div></section>`,
});
add({
  path: "/thank-you/", noindex: true, noCta: true,
  title: "Thank You | Yeti Insurance Agency", description: "Thank you for contacting Yeti Insurance Agency. A licensed agent will follow up within one business day.",
  body: `${C.smallHero({ kicker: "Thank you", h1: "We received your request.", sub: `A licensed agent will contact you within one business day. For immediate help, call ${site.phone}.`, ctas: false })}
<section><div class="wrap"><a class="btn btn-maroon" href="/">Back to home</a></div></section>`,
});

/* ================= LEGAL & SIMPLE PAGES ================= */
const simple = (path, title, h1, html, desc) => add({ path, priority: 0.3, title: `${title} | Yeti Insurance Agency`, description: desc || `${title} for ${site.legalName}, an independent insurance agency in Irving serving all of Texas.`, breadcrumbs: [[path, title]],
  body: `${C.smallHero({ kicker: site.name, h1, ctas: false })}<section><div class="wrap"><div class="prose">${html}</div></div></section>` });

simple("/privacy/", "Privacy Policy", "Privacy Policy", `<p>${site.legalName} ("we") respects your privacy. This policy explains what information we collect through this website and how we use it.</p><h2>Information we collect</h2><p>When you request a quote, submit a service request or contact us, we collect the information you provide, such as your name, phone number, email, ZIP code and details about the coverage you need. We also collect basic usage data through cookies and analytics tools.</p><h2>How we use it</h2><p>We use your information to respond to your request, prepare insurance quotes, service your policies and improve our website. To quote coverage, we may share your information with insurance companies we represent.</p><h2>We don't sell your information</h2><p>We do not sell your personal information.</p><h2>Contact</h2><p>Questions about this policy? Call ${site.phone} or email <a href="mailto:${site.email}">${site.email}</a>.</p>`);
simple("/terms/", "Terms of Use", "Terms of Use", `<p>Information on this website is provided for general informational purposes and does not create an insurance contract, alter any policy, or guarantee coverage. Coverage is subject to underwriting and the terms, conditions and exclusions of the policy issued. Submitting a quote request does not bind coverage. Coverage is not in force until confirmed in writing by ${site.name} or the insurance company.</p>`);
simple("/accessibility/", "Accessibility", "Accessibility Statement", `<p>${site.name} is committed to making this website usable for everyone, and we aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.</p><p>If you have difficulty using any part of this site, please call us at ${C.tel} or email <a href="mailto:${site.email}">${site.email}</a>, and we'll help you directly. Customers with hearing or speech disabilities can dial 7-1-1.</p>`);
simple("/producer-compensation-disclosure/", "Producer Compensation Disclosure", "Producer Compensation Disclosure", `<p>${site.legalName} is an independent insurance agency. We are typically compensated by the insurance companies we place business with, usually through commissions that are a percentage of the premium you pay. Some insurance companies may also pay contingent or bonus compensation based on factors such as the volume or profitability of business we place with them. You may request information about the compensation we expect to receive on your policy by contacting us.</p>`);
simple("/careers/", "Careers", "Careers at Yeti Insurance", `<p>We're always glad to hear from licensed, client-focused insurance professionals who want to grow with an independent Texas agency.</p>${site.careersOpenings.length ? `<h2>Open positions</h2><ul>${site.careersOpenings.map(o => `<li>${o}</li>`).join("")}</ul>` : "<p>We don't have specific openings listed right now, but we're always happy to meet great people.</p>"}<p>To apply, email your résumé to <a href="mailto:${site.email}">${site.email}</a>.</p>`);
simple("/referrals/", "Referrals", "Refer a friend or business", `<p>The best compliment you can give us is a referral. If you know a business owner, homeowner or driver who could use a second opinion on their insurance, send them our way.</p><p><button type="button" class="btn btn-maroon" data-open="quote-modal">Start a quote for someone</button></p>`);

add({
  path: "/404", noindex: true,
  title: "Page Not Found | Yeti Insurance Agency", description: "The page you're looking for couldn't be found. Explore commercial, home and auto insurance from Yeti Insurance Agency.",
  body: `${C.smallHero({ kicker: "404", h1: "We couldn't find that page.", sub: "The page may have moved. Try one of these instead.", ctas: false })}
<section><div class="wrap"><div class="chips"><a class="chip-link" href="/">Home</a><a class="chip-link" href="/commercial-insurance-texas/">Commercial insurance</a><a class="chip-link" href="/home-insurance-texas/">Home insurance</a><a class="chip-link" href="/auto-insurance-texas/">Auto insurance</a><a class="chip-link" href="/claims/">Claims</a><a class="chip-link" href="/contact/">Contact</a></div></div></section>`,
});

module.exports = { pages };
