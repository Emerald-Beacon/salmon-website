/**
 * Salmon HVAC - Site Configuration
 * Single source of truth for all business constants.
 * Referenced by build script and all page generators.
 */
const SITE_CONFIG = {
  businessName: "Salmon HVAC",
  legalName: "Salmon Plumbing & Heating Co., Inc.",
  address: {
    street: "105 S Main St",
    city: "Centerville",
    state: "UT",
    zip: "84014",
    full: "105 S Main St, Centerville, UT 84014",
  },
  phone: "(801) 397-0030",
  phoneTel: "+18013970030",
  emailOffice: "office@salmonhvac.com",
  emailWeb: "wmarriott@salmonhvac.com",
  website: "https://salmonhvac.com",
  founded: "1979",
  yearsInBusiness: 46,
  certifications: ["Daikin Comfort Pro Authorized Dealer"],
  serviceCounties: ["Davis", "Weber", "Morgan", "Salt Lake"],
  geo: { latitude: 40.918, longitude: -111.872 },
  hours: "Monday–Friday 7:00 AM–6:00 PM",
  social: {
    facebook: "https://www.facebook.com/SalmonHVAC",
    instagram: "https://www.instagram.com/salmonhvac",
    gbp: "https://g.page/salmonhvac",
  },
  services: [
    { name: "AC Repair", slug: "ac-repair" },
    { name: "AC Installation", slug: "ac-installation" },
    { name: "AC Maintenance", slug: "ac-maintenance" },
    { name: "Furnace Repair", slug: "furnace-repair" },
    { name: "Furnace Installation", slug: "furnace-installation" },
    { name: "Heat Pump Services", slug: "heat-pump-services" },
    { name: "Ductless Mini-Split", slug: "ductless-mini-split" },
    { name: "VRF Systems", slug: "vrf-systems" },
    { name: "Commercial HVAC", slug: "commercial-hvac" },
    { name: "Indoor Air Quality", slug: "indoor-air-quality" },
    { name: "Emergency HVAC", slug: "emergency-hvac" },
  ],
  cities: [
    { name: "Centerville", slug: "centerville-ut", county: "Davis", tier: 1 },
    { name: "Bountiful", slug: "bountiful-ut", county: "Davis", tier: 1 },
    { name: "Layton", slug: "layton-ut", county: "Davis", tier: 1 },
    { name: "Kaysville", slug: "kaysville-ut", county: "Davis", tier: 1 },
    { name: "Farmington", slug: "farmington-ut", county: "Davis", tier: 1 },
    { name: "Ogden", slug: "ogden-ut", county: "Weber", tier: 1 },
    { name: "Morgan", slug: "morgan-ut", county: "Morgan", tier: 1 },
    { name: "Salt Lake City", slug: "salt-lake-city-ut", county: "Salt Lake", tier: 1 },
    { name: "Clearfield", slug: "clearfield-ut", county: "Davis", tier: 2 },
    { name: "Roy", slug: "roy-ut", county: "Weber", tier: 2 },
    { name: "South Jordan", slug: "south-jordan-ut", county: "Salt Lake", tier: 2 },
    { name: "Sandy", slug: "sandy-ut", county: "Salt Lake", tier: 2 },
    { name: "West Jordan", slug: "west-jordan-ut", county: "Salt Lake", tier: 2 },
    { name: "Draper", slug: "draper-ut", county: "Salt Lake", tier: 2 },
  ],
};

if (typeof module !== "undefined") module.exports = SITE_CONFIG;
