/** Page shell: <head>, SEO tags, structured data, header/nav, footer, modals. */
const site = require("./site");
const C = require("./components");

const NAV = [
  { label: "Commercial", hub: ["/commercial-insurance-texas/", "All commercial insurance", "Coverage packages for Texas businesses"], items: [
    ["/commercial-insurance-texas/general-liability/", "General Liability"],
    ["/commercial-insurance-texas/commercial-property/", "Commercial Property"],
    ["/commercial-insurance-texas/commercial-auto/", "Commercial Auto & Fleet"],
    ["/commercial-insurance-texas/workers-compensation/", "Workers' Compensation"],
    ["/commercial-insurance-texas/contractors/", "Contractors Insurance"],
    ["/commercial-insurance-texas/commercial-umbrella/", "Commercial Umbrella"],
  ], cta: `<b>Not sure what you need?</b>Answer a few questions and we'll suggest coverage.<a href="/#finder">Try the coverage finder →</a>` },
  { label: "Personal", hub: ["/home-insurance-texas/", "Home Insurance", "Wind, hail &amp; liability protection"], items: [
    ["/auto-insurance-texas/", "Auto Insurance"],
    ["/home-insurance-texas/landlord/", "Landlord / Rental Property"],
    ["/home-insurance-texas/renters-condo/", "Renters &amp; Condo"],
    ["/home-insurance-texas/personal-umbrella/", "Personal Umbrella"],
  ], cta: `<b>Bundle home &amp; auto</b>Most carriers offer a multi-policy discount.<button type="button" class="link" style="background:none;border:0;border-bottom:1px solid;cursor:pointer;padding:6px 0 0;color:var(--maroon);font-size:13.5px" data-open="quote-modal" data-coverage="bundle">Start a bundle quote →</button>` },
  { label: "About", hub: ["/about/", "Our Story", "An independent Texas agency since " + site.founded], items: [
    ["/about/team/", "Meet the Team"],
    ["/areas-we-serve/", "Areas We Serve"],
    ["/partners/", "Lender &amp; Realtor Partners"],
    ["/referrals/", "Referrals"],
    ["/careers/", "Careers"],
  ] },
];
const TOP_LINKS = [["/claims/", "Claims"], ["/resources/", "Resources"], ["/contact/", "Contact"]];
const MOBILE_ONLY = [["/client-service/", "Client Service"], ["/client-service/payments/", "Make a Payment"]];

function nav(current) {
  const inSection = n => [n.hub[0], ...n.items.map(i => i[0])].some(u => current === u || (u !== "/" && current.startsWith(u) && u.length > 1));
  return `<nav class="menu" id="menu" aria-label="Main">
  ${NAV.map((n, i) => `<div class="dd">
    <button type="button" class="dd-top${inSection(n) ? " active" : ""}" aria-expanded="false" aria-controls="dd-${i}">${n.label} <i class="chev" aria-hidden="true"></i></button>
    <div class="dd-panel" id="dd-${i}">
      <a href="${n.hub[0]}"${current === n.hub[0] ? ' aria-current="page"' : ""}><strong style="font-weight:600">${n.hub[1]}</strong><small>${n.hub[2]}</small></a>
      ${n.items.map(([u, l, ext]) => `<a href="${u}"${ext ? ' target="_blank" rel="noopener"' : ""}${current === u ? ' aria-current="page"' : ""}>${l}</a>`).join("")}
      ${n.cta ? `<div class="dd-cta">${n.cta}</div>` : ""}
    </div>
  </div>`).join("")}
  ${TOP_LINKS.map(([u, l]) => `<a href="${u}"${current.startsWith(u) ? ' aria-current="page"' : ""}>${l}</a>`).join("")}
  ${MOBILE_ONLY.map(([u, l]) => `<a class="m-only" href="${u}"${current === u ? ' aria-current="page"' : ""}>${l}</a>`).join("")}
</nav>`;
}

function crumbs(list) {
  if (!list || !list.length) return "";
  const all = [["/", "Home"], ...list];
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${all.map(([u, l], i) => i === all.length - 1 ? `<li aria-current="page">${l}</li>` : `<li><a href="${u}">${l}</a></li>`).join("")}</ol></nav>`;
}

function orgSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "InsuranceAgency",
    "@id": site.url + "/#agency",
    name: site.name,
    legalName: site.legalName,
    url: site.url + "/",
    logo: site.url + "/assets/img/logo-navy.png",
    image: site.url + "/assets/img/og-image.jpg",
    telephone: site.phoneE164,
    email: site.email,
    foundingDate: String(site.founded),
    address: { "@type": "PostalAddress", streetAddress: site.address.street, addressLocality: site.address.city, addressRegion: site.address.state, postalCode: site.address.zip, addressCountry: site.address.country },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    areaServed: { "@type": "State", name: "Texas" },
    openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "18:00" }],
    sameAs: Object.values(site.social),
    hasOfferCatalog: { "@type": "OfferCatalog", name: "Insurance", itemListElement: ["Commercial Insurance", "Home Insurance", "Auto Insurance"].map(n => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: n } })) },
  };
}

function breadcrumbSchema(list) {
  const all = [["/", "Home"], ...list];
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: all.map(([u, l], i) => ({ "@type": "ListItem", position: i + 1, name: l.replace(/&amp;/g, "&"), item: site.url + u })) };
}

function layout(page) {
  const canonical = site.url + (page.path === "/404" ? "/" : page.path);
  const schemas = [orgSchema(), ...(page.breadcrumbs ? [breadcrumbSchema(page.breadcrumbs)] : []), ...(page.schema || [])];
  const body = page.body.replace("{{CRUMBS}}", crumbs(page.breadcrumbs));
  const ld = schemas.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join("\n");

  return `<!DOCTYPE html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${page.title}</title>
<meta name="description" content="${C.esc(page.description)}">
<link rel="canonical" href="${canonical}">
${page.noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
<meta property="og:type" content="${page.ogType || "website"}">
<meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${C.esc(page.title)}">
<meta property="og:description" content="${C.esc(page.description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${site.url}/assets/img/og-image.jpg">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0f2a4a">
<meta name="geo.region" content="US-TX">
<meta name="geo.placename" content="${site.address.city}, Texas">
<link rel="icon" href="/assets/img/favicon-64.png" type="image/png">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="stylesheet" href="/assets/css/main.css">
<script>document.documentElement.className='js'</script>
${ld}
<!-- Analytics: paste Google Analytics 4 / Tag Manager snippet here -->
</head>
<body data-hours-open="${site.hours.open}" data-hours-close="${site.hours.close}"${page.coverage ? ` data-coverage="${page.coverage}"` : ""}>
<a class="skip" href="#main">Skip to content</a>

<div class="util"><div class="wrap">
  <span>Serving all of Texas since ${site.founded}<span class="hide-sm"><span class="sep">|</span><a href="${site.googleReviewsUrl}" target="_blank" rel="noopener"><span class="gstars" aria-hidden="true">★★★★★</span> ${site.googleRating} on Google</a></span></span>
  <span><a class="hide-md" href="/client-service/payments/">Make a Payment</a><span class="sep hide-md">|</span><a class="hide-md" href="/client-service/">Client Service</a><span class="sep hide-md">|</span><button type="button" data-open="claim-modal" style="background:none;border:0;color:#fff;cursor:pointer;font-size:13px">Report a Claim</button></span>
</div></div>

<header class="site-header"><div class="wrap">
  ${C.brand("navy")}
  ${nav(page.path)}
  <div class="hdr-right">
    <div class="hdr-phone"><small><span class="open-dot" aria-hidden="true"></span><span class="open-ind">Call a licensed agent</span></small><a href="tel:${site.phoneE164}">${site.phone}</a></div>
    <button type="button" class="btn btn-maroon" data-open="quote-modal">Start a Quote</button>
    <button type="button" class="burger" aria-label="Menu" aria-expanded="false" aria-controls="menu"><span></span><span></span><span></span></button>
  </div>
</div></header>

<main id="main">
${body}
</main>

${page.noCta ? "" : C.ctaBand()}

<footer class="site-footer"><div class="wrap">
  <div class="fgrid">
    <div>
      ${C.brand("white")}
      <p style="margin-top:18px;max-width:300px">Independent insurance agency serving Texas businesses and families since ${site.founded}.</p>
      <address>${site.address.street}<br>${site.address.city}, ${site.address.state} ${site.address.zip}<br><a href="tel:${site.phoneE164}" style="color:#fff">${site.phone}</a><br>${site.hours.label}</address>
      <p style="margin-top:14px"><a href="${site.googleReviewsUrl}" target="_blank" rel="noopener" style="color:#fff"><span class="gstars" aria-hidden="true">★★★★★</span> ${site.googleRating} on Google · Read reviews</a></p>
    </div>
    <div><h2>Insurance</h2><ul>
      <li><a href="/commercial-insurance-texas/">Commercial Insurance</a></li>
      <li><a href="/commercial-insurance-texas/general-liability/">General Liability</a></li>
      <li><a href="/commercial-insurance-texas/workers-compensation/">Workers' Compensation</a></li>
      <li><a href="/commercial-insurance-texas/contractors/">Contractors Insurance</a></li>
      <li><a href="/home-insurance-texas/">Home Insurance</a></li>
      <li><a href="/auto-insurance-texas/">Auto Insurance</a></li>
    </ul></div>
    <div><h2>Clients</h2><ul>
      <li><a href="/client-service/">Client Service Center</a></li>
      <li><a href="/client-service/payments/">Make a Payment</a></li>
      <li><a href="/claims/">Claims Center</a></li>
      <li><a href="/partners/">Lender &amp; Realtor Partners</a></li>
      <li><a href="/quote/">Get a Quote</a></li>
    </ul></div>
    <div><h2>Company</h2><ul>
      <li><a href="/about/">About Us</a></li>
      <li><a href="/about/team/">Our Team</a></li>
      <li><a href="/areas-we-serve/">Areas We Serve</a></li>
      <li><a href="/resources/">Resources</a></li>
      <li><a href="/careers/">Careers</a></li>
      <li><a href="/contact/">Contact</a></li>
      <li><a href="${site.social.facebook}" target="_blank" rel="noopener">Facebook</a> · <a href="${site.social.instagram}" target="_blank" rel="noopener">Instagram</a></li>
    </ul></div>
  </div>
  <div class="fbottom">
    <span>© ${new Date().getFullYear()} ${site.legalName}. All rights reserved. Licensed by the Texas Department of Insurance${C.isPH(site.license) ? "" : `, Agency License No. ${site.license}`} · <a href="${site.licenseVerifyUrl}" target="_blank" rel="noopener" style="text-decoration:underline">Verify our license</a></span>
    <span><a href="/privacy/">Privacy Policy</a> &nbsp;·&nbsp; <a href="/terms/">Terms of Use</a> &nbsp;·&nbsp; <a href="/accessibility/">Accessibility</a> &nbsp;·&nbsp; <a href="/producer-compensation-disclosure/">Producer Compensation Disclosure</a> &nbsp;·&nbsp; <a href="/sitemap.xml">Sitemap</a></span>
  </div>
  <p class="disclaimer">Coverage descriptions on this site are general information only and do not modify any insurance policy. Coverage, availability and pricing are subject to carrier underwriting and the terms of each policy issued. Not all coverages are available from all carriers. ${C.isPH(site.googleReviewCount) || C.isPH(site.googleRatingDate) ? "" : `Google rating reflects ${site.googleReviewCount} reviews as of ${site.googleRatingDate}. `}For customers with hearing or speech disabilities, dial 7-1-1.</p>
</div></footer>

<div class="modal" id="quote-modal" role="dialog" aria-modal="true" aria-label="Start a quote" hidden>
  <div class="modal-bg" data-close></div>
  <div class="modal-box"><button type="button" class="modal-x" data-close aria-label="Close">×</button>${C.quoteForm({ id: "mq", heading: "Start your free quote", tag: "p" })}</div>
</div>
<div class="modal" id="claim-modal" role="dialog" aria-modal="true" aria-labelledby="claim-title" hidden>
  <div class="modal-bg" data-close></div>
  <div class="modal-box"><button type="button" class="modal-x" data-close aria-label="Close">×</button>${C.claimForm()}</div>
</div>

<div class="mbar"><a href="tel:${site.phoneE164}">Call</a><button type="button" class="q" data-open="quote-modal">Quote</button><a href="/claims/">Claims</a><a href="/client-service/payments/">Pay</a></div>
<button type="button" class="totop" aria-label="Back to top">↑</button>
<script src="/assets/js/main.js" defer></script>
</body>
</html>`;
}

module.exports = { layout };
