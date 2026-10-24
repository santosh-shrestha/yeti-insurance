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
  hours: { days: "Monday – Friday", open: 9, close: 18, label: "Mon–Fri 9:00 am – 6:00 pm (Central)" },
  serviceArea: "Texas",
  license: "",                               // Kept private: leave empty and no license number is shown anywhere on the site
  licenseVerifyUrl: "https://www.tdi.texas.gov/CONSUMER/company-profiles-and-agents-for-service-of-process.html", // TDI "Verify an agent or company license"
  // Real memberships/affiliations only (e.g. "BBB Accredited Business", "Independent Insurance Agents of Texas", "Irving-Las Colinas Chamber").
  // Leave empty until confirmed — nothing is shown when empty.
  affiliations: [],

  // Google reviews
  googleRating: "4.9",
  googleReviewCount: "[###]",               // number of reviews, e.g. "87"
  googleRatingDate: "[Month YYYY]",
  googleReviewsUrl: "https://www.google.com/maps/search/?api=1&query=Yeti+Insurance+Agency+222+W+Las+Colinas+Blvd+Irving+TX+75039", // replace with direct review link
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

  /**
   * GOOGLE SHEET — every form submission is also copied to the "Yeti Website Leads" sheet.
   * Paste the Apps Script Web App URL (ends in /exec) and the same secret token used in the script.
   * Leave sheetsUrl empty to turn this off. See integrations/README.md.
   */
  sheetsUrl: "",
  sheetsToken: "",

  // Carriers shown in the logo strip and claims table. Add logo files to /src/assets/img/carriers/
  carriers: [
    { name: "Travelers", claims: "[Claims phone]", url: "https://www.travelers.com/claims" },
    { name: "[Carrier]", claims: "[Claims phone]", url: "" },
    { name: "[Carrier]", claims: "[Claims phone]", url: "" },
    { name: "[Carrier]", claims: "[Claims phone]", url: "" },
    { name: "[Carrier]", claims: "[Claims phone]", url: "" },
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
