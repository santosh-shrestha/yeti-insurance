/**
 * SITE SETTINGS — edit this file to update business details everywhere on the site.
 * Values in [brackets] are placeholders that must be confirmed before launch.
 */
// Search engines index the site only when it is served from the real domain.
// On Netlify, process.env.URL is the site's primary URL (e.g. https://yetiinsu.netlify.app until the domain is switched).
const DEPLOY_URL = process.env.URL || "";
module.exports = {
  indexable: !DEPLOY_URL || /yetiinsu\.com/.test(DEPLOY_URL),
  url: "https://www.yetiinsu.com",          // production domain, no trailing slash
  name: "Yeti Insurance Agency",
  legalName: "Yeti Insurance Agency LLC",
  shortName: "Yeti Insurance",
  founded: 2016,
  phone: "(469) 345-6419",
  phoneE164: "+14693456419",
  email: "info@yetiinsu.com",               // general inbox (contact page, footer, schema)
  address: {
    street: "222 W Las Colinas Blvd #1650E",
    city: "Irving",
    state: "TX",
    zip: "75039",
    country: "US",
  },
  geo: { lat: 32.8686, lng: -96.9405 },      // approx. Las Colinas, verify in Google Business Profile
  // Office hours (Central). Keep in sync with the Google Business Profile. week: day → [open hour, close hour] (24h).
  hours: { label: "Mon–Fri 10:00 am – 6:00 pm · Sat 9:00 am – 5:00 pm (Central)", week: { Mon: [10, 18], Tue: [10, 18], Wed: [10, 18], Thu: [10, 18], Fri: [10, 18], Sat: [9, 17] } },
  serviceArea: "Texas",
  license: "",                               // Kept private: leave empty and no license number is shown anywhere on the site
  licenseVerifyUrl: "https://www.tdi.texas.gov/CONSUMER/company-profiles-and-agents-for-service-of-process.html", // TDI "Verify an agent or company license"
  // Real memberships/affiliations only (e.g. "BBB Accredited Business", "Independent Insurance Agents of Texas", "Irving-Las Colinas Chamber").
  // Leave empty until confirmed — nothing is shown when empty.
  affiliations: [],

  // Google reviews
  googleRating: "4.9",
  googleReviewCount: "77",               // number of reviews, e.g. "87"
  googleRatingDate: "October 2026",
  googleReviewsUrl: "https://g.page/r/CcKxWGnaFZLOEAI",          // opens the Business Profile with reviews
  googleWriteReviewUrl: "https://g.page/r/CcKxWGnaFZLOEAI/review", // opens the "write a review" box
  googleMapEmbed: "https://www.google.com/maps?q=222+W+Las+Colinas+Blvd+%231650E,+Irving,+TX+75039&output=embed",

  social: {
    facebook: "https://www.facebook.com/yetiinsurance",
    instagram: "https://www.instagram.com/yetiinsurance",
  },

  /**
   * FORMS
   * Default: Netlify Forms (works automatically when hosted on Netlify).
   * To use Formspree/another service instead, set formEndpoint to its URL, e.g. "https://formspree.io/f/xxxxxx".
   */
  formEndpoint: "",

  // Google tag (Google Ads + Analytics). Loaded on every page; the Ads "quote request" conversion fires on /thank-you/quote/.
  googleTag: "G-NTBRF8QEE8",

  /**
   * GOOGLE SHEET — every form submission is also copied to the "Yeti Website Leads" sheet.
   * Paste the Apps Script Web App URL (ends in /exec) and the same secret token used in the script.
   * Leave sheetsUrl empty to turn this off. See integrations/README.md.
   */
  sheetsUrl: "",
  sheetsToken: "",

  // Carriers shown in the logo strip and claims table. Add logo files to /src/assets/img/carriers/
  carriers: [
    // name (shown in the carrier strip + claims table), claims = 24/7 claims phone ("[...]" = hidden, shows "See your policy ID card"),
    // url = carrier's official claims page, note = extra line in the claims table. Numbers checked against carrier sites Oct 2026.
    { name: "Progressive", claims: "800-776-4737", url: "https://www.progressive.com/claims/" },
    { name: "Travelers", claims: "800-252-4633", url: "https://www.travelers.com/claims/file-claim", note: "Business policies: 800-238-6225" },
    { name: "Liberty Mutual", claims: "800-225-2467", url: "https://www.libertymutual.com/claims-center", note: "Small business: 844-325-2467" },
    { name: "Safeco", claims: "800-332-3226", url: "https://www.safeco.com/claims" },
    { name: "Nationwide", claims: "800-421-3535", url: "https://www.nationwide.com/personal/insurance/claims/" },
    { name: "GEICO", claims: "800-841-3000", url: "https://www.geico.com/claims/" },
    { name: "The Hartford", claims: "800-327-3636", url: "https://www.thehartford.com/claims", note: "Business, commercial auto & workers' comp" },
    { name: "BHHC", claims: "800-661-6029", url: "https://bhhc.com/workers-compensation/claim-services/report-a-claim/", note: "Berkshire Hathaway Homestate · workers' comp claims" },
    { name: "Homeowners of America", claims: "866-407-9896", url: "https://hoaic.com/claims-commitment/" },
    { name: "ARI Insurance", claims: "[Claims phone]", url: "", note: "American Risk Insurance" },
    { name: "Hallmark", claims: "800-486-4255", url: "https://www.hallmarkgrp.com/", note: "Personal lines claims" },
    { name: "Falcon Insurance", claims: "800-929-3252", url: "https://falconinsgroup.com/en/Claims/ReportClaim" },
  ],

  team: [
    { initials: "SS", name: "Shraddha Shrestha", role: "CEO & Managing Director",phone: "(469) 345-6419", tel: "+14693456419", email: "shraddha@yetiinsu.com", photo: "/assets/img/team/shraddha-shrestha.jpg", linkedin: "https://www.linkedin.com/in/shraddha-shrestha-7338a4172/" },
    { initials: "SP", name: "Suraj Poudyal", role: "Principal Agent & Co-Owner",phone: "(214) 995-0137", tel: "+12149950137", email: "suraj@yetiinsu.com", photo: "/assets/img/team/suraj-poudyal.jpg", linkedin: "https://www.linkedin.com/in/suraj-poudyal-24a42010/" },
  ],

  // About page — founder story paragraphs and milestones. Anything still in [brackets] is hidden automatically.
  story: ["[Founder story: why Yeti Insurance was started, what the name means, and the community it grew from.]"],
  milestones: [["[Year]", "[Milestone, e.g. expanded commercial lines]"], ["[Year]", "[Milestone, e.g. moved to the Las Colinas office]"]],
  careersOpenings: [],   // e.g. ["Licensed Commercial Lines Account Manager (Irving, full-time)"]

  cities: ["Dallas", "Fort Worth", "Houston", "Austin", "San Antonio", "Irving", "Arlington", "Plano", "Frisco", "El Paso", "Corpus Christi", "Lubbock"],
};
