#!/usr/bin/env node
/**
 * Generate the first high-intent AC repair city pages.
 *
 * These pages combine the existing /areas/ city strategy with the AC repair
 * service page so organic visitors can land on a city-specific repair intent.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, "..");

const partial = (name) => fs.readFileSync(path.join(root, "assets", "partials", `${name}.html`), "utf8").trim();
const nav = partial("nav");
const cta = partial("cta");
const footer = partial("footer");

const cities = [
  {
    slug: "salt-lake-city-ut",
    name: "Salt Lake City",
    county: "Salt Lake County",
    zipLine: "84101, 84102, 84103, 84105, 84106, 84108, 84109, 84111, 84115, and nearby Salt Lake City ZIP codes",
    title: "AC Repair in Salt Lake City, UT | Same-Day Cooling Service | Salmon HVAC",
    description: "Same-day AC repair in Salt Lake City, UT. Salmon HVAC repairs capacitors, frozen coils, refrigerant issues, and warm-air AC problems. Call (801) 397-0030.",
    hero: "AC Repair in Salt Lake City, UT",
    intro: "When Salt Lake City hits the mid-90s and the AC starts blowing warm air, you need a repair company that understands both older city homes and dense commercial buildings. Salmon HVAC serves Salt Lake City from our Centerville shop with same-day AC diagnostics, repair-first recommendations, and upfront pricing before work begins.",
    localContext: [
      "Salt Lake City AC calls often come from older homes in The Avenues, Capitol Hill, Sugar House, and Liberty Wells where ductwork, insulation, and aging equipment make summer comfort harder than it looks on paper.",
      "Downtown and central Salt Lake properties also face rooftop unit and mixed-use building issues. We diagnose residential split systems, package units, rooftop equipment, and ductless systems, then explain whether the current unit can be repaired reliably.",
      "Cottonwood, dust, and long run times during heat waves are common causes of dirty condenser coils, failed capacitors, high head pressure, and systems that run constantly without cooling the house."
    ],
    neighborhoods: [
      "The Avenues and Capitol Hill",
      "Sugar House and Liberty Wells",
      "Downtown Salt Lake City",
      "Foothill, East Bench, and Bonneville Hills",
      "Glendale, Rose Park, and Poplar Grove"
    ],
    commonProblems: [
      "AC blowing warm air during afternoon heat",
      "Frozen indoor coil after restricted airflow or low refrigerant",
      "Outdoor fan not spinning because of capacitor or motor failure",
      "Older systems running constantly in brick or historic homes",
      "Thermostat or zoning issues in multi-level homes and office spaces"
    ],
    proof: "Salt Lake City is one of the most varied HVAC markets we serve: historic homes, east bench properties, downtown offices, and dense neighborhoods with limited equipment access. Our technicians are used to diagnosing the actual failure first instead of jumping straight to replacement.",
    faq: [
      ["Do you offer same-day AC repair in Salt Lake City?", "Yes. Same-day appointments are available most days, especially for calls that come in before noon. During major heat waves, we prioritize no-cool calls and homes with vulnerable occupants whenever scheduling allows."],
      ["What AC problems are most common in Salt Lake City homes?", "Failed capacitors, dirty condenser coils, low refrigerant, frozen evaporator coils, and older systems that cannot keep up with long afternoon run times are the most common summer calls."],
      ["Can you repair AC systems in older Salt Lake City homes?", "Yes. Older homes often need a more careful diagnosis because ductwork, insulation, airflow, and equipment age all affect performance. We check the system before recommending a repair or replacement path."],
      ["Do you service commercial cooling systems in Salt Lake City?", "Yes. Salmon HVAC services commercial rooftop units, VRF systems, and light-commercial cooling equipment throughout Salt Lake City and the surrounding county."]
    ],
    nearby: [
      ["South Jordan", "/areas/south-jordan-ut/"],
      ["Sandy", "/areas/sandy-ut/"],
      ["West Jordan", "/areas/west-jordan-ut/"]
    ]
  },
  {
    slug: "layton-ut",
    name: "Layton",
    county: "Davis County",
    zipLine: "84040 and 84041",
    title: "AC Repair in Layton, UT | Same-Day Cooling Service | Salmon HVAC",
    description: "AC repair in Layton, UT for warm air, frozen coils, failed capacitors, and no-cool emergencies. Repair-first service from Salmon HVAC since 1979.",
    hero: "AC Repair in Layton, UT",
    intro: "Layton has a mix of west-side homes near Hill Field Road, east bench neighborhoods, rental properties near Hill AFB, and newer subdivisions where builder-grade AC equipment is starting to age. Salmon HVAC provides same-day AC repair in Layton with a repair-first diagnosis and clear pricing.",
    localContext: [
      "West Layton homes from the 1970s and 1980s often have older ductwork and cooling systems that struggle during long hot spells.",
      "East Layton and bench-area homes are newer, but many original builder systems are now reaching the age where capacitors, contactors, fan motors, and refrigerant issues start showing up.",
      "The Hill AFB rental market makes communication and response time especially important. We can work with homeowners, tenants, and property managers to get cooling restored quickly."
    ],
    neighborhoods: [
      "East Bench and Oak Hills",
      "Creekside and Chapel Hills",
      "Heritage Park and Ellison Park",
      "Hill Field Road corridor",
      "Layton Hills and surrounding commercial areas"
    ],
    commonProblems: [
      "AC runs but cannot cool below the upper 70s",
      "Outdoor fan humming but not spinning",
      "Short cycling after a thermostat or capacitor issue",
      "Rental-property no-cool calls that need fast scheduling",
      "Aging builder-grade equipment that needs honest repair-vs-replace guidance"
    ],
    proof: "We have served Davis County since 1979, and Layton is one of the most important AC repair markets in that footprint. The city has enough housing variety that a generic diagnosis is not enough; the age, neighborhood, airflow, and equipment history all matter.",
    faq: [
      ["Do you repair AC systems near Hill AFB?", "Yes. We handle AC repair for homeowners, tenants, and rental properties near Hill AFB and throughout Layton."],
      ["Can you usually fix a failed AC the same day in Layton?", "Most common repairs can be completed the same day because our trucks carry capacitors, contactors, common motors, and diagnostic equipment. Unusual parts may require a follow-up visit."],
      ["Should I repair or replace an older AC in Layton?", "If the system is repairable and the repair cost is reasonable, we will say so. Replacement usually becomes the better discussion when the system is older, inefficient, leaking refrigerant, or facing a major compressor-level repair."],
      ["Do you service all AC brands in Layton?", "Yes. We service all major brands and are a Daikin Comfort Pro Authorized Dealer."]
    ],
    nearby: [
      ["Kaysville", "/areas/kaysville-ut/"],
      ["Clearfield", "/areas/clearfield-ut/"],
      ["Farmington", "/areas/farmington-ut/"]
    ]
  },
  {
    slug: "ogden-ut",
    name: "Ogden",
    county: "Weber County",
    zipLine: "84401, 84403, 84404, and nearby Ogden ZIP codes",
    title: "AC Repair in Ogden, UT | Same-Day Cooling Service | Salmon HVAC",
    description: "Same-day AC repair in Ogden, UT for no-cool calls, warm air, frozen coils, and fan failures. Repair-first diagnostics from Salmon HVAC.",
    hero: "AC Repair in Ogden, UT",
    intro: "Ogden AC problems can look different from one neighborhood to the next: older central Ogden homes, east bench properties, rental units, and commercial spaces each need a careful diagnosis. Salmon HVAC provides AC repair in Ogden with upfront pricing and repair-first recommendations.",
    localContext: [
      "Older Ogden homes often have cooling systems working against limited insulation, older duct layouts, and equipment that has been repaired several times over the years.",
      "East bench and foothill homes can see strong sun exposure and uneven cooling between floors, especially when ductwork was not balanced for modern cooling loads.",
      "Commercial and rental properties near Washington Boulevard, Harrison Boulevard, and downtown Ogden need responsive service because downtime quickly turns into tenant or customer complaints."
    ],
    neighborhoods: [
      "Downtown Ogden",
      "East Bench and Mount Ogden",
      "Washington Terrace area",
      "North Ogden and nearby Weber County communities",
      "Commercial corridors along Washington and Harrison"
    ],
    commonProblems: [
      "Warm air from vents after a capacitor or contactor failure",
      "Condenser coils packed with dust and cottonwood",
      "Uneven cooling in older multi-level homes",
      "Frozen coils from airflow restrictions",
      "Older AC systems where repair cost needs to be weighed against replacement"
    ],
    proof: "Ogden is a high-priority Weber County service area for Salmon HVAC. We bring the same repair-first process here that we use across Northern Utah: diagnose the actual failure, explain the options clearly, and repair the current unit when that is the smart move.",
    faq: [
      ["Do you provide AC repair throughout Ogden?", "Yes. We serve Ogden, North Ogden, Washington Terrace, and nearby Weber County communities."],
      ["What causes AC systems to freeze up in Ogden homes?", "The most common causes are restricted airflow from dirty filters or coils, low refrigerant, blower issues, or a system running too long without moving enough air."],
      ["Can you repair older AC systems in central Ogden homes?", "Yes. We regularly diagnose older systems. If a repair is sensible, we will quote it. If the system is near the end of its life, we will explain that clearly too."],
      ["Do you handle emergency no-cool calls in Ogden?", "Yes. Same-day and urgent appointments are available most days, with priority for active no-cool calls during heat waves."]
    ],
    nearby: [
      ["North Ogden", "/areas/north-ogden-ut/"],
      ["Roy", "/areas/roy-ut/"],
      ["West Haven", "/areas/west-haven-ut/"]
    ]
  },
  {
    slug: "bountiful-ut",
    name: "Bountiful",
    county: "Davis County",
    zipLine: "84010",
    title: "AC Repair in Bountiful, UT | Same-Day Cooling Service | Salmon HVAC",
    description: "AC repair in Bountiful, UT for warm-air systems, frozen coils, failed capacitors, and older east bench homes. Call Salmon HVAC at (801) 397-0030.",
    hero: "AC Repair in Bountiful, UT",
    intro: "Bountiful homes put AC systems through a demanding mix of older neighborhoods, east bench elevation changes, and hot west-facing rooms. Salmon HVAC provides AC repair in Bountiful with fast local response from nearby Centerville and honest guidance on whether your current unit can be fixed.",
    localContext: [
      "Many Bountiful homes are mature properties where duct design, insulation, and equipment age matter just as much as the outdoor unit.",
      "East bench homes often have rooms that gain heat quickly in the afternoon, and an AC that is slightly weak can feel like it has failed completely.",
      "Because our shop is in Centerville, Bountiful is one of the fastest response areas in the Salmon HVAC service footprint."
    ],
    neighborhoods: [
      "East bench Bountiful",
      "Central Bountiful",
      "Orchard Drive corridor",
      "Val Verda and nearby neighborhoods",
      "South Davis County homes near Woods Cross and North Salt Lake"
    ],
    commonProblems: [
      "AC not keeping up in upstairs bedrooms",
      "Outdoor unit running but indoor air staying warm",
      "Capacitor and fan motor failures during heat waves",
      "Dirty condenser coils after spring pollen and cottonwood",
      "Older systems needing repair-first but realistic replacement guidance"
    ],
    proof: "Bountiful is close to our Centerville base, and we have decades of experience with South Davis County housing stock. We understand how older ductwork, hillsides, shade, and sun exposure affect cooling performance here.",
    faq: [
      ["How quickly can you get to Bountiful for AC repair?", "Bountiful is one of our closest service areas. Same-day appointments are available most days, especially for calls that come in earlier in the day."],
      ["Why is my upstairs hotter than the rest of my Bountiful home?", "Common causes include duct imbalance, poor attic insulation, undersized returns, dirty coils, or an AC system losing capacity. We check airflow and equipment performance before recommending a fix."],
      ["Do you repair older air conditioners in Bountiful?", "Yes. We work on older systems often and will recommend a repair when the numbers make sense."],
      ["Can you help decide between AC repair and replacement?", "Yes. We look at age, repair cost, refrigerant type, efficiency, and the likelihood of future failures before giving guidance."]
    ],
    nearby: [
      ["Centerville", "/areas/centerville-ut/"],
      ["North Salt Lake", "/areas/north-salt-lake-ut/"],
      ["Woods Cross", "/areas/woods-cross-ut/"]
    ]
  },
  {
    slug: "farmington-ut",
    name: "Farmington",
    county: "Davis County",
    zipLine: "84025",
    title: "AC Repair in Farmington, UT | Same-Day Cooling Service | Salmon HVAC",
    description: "Same-day AC repair in Farmington, UT for warm air, frozen coils, failed capacitors, and no-cool calls. Repair-first service from Salmon HVAC.",
    hero: "AC Repair in Farmington, UT",
    intro: "Farmington AC repair often means newer systems that are no longer under builder warranty, east bench homes with sun exposure, and growing neighborhoods near Station Park and west Farmington. Salmon HVAC provides same-day AC repair with upfront pricing and repair-first recommendations.",
    localContext: [
      "Farmington has a large mix of newer construction, established east-side homes, and fast-growing west-side neighborhoods where original equipment is beginning to need service.",
      "Homes near the bench can experience uneven cooling and higher afternoon loads, while west Farmington homes often call when builder-grade parts begin failing after several hard summers.",
      "Because Farmington is minutes from our Centerville shop, we can usually respond quickly when an AC stops cooling during peak summer weather."
    ],
    neighborhoods: [
      "Station Park and west Farmington",
      "Farmington east bench",
      "Main Street and historic Farmington",
      "Farmington Ranches area",
      "Nearby Davis County communities"
    ],
    commonProblems: [
      "Failed capacitors on builder-grade outdoor units",
      "AC running constantly during afternoon heat",
      "Uneven cooling between main floor and upstairs rooms",
      "Frozen coils caused by restricted airflow",
      "Thermostat and zoning issues in newer homes"
    ],
    proof: "Farmington is a close, high-priority Davis County service area for Salmon HVAC. We understand both the newer construction patterns and the older homes near the east bench, which makes the first diagnosis more accurate.",
    faq: [
      ["Do you offer same-day AC repair in Farmington?", "Yes. Same-day service is available most days, and Farmington is close to our Centerville shop."],
      ["Why does my newer Farmington home already need AC repair?", "Builder-grade parts can fail after repeated hot summers, especially capacitors, contactors, fan motors, and thermostats. A newer home can still have a very repairable AC problem."],
      ["Can you fix uneven cooling in a Farmington home?", "Often, yes. We check airflow, duct balance, filter condition, equipment capacity, and thermostat settings to determine whether the issue is a repair, maintenance, or design problem."],
      ["Do you work on heat pumps and AC systems in Farmington?", "Yes. We service central AC, heat pumps, ductless mini-splits, and related indoor comfort equipment."]
    ],
    nearby: [
      ["Centerville", "/areas/centerville-ut/"],
      ["Kaysville", "/areas/kaysville-ut/"],
      ["Layton", "/areas/layton-ut/"]
    ]
  }
];

function jsonLd(city) {
  const url = `https://salmonhvac.com/areas/${city.slug}/ac-repair/`;
  const parentUrl = `https://salmonhvac.com/areas/${city.slug}/`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        "name": `AC Repair in ${city.name}, UT`,
        "serviceType": "Air Conditioning Repair",
        "provider": { "@id": "https://salmonhvac.com/#organization" },
        "areaServed": {
          "@type": "City",
          "name": city.name,
          "containedInPlace": {
            "@type": "AdministrativeArea",
            "name": `${city.county}, Utah`
          }
        },
        "url": url,
        "description": city.description
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faqpage`,
        "mainEntity": city.faq.map(([question, answer]) => ({
          "@type": "Question",
          "name": question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": answer
          }
        }))
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://salmonhvac.com/" },
          { "@type": "ListItem", "position": 2, "name": "Service Areas", "item": "https://salmonhvac.com/areas/" },
          { "@type": "ListItem", "position": 3, "name": `${city.name}, UT`, "item": parentUrl },
          { "@type": "ListItem", "position": 4, "name": "AC Repair", "item": url }
        ]
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        "url": url,
        "name": city.title,
        "description": city.description,
        "isPartOf": { "@id": "https://salmonhvac.com/#website" },
        "about": { "@id": `${url}#service` },
        "mainEntity": { "@id": `${url}#service` },
        "breadcrumb": { "@id": `${url}#breadcrumb` }
      }
    ]
  };
}

function list(items) {
  return items.map((item) => `        <li>${item}</li>`).join("\n");
}

function linkedList(items) {
  return items.map(([label, href]) => `        <li><a href="${href}">${label}</a></li>`).join("\n");
}

function faqMarkup(city) {
  return city.faq.map(([question, answer]) => `      <div class="faq-item">
        <h3>${question}</h3>
        <p>${answer}</p>
      </div>`).join("\n\n");
}

function page(city) {
  const canonical = `https://salmonhvac.com/areas/${city.slug}/ac-repair/`;
  const parentPath = `/areas/${city.slug}/`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<!-- Google Tag Manager - Deferred -->
<script>
window.dataLayer=window.dataLayer||[];
function _loadGTM(){if(window._gtmLoaded)return;window._gtmLoaded=true;(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-593W9BPW');}
var _gtmTimer=setTimeout(_loadGTM,3500);
['mousedown','touchstart','keydown','scroll','mousemove'].forEach(function(e){window.addEventListener(e,function(){clearTimeout(_gtmTimer);_loadGTM();},{once:true,passive:true});});
</script>
<!-- End Google Tag Manager -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${city.title}</title>
  <meta name="description" content="${city.description}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${city.title}">
  <meta property="og:description" content="${city.description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Salmon HVAC">
  <meta property="og:image" content="https://salmonhvac.com/assets/images/ac-technician-service-utah.webp">
  <meta property="og:locale" content="en_US">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${city.title}">
  <meta name="twitter:description" content="${city.description}">
  <meta name="twitter:image" content="https://salmonhvac.com/assets/images/ac-technician-service-utah.webp">
  <link rel="icon" type="image/png" href="/assets/images/logo-salmon.png">
  <link rel="apple-touch-icon" href="/assets/images/logo-salmon.png">
  <link rel="preload" as="font" type="font/woff2" href="/assets/fonts/rajdhani-700.woff2" crossorigin>
  <link rel="preload" as="font" type="font/woff2" href="/assets/fonts/inter-400.woff2" crossorigin>
  <link rel="preload" as="font" type="font/woff2" href="/assets/fonts/inter-600.woff2" crossorigin>
  <link rel="stylesheet" href="/assets/css/fonts.css">
  <link rel="stylesheet" href="/assets/css/fontawesome-subset.css" media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="/assets/css/fontawesome-subset.css"></noscript>
  <link rel="stylesheet" href="/assets/css/style.css?v=5">
  <script type="application/ld+json">
${JSON.stringify(jsonLd(city), null, 2)}
  </script>
<!-- Meta Pixel Code - Deferred -->
<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[]}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','681566040187541');fbq('track','PageView');
function _loadFBQ(){if(window._fbqLoaded)return;window._fbqLoaded=true;var t=document.createElement('script');t.async=true;t.src='https://connect.facebook.net/en_US/fbevents.js';document.head.appendChild(t);}
var _fbqTimer=setTimeout(_loadFBQ,3500);
['mousedown','touchstart','keydown','scroll','mousemove'].forEach(function(e){window.addEventListener(e,function(){clearTimeout(_fbqTimer);_loadFBQ();},{once:true,passive:true});});
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=681566040187541&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->
</head>
<body>
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-593W9BPW"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->

<!-- PARTIAL:nav:start -->
${nav}
<!-- PARTIAL:nav:end -->

<nav class="breadcrumb" aria-label="Breadcrumb">
  <div class="container">
    <ol>
      <li><a href="/">Home</a></li>
      <li><a href="/areas/">Service Areas</a></li>
      <li><a href="${parentPath}">${city.name}, UT</a></li>
      <li aria-current="page">AC Repair</li>
    </ol>
  </div>
</nav>

<section class="page-hero">
  <div class="container">
    <h1>${city.hero}</h1>
    <p>Same-day cooling diagnostics, repair-first recommendations, and upfront pricing from Salmon HVAC, serving Northern Utah since 1979.</p>
  </div>
</section>

<section class="page-content">
  <div class="container">
    <p>${city.intro}</p>

    <h2>Local AC Repair Issues in ${city.name}</h2>
${city.localContext.map((paragraph) => `    <p>${paragraph}</p>`).join("\n\n")}

    <h2>Common AC Problems We Fix in ${city.name}</h2>
    <ul class="service-list">
${list(city.commonProblems)}
    </ul>

    <h2>${city.name} Neighborhoods and Areas We Serve</h2>
    <p>We provide AC repair throughout ${city.name} and surrounding ${city.county} communities, including ${city.zipLine}.</p>
    <ul class="service-list">
${list(city.neighborhoods)}
    </ul>

    <h2>Our AC Repair Process</h2>
    <ol class="service-steps">
      <li><strong>Diagnose the failure.</strong> We check electrical components, refrigerant behavior, airflow, coil condition, thermostat function, and safety issues before recommending a repair.</li>
      <li><strong>Explain the options.</strong> You get the likely cause, repair cost, and any realistic repair-vs-replacement concerns before work begins.</li>
      <li><strong>Repair the current unit when it makes sense.</strong> Salmon HVAC is a fix-it-first company. If the system can be repaired responsibly, we will say so.</li>
      <li><strong>Verify cooling performance.</strong> After the repair, we run the system and confirm it is cooling properly before we leave.</li>
    </ol>

    <h2>Why ${city.name} Homeowners Call Salmon HVAC</h2>
    <p>${city.proof}</p>
    <ul class="service-list">
      <li>Family-owned Northern Utah HVAC company serving local homes since 1979.</li>
      <li>Same-day service available most days during cooling season.</li>
      <li>Upfront pricing before repair work starts.</li>
      <li>All major AC brands serviced.</li>
      <li><a href="https://daikincomfort.com/" target="_blank" rel="noopener" class="daikin-link">Daikin</a> Comfort Pro Authorized Dealer.</li>
    </ul>

    <h2>Related AC Repair Resources</h2>
    <ul class="service-links-list">
      <li><a href="/services/ac-repair/">Northern Utah AC Repair</a></li>
      <li><a href="/blog/ac-fan-not-spinning-capacitor-repair-utah/">Outside AC Fan Not Spinning in Utah?</a></li>
      <li><a href="/blog/air-conditioner-not-cooling-top-causes-and-fixes-for-utah-homes/">Air Conditioner Not Cooling? Top Causes and Fixes</a></li>
      <li><a href="/blog/how-long-does-an-ac-unit-last-utah-repair-or-replace/">How Long Does an AC Unit Last in Utah?</a></li>
      <li><a href="/services/ac-maintenance/">AC Maintenance and Tune-Ups</a></li>
      <li><a href="/services/ac-installation/">AC Installation and Replacement</a></li>
    </ul>

    <h2>Frequently Asked Questions About AC Repair in ${city.name}</h2>
${faqMarkup(city)}

    <h2>Nearby Service Areas</h2>
    <ul class="neighboring-cities">
${linkedList(city.nearby)}
    </ul>
  </div>
</section>

<!-- PARTIAL:cta:start -->
${cta}
<!-- PARTIAL:cta:end -->

<!-- PARTIAL:footer:start -->
${footer}
<!-- PARTIAL:footer:end -->

<script src="/assets/js/main.js" defer></script>
</body>
</html>
`;
}

for (const city of cities) {
  const dir = path.join(root, "areas", city.slug, "ac-repair");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), page(city), "utf8");
  console.log(`Wrote /areas/${city.slug}/ac-repair/`);
}
