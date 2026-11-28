(() => {
  "use strict";

  /* ------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------ */
  const STORE = {
    theme: "ecocycle-theme",
    requests: "ecocycle.v2.requests",
    parts: "ecocycle.v2.parts",
    session: "ecocycle.v2.session",
    accounts: "ecocycle.v2.accounts",
  };

  const PART_CATEGORIES = [
    "RAM & Memory",
    "Storage (SSD/HDD)",
    "Processors (CPU)",
    "Graphics Cards (GPU)",
    "Motherboards & PCBs",
    "Displays & Screens",
    "Power Supplies & Adapters",
    "Battery Packs",
    "Cooling & Fans",
    "Other Salvage Parts",
  ];

  const PART_CONDITIONS = [
    "Working / Tested",
    "Refurbishable",
    "For Parts / Scrap",
  ];

  const PART_SUGGESTED_PRICES = {
    "RAM & Memory": 1200,
    "Storage (SSD/HDD)": 2200,
    "Processors (CPU)": 3500,
    "Graphics Cards (GPU)": 6500,
    "Motherboards & PCBs": 1600,
    "Displays & Screens": 3200,
    "Power Supplies & Adapters": 950,
    "Battery Packs": 750,
    "Cooling & Fans": 450,
    "Other Salvage Parts": 600,
  };

  const CATEGORIES = [
    {
      name: "Computers",
      code: "PC",
      desc: "Desktops, laptops, monitors, keyboards and mice",
      note: "",
      avgWeight: 6.5,
      co2PerKg: 1.8,
    },
    {
      name: "Mobile phones",
      code: "PH",
      desc: "Phones, tablets, chargers and accessories",
      note: "Remove SIM and memory cards",
      avgWeight: 0.3,
      co2PerKg: 2.5,
    },
    {
      name: "Batteries",
      code: "BT",
      desc: "Rechargeable and household batteries",
      note: "Keep damaged batteries separate",
      avgWeight: 0.5,
      co2PerKg: 1.2,
    },
    {
      name: "Televisions",
      code: "TV",
      desc: "LCD, LED, plasma and other displays",
      note: "Handle screens upright",
      avgWeight: 14.0,
      co2PerKg: 1.5,
    },
    {
      name: "Printers",
      code: "PR",
      desc: "Printers, scanners, fax machines, ink and toner units",
      note: "",
      avgWeight: 7.0,
      co2PerKg: 1.3,
    },
    {
      name: "Cables",
      code: "CB",
      desc: "Power cords, adapters, USB cables and other wiring",
      note: "",
      avgWeight: 0.8,
      co2PerKg: 2.1,
    },
    {
      name: "Game consoles",
      code: "GC",
      desc: "Consoles, controllers and handheld devices",
      note: "Sign out of accounts",
      avgWeight: 3.2,
      co2PerKg: 1.6,
    },
    {
      name: "Audio equipment",
      code: "AU",
      desc: "Speakers, headphones, radios and stereo equipment",
      note: "",
      avgWeight: 2.4,
      co2PerKg: 1.4,
    },
    {
      name: "Cameras",
      code: "CA",
      desc: "Digital cameras, camcorders, lenses and accessories",
      note: "Remove memory cards",
      avgWeight: 0.9,
      co2PerKg: 1.9,
    },
    {
      name: "Small appliances",
      code: "SA",
      desc: "Small electric kitchen, grooming and household appliances",
      note: "",
      avgWeight: 2.2,
      co2PerKg: 1.1,
    },
    {
      name: "Networking equipment",
      code: "NW",
      desc: "Routers, modems, switches and network accessories",
      note: "",
      avgWeight: 1.1,
      co2PerKg: 1.7,
    },
    {
      name: "Wearables",
      code: "WR",
      desc: "Smartwatches, fitness trackers and other electronic wearables",
      note: "Built-in batteries: do not open",
      avgWeight: 0.2,
      co2PerKg: 2.2,
    },
    {
      name: "Lamps and lighting",
      code: "LT",
      desc: "LED lamps and electronic lighting",
      note: "Ask the point about special handling",
      avgWeight: 0.4,
      co2PerKg: 1.0,
    },
    {
      name: "Other small electronics",
      code: "OT",
      desc: "Calculators, toys, power banks and other small devices",
      note: "Power banks: treat as batteries",
      avgWeight: 0.6,
      co2PerKg: 1.5,
    },
  ];

  const STATUSES = [
    "Pending",
    "Approved",
    "Scheduled",
    "Collected",
    "Processing",
    "Completed",
    "Rejected",
    "Cancelled",
  ];
  const IN_PROGRESS = ["Approved", "Scheduled", "Collected", "Processing"];
  const sKey = (s) => String(s || "").toLowerCase();

  const NAV = {
    user: [
      { id: "overview", label: "Overview", icon: "grid" },
      { id: "new", label: "New Request", icon: "plus" },
      { id: "requests", label: "My Requests", icon: "list" },
      { id: "parts", label: "Sell Parts", icon: "tag" },
      { id: "map", label: "Find a Point", icon: "pin" },
      { id: "categories", label: "Categories", icon: "box" },
      { id: "guide", label: "Safety Guide", icon: "book" },
    ],
    admin: [
      { id: "overview", label: "Overview", icon: "grid" },
      { id: "requests", label: "All Requests", icon: "list" },
      { id: "parts", label: "Parts & Razorpay", icon: "tag" },
      { id: "map", label: "Recycling Points", icon: "pin" },
      { id: "guide", label: "Safety Guide", icon: "book" },
    ],
  };
  const TITLES = {
    overview: "Overview",
    new: "New Request",
    requests: { user: "My Requests", admin: "All Requests" },
    parts: { user: "Sell & Buy Parts", admin: "Parts & Razorpay" },
    map: { user: "Find a Drop-Off Point", admin: "Recycling Points" },
    categories: "Accepted Categories",
    guide: "Safety Guide",
  };

  const QUICK_CITIES = [
    "All India",
    "Delhi",
    "Mumbai",
    "Bengaluru",
    "Chennai",
    "Kolkata",
    "Hyderabad",
    "Pune",
    "Jaipur",
    "Ahmedabad",
    "Guwahati",
    "Kochi",
  ];

  /* ------------------------------------------------------------------
   * Helpers
   * ------------------------------------------------------------------ */
  const $ = (id) => document.getElementById(id);
  const esc = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const icon = (n) =>
    `<svg class="i" aria-hidden="true"><use href="#i-${n}"/></svg>`;

  const pad = (n) => String(n).padStart(2, "0");
  const toISO = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const todayISO = () => toISO(new Date());
  function getTimeGreeting(name = "Deepak") {
    const hour = new Date().getHours();
    const period = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
    const rawFirst = String(name || "Deepak").trim().split(/\s+/).filter(Boolean)[0] || "Deepak";
    const firstName = rawFirst.toLowerCase() === "system" ? "Deepak" : rawFirst;
    return `Good ${period}, ${firstName}`;
  }
  const fmtDate = (iso) => {
    const d = new Date(String(iso).length <= 10 ? `${iso}T00:00:00` : iso);
    return Number.isNaN(d.getTime())
      ? String(iso || "")
      : d.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
  };
  const fmtDateTime = (iso) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
      ? ""
      : d.toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
  };
  const displayId = (id) => `ECO-${id}`;
  const initials = (name) =>
    String(name || "?")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("");

  const store = {
    get(k) {
      try {
        return localStorage.getItem(k);
      } catch {
        return null;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, v);
        return true;
      } catch {
        return false;
      }
    },
  };

  function readStoredJson(key, fallback) {
    const value = store.get(key);
    if (value === null) return fallback;
    try {
      return JSON.parse(value);
    } catch {
      throw new Error("Saved browser data is invalid. Clear this site's stored data and try again.");
    }
  }

  function writeStoredJson(key, value) {
    if (!store.set(key, JSON.stringify(value))) {
      throw new Error("The browser could not save data. Check available storage and try again.");
    }
  }

  function currentProfile() {
    const profile = readStoredJson(STORE.session, null);
    if (profile === null) throw new Error("Please sign in to continue.");
    if (!isProfile(profile)) {
      throw new Error("Saved account data is invalid. Sign in again.");
    }
    return profile;
  }

  const TOKEN_KEY = "ecocycle_jwt_token";
  let backendStatusOnline = false;

  const DAY_MS = 86400000;
  const isoDaysAgo = (days) => toISO(new Date(Date.now() - DAY_MS * days));
  const atDaysAgo = (days, hours = 0) =>
    new Date(Date.now() - DAY_MS * days - hours * 3600000).toISOString();

  const FALLBACK_CERTIFIED_CENTERS = [
    { name: "EcoCycle Certified Hub - Jaipur Central", address: "Malviya Industrial Area, Jaipur, Rajasthan 302017", city: "Jaipur", phone: "+91 98765 43210", email: "jaipur@ecocycle.org", lat: 26.8549, lng: 75.8243, verifiedPartner: true },
    { name: "VKIA Authorized E-Waste Depot - North Jaipur", address: "Vishwakarma Industrial Area, Road No. 9, Jaipur 302013", city: "Jaipur", phone: "+91 98765 43225", email: "vkia@ecocycle.org", lat: 26.9922, lng: 75.7720, verifiedPartner: true },
    { name: "Green Earth Recycling & Recovery Centre", address: "Sector 18, Electronic City, Gurugram, Delhi NCR 122015", city: "Delhi", phone: "+91 98765 43211", email: "delhi@greenearth.org", lat: 28.4985, lng: 77.0818, verifiedPartner: true },
    { name: "EcoCycle Capital Circular Hub - Okhla", address: "Phase II, Okhla Industrial Area, New Delhi 110020", city: "Delhi", phone: "+91 98765 43215", email: "delhi.okhla@ecocycle.org", lat: 28.5355, lng: 77.2732, verifiedPartner: true },
    { name: "NCR E-Waste & Electronics Collection Station", address: "Sector 62, Electronic City, Noida, Uttar Pradesh 201309", city: "Delhi", phone: "+91 98765 43216", email: "noida@ecocycle.org", lat: 28.6280, lng: 77.3649, verifiedPartner: true },
    { name: "EcoTech Electronic Scrap & Circular Hub", address: "Peenya Industrial Area 2nd Stage, Bengaluru, Karnataka 560058", city: "Bengaluru", phone: "+91 98765 43212", email: "bengaluru@ecotech.org", lat: 13.0285, lng: 77.5192, verifiedPartner: true },
    { name: "Silicon Plateau E-Waste Depot - Whitefield", address: "EPIP Zone, Whitefield, Bengaluru, Karnataka 560066", city: "Bengaluru", phone: "+91 98765 43217", email: "whitefield@ecocycle.org", lat: 12.9850, lng: 77.7366, verifiedPartner: true },
    { name: "Mumbai Zero-Waste Reclamation Facility", address: "Andheri East MIDC, Mumbai, Maharashtra 400093", city: "Mumbai", phone: "+91 98765 43213", email: "mumbai@ecocycle.org", lat: 19.1197, lng: 72.8697, verifiedPartner: true },
    { name: "Navi Mumbai Certified E-Cycle Recovery Center", address: "TTC Industrial Area, Kopar Khairane, Navi Mumbai 400709", city: "Mumbai", phone: "+91 98765 43218", email: "navimumbai@ecocycle.org", lat: 19.1030, lng: 73.0185, verifiedPartner: true },
    { name: "Southern E-Waste Authorized Collection Point", address: "Guindy Industrial Estate, Chennai, Tamil Nadu 600032", city: "Chennai", phone: "+91 98765 43220", email: "chennai@ecocycle.org", lat: 13.0067, lng: 80.2206, verifiedPartner: true },
    { name: "Bengal Tech-Waste & Refurbishment Facility", address: "Salt Lake Sector V, Kolkata, West Bengal 700091", city: "Kolkata", phone: "+91 98765 43221", email: "kolkata@ecocycle.org", lat: 22.5735, lng: 88.4331, verifiedPartner: true },
    { name: "Cyberabad Certified E-Waste Circular Hub", address: "HITEC City, Madhapur, Hyderabad, Telangana 500081", city: "Hyderabad", phone: "+91 98765 43223", email: "hyderabad@ecocycle.org", lat: 17.4435, lng: 78.3772, verifiedPartner: true },
    { name: "Pune Eco-Recycle Facility", address: "MIDC Bhosari, Pimpri-Chinchwad, Pune, Maharashtra 411026", city: "Pune", phone: "+91 98765 43224", email: "pune@ecocycle.org", lat: 18.6298, lng: 73.8441, verifiedPartner: true },
    { name: "Gujarat CleanTech & Metals Hub", address: "GIDC Industrial Estate, Vatva, Ahmedabad, Gujarat 382445", city: "Ahmedabad", phone: "+91 98765 43226", email: "ahmedabad@ecocycle.org", lat: 22.9567, lng: 72.6312, verifiedPartner: true },
    { name: "Awadh E-Waste Collection & Circular Point", address: "Transport Nagar, Kanpur Road, Lucknow, Uttar Pradesh 226012", city: "Lucknow", phone: "+91 98765 43227", email: "lucknow@ecocycle.org", lat: 26.7821, lng: 80.8924, verifiedPartner: true },
    { name: "City Beautiful Clean E-Recycle Hub", address: "Industrial Area Phase 1, Chandigarh 160002", city: "Chandigarh", phone: "+91 98765 43228", email: "chandigarh@ecocycle.org", lat: 30.7046, lng: 76.7985, verifiedPartner: true },
  ];

  const DEFAULT_OFFLINE_REQUESTS = [
    {
      id: 1730000008,
      user: "Rahul Sharma",
      email: "rahul@example.com",
      category: "Wearables",
      method: "Drop-off",
      qty: 2,
      date: isoDaysAgo(-1),
      location: "VKIA Authorized E-Waste Depot - North Jaipur",
      phone: "9876500001",
      notes: "Fitness trackers with original charging cradles",
      status: "Pending",
      estimatedWeight: 0.4,
      createdAt: atDaysAgo(0, 9),
      history: [{ status: "Pending", at: atDaysAgo(0, 9), by: "Rahul Sharma", note: "Submitted for weekend drop-off" }],
    },
    {
      id: 1730000003,
      user: "Priya Verma",
      email: "priya@example.com",
      category: "Batteries",
      method: "Pickup",
      qty: 5,
      date: isoDaysAgo(0),
      location: "Flat 4B, Green Glen, Delhi",
      phone: "9876500002",
      notes: "Laptop batteries in protective casing",
      status: "Pending",
      estimatedWeight: 2.5,
      createdAt: atDaysAgo(0, 4),
      history: [{ status: "Pending", at: atDaysAgo(0, 4), by: "Priya Verma", note: "Awaiting dispatcher review" }],
    },
    {
      id: 1730000006,
      user: "Rahul Sharma",
      email: "rahul@example.com",
      category: "Networking equipment",
      method: "Drop-off",
      qty: 4,
      date: isoDaysAgo(2),
      location: "EcoCycle Certified Hub - Jaipur Central",
      phone: "9876500001",
      notes: "Dual-band Wi-Fi routers and gigabit switch",
      status: "Approved",
      estimatedWeight: 4.4,
      createdAt: atDaysAgo(2),
      history: [
        { status: "Pending", at: atDaysAgo(2), by: "Rahul Sharma" },
        { status: "Approved", at: atDaysAgo(1), by: "System Admin", note: "Drop-off window open 9 AM – 6 PM" },
      ],
    },
    {
      id: 1730000001,
      user: "Rahul Sharma",
      email: "rahul@example.com",
      category: "Computers",
      method: "Pickup",
      qty: 2,
      date: isoDaysAgo(4),
      location: "Plot 15, Malviya Nagar, Jaipur, Rajasthan",
      phone: "9876500001",
      notes: "2 old desktop towers and monitor with power cables",
      status: "Scheduled",
      estimatedWeight: 13.0,
      createdAt: atDaysAgo(4),
      history: [
        { status: "Pending", at: atDaysAgo(4), by: "Rahul Sharma", note: "Submitted via web" },
        { status: "Approved", at: atDaysAgo(3), by: "System Admin", note: "Verified by dispatcher" },
        { status: "Scheduled", at: atDaysAgo(1), by: "System Admin", note: "Assigned to EcoCycle Van #3" },
      ],
    },
    {
      id: 1730000005,
      user: "Priya Verma",
      email: "priya@example.com",
      category: "Printers",
      method: "Drop-off",
      qty: 2,
      date: isoDaysAgo(8),
      location: "EcoCycle Capital Circular Hub - Okhla, Delhi",
      phone: "9876500002",
      notes: "LaserJet office printers, cartridges removed",
      status: "Processing",
      estimatedWeight: 14.0,
      createdAt: atDaysAgo(9),
      history: [
        { status: "Pending", at: atDaysAgo(9), by: "Priya Verma" },
        { status: "Approved", at: atDaysAgo(8), by: "System Admin" },
        { status: "Collected", at: atDaysAgo(7), by: "Okhla Hub Staff" },
        { status: "Processing", at: atDaysAgo(5), by: "Recovery Dept", note: "Sorting steel chassis & fuser assembly" },
      ],
    },
    {
      id: 1730000002,
      user: "Rahul Sharma",
      email: "rahul@example.com",
      category: "Mobile phones",
      method: "Drop-off",
      qty: 3,
      date: isoDaysAgo(15),
      location: "EcoCycle Certified Hub - Jaipur Central",
      phone: "9876500001",
      notes: "Old Android smartphones, batteries intact",
      status: "Completed",
      estimatedWeight: 1.5,
      actualWeight: 1.5,
      createdAt: atDaysAgo(15),
      history: [
        { status: "Pending", at: atDaysAgo(15), by: "Rahul Sharma" },
        { status: "Approved", at: atDaysAgo(14), by: "System Admin" },
        { status: "Collected", at: atDaysAgo(13), by: "Jaipur Hub Staff" },
        { status: "Processing", at: atDaysAgo(12), by: "Recovery Dept" },
        { status: "Completed", at: atDaysAgo(10), by: "Recovery Dept", note: "Precious metals recovered" },
      ],
    },
    {
      id: 1730000004,
      user: "Rahul Sharma",
      email: "rahul@example.com",
      category: "Televisions",
      method: "Pickup",
      qty: 1,
      date: isoDaysAgo(28),
      location: "B-14, Vaishali Nagar, Jaipur, Rajasthan",
      phone: "9876500001",
      notes: "43-inch LED TV with stand and remote",
      status: "Completed",
      estimatedWeight: 14.0,
      actualWeight: 13.8,
      createdAt: atDaysAgo(28),
      history: [
        { status: "Pending", at: atDaysAgo(28), by: "Rahul Sharma", note: "Booked home pickup" },
        { status: "Approved", at: atDaysAgo(27), by: "System Admin", note: "Crew slot confirmed" },
        { status: "Scheduled", at: atDaysAgo(26), by: "System Admin", note: "Assigned to Van #2" },
        { status: "Collected", at: atDaysAgo(25), by: "Jaipur Hub Staff" },
        { status: "Processing", at: atDaysAgo(23), by: "Recovery Dept" },
        { status: "Completed", at: atDaysAgo(21), by: "Recovery Dept", note: "Display panel & PCB recycled" },
      ],
    },
    {
      id: 1730000007,
      user: "Priya Verma",
      email: "priya@example.com",
      category: "Small appliances",
      method: "Pickup",
      qty: 3,
      date: isoDaysAgo(38),
      location: "Sector 62, Noida, Delhi NCR",
      phone: "9876500002",
      notes: "Electric kettle, toaster, and induction cooktop",
      status: "Completed",
      estimatedWeight: 6.6,
      actualWeight: 6.4,
      createdAt: atDaysAgo(38),
      history: [
        { status: "Pending", at: atDaysAgo(38), by: "Priya Verma" },
        { status: "Approved", at: atDaysAgo(37), by: "System Admin" },
        { status: "Collected", at: atDaysAgo(35), by: "Noida Field Team" },
        { status: "Completed", at: atDaysAgo(33), by: "Recovery Dept", note: "Copper coils & heating elements recovered" },
      ],
    },
  ];

  const DEFAULT_OFFLINE_PARTS = [
    {
      id: 2730000001,
      title: "Crucial 8GB DDR4-3200 Laptop RAM Stick",
      partCategory: "RAM & Memory",
      condition: "Working / Tested",
      qty: 2,
      priceInr: 1350,
      location: "Malviya Nagar, Jaipur, Rajasthan",
      description: "Pulled from upgraded corporate ThinkPad laptops. MemTest86 verified.",
      sellerName: "Rahul Sharma",
      sellerEmail: "rahul@example.com",
      sellerUpi: "rahul.sharma@okaxis",
      status: "Available",
      createdAt: atDaysAgo(5),
    },
    {
      id: 2730000002,
      title: "Samsung 512GB NVMe M.2 PCIe Gen3 SSD",
      partCategory: "Storage (SSD/HDD)",
      condition: "Working / Tested",
      qty: 1,
      priceInr: 2450,
      location: "Dwarka Sector 12, New Delhi",
      description: "94% SMART health remaining, securely wiped and formatted.",
      sellerName: "Priya Verma",
      sellerEmail: "priya@example.com",
      sellerUpi: "priya.verma@okicici",
      status: "Available",
      createdAt: atDaysAgo(4),
    },
    {
      id: 2730000003,
      title: "Dell 65W USB-C Original Power Adapters",
      partCategory: "Power Supplies & Adapters",
      condition: "Refurbishable",
      qty: 3,
      priceInr: 1100,
      location: "Vaishali Nagar, Jaipur, Rajasthan",
      description: "OEM Dell chargers with intact Type-C cables and surge protection.",
      sellerName: "Rahul Sharma",
      sellerEmail: "rahul@example.com",
      sellerUpi: "rahul.sharma@okaxis",
      status: "Sold",
      buyerName: "Priya Verma",
      buyerEmail: "priya@example.com",
      razorpayOrderId: "order_EcoRzp91a4f21c",
      razorpayPaymentId: "pay_EcoRzp88c7b104",
      paymentMethod: "UPI",
      paidAmountInr: 1100,
      paidAt: atDaysAgo(2),
      createdAt: atDaysAgo(6),
    },
    {
      id: 2730000004,
      title: "iPhone 13 OLED Display & Digitizer Assembly",
      partCategory: "Displays & Screens",
      condition: "Refurbishable",
      qty: 1,
      priceInr: 3800,
      location: "Okhla Phase II, New Delhi",
      description: "Genuine OLED panel salvaged from water-damaged logic board unit.",
      sellerName: "Priya Verma",
      sellerEmail: "priya@example.com",
      sellerUpi: "priya.verma@okicici",
      status: "Payout Settled",
      buyerName: "EcoCycle Buyback Hub",
      buyerEmail: "admin@example.com",
      razorpayOrderId: "order_EcoRzp72d910ab",
      razorpayPaymentId: "pay_EcoRzp72d999fe",
      paymentMethod: "Razorpay Hub Buyback",
      paidAmountInr: 3800,
      paidAt: atDaysAgo(8),
      payoutId: "pout_EcoRzp441098bc",
      payoutAt: atDaysAgo(7),
      createdAt: atDaysAgo(10),
    },
    {
      id: 2730000005,
      title: "High-Grade Gold-Plated Telecom & Server PCBs (2 kg)",
      partCategory: "Motherboards & PCBs",
      condition: "For Parts / Scrap",
      qty: 4,
      priceInr: 1850,
      location: "C-Scheme, Jaipur, Rajasthan",
      description: "Clean router and server boards ready for precious metal recovery.",
      sellerName: "Rahul Sharma",
      sellerEmail: "rahul@example.com",
      sellerUpi: "rahul.sharma@okaxis",
      status: "Available",
      createdAt: atDaysAgo(1),
    },
  ];

  function ensureOfflineParts() {
    const existing = readStoredJson(STORE.parts, null);
    if (!Array.isArray(existing)) {
      writeStoredJson(STORE.parts, DEFAULT_OFFLINE_PARTS);
      return [...DEFAULT_OFFLINE_PARTS];
    }
    return existing;
  }

  function ensureOfflineRequests() {
    const existing = readStoredJson(STORE.requests, null);
    if (existing === null) {
      writeStoredJson(STORE.requests, DEFAULT_OFFLINE_REQUESTS);
      return [...DEFAULT_OFFLINE_REQUESTS];
    }
    return existing;
  }

  function setBackendStatus(online) {
    backendStatusOnline = Boolean(online);
    const pill = $("backendPill");
    const text = $("backendStatusText");
    if (!pill || !text) return;
    if (online) {
      pill.classList.remove("is-offline");
      text.textContent = "Service Active";
      pill.title = "Connected to EcoCycle Server";
    } else {
      pill.classList.add("is-offline");
      text.textContent = "Offline Preview";
      pill.title = "Offline preview mode - changes saved locally in browser";
    }
  }

  // Ping server health
  try {
    fetch("/api/health")
      .then((r) => r.json())
      .then((data) => {
        const isDb = data.database && (data.database.connected || data.status === "healthy");
        setBackendStatus(isDb);
      })
      .catch(() => setBackendStatus(false));
  } catch (_) {}

  async function api(path, options = {}) {
    const token = store.get(TOKEN_KEY);
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(path, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      if (data.token) {
        store.set(TOKEN_KEY, data.token);
      }
      if (path === "/api/auth/logout") {
        store.set(TOKEN_KEY, null);
      }

      setBackendStatus(true);
      return data;
    } catch (netErr) {
      setBackendStatus(false);
      return localApiFallback(path, options);
    }
  }

  async function localApiFallback(path, options = {}) {
    const method = options.method || "GET";
    const body = options.body ? JSON.parse(options.body) : {};
    if (method === "POST" && path === "/api/auth/login") {
      const email = String(body.email || "").trim().toLowerCase();
      const role = body.role;
      const accounts = readStoredJson(STORE.accounts, []);
      const account =
        role === "user" && email === "rahul@example.com" && body.password === "demo1234"
          ? { name: "Rahul Sharma", email, role: "user" }
          : role === "user" && email === "priya@example.com" && body.password === "demo1234"
            ? { name: "Priya Verma", email, role: "user" }
            : role === "admin" && email === "admin@example.com" && body.password === "demo1234"
              ? { name: "System Admin", email, role: "admin" }
              : accounts.find(
                  (saved) =>
                    saved.email === email &&
                    saved.password === body.password &&
                    role === "user",
                );
      if (!account) throw new Error("Email, role, or password is incorrect.");
      const profile = { name: account.name, email: account.email, role: account.role || role };
      writeStoredJson(STORE.session, profile);
      return profile;
    }
    if (method === "POST" && path === "/api/auth/register") {
      const name = String(body.name || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const password = body.password;
      const accounts = readStoredJson(STORE.accounts, []);
      if (!name) throw new Error("Enter your full name.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Enter a valid email address.");
      }
      if (typeof password !== "string" || password.length < 8 || password.length > 128) {
        throw new Error("Password must be between 8 and 128 characters.");
      }
      if (
        email === "rahul@example.com" ||
        email === "priya@example.com" ||
        email === "admin@example.com" ||
        accounts.some((saved) => saved.email === email)
      ) {
        throw new Error("An account with that email already exists.");
      }
      const account = { name, email, password, role: "user" };
      writeStoredJson(STORE.accounts, [...accounts, account]);
      const profile = { name, email, role: "user" };
      writeStoredJson(STORE.session, profile);
      return profile;
    }
    if (method === "POST" && path === "/api/auth/logout") {
      writeStoredJson(STORE.session, null);
      return { ok: true };
    }
    if (method === "GET" && path === "/api/auth/session") {
      return currentProfile();
    }
    if (path === "/api/centers") {
      return FALLBACK_CERTIFIED_CENTERS;
    }
    if (path === "/api/categories") {
      return CATEGORIES;
    }
    const profile = currentProfile();
    if (method === "GET" && path === "/api/requests") {
      const requests = ensureOfflineRequests();
      if (!Array.isArray(requests) || !requests.every(isRequest)) {
        throw new Error("Saved collection requests are invalid. Clear this site's stored data and try again.");
      }
      return profile.role === "admin"
        ? requests
        : requests.filter((request) => request.email.toLowerCase() === profile.email.toLowerCase());
    }
    if (method === "POST" && path === "/api/requests") {
      if (profile.role !== "user") throw new Error("Only users can submit requests.");
      const requests = ensureOfflineRequests();
      const cat = CATEGORIES.find((c) => c.name === String(body.category || ""));
      const qtyNum = Number(body.qty);
      const estimatedWeight = Number(((cat ? cat.avgWeight : 2.5) * qtyNum).toFixed(2));
      const request = {
        id: Date.now(),
        user: profile.name,
        email: profile.email,
        category: String(body.category || ""),
        method: body.method,
        qty: qtyNum,
        date: String(body.date || ""),
        location: String(body.location || ""),
        notes: String(body.notes || ""),
        phone: String(body.phone || ""),
        status: "Pending",
        estimatedWeight,
        createdAt: new Date().toISOString(),
        history: [{ status: "Pending", at: new Date().toISOString(), by: profile.name }],
      };
      if (!isRequest(request)) throw new Error("The collection request is invalid.");
      writeStoredJson(STORE.requests, [request, ...requests]);
      return request;
    }
    const requestRoute = path.match(/^\/api\/requests\/(\d+)(?:\/status)?$/);
    if (requestRoute && method === "PATCH" && path.endsWith("/status")) {
      const requests = ensureOfflineRequests();
      const request = requests.find((entry) => String(entry.id) === requestRoute[1]);
      if (!request) throw new Error("Request not found.");
      if (
        profile.role === "user" &&
        (body.status !== "Cancelled" || request.email.toLowerCase() !== profile.email.toLowerCase() || request.status !== "Pending")
      ) {
        throw new Error("Users can only cancel their own pending requests.");
      }
      if (!STATUSES.includes(body.status)) throw new Error("Choose a valid status.");
      request.status = body.status;
      request.history = request.history || [];
      request.history.push({ status: body.status, at: new Date().toISOString(), by: profile.name });
      writeStoredJson(STORE.requests, requests);
      return request;
    }
    if (requestRoute && method === "DELETE" && !path.endsWith("/status")) {
      const requests = ensureOfflineRequests();
      const targetReq = requests.find((entry) => String(entry.id) === requestRoute[1]);
      if (!targetReq) throw new Error("Request not found.");
      const isOwner = String(targetReq.email || "").toLowerCase() === profile.email.toLowerCase();
      if (profile.role !== "admin" && !isOwner) {
        throw new Error("You are not authorized to remove this request.");
      }
      const remaining = requests.filter((entry) => String(entry.id) !== requestRoute[1]);
      writeStoredJson(STORE.requests, remaining);
      return { ok: true };
    }
    if (method === "GET" && path === "/api/parts/razorpay-config") {
      return {
        keyId: "rzp_test_EcoCycleDemo",
        mode: "razorpay_test_sim",
        hasLiveKeys: false,
        currency: "INR",
        merchantName: "EcoCycle Circular Parts",
      };
    }
    if (method === "GET" && path === "/api/parts") {
      return ensureOfflineParts();
    }
    if (method === "POST" && path === "/api/parts") {
      const parts = ensureOfflineParts();
      const priceNum = Math.round(Number(body.priceInr));
      if (!String(body.title || "").trim()) throw new Error("Please enter the part name.");
      if (!Number.isFinite(priceNum) || priceNum < 10) throw new Error("Minimum asking price is ₹10.");
      if (!String(body.location || "").trim()) throw new Error("Please enter pickup location.");
      const part = {
        id: Date.now(),
        title: String(body.title).trim(),
        partCategory: String(body.partCategory || "Other Salvage Parts"),
        condition: String(body.condition || "Working / Tested"),
        qty: Math.max(1, Math.min(99, parseInt(body.qty, 10) || 1)),
        priceInr: priceNum,
        location: String(body.location).trim(),
        description: String(body.description || "").trim(),
        sellerName: profile.name,
        sellerEmail: profile.email,
        sellerUpi: String(body.sellerUpi || "").trim(),
        status: "Available",
        createdAt: new Date().toISOString(),
      };
      writeStoredJson(STORE.parts, [part, ...parts]);
      return part;
    }
    const partOrderMatch = path.match(/^\/api\/parts\/([^/]+)\/razorpay\/order$/);
    if (partOrderMatch && method === "POST") {
      const parts = ensureOfflineParts();
      const part = parts.find((p) => String(p.id) === partOrderMatch[1]);
      if (!part) throw new Error("Part listing not found.");
      if (part.status !== "Available") throw new Error(`This part is already ${part.status.toLowerCase()}.`);
      const orderId = `order_sim_${Math.random().toString(36).slice(2, 12)}`;
      return {
        orderId,
        amount: Math.round(part.priceInr * 100),
        currency: "INR",
        keyId: "rzp_test_EcoCycleDemo",
        mode: "razorpay_test_sim",
        part,
      };
    }
    const partVerifyMatch = path.match(/^\/api\/parts\/([^/]+)\/razorpay\/verify$/);
    if (partVerifyMatch && method === "POST") {
      const parts = ensureOfflineParts();
      const part = parts.find((p) => String(p.id) === partVerifyMatch[1]);
      if (!part) throw new Error("Part listing not found.");
      if (part.status !== "Available") throw new Error(`This part is already ${part.status.toLowerCase()}.`);
      part.status = "Sold";
      part.buyerName = profile.name;
      part.buyerEmail = profile.email;
      part.razorpayOrderId = body.razorpay_order_id;
      part.razorpayPaymentId = body.razorpay_payment_id || `pay_sim_${Math.random().toString(36).slice(2, 12)}`;
      part.paymentMethod = body.paymentMethod || "UPI";
      part.paidAmountInr = part.priceInr;
      part.paidAt = new Date().toISOString();
      writeStoredJson(STORE.parts, parts);
      return part;
    }
    const partPayoutMatch = path.match(/^\/api\/parts\/([^/]+)\/payout$/);
    if (partPayoutMatch && method === "POST") {
      if (profile.role !== "admin") throw new Error("Administrator access is required.");
      const parts = ensureOfflineParts();
      const part = parts.find((p) => String(p.id) === partPayoutMatch[1]);
      if (!part) throw new Error("Part listing not found.");
      const now = new Date().toISOString();
      part.status = "Payout Settled";
      part.payoutId = `pout_sim_${Math.random().toString(36).slice(2, 12)}`;
      part.payoutAt = now;
      if (!part.razorpayPaymentId) {
        part.buyerName = "EcoCycle Buyback Hub";
        part.buyerEmail = profile.email;
        part.razorpayOrderId = `order_sim_${Math.random().toString(36).slice(2, 10)}`;
        part.razorpayPaymentId = `pay_sim_${Math.random().toString(36).slice(2, 10)}`;
        part.paymentMethod = "Razorpay Hub Buyback";
        part.paidAmountInr = part.priceInr;
        part.paidAt = now;
      }
      writeStoredJson(STORE.parts, parts);
      return part;
    }
    const partDeleteMatch = path.match(/^\/api\/parts\/([^/]+)$/);
    if (partDeleteMatch && method === "DELETE") {
      const parts = ensureOfflineParts();
      const part = parts.find((p) => String(p.id) === partDeleteMatch[1]);
      if (!part) throw new Error("Part listing not found.");
      const userEmail = profile.email.toLowerCase();
      const isSeller = String(part.sellerEmail || "").toLowerCase() === userEmail;
      const isBuyer = String(part.buyerEmail || "").toLowerCase() === userEmail;
      if (profile.role !== "admin" && !isSeller && !isBuyer) {
        throw new Error("You can only remove your own part listings or payments.");
      }
      writeStoredJson(STORE.parts, parts.filter((p) => String(p.id) !== partDeleteMatch[1]));
      return { ok: true };
    }
    throw new Error("This action is not available.");
  }

  const localApi = api;

  async function loadRequests() {
    const requests = await localApi("/api/requests");
    if (!Array.isArray(requests)) {
      throw new Error("Saved collection requests are invalid.");
    }
    state.requests = requests.map((r) => {
      r.id = r.id || r.numericId || r._id;
      return r;
    });
  }

  async function loadParts() {
    try {
      const [parts, rzpConfig] = await Promise.all([
        localApi("/api/parts"),
        localApi("/api/parts/razorpay-config"),
      ]);
      if (Array.isArray(parts)) {
        state.parts = parts.map((p) => {
          p.id = p.id || p.numericId || p._id;
          return p;
        });
      }
      if (rzpConfig && typeof rzpConfig === "object") {
        state.razorpayConfig = rzpConfig;
      }
    } catch (_) {
      state.parts = ensureOfflineParts();
    }
  }

  function isRequest(r) {
    if (!r || typeof r !== "object") return false;
    r.id = r.id || r.numericId || r._id;
    return (
      ["string", "number"].includes(typeof r.id) &&
      String(r.id).trim() !== "" &&
      typeof r.user === "string" &&
      typeof r.email === "string" &&
      typeof r.category === "string" &&
      ["Pickup", "Drop-off"].includes(r.method) &&
      typeof r.date === "string" &&
      typeof r.location === "string" &&
      STATUSES.includes(r.status)
    );
  }

  function isProfile(profile) {
    return (
      profile !== null &&
      typeof profile === "object" &&
      ["admin", "user"].includes(profile.role) &&
      typeof profile.name === "string" &&
      profile.name.trim() !== "" &&
      typeof profile.email === "string" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)
    );
  }

  /* ------------------------------------------------------------------
   * State
   * ------------------------------------------------------------------ */
  const state = {
    user: null,
    requests: [],
    parts: [],
    partsTab: "market",
    partsFilterCat: "all",
    partsFilterStatus: "all",
    partsSearch: "",
    razorpayConfig: null,
    view: "overview",
    openRequestId: null,
  };
  const isAdmin = () => state.user?.role === "admin";
  const myRequests = () =>
    isAdmin()
      ? state.requests
      : state.requests.filter(
          (r) =>
            String(r.email || "").toLowerCase() ===
            state.user.email.toLowerCase(),
        );
  const findRequest = (id) =>
    state.requests.find((r) => String(r.id) === String(id));

  /* ------------------------------------------------------------------
   * Theme, toast, modal
   * ------------------------------------------------------------------ */
  function setTheme(theme) {
    const dark = theme === "dark";
    document.body.dataset.theme = dark ? "dark" : "light";
    const btn = $("themeToggle");
    btn.setAttribute(
      "aria-label",
      dark ? "Switch to light theme" : "Switch to dark theme",
    );
    btn.innerHTML = icon(dark ? "sun" : "moon");
    store.set(STORE.theme, dark ? "dark" : "light");
  }

  function toast(message, type = "ok") {
    const el = document.createElement("div");
    el.className = `toast${type === "error" ? " is-error" : ""}`;
    el.innerHTML = `${icon(type === "error" ? "alert" : "check")}<span>${esc(message)}</span>`;
    $("toasts").appendChild(el);
    setTimeout(() => el.remove(), 4200);
  }

  function confirmDialog({ title, text, confirmLabel = "Delete" }) {
    return new Promise((resolve) => {
      const modal = $("modal");
      $("modalTitle").textContent = title;
      $("modalText").textContent = text;
      $("modalOk").textContent = confirmLabel;
      modal.hidden = false;
      const previous = document.activeElement;
      $("modalCancel").focus();
      const done = (v) => {
        modal.hidden = true;
        $("modalOk").onclick = $("modalCancel").onclick = null;
        modal.onclick = null;
        document.removeEventListener("keydown", onKey, true);
        previous?.focus?.();
        resolve(v);
      };
      const onKey = (e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          done(false);
        }
      };
      document.addEventListener("keydown", onKey, true);
      $("modalOk").onclick = () => done(true);
      $("modalCancel").onclick = () => done(false);
      modal.onclick = (e) => {
        if (e.target === modal) done(false);
      };
    });
  }

  /* ------------------------------------------------------------------
   * Auth
   * ------------------------------------------------------------------ */
  let authMode = "login";
  function setAuthMode(mode) {
    authMode = mode;
    const signup = mode === "signup";
    $("authNameField").hidden = !signup;
    $("authTitle").textContent = signup ? "Create your account" : "Sign in to your account";
    $("authDescription").textContent = signup
      ? "Join the circular network to schedule e-waste pickups and track impact."
      : "Enter your details to manage e-waste pickups and view certified impact.";
    $("authSubmit").innerHTML = signup
      ? `<span>Create account</span><svg class="i" style="width:16px;height:16px;"><use href="#i-arrow-right" /></svg>`
      : `<span>Sign in to EcoCycle</span><svg class="i" style="width:16px;height:16px;"><use href="#i-arrow-right" /></svg>`;
    $("authPassword").autocomplete = signup
      ? "new-password"
      : "current-password";
    $("authPassword").minLength = 8;
    $("authPassword").placeholder = signup
      ? "At least 8 characters"
      : "Enter your password";
    $("authRole").disabled = signup;
    if (signup) $("authRole").value = "user";
    for (const [id, active] of [
      ["loginTab", !signup],
      ["signupTab", signup],
    ]) {
      $(id).classList.toggle("is-active", active);
      $(id).setAttribute("aria-selected", String(active));
    }
    $("authMessage").textContent = "";
  }

  function showLanding(mode) {
    closeDrawer();
    $("app").hidden = true;
    if (mode === "auth") {
      if ($("landing")) $("landing").hidden = true;
      $("auth").hidden = false;
    } else {
      $("auth").hidden = true;
      if ($("landing")) $("landing").hidden = false;
    }
  }

  function openAuthGate(mode = "login") {
    showLanding("auth");
    setAuthMode(mode);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }

  async function startSession(profile) {
    await Promise.all([loadRequests(), loadParts()]);
    state.user = profile;
    if ($("landing")) $("landing").hidden = true;
    $("auth").hidden = true;
    $("app").hidden = false;
    $("avatar").textContent = initials(profile.name);
    $("topbarAvatar").textContent = initials(profile.name);
    $("topbarAvatar").title = `${profile.name} · ${profile.role === "admin" ? "Administrator" : "User"}`;
    $("accountName").textContent = profile.name;
    $("accountRole").textContent =
      profile.role === "admin" ? "Administrator" : "User";
    $("roleCaption").textContent =
      profile.role === "admin" ? "Operations" : "Collections";
    $("todayLabel").textContent = new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    buildNav();
    setupStaticControls();
    route();
  }

  async function endSession() {
    let logoutError = "";
    try {
      await localApi("/api/auth/logout", { method: "POST" });
    } catch (error) {
      logoutError = error.message;
    }
    state.user = null;
    state.requests = [];
    state.parts = [];
    closeDrawer();
    $("toasts").replaceChildren();
    $("app").hidden = true;
    $("auth").hidden = true;
    if ($("landing")) $("landing").hidden = false;
    $("authForm").reset();
    setAuthMode("login");
    $("authMessage").textContent = logoutError
      ? `Signed out on this page, but the server could not end the session: ${logoutError}`
      : "";
    history.replaceState(null, "", location.pathname);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }

  async function submitAuth(e) {
    e.preventDefault();
    const email = $("authEmail").value.trim().toLowerCase();
    const password = $("authPassword").value;
    const role = $("authRole").value;
    const msg = $("authMessage");
    if (authMode === "signup" && !$("authName").value.trim()) {
      msg.textContent = "Enter your full name.";
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msg.textContent = "Enter a valid email address.";
      return;
    }
    const minLength = authMode === "signup" ? 8 : 6;
    if (password.length < minLength) {
      msg.textContent = `Password must be at least ${minLength} characters.`;
      return;
    }
    const signup = authMode === "signup";
    const payload = signup
      ? { name: $("authName").value.trim(), email, password }
      : { email, password, role: $("authRole").value };
    const submit = $("authSubmit");
    submit.disabled = true;
    msg.textContent = "";
    try {
      const profile = await localApi(
        signup ? "/api/auth/register" : "/api/auth/login",
        { method: "POST", body: JSON.stringify(payload) },
      );
      await startSession(profile);
    } catch (error) {
      const raw = error.message || "";
      if (raw.toLowerCase().includes("invalid credentials")) {
        msg.textContent = "The email or password you entered is incorrect.";
      } else {
        msg.textContent = raw;
      }
    } finally {
      submit.disabled = false;
    }
  }

  /* ------------------------------------------------------------------
   * Navigation & routing
   * ------------------------------------------------------------------ */
  function buildNav() {
    const items = NAV[state.user.role];
    $("nav").innerHTML = items
      .map(
        (n) =>
          `<a href="#/${n.id}" data-nav="${n.id}">${icon(n.icon)}<span>${esc(n.label)}</span><span class="badge" data-badge="${n.id}" hidden></span></a>`,
      )
      .join("");
  }

  function updateBadges() {
    const el = document.querySelector('[data-badge="requests"]');
    const n = isAdmin()
      ? state.requests.filter((r) => r.status === "Pending").length
      : 0;
    if (el) {
      el.hidden = !n;
      el.textContent = n;
      el.title = n ? `${n} pending review` : "";
    }
    const topbarBadge = $("topbarBadge");
    topbarBadge.hidden = !n;
    topbarBadge.textContent = n > 9 ? "9+" : n;
    topbarBadge.title = n ? `${n} pending review` : "";
  }

  function currentHash() {
    return location.hash.replace(/^#\/?/, "").split("?")[0] || "overview";
  }

  function setNavOpen(open) {
    $("app").classList.toggle("nav-open", open);
    $("menuButton").setAttribute("aria-expanded", String(open));
    $("menuButton").setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation",
    );
    $("menuButton").innerHTML = icon(open ? "x" : "menu");
  }

  function route() {
    if (!state.user) return;
    const focusHeading =
      $("app").classList.contains("nav-open") &&
      window.matchMedia("(max-width: 860px)").matches;
    const allowed = NAV[state.user.role].map((n) => n.id);
    let view = currentHash();
    if (!allowed.includes(view)) view = "overview";
    state.view = view;
    document
      .querySelectorAll(".view")
      .forEach((s) => (s.hidden = s.id !== `view-${view}`));
    document.querySelectorAll("#nav a").forEach((a) => {
      if (a.dataset.nav === view) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    const t = TITLES[view];
    const title = typeof t === "string" ? t : t[state.user.role];
    $("pageTitle").textContent = title;
    document.title = `${title} – EcoCycle`;
    $("app").classList.toggle("is-overview", view === "overview");
    setNavOpen(false);
    updateBadges();
    if (view === "overview") renderOverview();
    if (view === "requests") renderRequests();
    if (view === "new") prepareForm();
    if (view === "categories") renderCategories();
    if (view === "parts") renderParts();
    if (view === "map") showMap();
    const main = $("main-content");
    if (main) main.setAttribute("tabindex", "-1");
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    if (focusHeading) $("pageTitle").focus();
    else if (main) main.focus({ preventScroll: true });
  }

  /* ------------------------------------------------------------------
   * Shared renderers
   * ------------------------------------------------------------------ */
  const pill = (status) =>
    `<span class="pill s-${sKey(status)}">${esc(status)}</span>`;

  function requestRow(r, withRequester) {
    const isOwner = !isAdmin() && String(r.email).toLowerCase() === state.user.email.toLowerCase();
    const canCancel = isOwner && r.status === "Pending";
    const canRemove = isAdmin() || isOwner;
    const catCode = CATEGORIES.find((c) => c.name === r.category)?.code || String(r.category || "OT").slice(0, 2).toUpperCase();
    return `<tr class="row-link" tabindex="0" data-open="${esc(r.id)}">
      <td><span class="id">${esc(displayId(r.id))}</span><span class="sub">${esc(fmtDate(r.createdAt))}</span></td>
      ${withRequester ? `<td class="col-requester"><strong>${esc(r.user)}</strong><span class="sub">${esc(r.email || "")}</span></td>` : ""}
      <td>
        <div style="display:flex;align-items:center;gap:9px;">
          <span class="cat-code" aria-hidden="true">${esc(catCode)}</span>
          <div><strong>${esc(r.category)}</strong>${r.qty > 1 ? `<span class="sub">Qty: ${esc(r.qty)}</span>` : ""}</div>
        </div>
      </td>
      <td class="method">${esc(r.method)}</td>
      <td class="num">${esc(fmtDate(r.date))}</td>
      <td class="col-location"><div class="clip" title="${esc(r.location)}">${esc(r.location)}</div></td>
      <td>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
          ${pill(r.status)}
          <div class="row-action-group">
            ${canCancel ? `<button class="btn btn-sm tbl-action-btn" type="button" data-cancel-row="${esc(r.id)}" title="Cancel request">Cancel</button>` : ""}
            ${canRemove ? `<button class="btn btn-sm btn-ghost-danger tbl-action-btn" type="button" data-delete-row="${esc(r.id)}" title="Remove request">Remove</button>` : ""}
          </div>
        </div>
      </td>
    </tr>`;
  }

  /* ------------------------------------------------------------------
   * Overview
   * ------------------------------------------------------------------ */
  function kpi(label, value, note) {
    const details = {
      "Total requests": ["list", "neutral"],
      "Total Requests": ["list", "neutral"],
      "My requests": ["list", "neutral"],
      "Awaiting review": ["clock", "amber"],
      "Awaiting Review": ["clock", "amber"],
      "In progress": ["trend", "blue"],
      "In Progress": ["trend", "blue"],
      Completed: ["check", "green"],
      "Rejected or cancelled": ["x", "rose"],
    };
    const [glyph, tone] = details[label] || ["box", "neutral"];
    return `<article class="kpi kpi-${tone}">
      <div class="kpi-top">
        <div class="kpi-value">${esc(value)}</div>
        <span class="kpi-status-icon" aria-hidden="true">${icon(glyph)}</span>
      </div>
      <div class="kpi-label">${esc(label)}</div>
      <div class="kpi-note">${esc(note)}</div>
    </article>`;
  }

  function animateCountUp(el, target, unitHtml = "", decimals = 0) {
    if (!el) return;
    const end = Number(target) || 0;
    const formatted = decimals > 0 ? (Math.round(end * 10 ** decimals) / 10 ** decimals) : Math.round(end);
    el.innerHTML = `${formatted}${unitHtml}`;
  }

  function runKpiCountUps() {}

  function weekBuckets(requests, weeks = 8) {
    const now = new Date();
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1),
    ); // Monday
    const buckets = [];
    for (let i = weeks - 1; i >= 0; i--) {
      const s = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() - i * 7,
      );
      const e = new Date(s.getFullYear(), s.getMonth(), s.getDate() + 7);
      buckets.push({ start: s, end: e, count: 0 });
    }
    for (const r of requests) {
      const t = new Date(r.createdAt).getTime();
      const b = buckets.find(
        (x) => t >= x.start.getTime() && t < x.end.getTime(),
      );
      if (b) b.count++;
    }
    return buckets;
  }

  function updateSustainabilityAndPipeline(mine, count, done) {
    // Environmental Calculations
    const totalWeight = mine.reduce((sum, r) => sum + (r.actualWeight || r.estimatedWeight || (r.qty || 1) * 2.8), 0);
    const completedWeight = mine.filter((r) => r.status === "Completed").reduce((sum, r) => sum + (r.actualWeight || r.estimatedWeight || (r.qty || 1) * 2.8), 0);
    const co2Saved = Math.round(completedWeight * 1.44);
    const metalsGrams = Math.round(completedWeight * 135);
    const recoveryRate = mine.length ? Math.round((done / mine.length) * 100) : 100;

    animateCountUp($("statEwaste"), Math.round(totalWeight * 10) / 10, "<small>kg</small>", 1);
    if ($("statEwasteSub")) $("statEwasteSub").textContent = `${mine.length} ${mine.length === 1 ? "request" : "requests"} tracked`;
    animateCountUp($("statCo2"), co2Saved, "<small>kg</small>", 0);
    if ($("statCo2Sub")) $("statCo2Sub").textContent = `${Math.round(completedWeight * 10) / 10} kg completed × 1.44`;
    animateCountUp($("statMetals"), metalsGrams, "<small>g</small>", 0);
    animateCountUp($("statRate"), recoveryRate, "<small>%</small>", 0);
    if ($("statRateSub")) $("statRateSub").textContent = `${done} of ${mine.length} completed`;
    if ($("impactCompletedText")) $("impactCompletedText").textContent = `${done} of ${mine.length} ${mine.length === 1 ? "request" : "requests"} completed`;
    if ($("impactProgressBar")) $("impactProgressBar").style.width = `${recoveryRate}%`;
    if ($("impactProgressPercent")) $("impactProgressPercent").textContent = `${recoveryRate}%`;
    if ($("recoveryStatusBadge")) {
      $("recoveryStatusBadge").hidden = mine.length === 0;
    }

    // Pipeline funnel
    const pipelineSteps = [
      { name: "Pending Review", status: "Pending", color: "#d97706" },
      { name: "Approved", status: "Approved", color: "#0284c7" },
      { name: "Scheduled", status: "Scheduled", color: "#334155" },
      { name: "Collected", status: "Collected", color: "#0d9488" },
      { name: "Processing", status: "Processing", color: "#64748b" },
      { name: "Completed", status: "Completed", color: "#059669" },
    ];

    if ($("pipelineTrack")) {
      $("pipelineTrack").innerHTML = pipelineSteps.map((step) => {
        const cnt = count((r) => r.status === step.status);
        return `<div class="pipeline-step" data-pipeline-status="${step.status}" style="--step-color: ${step.color}">
          <div class="pipeline-step-top">
            <span class="pipeline-step-num">${cnt}</span>
            <span class="pipeline-step-dot"></span>
          </div>
          <div class="pipeline-step-name">${step.name}</div>
        </div>`;
      }).join("");

      $("pipelineTrack").querySelectorAll(".pipeline-step").forEach((el) => {
        el.addEventListener("click", () => {
          const st = el.dataset.pipelineStatus;
          $("statusFilter").value = st;
          location_hash("#/requests");
        });
      });
    }
  }

  function renderOverview() {
    const mine = myRequests();
    const count = (fn) => mine.filter(fn).length;
    const pending = count((r) => r.status === "Pending");
    const active = count((r) => IN_PROGRESS.includes(r.status));
    const done = count((r) => r.status === "Completed");
    const adminView = isAdmin();

    updateSustainabilityAndPipeline(mine, count, done);

    if ($("overviewWelcomeGreeting") && state.user) {
      $("overviewWelcomeGreeting").textContent = getTimeGreeting(state.user.name);
    }
    if ($("overviewWelcomeSub")) {
      $("overviewWelcomeSub").textContent = adminView
        ? `${pending} pending review · ${active} in progress · ${done} completed`
        : "Here's what's happening with your recycling activity today.";
    }
    if ($("overviewSecondaryAction")) {
      $("overviewSecondaryAction").textContent = adminView ? "View All Requests" : "View My Requests";
    }
    if ($("overviewColumns")) {
      $("overviewColumns").classList.toggle("is-user", !adminView);
      $("overviewColumns").classList.toggle("is-admin", adminView);
    }
    if ($("impactRateCell")) $("impactRateCell").hidden = !adminView;
    if ($("pipelinePanel")) $("pipelinePanel").hidden = !adminView;
    if ($("overviewGrid")) $("overviewGrid").hidden = !adminView;
    if ($("overviewQuickActions")) $("overviewQuickActions").hidden = adminView;
    if ($("overviewPrimaryCol")) $("overviewPrimaryCol").hidden = adminView;

    if (adminView) {
      $("kpis").innerHTML =
        kpi("Total requests", mine.length, "All time") +
        kpi(
          "Awaiting review",
          pending,
          pending ? "Needs a decision" : "Queue is clear",
        ) +
        kpi("In progress", active, "Approved to processing") +
        kpi(
          "Completed",
          done,
          mine.length
            ? `${Math.round((done / mine.length) * 100)}% of all requests`
            : "No requests yet",
        ) +
        kpi(
          "Rejected or cancelled",
          count((r) => ["Rejected", "Cancelled"].includes(r.status)),
          "Closed without collection",
        );

      const statusCounts = STATUSES.map((s) => ({
        s,
        n: count((r) => r.status === s),
      }));
      const total = mine.length || 1;
      const byCat = Object.entries(
        mine.reduce(
          (a, r) => ((a[r.category] = (a[r.category] || 0) + 1), a),
          {},
        ),
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);
      const maxCat = Math.max(1, ...byCat.map((c) => c[1]));
      const weeks = weekBuckets(mine, 6);
      const maxWeek = Math.max(1, ...weeks.map((w) => w.count));
      const weekScale = Math.max(8, Math.ceil(maxWeek / 2) * 2);
      const statusColors = {
        Pending: "#d97706",
        Scheduled: "#334155",
        Processing: "#64748b",
        Rejected: "#dc2626",
        Approved: "#0284c7",
        Collected: "#0d9488",
        Completed: "#059669",
        Cancelled: "#94a3b8",
      };
      let statusStop = 0;
      const donutStops = statusCounts
        .filter((x) => x.n)
        .map((x) => {
          const start = statusStop;
          statusStop += (x.n / total) * 100;
          return `${statusColors[x.s]} ${start}% ${statusStop}%`;
        })
        .join(", ");
      const queue = mine
        .filter((r) => r.status === "Pending")
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .slice(0, 5);

      $("overviewGrid").innerHTML = `
        <section class="panel status-panel">
          <div class="panel-head"><h2>Requests by status</h2></div>
          <div class="panel-body status-content">
            <div class="donut-wrap">
              <div class="status-donut" role="img" aria-label="Status distribution: ${statusCounts.filter((x) => x.n).map((x) => `${x.n} ${x.s.toLowerCase()}`).join(", ") || "no requests"}" style="--donut:${donutStops || "#dce3ed 0% 100%"}">
                <div><strong>${mine.length}</strong><span>Total requests</span></div>
              </div>
            </div>
            <ul class="legend">
              ${statusCounts.filter((x) => x.n).map((x) => `<li><i style="--legend-color:${statusColors[x.s]}"></i><span>${esc(x.s)}</span><b>${x.n}</b><small>${Math.round((x.n / total) * 100)}%</small></li>`).join("")}
            </ul>
          </div>
        </section>
        <section class="panel">
          <div class="panel-head"><h2>Requests by category</h2><span class="panel-tag">Top ${byCat.length}</span></div>
          <div class="panel-body">
            ${byCat.length ? `<ul class="bars">${byCat.map(([n, c]) => {
              const code = CATEGORIES.find((category) => category.name === n)?.code || n.slice(0, 2).toUpperCase();
              return `<li class="category-bar">
                <span class="category-mark" aria-hidden="true">${esc(code)}</span>
                <span class="bar-label" title="${esc(n)}">${esc(n)}</span>
                <span class="bar-track"><span class="bar-fill" style="display:block;width:${(c / maxCat) * 100}%"></span></span>
                <span class="bar-val">${c}</span><small>${Math.round((c / total) * 100)}%</small>
              </li>`;
            }).join("")}</ul>` : `<p class="hint">No requests yet.</p>`}
          </div>
        </section>
        <section class="panel weekly-panel">
          <div class="panel-head"><h2>Requests per week</h2><span class="panel-tag">Last 6 weeks</span></div>
          <div class="panel-body weekly-body">
            <div class="weekly-chart" role="img" aria-label="Requests per week: ${weeks.map((w) => `${w.count} on week starting ${w.start.toLocaleDateString("en-IN")}`).join(", ")}">
              <div class="chart-axis">${[weekScale, weekScale * .75, weekScale * .5, weekScale * .25, 0].map((tick) => `<span>${Math.round(tick)}</span>`).join("")}</div>
              <div class="chart-plot">
                ${weeks.map((w) => `<div class="week-column"><b>${w.count || ""}</b><span style="height:${(w.count / weekScale) * 100}%"></span></div>`).join("")}
              </div>
            </div>
            <div class="week-labels">${weeks.map((w, i) => `<span>Week ${i + 1}</span>`).join("")}</div>
          </div>
        </section>
        <section class="panel flush">
          <div class="panel-head"><h2>Awaiting review</h2><a class="link queue-link" href="#/requests">Open tracker <span aria-hidden="true">→</span></a></div>
          ${
            queue.length
              ? `<ul class="queue">${queue
                  .map(
                    (r) => `
            <li>
              <span class="queue-icon" aria-hidden="true">${esc(CATEGORIES.find((category) => category.name === r.category)?.code || r.category.slice(0, 2).toUpperCase())}</span>
              <div class="queue-main" data-open="${esc(r.id)}" tabindex="0">
                <strong>${esc(r.category)} · ${esc(r.user)}</strong>
                <span>${esc(r.method)} · ${esc(fmtDate(r.date))} · ${esc(r.location)}</span>
              </div>
              <div class="queue-actions">
                <button class="btn btn-sm" type="button" data-quick="Approved" data-id="${esc(r.id)}">Approve</button>
                <button class="btn btn-sm btn-ghost-danger" type="button" data-quick="Rejected" data-id="${esc(r.id)}">Reject</button>
              </div>
            </li>`,
                  )
                  .join("")}</ul>`
              : `<div class="empty"><strong>No requests waiting</strong>New requests will appear here.</div>`
          }
        </section>`;
    } else {
      $("kpis").innerHTML =
        kpi("Total Requests", mine.length, "") +
        kpi("Awaiting Review", pending, "") +
        kpi("In Progress", active, "") +
        kpi("Completed", done, "");

      const recent = [...mine]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 5);

      if ($("overviewPrimaryCol")) {
        $("overviewPrimaryCol").innerHTML = `
          <section class="recent-requests-section" aria-label="Recent Requests">
            <div class="section-head-row">
              <div>
                <h2>Recent Requests</h2>
                <p class="section-sub">Track the latest recycling requests and their current status.</p>
              </div>
              <a class="text-link" href="#/requests">View all <span aria-hidden="true">→</span></a>
            </div>
            ${
              recent.length
                ? `<div class="recent-table-shell"><div class="table-wrap"><table class="tbl overview-recent-tbl">
                  <thead>
                    <tr>
                      <th scope="col">Request</th>
                      <th scope="col">Item</th>
                      <th scope="col">Status</th>
                      <th scope="col">Date</th>
                      <th scope="col" class="col-action">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${recent
                      .map((r) => {
                        const statusLabel = r.status === "Pending" ? "Awaiting Review" : r.status;
                        return `<tr class="row-link" tabindex="0" data-open="${esc(r.id)}">
                          <td><span class="id">${esc(displayId(r.id))}</span></td>
                          <td>
                            <span class="recent-item-name">${esc(r.category)}</span>
                          </td>
                          <td><span class="pill s-${sKey(r.status)}">${esc(statusLabel)}</span></td>
                          <td class="num recent-date-cell">${esc(fmtDate(r.date))}</td>
                          <td class="col-action">
                            <div class="row-action-group">
                              <button class="action-text-btn" type="button" data-open="${esc(r.id)}">View</button>
                              <button class="action-text-btn action-text-danger" type="button" data-delete-row="${esc(r.id)}">Remove</button>
                            </div>
                          </td>
                        </tr>`;
                      })
                      .join("")}
                  </tbody>
                </table></div></div>`
                : `<div class="empty-minimal"><strong>No recycling requests yet</strong><p>Submit a pickup or drop-off request to see your activity here.</p><a class="btn btn-primary btn-sm" href="#/new">+ New Request</a></div>`
            }
          </section>
        `;
      }
      if ($("overviewGrid")) $("overviewGrid").innerHTML = "";
    }
    runKpiCountUps($("kpis"));
  }

  /* ------------------------------------------------------------------
   * Requests list
   * ------------------------------------------------------------------ */
  let controlsReady = false;
  let activeTabFilter = "all";

  function setupStaticControls() {
    if (controlsReady) {
      refreshStatusFilter();
      return;
    }
    controlsReady = true;
    $("requestSearch").addEventListener("input", renderRequests);
    $("globalSearchForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const query = $("globalSearch").value.trim();
      if (!query) {
        $("globalSearch").focus();
        return;
      }
      $("requestSearch").value = query;
      if (state.view === "requests") renderRequests();
      else location_hash("#/requests");
    });
    $("statusFilter").addEventListener("change", () => {
      activeTabFilter = $("statusFilter").value;
      updateFilterTabsUI();
      renderRequests();
    });
    $("methodFilter").addEventListener("change", renderRequests);
    $("exportCsv").addEventListener("click", exportCsv);

    // Setup filter tab buttons
    const tabs = document.querySelectorAll("#requestFilterTabs .filter-tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        activeTabFilter = tab.dataset.status;
        updateFilterTabsUI();
        if (activeTabFilter === "all") {
          $("statusFilter").value = "all";
        } else if (activeTabFilter === "In Progress") {
          $("statusFilter").value = "all";
        } else {
          $("statusFilter").value = activeTabFilter;
        }
        renderRequests();
      });
    });

    refreshStatusFilter();
  }

  function updateFilterTabsUI() {
    const tabs = document.querySelectorAll("#requestFilterTabs .filter-tab");
    tabs.forEach((tab) => {
      tab.classList.toggle("is-active", tab.dataset.status === activeTabFilter);
    });
  }

  function refreshStatusFilter() {
    $("statusFilter").innerHTML =
      `<option value="all">All statuses</option>` +
      STATUSES.map((s) => `<option value="${s}">${s}</option>`).join("");
    $("exportCsv").hidden = !isAdmin();
    $("requestSearch").placeholder = isAdmin()
      ? "Search by name, item, location or ID"
      : "Search my requests";
  }

  function filteredRequests() {
    const q = $("requestSearch").value.trim().toLowerCase();
    const st = $("statusFilter").value;
    const me = $("methodFilter").value;
    return myRequests()
      .filter((r) => {
        if (activeTabFilter === "In Progress") {
          return IN_PROGRESS.includes(r.status);
        }
        if (activeTabFilter !== "all" && r.status !== activeTabFilter) {
          return false;
        }
        return (st === "all" || r.status === st) && (me === "all" || r.method === me);
      })
      .filter(
        (r) =>
          !q ||
          [
            displayId(r.id),
            r.id,
            r.user,
            r.email,
            r.category,
            r.location,
            r.method,
            r.status,
          ].some((f) =>
            String(f ?? "")
              .toLowerCase()
              .includes(q),
          ),
      )
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }

  function renderRequests() {
    const withReq = isAdmin();
    document.querySelector(".col-requester").hidden = !withReq;
    const rows = filteredRequests();
    const total = myRequests().length;
    const mine = myRequests();
    const count = (fn) => mine.filter(fn).length;

    // Update filter tab counters
    if ($("badgeAll")) $("badgeAll").textContent = total;
    if ($("badgePending")) $("badgePending").textContent = count((r) => r.status === "Pending");
    if ($("badgeActive")) $("badgeActive").textContent = count((r) => IN_PROGRESS.includes(r.status));
    if ($("badgeCompleted")) $("badgeCompleted").textContent = count((r) => r.status === "Completed");
    if ($("badgeCancelled")) $("badgeCancelled").textContent = count((r) => ["Rejected", "Cancelled"].includes(r.status));

    $("requestCount").textContent =
      `${rows.length} of ${total} ${total === 1 ? "request" : "requests"}`;
    $("requestsBody").innerHTML = rows.length
      ? rows.map((r) => requestRow(r, withReq)).join("")
      : `<tr><td colspan="${withReq ? 7 : 6}"><div class="empty"><strong>${total ? "No requests match these filters" : "No requests yet"}</strong>${total ? "Try clearing the search or status filter." : isAdmin() ? "Requests will appear here when users submit them." : 'Create your first request to get started.<br /><a class="btn btn-primary" href="#/new">New request</a>'}</div></td></tr>`;
    updateBadges();
  }

  function csvCell(v) {
    let s = String(v ?? "");
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // avoid spreadsheet formula execution
    return `"${s.replace(/"/g, '""')}"`;
  }
  function exportCsv() {
    const rows = filteredRequests();
    const head = [
      "Request ID",
      "Requester",
      "Email",
      "Phone",
      "Category",
      "Quantity",
      "Method",
      "Date",
      "Location",
      "Status",
      "Created",
      "Notes",
    ];
    const lines = [head.map(csvCell).join(",")].concat(
      rows.map((r) =>
        [
          displayId(r.id),
          r.user,
          r.email,
          r.phone,
          r.category,
          r.qty,
          r.method,
          r.date,
          r.location,
          r.status,
          r.createdAt,
          r.notes,
        ]
          .map(csvCell)
          .join(","),
      ),
    );
    const blob = new Blob(["﻿" + lines.join("\r\n")], {
      type: "text/csv;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ecocycle-requests-${todayISO()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast(
      `Exported ${rows.length} ${rows.length === 1 ? "request" : "requests"}`,
    );
  }

  /* ------------------------------------------------------------------
   * Drawer
   * ------------------------------------------------------------------ */
  let drawerReturnFocus = null;
  function openDrawer(id) {
    const r = findRequest(id);
    if (!r) return;
    if (
      !isAdmin() &&
      String(r.email).toLowerCase() !== state.user.email.toLowerCase()
    )
      return;
    state.openRequestId = r.id;
    drawerReturnFocus = document.activeElement;
    renderDrawer();
    $("drawerScrim").hidden = false;
    $("drawer").hidden = false;
    $("drawerClose").focus();
  }
  function closeDrawer() {
    if ($("drawer").hidden) return;
    $("drawer").hidden = true;
    $("drawerScrim").hidden = true;
    state.openRequestId = null;
    drawerReturnFocus?.focus?.();
  }
  function renderDrawer() {
    const r = findRequest(state.openRequestId);
    if (!r) return closeDrawer();
    $("drawerTitle").textContent = displayId(r.id);
    $("drawerSub").innerHTML = pill(r.status);
    const hist = [...(r.history || [])].reverse();
    const canCancel = !isAdmin() && r.status === "Pending";
    const estWeight = r.actualWeight || r.estimatedWeight || (r.qty || 1) * 2.8;

    $("drawerBody").innerHTML = `
      <dl class="dl">
        <dt>Requester</dt><dd><strong>${esc(r.user)}</strong><br /><span class="hint">${esc(r.email || "")}${r.phone ? ` · ${esc(r.phone)}` : ""}</span></dd>
        <dt>Category</dt><dd>${esc(r.category)}${r.qty ? ` · Quantity ${esc(r.qty)}` : ""}</dd>
        <dt>Method</dt><dd>${esc(r.method)}</dd>
        <dt>${r.method === "Drop-off" ? "Drop-off date" : "Pickup date"}</dt><dd>${esc(fmtDate(r.date))}</dd>
        <dt>${r.method === "Drop-off" ? "Drop-off point" : "Address"}</dt><dd>${esc(r.location)}</dd>
        ${r.notes ? `<dt>Notes</dt><dd>${esc(r.notes)}</dd>` : ""}
        <dt>Submitted</dt><dd>${esc(fmtDateTime(r.createdAt))}</dd>
      </dl>

      ${
        r.status === "Completed"
          ? `
        <div class="estimator-box" style="margin: 16px 0 20px;">
          <div class="estimator-head">
            <svg class="i"><use href="#i-check" /></svg>
            <span>Circularity & Recovery Certificate</span>
          </div>
          <div class="estimator-stats">
            <div class="estimator-stat"><strong>${estWeight} kg</strong><span>Materials Diverted</span></div>
            <div class="estimator-stat"><strong>${Math.round(estWeight * 1.44)} kg</strong><span>CO₂ Avoided</span></div>
            <div class="estimator-stat"><strong>${Math.round(estWeight * 120)} g</strong><span>Metals Recovered</span></div>
          </div>
        </div>`
          : ""
      }

      <h3>Tracking Timeline & Audit Log</h3>
      <ol class="timeline">
        ${hist.map((h) => `<li><strong>${esc(h.status)}</strong><small>${esc(fmtDateTime(h.at))}${h.by ? ` · by ${esc(h.by)}` : ""}${h.note ? ` (${esc(h.note)})` : ""}</small></li>`).join("")}
      </ol>

      ${
        isAdmin()
          ? `
        <h3>Update status</h3>
        <div class="manage">
          <label class="sr-only" for="drawerStatus">Status</label>
          <select id="drawerStatus">${STATUSES.map((s) => `<option ${s === r.status ? "selected" : ""}>${s}</option>`).join("")}</select>
          <button class="btn btn-primary" type="button" id="drawerSave">Save</button>
        </div>
        <div class="drawer-danger"><button class="btn btn-ghost-danger" type="button" id="drawerDelete">${icon("trash")}Delete request</button></div>`
          : canCancel
            ? `<div class="drawer-danger"><button class="btn btn-ghost-danger" type="button" id="drawerCancel">Cancel this request</button></div>`
            : ""
      }
    `;
  }

  async function setStatus(r, status) {
    if (r.status === status) return false;
    const updated = await localApi(`/api/requests/${encodeURIComponent(r.id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    const index = state.requests.findIndex(
      (request) => String(request.id) === String(updated.id),
    );
    if (index === -1) state.requests.unshift(updated);
    else state.requests[index] = updated;
    return true;
  }
  function afterChange(message) {
    updateBadges();
    if (state.view === "overview") renderOverview();
    if (state.view === "requests") renderRequests();
    if (!$("drawer").hidden) renderDrawer();
    toast(message);
  }

  /* ------------------------------------------------------------------
   * New request form
   * ------------------------------------------------------------------ */
  function selectedMethod() {
    return document.querySelector('input[name="fMethod"]:checked').value;
  }
  function applyMethod() {
    const drop = selectedMethod() === "Drop-off";
    $("fAddressField").hidden = drop;
    $("fDropField").hidden = !drop;
    $("fDateLabel").textContent = drop ? "Drop-off date" : "Pickup date";
  }
  let formControlsReady = false;

  function updateCategoryGuidance() {
    const catName = $("fCategory").value;
    const cat = CATEGORIES.find((c) => c.name === catName);
    const tipEl = $("categorySafetyTip");
    const tipText = $("categorySafetyText");
    if (tipEl && tipText) {
      if (cat && cat.note) {
        tipText.innerHTML = `<strong>${esc(cat.name)} safety note:</strong> ${esc(cat.note)}. Keep items intact and separate.`;
        tipEl.hidden = false;
      } else {
        tipEl.hidden = true;
      }
    }
    updateImpactEstimator();
  }

  function updateImpactEstimator() {
    const catName = $("fCategory")?.value;
    const qty = Math.max(1, parseInt($("fQty")?.value, 10) || 1);
    const catWeights = {
      Computers: 6.5,
      "Mobile phones": 0.3,
      Batteries: 0.5,
      Televisions: 14.0,
      Printers: 7.0,
      Cables: 0.8,
      "Game consoles": 3.2,
      "Audio equipment": 2.4,
      Cameras: 0.9,
      "Small appliances": 2.2,
      "Networking equipment": 1.1,
      Wearables: 0.2,
      "Lamps and lighting": 0.4,
      "Other small electronics": 0.6,
    };
    const avgW = catWeights[catName] || 2.5;
    const weight = Math.round(qty * avgW * 10) / 10;
    const co2 = Math.round(weight * 1.44 * 10) / 10;
    const metals = Math.round(weight * 125);

    if ($("estWeight")) $("estWeight").textContent = `~${weight} kg`;
    if ($("estCo2")) $("estCo2").textContent = `~${co2} kg CO₂`;
    if ($("estRecovered")) $("estRecovered").textContent = `~${metals} g`;
  }

  function prepareForm() {
    if (isAdmin()) return;
    $("fName").value = state.user.name;
    $("fEmail").value = state.user.email;
    $("fDate").min = todayISO();
    if (!$("fCategory").options.length) {
      $("fCategory").innerHTML = CATEGORIES.map(
        (c) => `<option>${esc(c.name)}</option>`,
      ).join("");
    }
    if (pendingDrop) {
      document.querySelector(
        'input[name="fMethod"][value="Drop-off"]',
      ).checked = true;
      $("fDrop").value = pendingDrop;
      pendingDrop = "";
    }
    if (pendingCategory) {
      $("fCategory").value = pendingCategory;
      pendingCategory = "";
    }
    applyMethod();
    $("requestError").textContent = "";

    if (!formControlsReady) {
      formControlsReady = true;
      $("fCategory").addEventListener("change", updateCategoryGuidance);
      $("fQty").addEventListener("input", updateImpactEstimator);

      // Wire quick date chips
      const chips = document.querySelectorAll("#quickDateChips .date-chip");
      chips.forEach((btn) => {
        btn.addEventListener("click", () => {
          const days = parseInt(btn.dataset.days, 10) || 1;
          const d = new Date();
          d.setDate(d.getDate() + days);
          $("fDate").value = d.toISOString().slice(0, 10);
        });
      });
    }

    updateCategoryGuidance();
  }
  let pendingDrop = "";
  let pendingCategory = "";

  async function submitRequest(e) {
    e.preventDefault();
    if (isAdmin()) return;
    const err = $("requestError");
    const method = selectedMethod();
    const date = $("fDate").value;
    const location = (
      method === "Drop-off" ? $("fDrop").value : $("fAddress").value
    ).trim();
    const qty = Math.max(1, Math.min(99, parseInt($("fQty").value, 10) || 1));
    if (!date) {
      err.textContent = "Choose a date.";
      $("fDate").focus();
      return;
    }
    if (date < todayISO()) {
      err.textContent = "The date can’t be in the past.";
      $("fDate").focus();
      return;
    }
    if (!location) {
      err.textContent =
        method === "Drop-off"
          ? "Enter or choose a drop-off point."
          : "Enter the pickup address.";
      (method === "Drop-off" ? $("fDrop") : $("fAddress")).focus();
      return;
    }
    err.textContent = "";
    const submit = $("requestForm").querySelector('[type="submit"]');
    submit.disabled = true;
    try {
      const request = await localApi("/api/requests", {
        method: "POST",
        body: JSON.stringify({
          method,
          date,
          location,
          qty,
          phone: $("fPhone").value.trim(),
          category: $("fCategory").value,
          notes: $("fNotes").value.trim(),
        }),
      });
      state.requests.unshift(request);
      $("requestForm").reset();
      $("fDrop").value = "";
      toast(`Request ${displayId(request.id)} submitted`);
      location_hash("#/requests");
    } catch (error) {
      err.textContent = `Could not submit request: ${error.message}`;
    } finally {
      submit.disabled = false;
    }
  }
  const location_hash = (h) => {
    window.location.hash = h;
  };

  /* ------------------------------------------------------------------
   * Categories
   * ------------------------------------------------------------------ */
  function renderCategories() {
    $("categoryBody").innerHTML = CATEGORIES.map(
      (c) => `<tr>
        <td>
          <div class="cat-cell">
            <span class="cat-code" aria-hidden="true">${esc(c.code)}</span>
            <div>
              <strong class="cat-name">${esc(c.name)}</strong>
              <span class="sub">~${esc(c.avgWeight)} kg/unit · ${esc(c.co2PerKg)} kg CO₂/kg</span>
            </div>
          </div>
        </td>
        <td>${esc(c.desc)}</td>
        <td class="method">${c.note ? `<span class="cat-note">${icon("alert")}<span>${esc(c.note)}</span></span>` : '<span class="sub">Standard handling</span>'}</td>
        <td class="actions">${isAdmin() ? "" : `<button class="btn btn-sm btn-primary" type="button" data-category="${esc(c.name)}">Request Pickup</button>`}</td>
      </tr>`,
    ).join("");
  }

  /* ------------------------------------------------------------------
   * Sell Parts & Razorpay Marketplace (#/parts)
   * ------------------------------------------------------------------ */
  const fmtInr = (val) => `₹${Number(val || 0).toLocaleString("en-IN")}`;

  function partStatusClass(status) {
    if (status === "Available") return "is-available";
    if (status === "Sold") return "is-sold";
    if (status === "Payout Settled") return "is-settled";
    return "";
  }

  function closeRzpModal() {
    const m = $("rzpModal");
    if (m) m.hidden = true;
  }

  function pdfEscape(str) {
    return String(str ?? "")
      .replace(/[^\x20-\x7E]/g, "-")
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");
  }

  function buildReceiptPdfBlob(part) {
    const amount = Number(part.paidAmountInr || part.priceInr || 0).toLocaleString("en-IN");
    const rows = [
      ["Receipt Status", part.status || "Sold"],
      ["Part Name", part.title || "-"],
      ["Category", `${part.partCategory || "-"} (${part.condition || "-"})`],
      ["Quantity", String(part.qty || 1)],
      ["Amount Paid", `INR ${amount}`],
      ["Payment Method", part.paymentMethod || "UPI"],
      ["Razorpay Order ID", part.razorpayOrderId || "-"],
      ["Razorpay Payment ID", part.razorpayPaymentId || "-"],
    ];
    if (part.payoutId) rows.push(["Payout ID", part.payoutId]);
    rows.push(["Seller", `${part.sellerName || "-"}${part.sellerUpi ? ` (${part.sellerUpi})` : ""}`]);
    rows.push(["Buyer", part.buyerName || "-"]);
    rows.push(["Paid At", fmtDateTime(part.paidAt) || new Date().toLocaleString("en-IN")]);

    const cmds = [
      "0.03 0.15 0.33 rg 40 735 515 62 re f",
      "1 1 1 rg BT /F2 16 Tf 58 770 Td (ECOCYCLE - RAZORPAY PAYMENT RECEIPT) Tj ET",
      "0.82 0.90 1 rg BT /F1 10 Tf 58 750 Td (Verified Transaction Receipt | Part #" + pdfEscape(part.id) + ") Tj ET",
      "0.88 0.90 0.92 RG 1 w 40 715 m 555 715 l S",
    ];
    let y = 690;
    for (const [label, val] of rows) {
      cmds.push(`0.35 0.42 0.48 rg BT /F2 10 Tf 50 ${y} Td (${pdfEscape(label)}) Tj ET`);
      cmds.push(`0.06 0.11 0.15 rg BT /F1 10 Tf 205 ${y} Td (${pdfEscape(val).slice(0, 66)}) Tj ET`);
      cmds.push(`0.93 0.95 0.96 RG 0.5 w 50 ${y - 9} m 545 ${y - 9} l S`);
      y -= 28;
    }
    cmds.push("0.45 0.52 0.58 rg BT /F1 9 Tf 50 72 Td (Generated by EcoCycle Parts Marketplace - Verified Razorpay INR Receipt) Tj ET");

    const stream = cmds.join("\n");
    const objs = [
      "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
      "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
      "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n",
      "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
      "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n",
      `6 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`,
    ];
    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    for (const o of objs) {
      offsets.push(pdf.length);
      pdf += o;
    }
    const xrefPos = pdf.length;
    pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i < offsets.length; i++) {
      pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
    return new Blob([pdf], { type: "application/pdf" });
  }

  function downloadPartReceipt(part) {
    const blob = buildReceiptPdfBlob(part);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `EcoCycle-Receipt-${part.razorpayPaymentId || part.id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast("Receipt PDF downloaded");
  }

  function openPartReceipt(part) {
    const modal = $("rzpModal");
    const body = $("rzpModalBody");
    const title = $("rzpModalTitle");
    const meta = $("rzpOrderMeta");
    const modePill = $("rzpModePill");
    if (!modal || !body) return;

    title.textContent = "Razorpay Payment Receipt";
    meta.textContent = `Part #${part.id}`;
    modePill.textContent = part.status.toUpperCase();

    body.innerHTML = `
      <div class="rzp-summary">
        <div>
          <div style="font-size:12px;color:var(--muted);">${esc(part.title)}</div>
          <div style="font-size:12px;color:var(--muted);margin-top:2px;">Seller: ${esc(part.sellerName)}${part.sellerUpi ? ` (${esc(part.sellerUpi)})` : ""}</div>
        </div>
        <strong>${fmtInr(part.paidAmountInr || part.priceInr)}</strong>
      </div>
      <div class="rzp-receipt-box">
        <div class="rzp-receipt-row"><span>Status</span><strong>${esc(part.status)}</strong></div>
        <div class="rzp-receipt-row"><span>Razorpay Order ID</span><code>${esc(part.razorpayOrderId || "—")}</code></div>
        <div class="rzp-receipt-row"><span>Razorpay Payment ID</span><code>${esc(part.razorpayPaymentId || "—")}</code></div>
        ${part.payoutId ? `<div class="rzp-receipt-row"><span>Payout ID</span><code>${esc(part.payoutId)}</code></div>` : ""}
        <div class="rzp-receipt-row"><span>Payment Method</span><strong>${esc(part.paymentMethod || "UPI")}</strong></div>
        <div class="rzp-receipt-row"><span>Buyer</span><strong>${esc(part.buyerName || "—")}</strong></div>
        <div class="rzp-receipt-row"><span>Paid At</span><span>${esc(fmtDateTime(part.paidAt) || "—")}</span></div>
      </div>
      <div class="modal-actions">
        <button class="btn" type="button" id="rzpDownloadReceiptBtn">
          <svg class="i"><use href="#i-download"/></svg>
          <span>Download Receipt</span>
        </button>
        <button class="btn btn-primary" type="button" id="rzpDoneBtn">Close Receipt</button>
      </div>
    `;
    modal.hidden = false;
    $("rzpDownloadReceiptBtn")?.addEventListener("click", () => downloadPartReceipt(part));
    $("rzpDoneBtn")?.addEventListener("click", closeRzpModal);
  }

  async function finalizeRazorpayPayment(partId, payload) {
    const updated = await localApi(`/api/parts/${encodeURIComponent(partId)}/razorpay/verify`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    updated.id = updated.id || updated.numericId || updated._id;
    const idx = state.parts.findIndex((p) => String(p.id) === String(updated.id));
    if (idx === -1) state.parts.unshift(updated);
    else state.parts[idx] = updated;
    renderParts();
    toast(`Payment verified via Razorpay (${updated.razorpayPaymentId})`);
    openPartReceipt(updated);
  }

  async function openRazorpayCheckout(partId) {
    const part = state.parts.find((p) => String(p.id) === String(partId));
    if (!part) return;
    try {
      const order = await localApi(`/api/parts/${encodeURIComponent(part.id)}/razorpay/order`, {
        method: "POST",
        body: JSON.stringify({}),
      });

      // Use official Razorpay Checkout popup when live/test Razorpay keys are configured
      if (order.mode === "razorpay_api" && typeof window.Razorpay === "function") {
        const rzp = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency || "INR",
          name: "EcoCycle Circular Parts",
          description: part.title,
          order_id: order.orderId,
          prefill: {
            name: state.user?.name || "",
            email: state.user?.email || "",
          },
          theme: { color: "#0f8a6a" },
          handler: async (response) => {
            try {
              await finalizeRazorpayPayment(part.id, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                paymentMethod: "Razorpay Checkout",
              });
            } catch (err) {
              toast(`Payment verification failed: ${err.message}`, "error");
            }
          },
        });
        rzp.open();
        return;
      }

      // Built-in Razorpay Test Checkout Modal
      const modal = $("rzpModal");
      const body = $("rzpModalBody");
      $("rzpModalTitle").textContent = "Razorpay Checkout";
      $("rzpOrderMeta").textContent = `Order ${order.orderId}`;
      $("rzpModePill").textContent = "TEST MODE";

      let selectedPayMethod = "UPI";
      const detectCardNetwork = (digits) => {
        if (/^4/.test(digits)) return "VISA";
        if (/^(5[1-5]|2[2-7])/.test(digits)) return "MASTERCARD";
        if (/^3[47]/.test(digits)) return "AMEX";
        if (/^(60|6521|6522|508)/.test(digits)) return "RUPAY";
        return "CARD";
      };
      const BANK_DEFAULT_IFSC = {
        "HDFC Bank": "HDFC0001234",
        "State Bank of India (SBI)": "SBIN0001122",
        "ICICI Bank": "ICIC0000456",
        "Axis Bank": "UTIB0000789",
        "Kotak Mahindra Bank": "KKBK0000321",
        "Punjab National Bank": "PUNB0123400",
        "Bank of Baroda": "BARB0JAIPUR",
      };

      body.innerHTML = `
        <div class="rzp-summary">
          <div>
            <strong class="rzp-summary-title">${esc(part.title)}</strong>
            <small class="rzp-summary-sub">Qty: ${esc(part.qty)} · Seller: ${esc(part.sellerName)}</small>
          </div>
          <strong class="rzp-summary-amount">${fmtInr(part.priceInr)}</strong>
        </div>

        <div>
          <label class="rzp-section-label">Choose Payment Method</label>
          <div class="rzp-methods" id="rzpMethods">
            <button type="button" class="rzp-method-btn is-active" data-rzp-method="UPI">
              <strong>UPI / QR</strong>
              <small>GPay, PhonePe, Paytm</small>
            </button>
            <button type="button" class="rzp-method-btn" data-rzp-method="Debit Card">
              <strong>Debit Card</strong>
              <small>Visa, Mastercard, RuPay</small>
            </button>
            <button type="button" class="rzp-method-btn" data-rzp-method="Credit Card">
              <strong>Credit Card</strong>
              <small>Visa, Mastercard, Amex</small>
            </button>
            <button type="button" class="rzp-method-btn" data-rzp-method="Bank Transfer">
              <strong>Netbanking / Bank</strong>
              <small>Bank Account, IFSC, NEFT</small>
            </button>
          </div>
        </div>

        <div class="rzp-card-panel" id="rzpInputField">
          <div class="rzp-card-panel-head">
            <span id="rzpPayInputLabel">UPI ID</span>
            <span class="rzp-card-brand">INSTANT</span>
          </div>
          <div class="field">
            <input id="rzpPayInput" type="text" value="deepak@okaxis" placeholder="name@okbank" aria-label="UPI ID" />
          </div>
          <div class="rzp-quick-chips" id="rzpUpiChips">
            <button type="button" class="rzp-chip" data-upi-handle="@okaxis">@okaxis</button>
            <button type="button" class="rzp-chip" data-upi-handle="@okicici">@okicici</button>
            <button type="button" class="rzp-chip" data-upi-handle="@ybl">@ybl</button>
            <button type="button" class="rzp-chip" data-upi-handle="@paytm">@paytm</button>
          </div>
        </div>

        <div class="rzp-card-panel" id="rzpCardFields" hidden>
          <div class="rzp-card-panel-head">
            <span id="rzpCardPanelTitle">Debit Card Details</span>
            <span class="rzp-card-brand" id="rzpCardBrand">VISA</span>
          </div>
          <div class="field">
            <label for="rzpCardNumber" id="rzpCardNumberLabel">Card Number</label>
            <input id="rzpCardNumber" type="text" inputmode="numeric" maxlength="19" autocomplete="cc-number" value="4111 1111 1111 1111" placeholder="XXXX XXXX XXXX XXXX" />
          </div>
          <div class="rzp-card-grid">
            <div class="field">
              <label for="rzpCardExpiry">Expiry (MM/YY)</label>
              <input id="rzpCardExpiry" type="text" inputmode="numeric" maxlength="5" autocomplete="cc-exp" value="12/28" placeholder="MM/YY" />
            </div>
            <div class="field">
              <label for="rzpCardCvv">CVV</label>
              <input id="rzpCardCvv" type="password" inputmode="numeric" maxlength="4" autocomplete="cc-csc" value="123" placeholder="123" />
            </div>
          </div>
          <div class="field">
            <label for="rzpCardHolder">Cardholder Name</label>
            <input id="rzpCardHolder" type="text" autocomplete="cc-name" value="${esc(state.user?.name || "Deepak")}" placeholder="Name on card" />
          </div>
        </div>

        <div class="rzp-card-panel" id="rzpBankFields" hidden>
          <div class="rzp-card-panel-head">
            <span>Bank Account & Netbanking Details</span>
            <span class="rzp-card-brand">NEFT / IMPS</span>
          </div>
          <div class="rzp-quick-chips" id="rzpBankChips">
            <button type="button" class="rzp-chip is-selected" data-bank-pick="HDFC Bank">HDFC</button>
            <button type="button" class="rzp-chip" data-bank-pick="State Bank of India (SBI)">SBI</button>
            <button type="button" class="rzp-chip" data-bank-pick="ICICI Bank">ICICI</button>
            <button type="button" class="rzp-chip" data-bank-pick="Axis Bank">Axis</button>
            <button type="button" class="rzp-chip" data-bank-pick="Kotak Mahindra Bank">Kotak</button>
          </div>
          <div class="field">
            <label for="rzpBankName">Bank Name</label>
            <select id="rzpBankName">
              ${Object.keys(BANK_DEFAULT_IFSC).map((b) => `<option value="${esc(b)}">${esc(b)}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label for="rzpBankHolder">Account Holder Name</label>
            <input id="rzpBankHolder" type="text" value="${esc(state.user?.name || "Deepak")}" placeholder="Full name as on bank account" />
          </div>
          <div class="rzp-card-grid">
            <div class="field">
              <label for="rzpBankAccount">Account Number</label>
              <input id="rzpBankAccount" type="text" inputmode="numeric" maxlength="22" value="5010 0482 1923" placeholder="9–18 digit account no." />
            </div>
            <div class="field">
              <label for="rzpBankIfsc">IFSC Code</label>
              <input id="rzpBankIfsc" type="text" maxlength="11" value="HDFC0001234" placeholder="e.g. HDFC0001234" style="text-transform:uppercase;" />
            </div>
          </div>
        </div>

        <p class="form-error" id="rzpErr" role="alert"></p>

        <div class="rzp-secure-note">
          <svg class="i"><use href="#i-shield"/></svg>
          <span>256-bit TLS encrypted · Instant Razorpay order verification</span>
        </div>

        <div class="modal-actions" style="margin-top:2px;">
          <button class="btn" type="button" id="rzpCancelBtn">Cancel</button>
          <button class="btn btn-rzp" type="button" id="rzpPayNowBtn">Pay ${fmtInr(part.priceInr)}</button>
        </div>
      `;

      modal.hidden = false;

      const updateBrandBadge = () => {
        const digits = ($("rzpCardNumber")?.value || "").replace(/\D/g, "");
        if ($("rzpCardBrand")) $("rzpCardBrand").textContent = detectCardNetwork(digits);
      };

      $("rzpCardNumber")?.addEventListener("input", (e) => {
        const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
        e.target.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
        updateBrandBadge();
      });

      $("rzpCardExpiry")?.addEventListener("input", (e) => {
        const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
        e.target.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
      });

      $("rzpCardCvv")?.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
      });

      $("rzpBankAccount")?.addEventListener("input", (e) => {
        const digits = e.target.value.replace(/\D/g, "").slice(0, 18);
        e.target.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
      });

      $("rzpBankIfsc")?.addEventListener("input", (e) => {
        e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11);
      });

      const selectBank = (bankName) => {
        if ($("rzpBankName")) $("rzpBankName").value = bankName;
        if ($("rzpBankIfsc") && BANK_DEFAULT_IFSC[bankName]) {
          $("rzpBankIfsc").value = BANK_DEFAULT_IFSC[bankName];
        }
        body.querySelectorAll("[data-bank-pick]").forEach((chip) => {
          chip.classList.toggle("is-selected", chip.dataset.bankPick === bankName);
        });
      };

      $("rzpBankName")?.addEventListener("change", (e) => {
        selectBank(e.target.value);
      });

      body.querySelectorAll("[data-bank-pick]").forEach((chip) => {
        chip.addEventListener("click", () => selectBank(chip.dataset.bankPick));
      });

      body.querySelectorAll("[data-upi-handle]").forEach((chip) => {
        chip.addEventListener("click", () => {
          const inp = $("rzpPayInput");
          if (!inp) return;
          const prefix = inp.value.split("@")[0].trim() || "deepak";
          inp.value = `${prefix}${chip.dataset.upiHandle}`;
          inp.focus();
        });
      });

      const syncMethodFields = () => {
        const isCard = selectedPayMethod === "Debit Card" || selectedPayMethod === "Credit Card";
        const isBank = selectedPayMethod === "Bank Transfer";
        const upiPanel = $("rzpInputField");
        const cardFields = $("rzpCardFields");
        const bankFields = $("rzpBankFields");
        if (upiPanel) upiPanel.hidden = isCard || isBank;
        if (cardFields) cardFields.hidden = !isCard;
        if (bankFields) bankFields.hidden = !isBank;

        if (isCard) {
          if ($("rzpCardPanelTitle")) $("rzpCardPanelTitle").textContent = `${selectedPayMethod} Details`;
          const cardInp = $("rzpCardNumber");
          if (cardInp && (!cardInp.value.trim() || cardInp.value === "4111 1111 1111 1111" || cardInp.value === "5555 5555 5555 4444")) {
            cardInp.value = selectedPayMethod === "Credit Card" ? "5555 5555 5555 4444" : "4111 1111 1111 1111";
          }
          updateBrandBadge();
          return;
        }

        if (isBank) {
          return;
        }

        const lbl = $("rzpPayInputLabel");
        const inp = $("rzpPayInput");
        if (lbl) lbl.textContent = "UPI ID";
        if (inp && !inp.value.trim()) inp.value = "deepak@okaxis";
        if (inp) inp.placeholder = "name@okbank";
      };

      syncMethodFields();

      body.querySelectorAll("[data-rzp-method]").forEach((btn) => {
        btn.addEventListener("click", () => {
          selectedPayMethod = btn.dataset.rzpMethod;
          body.querySelectorAll("[data-rzp-method]").forEach((b) =>
            b.classList.toggle("is-active", b === btn),
          );
          $("rzpErr").textContent = "";
          syncMethodFields();
        });
      });

      $("rzpCancelBtn").addEventListener("click", closeRzpModal);
      $("rzpPayNowBtn").addEventListener("click", async () => {
        const payBtn = $("rzpPayNowBtn");
        const errEl = $("rzpErr");
        const isCard = selectedPayMethod === "Debit Card" || selectedPayMethod === "Credit Card";
        const isBank = selectedPayMethod === "Bank Transfer";
        let methodSummary = selectedPayMethod;

        if (isCard) {
          const digits = ($("rzpCardNumber")?.value || "").replace(/\D/g, "");
          const expiry = ($("rzpCardExpiry")?.value || "").trim();
          const cvv = ($("rzpCardCvv")?.value || "").replace(/\D/g, "");
          const holder = ($("rzpCardHolder")?.value || "").trim();
          if (digits.length < 12 || digits.length > 19) {
            errEl.textContent = `Enter a valid ${selectedPayMethod.toLowerCase()} number.`;
            return;
          }
          if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
            errEl.textContent = "Enter card expiry in MM/YY format.";
            return;
          }
          if (cvv.length < 3 || cvv.length > 4) {
            errEl.textContent = "Enter a valid 3 or 4 digit CVV.";
            return;
          }
          if (!holder) {
            errEl.textContent = "Enter the cardholder name.";
            return;
          }
          methodSummary = `${selectedPayMethod} (•••• ${digits.slice(-4)})`;
        } else if (isBank) {
          const bankName = ($("rzpBankName")?.value || "").trim();
          const holder = ($("rzpBankHolder")?.value || "").trim();
          const acctDigits = ($("rzpBankAccount")?.value || "").replace(/\D/g, "");
          const ifsc = ($("rzpBankIfsc")?.value || "").trim().toUpperCase();
          if (!bankName) {
            errEl.textContent = "Select a bank to continue.";
            return;
          }
          if (!holder) {
            errEl.textContent = "Enter the bank account holder name.";
            return;
          }
          if (acctDigits.length < 9 || acctDigits.length > 18) {
            errEl.textContent = "Enter a valid 9 to 18 digit bank account number.";
            return;
          }
          if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
            errEl.textContent = "Enter a valid 11-character IFSC code (e.g. HDFC0001234).";
            return;
          }
          methodSummary = `Bank Transfer · ${bankName} (•••• ${acctDigits.slice(-4)} · ${ifsc})`;
        } else if (!($("rzpPayInput")?.value || "").trim() || !$("rzpPayInput").value.includes("@")) {
          errEl.textContent = "Enter a valid UPI ID (e.g. name@okbank).";
          return;
        } else {
          methodSummary = `UPI (${$("rzpPayInput").value.trim()})`;
        }

        payBtn.disabled = true;
        payBtn.textContent = "Verifying with Razorpay…";
        errEl.textContent = "";
        try {
          await new Promise((r) => setTimeout(r, 450));
          await finalizeRazorpayPayment(part.id, {
            razorpay_order_id: order.orderId,
            simulatedPayment: true,
            paymentMethod: methodSummary,
          });
        } catch (err) {
          errEl.textContent = err.message;
          payBtn.disabled = false;
          payBtn.textContent = `Pay ${fmtInr(part.priceInr)}`;
        }
      });
    } catch (err) {
      toast(`Could not start Razorpay checkout: ${err.message}`, "error");
    }
  }

  function getFilteredParts() {
    const me = (state.user?.email || "").toLowerCase();
    const allParts = state.parts || [];
    const myListings = allParts.filter(
      (p) => String(p.sellerEmail || "").toLowerCase() === me || String(p.buyerEmail || "").toLowerCase() === me,
    );
    const q = state.partsSearch.trim().toLowerCase();
    const baseList = state.partsTab === "mine" ? myListings : allParts;
    return baseList.filter((p) => {
      if (state.partsFilterCat !== "all" && p.partCategory !== state.partsFilterCat) return false;
      if (state.partsFilterStatus !== "all" && p.status !== state.partsFilterStatus) return false;
      if (
        q &&
        ![p.title, p.partCategory, p.location, p.sellerName, p.description, p.condition, p.razorpayPaymentId]
          .some((f) => String(f || "").toLowerCase().includes(q))
      ) {
        return false;
      }
      return true;
    });
  }

  function renderPartRow(p) {
    const me = (state.user?.email || "").toLowerCase();
    const isSeller = String(p.sellerEmail || "").toLowerCase() === me;
    const isBuyer = String(p.buyerEmail || "").toLowerCase() === me;
    const isAvailable = p.status === "Available";
    const canBuy = isAvailable;
    const canSettlePayout = isAdmin() && p.status === "Sold";
    const canRemove = isAdmin() || isSeller || isBuyer;
    const metaSub = p.razorpayPaymentId
      ? `Paid · ${p.razorpayPaymentId}`
      : p.sellerUpi
        ? `UPI: ${p.sellerUpi}`
        : "Razorpay protected";

    return `
      <tr class="part-row" data-part-id="${esc(p.id)}">
        <td class="part-col-title" data-label="Part">
          <strong>${esc(p.title)}</strong>
          <span class="part-row-desc">${esc(p.description || "Verified salvaged electronic component ready for reuse or recovery.")}</span>
          <span class="part-row-ref">${esc(metaSub)}</span>
        </td>
        <td data-label="Category"><span class="part-cat-pill">${esc(p.partCategory)}</span></td>
        <td data-label="Condition">${esc(p.condition)}</td>
        <td class="num" data-label="Qty">${esc(p.qty)}</td>
        <td data-label="Location">${esc(p.location)}</td>
        <td data-label="Seller">${esc(p.sellerName)}${isSeller ? " (You)" : ""}</td>
        <td class="num part-col-price" data-label="Price"><strong>${fmtInr(p.priceInr)}</strong></td>
        <td data-label="Status"><span class="part-status-pill ${partStatusClass(p.status)}">${esc(p.status)}</span></td>
        <td class="part-col-actions" data-label="Actions">
          <div class="part-actions">
            ${canBuy ? `<button class="btn btn-sm btn-rzp" type="button" data-buy-part="${esc(p.id)}">Buy with Razorpay</button>` : ""}
            ${p.razorpayPaymentId ? `<button class="btn btn-sm" type="button" data-receipt-part="${esc(p.id)}">Receipt</button>` : ""}
            ${canSettlePayout ? `<button class="btn btn-sm btn-primary" type="button" data-payout-part="${esc(p.id)}">Settle Payout</button>` : ""}
            ${canRemove ? `<button class="btn btn-sm btn-ghost-danger" type="button" data-delete-part="${esc(p.id)}">Remove</button>` : ""}
          </div>
        </td>
      </tr>
    `;
  }

  function renderPartsResults() {
    const resultsHost = $("partsResultsHost");
    if (!resultsHost) return;
    const filtered = getFilteredParts();
    const countEl = $("partsToolbarCount");
    if (countEl) {
      countEl.textContent = `${filtered.length} ${filtered.length === 1 ? "part" : "parts"}`;
    }
    if (!filtered.length) {
      const hasFilters =
        state.partsSearch.trim() !== "" ||
        state.partsFilterCat !== "all" ||
        state.partsFilterStatus !== "all";
      resultsHost.innerHTML = `
        <div class="panel">
          <div class="empty">
            <strong>No matching parts found</strong>
            Try clearing your filters or list a new part to sell.
            <div class="empty-actions">
              ${hasFilters ? `<button class="btn" type="button" id="partsResetFiltersBtn">Clear filters</button>` : ""}
              <button class="btn btn-primary" type="button" id="emptySellBtn">+ Sell a Part</button>
            </div>
          </div>
        </div>
      `;
      return;
    }

    resultsHost.innerHTML = `
      <div class="panel flush">
        <div class="table-wrap">
          <table class="tbl parts-tbl">
            <thead>
              <tr>
                <th scope="col">Part</th>
                <th scope="col">Category</th>
                <th scope="col">Condition</th>
                <th scope="col">Qty</th>
                <th scope="col">Location</th>
                <th scope="col">Seller</th>
                <th scope="col">Price</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>${filtered.map(renderPartRow).join("")}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderParts() {
    const host = $("partsContainer");
    if (!host) return;
    const me = (state.user?.email || "").toLowerCase();
    const allParts = state.parts || [];
    const availableParts = allParts.filter((p) => p.status === "Available");
    const myListings = allParts.filter(
      (p) => String(p.sellerEmail || "").toLowerCase() === me || String(p.buyerEmail || "").toLowerCase() === me,
    );
    const myEarnings = allParts
      .filter(
        (p) =>
          String(p.sellerEmail || "").toLowerCase() === me &&
          ["Sold", "Payout Settled"].includes(p.status),
      )
      .reduce((acc, p) => acc + Number(p.paidAmountInr || p.priceInr || 0), 0);
    const rzpModeLabel = state.razorpayConfig?.hasLiveKeys
      ? "Razorpay Live API"
      : "Razorpay Test Checkout";

    host.innerHTML = `
      <div class="parts-hero">
        <div>
          <h2>Parts Marketplace</h2>
          <p>List tested electronic components for sale or purchase available parts via Razorpay checkout.</p>
        </div>
        <div>
          <button class="btn btn-primary" type="button" id="partsQuickSellBtn">
            <svg class="i"><use href="#i-plus"/></svg>
            <span>List a Part</span>
          </button>
        </div>
      </div>

      <div class="parts-stats">
        <div class="parts-stat-card">
          <small>Marketplace</small>
          <strong>${availableParts.length} Available</strong>
          <span>${allParts.length} total parts listed</span>
        </div>
        <div class="parts-stat-card">
          <small>My Activity</small>
          <strong>${myListings.length} Listings</strong>
          <span>Selling & purchased parts</span>
        </div>
        <div class="parts-stat-card">
          <small>My Razorpay Earnings</small>
          <strong>${fmtInr(myEarnings)}</strong>
          <span>From sold & settled parts</span>
        </div>
        <div class="parts-stat-card">
          <small>Payment Gateway</small>
          <strong>${esc(rzpModeLabel)}</strong>
          <span>INR (₹) · HMAC-SHA256 verified</span>
        </div>
      </div>

      <div class="filter-tabs" role="tablist" aria-label="Parts sections">
        <button class="filter-tab ${state.partsTab === "market" ? "is-active" : ""}" data-parts-tab="market" type="button">
          Marketplace <span class="tab-badge">${allParts.length}</span>
        </button>
        <button class="filter-tab ${state.partsTab === "sell" ? "is-active" : ""}" data-parts-tab="sell" type="button">
          + Sell a Part
        </button>
        <button class="filter-tab ${state.partsTab === "mine" ? "is-active" : ""}" data-parts-tab="mine" type="button">
          My Listings & Purchases <span class="tab-badge">${myListings.length}</span>
        </button>
      </div>

      ${
        state.partsTab === "sell"
          ? `
        <div class="split">
          <div class="panel">
            <div class="panel-head"><h2>List a part for sale</h2></div>
            <form class="form form-grid" id="sellPartForm" novalidate>
              <div class="field span-2">
                <label for="pTitle">Part name & model</label>
                <input id="pTitle" type="text" placeholder="e.g. Samsung 8GB DDR4 Laptop RAM" required />
              </div>
              <div class="field">
                <label for="pCategory">Part category</label>
                <select id="pCategory">
                  ${PART_CATEGORIES.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join("")}
                </select>
              </div>
              <div class="field">
                <label for="pCondition">Condition</label>
                <select id="pCondition">
                  ${PART_CONDITIONS.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join("")}
                </select>
              </div>
              <div class="field">
                <label for="pQty">Quantity</label>
                <input id="pQty" type="number" min="1" max="99" value="1" />
              </div>
              <div class="field">
                <label for="pPrice">Asking price (INR ₹)</label>
                <input id="pPrice" type="number" min="10" max="500000" value="1200" />
                <small class="hint" id="pSuggestedHint">Suggested estimate: ₹1,200</small>
              </div>
              <div class="field">
                <label for="pUpi">Your UPI ID (for Razorpay payout)</label>
                <input id="pUpi" type="text" placeholder="e.g. deepak@okaxis" />
              </div>
              <div class="field">
                <label for="pLocation">Pickup city / area</label>
                <input id="pLocation" type="text" placeholder="e.g. Malviya Nagar, Jaipur" />
              </div>
              <div class="field span-2">
                <label for="pDesc">Specs & notes (optional)</label>
                <textarea id="pDesc" rows="2" placeholder="Test status, compatibility, warranty or salvage notes"></textarea>
              </div>
              <p class="form-error span-2" id="sellPartError" role="alert"></p>
              <div class="form-actions span-2">
                <button class="btn btn-primary" type="submit">Publish Part Listing</button>
                <button class="btn" type="button" id="sellPartCancelBtn">Back to Marketplace</button>
              </div>
            </form>
          </div>
          <aside class="panel aside-note">
            <div class="panel-head"><h2>How Razorpay Selling Works</h2></div>
            <ul class="check-list">
              <li>Enter your part details, tested condition, asking price in ₹, and your UPI ID.</li>
              <li>Buyers or EcoCycle Buyback Hubs pay securely using <strong>Razorpay Checkout</strong> (UPI, Card, Netbanking).</li>
              <li>Every purchase creates a verified <code>order_...</code> and <code>pay_...</code> receipt, and payouts settle directly to your UPI.</li>
            </ul>
          </aside>
        </div>`
          : `
        <div class="toolbar">
          <div class="search">
            <svg class="i"><use href="#i-search" /></svg>
            <input id="partsSearchInput" type="search" value="${esc(state.partsSearch)}" placeholder="Search parts, specs, seller or city..." aria-label="Search parts" />
          </div>
          <select id="partsCatFilter" aria-label="Filter by part category">
            <option value="all">All part categories</option>
            ${PART_CATEGORIES.map((c) => `<option value="${esc(c)}" ${state.partsFilterCat === c ? "selected" : ""}>${esc(c)}</option>`).join("")}
          </select>
          <select id="partsStatusFilter" aria-label="Filter by listing status">
            <option value="all">All statuses</option>
            ${["Available", "Sold", "Payout Settled"].map((s) => `<option value="${esc(s)}" ${state.partsFilterStatus === s ? "selected" : ""}>${esc(s)}</option>`).join("")}
          </select>
          <span class="toolbar-count" id="partsToolbarCount"></span>
        </div>
        <div id="partsResultsHost"></div>`
      }
    `;

    // Render initial filtered list without recreating toolbar or losing search focus
    if (state.partsTab !== "sell") {
      renderPartsResults();
    }

    // Wire interactive controls inside #view-parts
    $("partsQuickSellBtn")?.addEventListener("click", () => {
      state.partsTab = "sell";
      renderParts();
    });
    $("sellPartCancelBtn")?.addEventListener("click", () => {
      state.partsTab = "market";
      renderParts();
    });
    host.querySelectorAll("[data-parts-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.partsTab = btn.dataset.partsTab;
        renderParts();
      });
    });

    const searchInp = $("partsSearchInput");
    if (searchInp) {
      searchInp.addEventListener("input", () => {
        state.partsSearch = searchInp.value;
        renderPartsResults();
      });
    }
    $("partsCatFilter")?.addEventListener("change", (e) => {
      state.partsFilterCat = e.target.value;
      renderPartsResults();
    });
    $("partsStatusFilter")?.addEventListener("change", (e) => {
      state.partsFilterStatus = e.target.value;
      renderPartsResults();
    });

    const pCat = $("pCategory");
    const pCond = $("pCondition");
    const pQty = $("pQty");
    const updateSuggestedPrice = () => {
      if (!pCat || !$("pPrice")) return;
      const base = PART_SUGGESTED_PRICES[pCat.value] || 800;
      const mult =
        pCond.value === "Working / Tested"
          ? 1
          : pCond.value === "Refurbishable"
            ? 0.65
            : 0.35;
      const qtyNum = Math.max(1, parseInt(pQty?.value, 10) || 1);
      const suggested = Math.round(base * mult * qtyNum);
      $("pPrice").value = suggested;
      if ($("pSuggestedHint")) {
        $("pSuggestedHint").textContent = `Suggested estimate: ${fmtInr(suggested)}`;
      }
    };
    pCat?.addEventListener("change", updateSuggestedPrice);
    pCond?.addEventListener("change", updateSuggestedPrice);
    pQty?.addEventListener("input", updateSuggestedPrice);

    $("sellPartForm")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const err = $("sellPartError");
      const title = $("pTitle").value.trim();
      const priceInr = Number($("pPrice").value);
      const location = $("pLocation").value.trim();
      if (!title) {
        err.textContent = "Please enter the part name or model.";
        $("pTitle").focus();
        return;
      }
      if (!Number.isFinite(priceInr) || priceInr < 10) {
        err.textContent = "Enter a valid asking price (minimum ₹10).";
        $("pPrice").focus();
        return;
      }
      if (!location) {
        err.textContent = "Enter your city or pickup location.";
        $("pLocation").focus();
        return;
      }
      err.textContent = "";
      const btn = e.target.querySelector('[type="submit"]');
      btn.disabled = true;
      try {
        const created = await localApi("/api/parts", {
          method: "POST",
          body: JSON.stringify({
            title,
            partCategory: $("pCategory").value,
            condition: $("pCondition").value,
            qty: Math.max(1, parseInt($("pQty").value, 10) || 1),
            priceInr,
            sellerUpi: $("pUpi").value.trim(),
            location,
            description: $("pDesc").value.trim(),
          }),
        });
        created.id = created.id || created.numericId || created._id;
        state.parts.unshift(created);
        state.partsTab = "market";
        renderParts();
        toast(`Part "${created.title}" listed for ${fmtInr(created.priceInr)}`);
      } catch (error) {
        err.textContent = error.message;
      } finally {
        btn.disabled = false;
      }
    });

    $("partsResultsHost")?.addEventListener("click", async (e) => {
      const target = e.target instanceof Element ? e.target : null;
      if (!target) return;

      if (target.closest("#emptySellBtn")) {
        state.partsTab = "sell";
        renderParts();
        return;
      }
      if (target.closest("#partsResetFiltersBtn")) {
        state.partsSearch = "";
        state.partsFilterCat = "all";
        state.partsFilterStatus = "all";
        if ($("partsSearchInput")) $("partsSearchInput").value = "";
        if ($("partsCatFilter")) $("partsCatFilter").value = "all";
        if ($("partsStatusFilter")) $("partsStatusFilter").value = "all";
        renderPartsResults();
        return;
      }

      const buyBtn = target.closest("[data-buy-part]");
      if (buyBtn) {
        openRazorpayCheckout(buyBtn.dataset.buyPart);
        return;
      }

      const receiptBtn = target.closest("[data-receipt-part]");
      if (receiptBtn) {
        const p = state.parts.find((x) => String(x.id) === String(receiptBtn.dataset.receiptPart));
        if (p) openPartReceipt(p);
        return;
      }

      const payoutBtn = target.closest("[data-payout-part]");
      if (payoutBtn) {
        const id = payoutBtn.dataset.payoutPart;
        try {
          const updated = await localApi(`/api/parts/${encodeURIComponent(id)}/payout`, {
            method: "POST",
            body: JSON.stringify({}),
          });
          updated.id = updated.id || updated.numericId || updated._id;
          const idx = state.parts.findIndex((p) => String(p.id) === String(updated.id));
          if (idx !== -1) state.parts[idx] = updated;
          renderParts();
          toast(`Razorpay payout settled (${updated.payoutId})`);
          openPartReceipt(updated);
        } catch (err) {
          toast(`Could not settle payout: ${err.message}`, "error");
        }
        return;
      }

      const deleteBtn = target.closest("[data-delete-part]");
      if (deleteBtn) {
        const id = deleteBtn.dataset.deletePart;
        const ok = await confirmDialog({
          title: "Remove part listing?",
          text: "This listing will be removed from the marketplace.",
          confirmLabel: "Remove",
        });
        if (!ok) return;
        try {
          await localApi(`/api/parts/${encodeURIComponent(id)}`, { method: "DELETE" });
          state.parts = state.parts.filter((p) => String(p.id) !== String(id));
          renderParts();
          toast("Part listing removed");
        } catch (err) {
          toast(`Could not remove listing: ${err.message}`, "error");
        }
      }
    });
  }

  /* ------------------------------------------------------------------
   * Map (Pure Leaflet JS Library - Zero External API Dependencies)
   * ------------------------------------------------------------------ */
  const KINDS = {
    recycling: {
      label: "Recycling point",
      color: "#0f8a6a",
      cls: "k-recycling",
    },
    shop: { label: "Electronics shop", color: "#2b6cb0", cls: "k-shop" },
    scrap: { label: "Scrap yard", color: "#b7791f", cls: "k-scrap" },
  };

  // 100% Client-side coordinate index for Indian cities & regions
  const CITY_COORDS = {
    allindia: { latitude: 22.5, longitude: 79.0, label: "All India", zoom: 5, allIndia: true },
    india: { latitude: 22.5, longitude: 79.0, label: "All India", zoom: 5, allIndia: true },
    jaipur: { latitude: 26.9124, longitude: 75.7873, label: "Jaipur, Rajasthan" },
    jodhpur: { latitude: 26.2389, longitude: 73.0243, label: "Jodhpur, Rajasthan" },
    udaipur: { latitude: 24.5854, longitude: 73.7125, label: "Udaipur, Rajasthan" },
    kota: { latitude: 25.2138, longitude: 75.8648, label: "Kota, Rajasthan" },
    delhi: { latitude: 28.6139, longitude: 77.2090, label: "Delhi NCR" },
    newdelhi: { latitude: 28.6139, longitude: 77.2090, label: "New Delhi" },
    ncr: { latitude: 28.6139, longitude: 77.2090, label: "Delhi NCR" },
    gurugram: { latitude: 28.4595, longitude: 77.0266, label: "Gurugram, Haryana" },
    gurgaon: { latitude: 28.4595, longitude: 77.0266, label: "Gurugram, Haryana" },
    noida: { latitude: 28.5355, longitude: 77.3910, label: "Noida, Uttar Pradesh" },
    faridabad: { latitude: 28.4089, longitude: 77.3178, label: "Faridabad, Haryana" },
    ghaziabad: { latitude: 28.6692, longitude: 77.4538, label: "Ghaziabad, UP" },
    mumbai: { latitude: 19.0760, longitude: 72.8777, label: "Mumbai, Maharashtra" },
    bombay: { latitude: 19.0760, longitude: 72.8777, label: "Mumbai, Maharashtra" },
    navimumbai: { latitude: 19.0330, longitude: 73.0297, label: "Navi Mumbai" },
    thane: { latitude: 19.2183, longitude: 72.9781, label: "Thane, Maharashtra" },
    bengaluru: { latitude: 12.9716, longitude: 77.5946, label: "Bengaluru, Karnataka" },
    bangalore: { latitude: 12.9716, longitude: 77.5946, label: "Bengaluru, Karnataka" },
    mysuru: { latitude: 12.2958, longitude: 76.6394, label: "Mysuru, Karnataka" },
    mysore: { latitude: 12.2958, longitude: 76.6394, label: "Mysuru, Karnataka" },
    mangaluru: { latitude: 12.9141, longitude: 74.8560, label: "Mangaluru, Karnataka" },
    mangalore: { latitude: 12.9141, longitude: 74.8560, label: "Mangaluru, Karnataka" },
    hubballi: { latitude: 15.3647, longitude: 75.1240, label: "Hubballi, Karnataka" },
    chennai: { latitude: 13.0827, longitude: 80.2707, label: "Chennai, Tamil Nadu" },
    madras: { latitude: 13.0827, longitude: 80.2707, label: "Chennai, Tamil Nadu" },
    madurai: { latitude: 9.9252, longitude: 78.1198, label: "Madurai, Tamil Nadu" },
    trichy: { latitude: 10.7905, longitude: 78.7047, label: "Tiruchirappalli, Tamil Nadu" },
    tiruchirappalli: { latitude: 10.7905, longitude: 78.7047, label: "Tiruchirappalli, Tamil Nadu" },
    kolkata: { latitude: 22.5726, longitude: 88.3639, label: "Kolkata, West Bengal" },
    calcutta: { latitude: 22.5726, longitude: 88.3639, label: "Kolkata, West Bengal" },
    siliguri: { latitude: 26.7271, longitude: 88.3953, label: "Siliguri, West Bengal" },
    hyderabad: { latitude: 17.3850, longitude: 78.4867, label: "Hyderabad, Telangana" },
    secunderabad: { latitude: 17.4399, longitude: 78.4983, label: "Secunderabad, Telangana" },
    warangal: { latitude: 17.9689, longitude: 79.5941, label: "Warangal, Telangana" },
    pune: { latitude: 18.5204, longitude: 73.8567, label: "Pune, Maharashtra" },
    nashik: { latitude: 19.9975, longitude: 73.7898, label: "Nashik, Maharashtra" },
    aurangabad: { latitude: 19.8762, longitude: 75.3433, label: "Chhatrapati Sambhajinagar, Maharashtra" },
    lucknow: { latitude: 26.8467, longitude: 80.9462, label: "Lucknow, Uttar Pradesh" },
    prayagraj: { latitude: 25.4358, longitude: 81.8463, label: "Prayagraj, UP" },
    allahabad: { latitude: 25.4358, longitude: 81.8463, label: "Prayagraj, UP" },
    ahmedabad: { latitude: 23.0225, longitude: 72.5714, label: "Ahmedabad, Gujarat" },
    vadodara: { latitude: 22.3072, longitude: 73.1812, label: "Vadodara, Gujarat" },
    baroda: { latitude: 22.3072, longitude: 73.1812, label: "Vadodara, Gujarat" },
    rajkot: { latitude: 22.3039, longitude: 70.8022, label: "Rajkot, Gujarat" },
    chandigarh: { latitude: 30.7333, longitude: 76.7794, label: "Chandigarh" },
    amritsar: { latitude: 31.6340, longitude: 74.8723, label: "Amritsar, Punjab" },
    ludhiana: { latitude: 30.9010, longitude: 75.8573, label: "Ludhiana, Punjab" },
    dehradun: { latitude: 30.3165, longitude: 78.0322, label: "Dehradun, Uttarakhand" },
    shimla: { latitude: 31.1048, longitude: 77.1734, label: "Shimla, Himachal Pradesh" },
    jammu: { latitude: 32.7266, longitude: 74.8570, label: "Jammu, J&K" },
    srinagar: { latitude: 34.0837, longitude: 74.7973, label: "Srinagar, J&K" },
    indore: { latitude: 22.7196, longitude: 75.8577, label: "Indore, Madhya Pradesh" },
    bhopal: { latitude: 23.2599, longitude: 77.4126, label: "Bhopal, Madhya Pradesh" },
    jabalpur: { latitude: 23.1815, longitude: 79.9864, label: "Jabalpur, Madhya Pradesh" },
    surat: { latitude: 21.1702, longitude: 72.8311, label: "Surat, Gujarat" },
    nagpur: { latitude: 21.1458, longitude: 79.0882, label: "Nagpur, Maharashtra" },
    patna: { latitude: 25.5941, longitude: 85.1376, label: "Patna, Bihar" },
    ranchi: { latitude: 23.3441, longitude: 85.3096, label: "Ranchi, Jharkhand" },
    jamshedpur: { latitude: 22.8046, longitude: 86.2029, label: "Jamshedpur, Jharkhand" },
    bhubaneswar: { latitude: 20.2961, longitude: 85.8245, label: "Bhubaneswar, Odisha" },
    raipur: { latitude: 21.2514, longitude: 81.6296, label: "Raipur, Chhattisgarh" },
    guwahati: { latitude: 26.1445, longitude: 91.7362, label: "Guwahati, Assam" },
    shillong: { latitude: 25.5788, longitude: 91.8933, label: "Shillong, Meghalaya" },
    agartala: { latitude: 23.8315, longitude: 91.2868, label: "Agartala, Tripura" },
    imphal: { latitude: 24.8170, longitude: 93.9368, label: "Imphal, Manipur" },
    gangtok: { latitude: 27.3314, longitude: 88.6138, label: "Gangtok, Sikkim" },
    goa: { latitude: 15.4909, longitude: 73.8278, label: "Panaji, Goa" },
    panaji: { latitude: 15.4909, longitude: 73.8278, label: "Panaji, Goa" },
    kochi: { latitude: 9.9312, longitude: 76.2673, label: "Kochi, Kerala" },
    trivandrum: { latitude: 8.5241, longitude: 76.9366, label: "Thiruvananthapuram, Kerala" },
    thiruvananthapuram: { latitude: 8.5241, longitude: 76.9366, label: "Thiruvananthapuram, Kerala" },
    kozhikode: { latitude: 11.2588, longitude: 75.7804, label: "Kozhikode, Kerala" },
    coimbatore: { latitude: 11.0168, longitude: 76.9558, label: "Coimbatore, Tamil Nadu" },
    visakhapatnam: { latitude: 17.6868, longitude: 83.2185, label: "Visakhapatnam, Andhra Pradesh" },
    vizag: { latitude: 17.6868, longitude: 83.2185, label: "Visakhapatnam, Andhra Pradesh" },
    vijayawada: { latitude: 16.5062, longitude: 80.6480, label: "Vijayawada, Andhra Pradesh" },
    tirupati: { latitude: 13.6288, longitude: 79.4192, label: "Tirupati, Andhra Pradesh" },
    varanasi: { latitude: 25.3176, longitude: 82.9739, label: "Varanasi, UP" },
    kanpur: { latitude: 26.4499, longitude: 80.3319, label: "Kanpur, UP" },
    agra: { latitude: 27.1767, longitude: 78.0081, label: "Agra, UP" },
  };

  const PIN_3_CITY = {
    "110": "delhi", "122": "gurugram", "141": "ludhiana", "143": "amritsar",
    "160": "chandigarh", "171": "shimla", "180": "jammu", "190": "srinagar",
    "201": "noida", "208": "kanpur", "211": "prayagraj", "221": "varanasi",
    "226": "lucknow", "248": "dehradun", "282": "agra", "302": "jaipur",
    "303": "jaipur", "313": "udaipur", "324": "kota", "342": "jodhpur",
    "360": "rajkot", "380": "ahmedabad", "382": "ahmedabad", "390": "vadodara",
    "394": "surat", "395": "surat", "400": "mumbai", "401": "mumbai",
    "403": "goa", "411": "pune", "422": "nashik", "431": "aurangabad",
    "440": "nagpur", "452": "indore", "462": "bhopal", "482": "jabalpur",
    "492": "raipur", "500": "hyderabad", "506": "warangal", "517": "tirupati",
    "520": "vijayawada", "530": "visakhapatnam", "560": "bengaluru", "570": "mysuru",
    "575": "mangaluru", "580": "hubballi", "600": "chennai", "620": "trichy",
    "625": "madurai", "641": "coimbatore", "673": "kozhikode", "682": "kochi",
    "683": "kochi", "695": "trivandrum", "700": "kolkata", "711": "kolkata",
    "734": "siliguri", "737": "gangtok", "751": "bhubaneswar", "781": "guwahati",
    "793": "shillong", "795": "imphal", "799": "agartala", "800": "patna",
    "831": "jamshedpur", "834": "ranchi",
  };
  const PIN_2_CITY = {
    "11": "delhi", "12": "gurugram", "13": "chandigarh", "14": "ludhiana",
    "16": "chandigarh", "17": "shimla", "18": "jammu", "19": "srinagar",
    "20": "noida", "21": "prayagraj", "22": "lucknow", "24": "dehradun",
    "28": "agra", "30": "jaipur", "31": "udaipur", "32": "kota", "34": "jodhpur",
    "36": "rajkot", "38": "ahmedabad", "39": "surat", "40": "mumbai",
    "41": "pune", "42": "nashik", "43": "aurangabad", "44": "nagpur",
    "45": "indore", "46": "bhopal", "48": "jabalpur", "49": "raipur",
    "50": "hyderabad", "51": "tirupati", "52": "vijayawada", "53": "visakhapatnam",
    "56": "bengaluru", "57": "mysuru", "58": "hubballi", "60": "chennai",
    "62": "madurai", "64": "coimbatore", "67": "kozhikode", "68": "kochi",
    "69": "trivandrum", "70": "kolkata", "71": "kolkata", "73": "siliguri",
    "75": "bhubaneswar", "78": "guwahati", "79": "shillong", "80": "patna",
    "83": "ranchi",
  };

  // Pure client-side database of drop-off points, recycling hubs & scrap yards
  const LOCAL_PLACES = [
    // --- JAIPUR ---
    {
      key: "jp_cert_1",
      name: "EcoCycle Certified Hub - Jaipur Central",
      address: "Plot 42, Malviya Industrial Area, Jaipur, Rajasthan 302017",
      city: "jaipur",
      kind: "recycling",
      lat: 26.8524,
      lon: 75.8074,
      phone: "+91 98765 43210",
      hours: "Mon - Sat: 9:00 AM - 6:30 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=26.8524,75.8074",
    },
    {
      key: "jp_cert_2",
      name: "Pink City E-Waste Reclamation Point",
      address: "Road No. 5, Vishwakarma Industrial Area (VKIA), Jaipur 302013",
      city: "jaipur",
      kind: "recycling",
      lat: 26.9856,
      lon: 75.7689,
      phone: "+91 98765 43214",
      hours: "Mon - Sat: 9:30 AM - 7:00 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=26.9856,75.7689",
    },
    {
      key: "jp_shop_1",
      name: "Reliance Digital E-Waste Drop Box",
      address: "World Trade Park, Malviya Nagar, JLN Marg, Jaipur 302017",
      city: "jaipur",
      kind: "shop",
      lat: 26.8538,
      lon: 75.8052,
      phone: "+91 141 272 8800",
      hours: "Everyday: 10:30 AM - 9:30 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=26.8538,75.8052",
    },
    {
      key: "jp_shop_2",
      name: "C-Scheme Electronics Care & Exchange",
      address: "Mirza Ismail Road, near Raj Mandir Cinema, C-Scheme, Jaipur 302001",
      city: "jaipur",
      kind: "shop",
      lat: 26.9182,
      lon: 75.8091,
      phone: "+91 98290 11223",
      hours: "Mon - Sat: 10:00 AM - 8:30 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=26.9182,75.8091",
    },
    {
      key: "jp_scrap_1",
      name: "Sitapura Industrial Scrap & Recovery Depot",
      address: "RIICO Industrial Area, Phase III, Sitapura, Jaipur 302022",
      city: "jaipur",
      kind: "scrap",
      lat: 26.7725,
      lon: 75.8451,
      phone: "+91 94140 55667",
      hours: "Mon - Sat: 8:30 AM - 5:30 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=26.7725,75.8451",
    },
    {
      key: "jp_rec_3",
      name: "Mansarovar Clean E-Waste Collection Post",
      address: "Sector 7, Madhyam Marg, Mansarovar, Jaipur 302020",
      city: "jaipur",
      kind: "recycling",
      lat: 26.8612,
      lon: 75.7645,
      phone: "+91 98765 43230",
      hours: "Mon - Sat: 9:00 AM - 6:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=26.8612,75.7645",
    },

    // --- DELHI NCR ---
    {
      key: "delhi_cert_1",
      name: "EcoCycle Capital Circular Hub - Okhla",
      address: "Phase II, Okhla Industrial Area, New Delhi 110020",
      city: "delhi",
      kind: "recycling",
      lat: 28.5355,
      lon: 77.2732,
      phone: "+91 98765 43215",
      hours: "Mon - Sat: 9:00 AM - 7:00 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=28.5355,77.2732",
    },
    {
      key: "delhi_cert_2",
      name: "Green Earth Recycling & Recovery Centre",
      address: "Sector 18, Electronic City, Gurugram, Delhi NCR 122015",
      city: "delhi",
      kind: "recycling",
      lat: 28.4985,
      lon: 77.0818,
      phone: "+91 98765 43211",
      hours: "Mon - Sat: 9:00 AM - 6:30 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=28.4985,77.0818",
    },
    {
      key: "delhi_cert_3",
      name: "NCR E-Waste & Electronics Collection Station",
      address: "Sector 62, Electronic City, Noida, UP 201309",
      city: "delhi",
      kind: "recycling",
      lat: 28.6280,
      lon: 77.3649,
      phone: "+91 98765 43216",
      hours: "Mon - Sat: 9:30 AM - 6:30 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=28.6280,77.3649",
    },
    {
      key: "delhi_scrap_1",
      name: "Mayapuri Metal & E-Scrap Hub",
      address: "Mayapuri Industrial Area Phase 1, New Delhi 110064",
      city: "delhi",
      kind: "scrap",
      lat: 28.6321,
      lon: 77.1265,
      phone: "+91 11 2811 4455",
      hours: "Mon - Sat: 9:00 AM - 6:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=28.6321,77.1265",
    },
    {
      key: "delhi_shop_1",
      name: "Nehru Place Electronics Recycle Center",
      address: "Devika Tower, Nehru Place, New Delhi 110019",
      city: "delhi",
      kind: "shop",
      lat: 28.5491,
      lon: 77.2533,
      phone: "+91 11 4160 8899",
      hours: "Mon - Sat: 10:00 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=28.5491,77.2533",
    },

    // --- MUMBAI ---
    {
      key: "mum_cert_1",
      name: "Mumbai E-Waste Reclamation Facility",
      address: "MIDC Industrial Area, Andheri East, Mumbai 400093",
      city: "mumbai",
      kind: "recycling",
      lat: 19.1136,
      lon: 72.8697,
      phone: "+91 98765 43213",
      hours: "Mon - Sat: 9:00 AM - 6:30 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=19.1136,72.8697",
    },
    {
      key: "mum_cert_2",
      name: "Kopar Khairane CleanTech Recovery Unit",
      address: "TTC Industrial Area, MIDC Kopar Khairane, Navi Mumbai 400709",
      city: "mumbai",
      kind: "recycling",
      lat: 19.1025,
      lon: 73.0112,
      phone: "+91 98765 43218",
      hours: "Mon - Sat: 9:00 AM - 6:00 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=19.1025,73.0112",
    },
    {
      key: "mum_scrap_1",
      name: "Kurla Industrial E-Scrap Reclamation Yard",
      address: "LBS Marg, Kurla West, Mumbai 400070",
      city: "mumbai",
      kind: "scrap",
      lat: 19.0682,
      lon: 72.8795,
      phone: "+91 22 2650 3344",
      hours: "Mon - Sat: 8:30 AM - 6:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=19.0682,72.8795",
    },
    {
      key: "mum_shop_1",
      name: "Vijay Sales Electronic Return Depot",
      address: "Veer Savarkar Marg, Prabhadevi, Dadar, Mumbai 400025",
      city: "mumbai",
      kind: "shop",
      lat: 19.0178,
      lon: 72.8291,
      phone: "+91 22 2437 1122",
      hours: "Everyday: 10:30 AM - 9:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=19.0178,72.8291",
    },

    // --- BENGALURU ---
    {
      key: "blr_cert_1",
      name: "EcoTech Electronic Scrap & Circular Hub",
      address: "Peenya Industrial Area 2nd Stage, Bengaluru 560058",
      city: "bengaluru",
      kind: "recycling",
      lat: 13.0285,
      lon: 77.5192,
      phone: "+91 98765 43212",
      hours: "Mon - Sat: 9:00 AM - 6:30 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=13.0285,77.5192",
    },
    {
      key: "blr_cert_2",
      name: "Silicon Plateau E-Waste Depot - Whitefield",
      address: "EPIP Zone, Whitefield, Bengaluru 560066",
      city: "bengaluru",
      kind: "recycling",
      lat: 12.9840,
      lon: 77.7290,
      phone: "+91 98765 43217",
      hours: "Mon - Sat: 9:00 AM - 6:00 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=12.9840,77.7290",
    },
    {
      key: "blr_shop_1",
      name: "SP Road Component Recycling & Exchange",
      address: "Sadhu Muthu Road, SP Road Cross, Bengaluru 560002",
      city: "bengaluru",
      kind: "shop",
      lat: 12.9641,
      lon: 77.5855,
      phone: "+91 80 2222 5566",
      hours: "Mon - Sat: 10:30 AM - 8:30 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=12.9641,77.5855",
    },

    // --- CHENNAI ---
    {
      key: "chn_cert_1",
      name: "Coromandel Green Recycling Depot",
      address: "Guindy Industrial Estate, Chennai 600032",
      city: "chennai",
      kind: "recycling",
      lat: 13.0067,
      lon: 80.2023,
      phone: "+91 98765 43219",
      hours: "Mon - Sat: 9:00 AM - 6:30 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=13.0067,80.2023",
    },
    {
      key: "chn_shop_1",
      name: "Ritchie Street E-Recycle Exchange",
      address: "Mount Road, Narasingapuram, Ritchie Street, Chennai 600002",
      city: "chennai",
      kind: "shop",
      lat: 13.0691,
      lon: 80.2711,
      phone: "+91 44 2855 3322",
      hours: "Mon - Sat: 10:00 AM - 8:30 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=13.0691,80.2711",
    },

    // --- KOLKATA ---
    {
      key: "kol_cert_1",
      name: "Bengal Circular Materials Facility",
      address: "Sector V, Salt Lake, Kolkata 700091",
      city: "kolkata",
      kind: "recycling",
      lat: 22.5802,
      lon: 88.4312,
      phone: "+91 98765 43221",
      hours: "Mon - Sat: 9:00 AM - 6:00 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=22.5802,88.4312",
    },
    {
      key: "kol_scrap_1",
      name: "Howrah Industrial Metal & Scrap Terminal",
      address: "Foreshore Road, Shibpur, Howrah 711102",
      city: "kolkata",
      kind: "scrap",
      lat: 22.5614,
      lon: 88.3242,
      phone: "+91 33 2660 7788",
      hours: "Mon - Sat: 8:30 AM - 5:30 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=22.5614,88.3242",
    },

    // --- HYDERABAD ---
    {
      key: "hyd_cert_1",
      name: "Cyberabad E-Waste Recovery Hub",
      address: "Madhapur, HITEC City, Hyderabad 500081",
      city: "hyderabad",
      kind: "recycling",
      lat: 17.4435,
      lon: 78.3772,
      phone: "+91 98765 43222",
      hours: "Mon - Sat: 9:00 AM - 6:30 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=17.4435,78.3772",
    },
    {
      key: "hyd_scrap_1",
      name: "Sanathnagar Industrial E-Scrap Yard",
      address: "Sanathnagar Industrial Area, Hyderabad 500018",
      city: "hyderabad",
      kind: "scrap",
      lat: 17.4582,
      lon: 78.4389,
      phone: "+91 40 2381 4455",
      hours: "Mon - Sat: 9:00 AM - 6:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=17.4582,78.4389",
    },

    // --- PUNE ---
    {
      key: "pune_cert_1",
      name: "Pune Eco-Recycle Facility",
      address: "MIDC Bhosari, Pimpri-Chinchwad, Pune 411026",
      city: "pune",
      kind: "recycling",
      lat: 18.6298,
      lon: 73.8441,
      phone: "+91 98765 43224",
      hours: "Mon - Sat: 9:00 AM - 6:30 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=18.6298,73.8441",
    },

    // --- AHMEDABAD ---
    {
      key: "ahm_cert_1",
      name: "Gujarat CleanTech & Metals Hub",
      address: "GIDC Industrial Estate, Vatva, Ahmedabad 382445",
      city: "ahmedabad",
      kind: "recycling",
      lat: 22.9567,
      lon: 72.6312,
      phone: "+91 98765 43226",
      hours: "Mon - Sat: 9:00 AM - 6:30 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=22.9567,72.6312",
    },

    // --- LUCKNOW ---
    {
      key: "lko_cert_1",
      name: "Awadh E-Waste Collection & Circular Point",
      address: "Transport Nagar, Kanpur Road, Lucknow 226012",
      city: "lucknow",
      kind: "recycling",
      lat: 26.7821,
      lon: 80.8924,
      phone: "+91 98765 43227",
      hours: "Mon - Sat: 9:30 AM - 6:30 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=26.7821,80.8924",
    },

    // --- CHANDIGARH ---
    {
      key: "chd_cert_1",
      name: "City Beautiful Clean E-Recycle Hub",
      address: "Industrial Area Phase 1, Chandigarh 160002",
      city: "chandigarh",
      kind: "recycling",
      lat: 30.7046,
      lon: 76.7985,
      phone: "+91 98765 43228",
      hours: "Mon - Sat: 9:00 AM - 6:00 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=30.7046,76.7985",
    },

    // --- OTHER INDIAN CITIES ---
    {
      key: "indore_1",
      name: "Malwa CleanTech E-Recycling Hub",
      address: "Sanwer Road Industrial Area, Sector E, Indore 452015",
      city: "indore",
      kind: "recycling",
      lat: 22.7561,
      lon: 75.8452,
      phone: "+91 731 249 8899",
      hours: "Mon - Sat: 9:00 AM - 6:00 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=22.7561,75.8452",
    },
    {
      key: "bhopal_1",
      name: "Bhopal Eco-Waste Reclamation Station",
      address: "Govindpura Industrial Area, Bhopal 462023",
      city: "bhopal",
      kind: "recycling",
      lat: 23.2645,
      lon: 77.4489,
      phone: "+91 755 258 7766",
      hours: "Mon - Sat: 9:00 AM - 6:00 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=23.2645,77.4489",
    },
    {
      key: "surat_1",
      name: "Surat Diamond City Green Scrap Hub",
      address: "Pandesara GIDC, Surat, Gujarat 394221",
      city: "surat",
      kind: "scrap",
      lat: 21.1491,
      lon: 72.8284,
      phone: "+91 261 289 3322",
      hours: "Mon - Sat: 9:00 AM - 6:30 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=21.1491,72.8284",
    },
    {
      key: "nagpur_1",
      name: "Orange City E-Waste Recycling Unit",
      address: "MIDC Industrial Estate, Hingna Road, Nagpur 440028",
      city: "nagpur",
      kind: "recycling",
      lat: 21.1214,
      lon: 79.0089,
      phone: "+91 712 278 4455",
      hours: "Mon - Sat: 9:00 AM - 6:00 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=21.1214,79.0089",
    },
    {
      key: "patna_1",
      name: "Pataliputra Circular Electronics Facility",
      address: "Patliputra Industrial Area, Patna 800013",
      city: "patna",
      kind: "recycling",
      lat: 25.6214,
      lon: 85.1124,
      phone: "+91 612 227 6655",
      hours: "Mon - Sat: 9:30 AM - 6:00 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=25.6214,85.1124",
    },
    {
      key: "kochi_1",
      name: "Cochin Coastal CleanTech Recycling Hub",
      address: "Kinfra Hi-Tech Park, Kalamassery, Kochi 683503",
      city: "kochi",
      kind: "recycling",
      lat: 10.0489,
      lon: 76.3245,
      phone: "+91 484 255 8899",
      hours: "Mon - Sat: 9:00 AM - 6:00 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=10.0489,76.3245",
    },
    {
      key: "cbe_1",
      name: "Coimbatore Industrial Green Metal Hub",
      address: "SIDCO Industrial Estate, Kurichi, Coimbatore 641021",
      city: "coimbatore",
      kind: "recycling",
      lat: 10.9412,
      lon: 76.9745,
      phone: "+91 422 267 3344",
      hours: "Mon - Sat: 9:00 AM - 6:00 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=10.9412,76.9745",
    },
    {
      key: "vizag_1",
      name: "Vizag Steel City E-Scrap Terminal",
      address: "Autonagar, Gajuwaka, Visakhapatnam 530012",
      city: "visakhapatnam",
      kind: "scrap",
      lat: 17.6989,
      lon: 83.2045,
      phone: "+91 891 251 7788",
      hours: "Mon - Sat: 8:30 AM - 5:30 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=17.6989,83.2045",
    },
    {
      key: "vns_1",
      name: "Kashi Green Environmental Depot",
      address: "Ramnagar Industrial Area, Varanasi 221008",
      city: "varanasi",
      kind: "recycling",
      lat: 25.2814,
      lon: 83.0245,
      phone: "+91 542 262 3344",
      hours: "Mon - Sat: 9:00 AM - 5:30 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=25.2814,83.0245",
    },
    {
      key: "kanpur_1",
      name: "Kanpur Leather & Metal E-Cycle Unit",
      address: "Panki Industrial Area, Site 1, Kanpur 208022",
      city: "kanpur",
      kind: "recycling",
      lat: 26.4689,
      lon: 80.2456,
      phone: "+91 512 269 1122",
      hours: "Mon - Sat: 9:00 AM - 6:00 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=26.4689,80.2456",
    },
    {
      key: "agra_1",
      name: "Taj City Circular Materials Depot",
      address: "Foundry Nagar Industrial Area, Agra 282006",
      city: "agra",
      kind: "recycling",
      lat: 27.2045,
      lon: 78.0489,
      phone: "+91 562 228 4455",
      hours: "Mon - Sat: 9:00 AM - 6:00 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=27.2045,78.0489",
    },

    // --- PAN-INDIA SHOPS & REGIONAL HUBS ---
    // North India Shops & Hubs
    {
      key: "del_shop_2",
      name: "Lajpat Rai Market Electronics & Parts Exchange",
      address: "Chandni Chowk, Old Delhi 110006",
      city: "delhi",
      kind: "shop",
      lat: 28.6562,
      lon: 77.2356,
      phone: "+91 11 2386 4411",
      hours: "Mon - Sat: 10:30 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=28.6562,77.2356",
    },
    {
      key: "ggn_shop_1",
      name: "CyberHub Tech Care & E-Waste Drop Shop",
      address: "MG Road, DLF Phase II, Gurugram 122002",
      city: "gurugram",
      kind: "shop",
      lat: 28.4812,
      lon: 77.0801,
      phone: "+91 124 410 5522",
      hours: "Everyday: 10:30 AM - 9:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=28.4812,77.0801",
    },
    {
      key: "noida_shop_1",
      name: "Atta Market Electronics Repair & Buyback Shop",
      address: "Sector 18, Noida, Uttar Pradesh 201301",
      city: "noida",
      kind: "shop",
      lat: 28.5706,
      lon: 77.3261,
      phone: "+91 120 431 6677",
      hours: "Tue - Sun: 10:30 AM - 8:30 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=28.5706,77.3261",
    },
    {
      key: "chd_shop_1",
      name: "Sector 22 Electronics & Laptop Parts Store",
      address: "SCO 118, Sector 22-B, Chandigarh 160022",
      city: "chandigarh",
      kind: "shop",
      lat: 30.7318,
      lon: 76.7712,
      phone: "+91 172 270 4488",
      hours: "Mon - Sat: 10:00 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=30.7318,76.7712",
    },
    {
      key: "lko_shop_1",
      name: "Naza Computer & Electronics Exchange Market",
      address: "Lalbagh, Hazratganj, Lucknow 226001",
      city: "lucknow",
      kind: "shop",
      lat: 26.8489,
      lon: 80.9395,
      phone: "+91 522 261 7788",
      hours: "Mon - Sat: 10:30 AM - 8:30 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=26.8489,80.9395",
    },
    {
      key: "knp_shop_1",
      name: "Gumti No. 5 Electronics & E-Scrap Shop",
      address: "Gumti No. 5, Kaushalpuri, Kanpur 208012",
      city: "kanpur",
      kind: "shop",
      lat: 26.4735,
      lon: 80.3121,
      phone: "+91 512 254 2211",
      hours: "Mon - Sat: 10:00 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=26.4735,80.3121",
    },
    {
      key: "vns_shop_1",
      name: "Sigra Digital Repair & E-Waste Exchange",
      address: "Mahmoorganj Road, Sigra, Varanasi 221010",
      city: "varanasi",
      kind: "shop",
      lat: 25.3118,
      lon: 82.9862,
      phone: "+91 542 222 9900",
      hours: "Mon - Sat: 10:00 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=25.3118,82.9862",
    },
    {
      key: "agr_shop_1",
      name: "Sanjay Place Electronics & IT Parts Shop",
      address: "Block 42, Sanjay Place, Agra 282002",
      city: "agra",
      kind: "shop",
      lat: 27.2004,
      lon: 78.0068,
      phone: "+91 562 400 5511",
      hours: "Mon - Sat: 10:30 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=27.2004,78.0068",
    },
    {
      key: "pry_shop_1",
      name: "Civil Lines Electronics & Battery Drop Shop",
      address: "MG Marg, Civil Lines, Prayagraj 211001",
      city: "prayagraj",
      kind: "shop",
      lat: 25.4484,
      lon: 81.8346,
      phone: "+91 532 242 3311",
      hours: "Mon - Sat: 10:00 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=25.4484,81.8346",
    },
    {
      key: "jdh_shop_1",
      name: "Sardarpura Electronics Care & Trade-In Shop",
      address: "C-Road, Sardarpura, Jodhpur 342003",
      city: "jodhpur",
      kind: "shop",
      lat: 26.2775,
      lon: 73.0086,
      phone: "+91 291 263 4455",
      hours: "Mon - Sat: 10:00 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=26.2775,73.0086",
    },
    {
      key: "jdh_cert_1",
      name: "Marwar CleanTech E-Waste Hub - Basni",
      address: "Phase II, Basni Industrial Area, Jodhpur 342005",
      city: "jodhpur",
      kind: "recycling",
      lat: 26.2241,
      lon: 72.9992,
      phone: "+91 291 274 8811",
      hours: "Mon - Sat: 9:00 AM - 6:00 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=26.2241,72.9992",
    },
    {
      key: "udr_shop_1",
      name: "Bapu Bazar Electronics & Parts Hub",
      address: "Bapu Bazar Main Road, Udaipur 313001",
      city: "udaipur",
      kind: "shop",
      lat: 24.5812,
      lon: 73.6914,
      phone: "+91 294 242 7788",
      hours: "Mon - Sat: 10:00 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=24.5812,73.6914",
    },
    {
      key: "udr_cert_1",
      name: "Mewar E-Waste Recycling Centre - Madri",
      address: "MIA Madri Industrial Area, Udaipur 313003",
      city: "udaipur",
      kind: "recycling",
      lat: 24.5698,
      lon: 73.7485,
      phone: "+91 294 249 1122",
      hours: "Mon - Sat: 9:00 AM - 6:00 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=24.5698,73.7485",
    },
    {
      key: "kota_shop_1",
      name: "Talwandi IT & Electronic Recycling Shop",
      address: "Sector 2, Talwandi, Kota 324005",
      city: "kota",
      kind: "shop",
      lat: 25.1544,
      lon: 75.8472,
      phone: "+91 744 242 6611",
      hours: "Mon - Sat: 10:00 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=25.1544,75.8472",
    },
    {
      key: "ddn_shop_1",
      name: "Paltan Bazar Electronics & Recycle Shop",
      address: "Capri Trade Centre, Connaught Place, Dehradun 248001",
      city: "dehradun",
      kind: "shop",
      lat: 30.3245,
      lon: 78.0365,
      phone: "+91 135 265 4433",
      hours: "Mon - Sat: 10:00 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=30.3245,78.0365",
    },
    {
      key: "ddn_cert_1",
      name: "Doon Valley CleanTech Recovery Unit",
      address: "SIDCUL Industrial Park, Selaqui, Dehradun 248197",
      city: "dehradun",
      kind: "recycling",
      lat: 30.3652,
      lon: 77.8548,
      phone: "+91 135 269 8877",
      hours: "Mon - Sat: 9:00 AM - 6:00 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=30.3652,77.8548",
    },
    {
      key: "amr_shop_1",
      name: "Hall Bazar Electronics & Mobile Parts Exchange",
      address: "Hall Bazar, Town Hall Road, Amritsar 143001",
      city: "amritsar",
      kind: "shop",
      lat: 31.6265,
      lon: 74.8758,
      phone: "+91 183 255 3344",
      hours: "Mon - Sat: 10:00 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=31.6265,74.8758",
    },
    {
      key: "ldh_shop_1",
      name: "Gill Road Electronics & Computer Scrap Shop",
      address: "Gill Road, Miller Ganj, Ludhiana 141003",
      city: "ludhiana",
      kind: "shop",
      lat: 30.8921,
      lon: 75.8624,
      phone: "+91 161 253 7799",
      hours: "Mon - Sat: 9:30 AM - 7:30 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=30.8921,75.8624",
    },
    {
      key: "ldh_cert_1",
      name: "Punjab Circular E-Waste Hub - Focal Point",
      address: "Phase V, Focal Point, Ludhiana 141010",
      city: "ludhiana",
      kind: "recycling",
      lat: 30.8825,
      lon: 75.9212,
      phone: "+91 161 267 4411",
      hours: "Mon - Sat: 9:00 AM - 6:00 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=30.8825,75.9212",
    },
    {
      key: "shm_shop_1",
      name: "Lower Bazar Electronics & Device Drop Shop",
      address: "Lower Bazar, The Mall, Shimla 171001",
      city: "shimla",
      kind: "shop",
      lat: 31.1041,
      lon: 77.1712,
      phone: "+91 177 265 2299",
      hours: "Mon - Sat: 10:00 AM - 7:30 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=31.1041,77.1712",
    },
    {
      key: "jammu_shop_1",
      name: "Residency Road IT & E-Waste Drop Shop",
      address: "Residency Road, Jammu 180001",
      city: "jammu",
      kind: "shop",
      lat: 32.7312,
      lon: 74.8648,
      phone: "+91 191 254 6677",
      hours: "Mon - Sat: 10:00 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=32.7312,74.8648",
    },
    {
      key: "sgr_shop_1",
      name: "Lal Chowk Electronics Repair & Buyback Shop",
      address: "Residency Road, Lal Chowk, Srinagar 190001",
      city: "srinagar",
      kind: "shop",
      lat: 34.0725,
      lon: 74.8124,
      phone: "+91 194 247 5533",
      hours: "Mon - Sat: 10:00 AM - 7:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=34.0725,74.8124",
    },

    // West India Shops & Hubs
    {
      key: "mum_shop_2",
      name: "Lamington Road IT & Electronic Parts Exchange",
      address: "Grant Road East, Lamington Road, Mumbai 400007",
      city: "mumbai",
      kind: "shop",
      lat: 18.9619,
      lon: 72.8168,
      phone: "+91 22 2388 9944",
      hours: "Mon - Sat: 10:30 AM - 8:30 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=18.9619,72.8168",
    },
    {
      key: "pune_shop_1",
      name: "Tilak Road Electronics & Spare Parts Hub",
      address: "Sadashiv Peth, Tilak Road, Pune 411030",
      city: "pune",
      kind: "shop",
      lat: 18.5089,
      lon: 73.8482,
      phone: "+91 20 2447 5566",
      hours: "Mon - Sat: 10:00 AM - 8:30 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=18.5089,73.8482",
    },
    {
      key: "pune_shop_2",
      name: "Kothrud Electronic Exchange & Drop Point",
      address: "Paud Road, Kothrud, Pune 411038",
      city: "pune",
      kind: "shop",
      lat: 18.5074,
      lon: 73.8077,
      phone: "+91 20 2543 1122",
      hours: "Everyday: 10:00 AM - 8:30 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=18.5074,73.8077",
    },
    {
      key: "ngp_shop_1",
      name: "Sitabuldi Electronics & Component Exchange",
      address: "Variety Square, Sitabuldi, Nagpur 440012",
      city: "nagpur",
      kind: "shop",
      lat: 21.1432,
      lon: 79.0805,
      phone: "+91 712 252 3344",
      hours: "Mon - Sat: 10:00 AM - 8:30 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=21.1432,79.0805",
    },
    {
      key: "nsk_shop_1",
      name: "MG Road Nashik Electronics & E-Recycle Shop",
      address: "MG Road, Shalimar, Nashik 422001",
      city: "nashik",
      kind: "shop",
      lat: 20.0012,
      lon: 73.7869,
      phone: "+91 253 257 8899",
      hours: "Mon - Sat: 10:00 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=20.0012,73.7869",
    },
    {
      key: "nsk_cert_1",
      name: "Satpur MIDC E-Waste Processing Plant",
      address: "MIDC Satpur Industrial Estate, Nashik 422007",
      city: "nashik",
      kind: "recycling",
      lat: 19.9921,
      lon: 73.7321,
      phone: "+91 253 235 4411",
      hours: "Mon - Sat: 9:00 AM - 6:00 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=19.9921,73.7321",
    },
    {
      key: "aur_shop_1",
      name: "Paithan Gate Electronics & Buyback Shop",
      address: "Nirala Bazar, Chhatrapati Sambhajinagar 431001",
      city: "aurangabad",
      kind: "shop",
      lat: 19.8781,
      lon: 75.3248,
      phone: "+91 240 233 5511",
      hours: "Mon - Sat: 10:00 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=19.8781,75.3248",
    },
    {
      key: "ahm_shop_1",
      name: "Relief Road & CG Road Electronics Exchange",
      address: "Relief Road, Kalupur, Ahmedabad 380001",
      city: "ahmedabad",
      kind: "shop",
      lat: 23.0274,
      lon: 72.5892,
      phone: "+91 79 2535 6677",
      hours: "Mon - Sat: 10:30 AM - 8:30 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=23.0274,72.5892",
    },
    {
      key: "sur_shop_1",
      name: "Ghod Dod Electronics & Laptop Spare Shop",
      address: "Ghod Dod Road, Athwa, Surat 395007",
      city: "surat",
      kind: "shop",
      lat: 21.1765,
      lon: 72.8062,
      phone: "+91 261 223 4455",
      hours: "Mon - Sat: 10:00 AM - 8:30 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=21.1765,72.8062",
    },
    {
      key: "vad_shop_1",
      name: "Alkapuri Digital Parts & Recycle Store",
      address: "RC Dutt Road, Alkapuri, Vadodara 390007",
      city: "vadodara",
      kind: "shop",
      lat: 22.3119,
      lon: 73.1723,
      phone: "+91 265 234 5566",
      hours: "Mon - Sat: 10:00 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=22.3119,73.1723",
    },
    {
      key: "vad_cert_1",
      name: "Makarpura GIDC CleanTech Recycling Hub",
      address: "GIDC Industrial Estate, Makarpura, Vadodara 390010",
      city: "vadodara",
      kind: "recycling",
      lat: 22.2535,
      lon: 73.1924,
      phone: "+91 265 264 7788",
      hours: "Mon - Sat: 9:00 AM - 6:00 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=22.2535,73.1924",
    },
    {
      key: "rjk_shop_1",
      name: "Yagnik Road Electronics & E-Waste Shop",
      address: "Dr Yagnik Road, Rajkot 360001",
      city: "rajkot",
      kind: "shop",
      lat: 22.2921,
      lon: 70.7932,
      phone: "+91 281 246 3344",
      hours: "Mon - Sat: 10:00 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=22.2921,70.7932",
    },
    {
      key: "goa_shop_1",
      name: "Panaji 18th June Road Electronics Shop",
      address: "18th June Road, Panaji, Goa 403001",
      city: "goa",
      kind: "shop",
      lat: 15.4958,
      lon: 73.8256,
      phone: "+91 832 222 7788",
      hours: "Mon - Sat: 10:00 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=15.4958,73.8256",
    },
    {
      key: "goa_cert_1",
      name: "Verna EcoCycle Coastal E-Waste Hub",
      address: "Verna Industrial Estate, Phase III, Goa 403722",
      city: "goa",
      kind: "recycling",
      lat: 15.3621,
      lon: 73.9384,
      phone: "+91 832 278 4411",
      hours: "Mon - Sat: 9:00 AM - 6:00 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=15.3621,73.9384",
    },

    // South India Shops & Hubs
    {
      key: "blr_shop_2",
      name: "Koramangala Gadget Care & Refurbish Shop",
      address: "80 Feet Road, 4th Block, Koramangala, Bengaluru 560034",
      city: "bengaluru",
      kind: "shop",
      lat: 12.9352,
      lon: 77.6245,
      phone: "+91 80 4123 7788",
      hours: "Everyday: 10:30 AM - 9:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=12.9352,77.6245",
    },
    {
      key: "mys_shop_1",
      name: "Devaraja Urs Road Electronics Exchange",
      address: "D. Devaraja Urs Road, Mysuru 570001",
      city: "mysuru",
      kind: "shop",
      lat: 12.3095,
      lon: 76.6476,
      phone: "+91 821 242 5566",
      hours: "Mon - Sat: 10:00 AM - 8:30 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=12.3095,76.6476",
    },
    {
      key: "mng_shop_1",
      name: "Hampankatta Electronics & Laptop Parts Store",
      address: "KS Rao Road, Hampankatta, Mangaluru 575001",
      city: "mangaluru",
      kind: "shop",
      lat: 12.8712,
      lon: 74.8432,
      phone: "+91 824 244 2211",
      hours: "Mon - Sat: 10:00 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=12.8712,74.8432",
    },
    {
      key: "hbl_shop_1",
      name: "Lamington Hubballi Electronic Spare Shop",
      address: "Lamington Road, Hubballi, Karnataka 580020",
      city: "hubballi",
      kind: "shop",
      lat: 15.3512,
      lon: 75.1384,
      phone: "+91 836 225 6677",
      hours: "Mon - Sat: 10:00 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=15.3512,75.1384",
    },
    {
      key: "chn_shop_2",
      name: "T. Nagar Digital Return & Parts Shop",
      address: "Usman Road, T. Nagar, Chennai 600017",
      city: "chennai",
      kind: "shop",
      lat: 13.0405,
      lon: 80.2337,
      phone: "+91 44 2434 7788",
      hours: "Everyday: 10:00 AM - 9:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=13.0405,80.2337",
    },
    {
      key: "cbe_shop_1",
      name: "Cross Cut Road Electronics & PC Parts Shop",
      address: "Cross Cut Road, Gandhipuram, Coimbatore 641012",
      city: "coimbatore",
      kind: "shop",
      lat: 11.0183,
      lon: 76.9661,
      phone: "+91 422 249 5566",
      hours: "Mon - Sat: 10:00 AM - 8:30 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=11.0183,76.9661",
    },
    {
      key: "mdu_shop_1",
      name: "Town Hall Road Electronics & E-Scrap Shop",
      address: "Town Hall Road, Madurai 625001",
      city: "madurai",
      kind: "shop",
      lat: 9.9195,
      lon: 78.1162,
      phone: "+91 452 234 7788",
      hours: "Mon - Sat: 10:00 AM - 8:30 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=9.9195,78.1162",
    },
    {
      key: "trichy_shop_1",
      name: "Thillai Nagar Tech Repair & Buyback Shop",
      address: "Main Road, Thillai Nagar, Tiruchirappalli 620018",
      city: "trichy",
      kind: "shop",
      lat: 10.8245,
      lon: 78.6852,
      phone: "+91 431 274 2211",
      hours: "Mon - Sat: 10:00 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=10.8245,78.6852",
    },
    {
      key: "hyd_shop_1",
      name: "CTC Parklane Electronics & Parts Exchange",
      address: "Chenoy Trade Centre, Parklane, Secunderabad 500003",
      city: "hyderabad",
      kind: "shop",
      lat: 17.4418,
      lon: 78.4932,
      phone: "+91 40 2784 6677",
      hours: "Mon - Sat: 10:30 AM - 8:30 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=17.4418,78.4932",
    },
    {
      key: "hyd_shop_2",
      name: "Ameerpet IT Spares & E-Waste Drop Point",
      address: "Maitrivanam Complex, Ameerpet, Hyderabad 500016",
      city: "hyderabad",
      kind: "shop",
      lat: 17.4375,
      lon: 78.4483,
      phone: "+91 40 2373 1122",
      hours: "Mon - Sat: 10:00 AM - 8:30 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=17.4375,78.4483",
    },
    {
      key: "wgl_shop_1",
      name: "Hanamkonda Digital Care & E-Recycle Shop",
      address: "Chowrastha Road, Hanamkonda, Warangal 506001",
      city: "warangal",
      kind: "shop",
      lat: 18.0042,
      lon: 79.5582,
      phone: "+91 870 257 3344",
      hours: "Mon - Sat: 10:00 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=18.0042,79.5582",
    },
    {
      key: "vzg_shop_1",
      name: "Dwaraka Nagar Electronics & Parts Store",
      address: "Diamond Park Road, Dwaraka Nagar, Visakhapatnam 530016",
      city: "visakhapatnam",
      kind: "shop",
      lat: 17.7285,
      lon: 83.3065,
      phone: "+91 891 274 5566",
      hours: "Mon - Sat: 10:00 AM - 8:30 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=17.7285,83.3065",
    },
    {
      key: "vjw_shop_1",
      name: "Benz Circle Electronics & Buyback Hub",
      address: "MG Road, Benz Circle, Vijayawada 520010",
      city: "vijayawada",
      kind: "shop",
      lat: 16.4995,
      lon: 80.6548,
      phone: "+91 866 247 7788",
      hours: "Mon - Sat: 10:00 AM - 8:30 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=16.4995,80.6548",
    },
    {
      key: "tpt_shop_1",
      name: "Tirupati Central Electronics Exchange Shop",
      address: "Tilak Road, Tirupati 517501",
      city: "tirupati",
      kind: "shop",
      lat: 13.6355,
      lon: 79.4241,
      phone: "+91 877 224 3311",
      hours: "Mon - Sat: 10:00 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=13.6355,79.4241",
    },
    {
      key: "koc_shop_1",
      name: "Penta Menaka Electronics & Parts Market",
      address: "Shanmugham Road, Marine Drive, Kochi 682031",
      city: "kochi",
      kind: "shop",
      lat: 9.9781,
      lon: 76.2768,
      phone: "+91 484 236 4455",
      hours: "Mon - Sat: 10:00 AM - 8:30 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=9.9781,76.2768",
    },
    {
      key: "tvm_shop_1",
      name: "MG Road Trivandrum IT & Recycle Shop",
      address: "Statue Junction, MG Road, Thiruvananthapuram 695001",
      city: "trivandrum",
      kind: "shop",
      lat: 8.4995,
      lon: 76.9491,
      phone: "+91 471 247 8899",
      hours: "Mon - Sat: 10:00 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=8.4995,76.9491",
    },
    {
      key: "tvm_cert_1",
      name: "Technopark Clean Kerala E-Waste Hub",
      address: "Kazhakkoottam Industrial Estate, Thiruvananthapuram 695582",
      city: "trivandrum",
      kind: "recycling",
      lat: 8.5568,
      lon: 76.8814,
      phone: "+91 471 270 4411",
      hours: "Mon - Sat: 9:00 AM - 6:00 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=8.5568,76.8814",
    },
    {
      key: "ccj_shop_1",
      name: "Mavoor Road Kozhikode Electronics Shop",
      address: "Mavoor Road, Kozhikode 673004",
      city: "kozhikode",
      kind: "shop",
      lat: 11.2591,
      lon: 75.7885,
      phone: "+91 495 272 3344",
      hours: "Mon - Sat: 10:00 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=11.2591,75.7885",
    },

    // East, Central & North-East India Shops & Hubs
    {
      key: "kol_shop_1",
      name: "Chandni Chowk Kolkata Electronics & Parts Market",
      address: "Chittaranjan Avenue, Chandni Chowk, Kolkata 700072",
      city: "kolkata",
      kind: "shop",
      lat: 22.5675,
      lon: 88.3534,
      phone: "+91 33 2212 6677",
      hours: "Mon - Sat: 10:30 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=22.5675,88.3534",
    },
    {
      key: "kol_shop_2",
      name: "Gariahat Digital Repair & Exchange Store",
      address: "Rash Behari Avenue, Gariahat, Kolkata 700029",
      city: "kolkata",
      kind: "shop",
      lat: 22.5179,
      lon: 88.3652,
      phone: "+91 33 2464 8811",
      hours: "Tue - Sun: 10:30 AM - 8:30 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=22.5179,88.3652",
    },
    {
      key: "slg_shop_1",
      name: "Bidhan Market Siliguri Electronics Shop",
      address: "Bidhan Road, Siliguri, West Bengal 734001",
      city: "siliguri",
      kind: "shop",
      lat: 26.7124,
      lon: 88.4285,
      phone: "+91 353 243 4455",
      hours: "Mon - Sat: 10:00 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=26.7124,88.4285",
    },
    {
      key: "bbsr_shop_1",
      name: "Saheed Nagar IT & Electronics Exchange Shop",
      address: "Janpath, Saheed Nagar, Bhubaneswar 751007",
      city: "bhubaneswar",
      kind: "shop",
      lat: 20.2912,
      lon: 85.8442,
      phone: "+91 674 254 6677",
      hours: "Mon - Sat: 10:00 AM - 8:30 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=20.2912,85.8442",
    },
    {
      key: "bbsr_cert_1",
      name: "Kalinga CleanTech E-Waste Hub - Mancheswar",
      address: "Mancheswar Industrial Estate, Bhubaneswar 751010",
      city: "bhubaneswar",
      kind: "recycling",
      lat: 20.3075,
      lon: 85.8584,
      phone: "+91 674 258 9900",
      hours: "Mon - Sat: 9:00 AM - 6:00 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=20.3075,85.8584",
    },
    {
      key: "pat_shop_1",
      name: "SP Verma Road Electronics & Spare Parts Shop",
      address: "SP Verma Road, Frazer Road Area, Patna 800001",
      city: "patna",
      kind: "shop",
      lat: 25.6114,
      lon: 85.1389,
      phone: "+91 612 220 4455",
      hours: "Mon - Sat: 10:00 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=25.6114,85.1389",
    },
    {
      key: "rnc_shop_1",
      name: "Main Road Ranchi Electronics & Parts Store",
      address: "Gel Church Complex, Main Road, Ranchi 834001",
      city: "ranchi",
      kind: "shop",
      lat: 23.3568,
      lon: 85.3248,
      phone: "+91 651 233 4455",
      hours: "Mon - Sat: 10:00 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=23.3568,85.3248",
    },
    {
      key: "rnc_cert_1",
      name: "Chotanagpur E-Waste Recovery Centre",
      address: "Kokar Industrial Area, Ranchi 834009",
      city: "ranchi",
      kind: "recycling",
      lat: 23.3765,
      lon: 85.3621,
      phone: "+91 651 254 7788",
      hours: "Mon - Sat: 9:00 AM - 6:00 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=23.3765,85.3621",
    },
    {
      key: "jsr_shop_1",
      name: "Bistupur Electronics & Metal Recovery Shop",
      address: "Main Road, Bistupur, Jamshedpur 831001",
      city: "jamshedpur",
      kind: "shop",
      lat: 22.7925,
      lon: 86.1842,
      phone: "+91 657 242 5566",
      hours: "Mon - Sat: 10:00 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=22.7925,86.1842",
    },
    {
      key: "rpr_shop_1",
      name: "Ravi Bhawan Raipur Electronics & Spare Shop",
      address: "Jaistambh Chowk, MG Road, Raipur 492001",
      city: "raipur",
      kind: "shop",
      lat: 21.2465,
      lon: 81.6334,
      phone: "+91 771 253 4455",
      hours: "Mon - Sat: 10:00 AM - 8:30 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=21.2465,81.6334",
    },
    {
      key: "rpr_cert_1",
      name: "Chhattisgarh Green E-Waste Hub - Urla",
      address: "Urla Industrial Complex, Raipur 493221",
      city: "raipur",
      kind: "recycling",
      lat: 21.3185,
      lon: 81.6224,
      phone: "+91 771 232 6677",
      hours: "Mon - Sat: 9:00 AM - 6:00 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=21.3185,81.6224",
    },
    {
      key: "ind_shop_1",
      name: "Silver Mall Jail Road Electronics Shop",
      address: "RNT Marg, Jail Road, Indore 452007",
      city: "indore",
      kind: "shop",
      lat: 22.7212,
      lon: 75.8712,
      phone: "+91 731 252 6677",
      hours: "Mon - Sat: 10:30 AM - 8:30 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=22.7212,75.8712",
    },
    {
      key: "bhp_shop_1",
      name: "MP Nagar Zone-1 Electronics & Parts Shop",
      address: "Zone I, Maharana Pratap Nagar, Bhopal 462011",
      city: "bhopal",
      kind: "shop",
      lat: 23.2332,
      lon: 77.4343,
      phone: "+91 755 255 3344",
      hours: "Mon - Sat: 10:30 AM - 8:30 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=23.2332,77.4343",
    },
    {
      key: "jbp_shop_1",
      name: "Russell Chowk Electronics Care & Buyback",
      address: "Napier Town, Russell Chowk, Jabalpur 482001",
      city: "jabalpur",
      kind: "shop",
      lat: 23.1642,
      lon: 79.9355,
      phone: "+91 761 240 5566",
      hours: "Mon - Sat: 10:00 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=23.1642,79.9355",
    },
    {
      key: "ghy_shop_1",
      name: "Fancy Bazar Electronics & Parts Exchange",
      address: "MG Road, Fancy Bazar, Guwahati, Assam 781001",
      city: "guwahati",
      kind: "shop",
      lat: 26.1856,
      lon: 91.7412,
      phone: "+91 361 254 6677",
      hours: "Mon - Sat: 10:00 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=26.1856,91.7412",
    },
    {
      key: "ghy_cert_1",
      name: "North-East EcoCycle Hub - Bamunimaidam",
      address: "Industrial Estate, Bamunimaidam, Guwahati 781021",
      city: "guwahati",
      kind: "recycling",
      lat: 26.1875,
      lon: 91.7892,
      phone: "+91 361 265 8899",
      hours: "Mon - Sat: 9:00 AM - 6:00 PM",
      verified: true,
      osm: "https://www.google.com/maps/search/?api=1&query=26.1875,91.7892",
    },
    {
      key: "shl_shop_1",
      name: "Police Bazar Electronics & E-Recycle Shop",
      address: "GS Road, Police Bazar, Shillong 793001",
      city: "shillong",
      kind: "shop",
      lat: 25.5762,
      lon: 91.8832,
      phone: "+91 364 222 4455",
      hours: "Mon - Sat: 9:30 AM - 7:30 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=25.5762,91.8832",
    },
    {
      key: "agt_shop_1",
      name: "Battala Agartala Electronics & Parts Shop",
      address: "HG Basak Road, Battala, Agartala 799001",
      city: "agartala",
      kind: "shop",
      lat: 23.8295,
      lon: 91.2731,
      phone: "+91 381 232 5566",
      hours: "Mon - Sat: 10:00 AM - 8:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=23.8295,91.2731",
    },
    {
      key: "imp_shop_1",
      name: "Paona Bazar Imphal Electronics Exchange",
      address: "Paona Bazar, Imphal, Manipur 795001",
      city: "imphal",
      kind: "shop",
      lat: 24.8081,
      lon: 93.9362,
      phone: "+91 385 244 3344",
      hours: "Mon - Sat: 9:30 AM - 7:00 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=24.8081,93.9362",
    },
    {
      key: "gtk_shop_1",
      name: "MG Marg Gangtok Tech Care & Drop Shop",
      address: "MG Marg, Gangtok, Sikkim 737101",
      city: "gangtok",
      kind: "shop",
      lat: 27.3289,
      lon: 88.6122,
      phone: "+91 3592 204 556",
      hours: "Mon - Sat: 9:30 AM - 7:30 PM",
      verified: false,
      osm: "https://www.google.com/maps/search/?api=1&query=27.3289,88.6122",
    },
  ];

  // Pre-indexed search metadata for instant sub-millisecond lookup
  const INDEXED_PLACES = LOCAL_PLACES.map((p) => ({
    ...p,
    _blob: `${p.name} ${p.address} ${p.city} ${p.kind}`.toLowerCase(),
  }));

  const M = {
    map: null,
    group: null,
    originMarker: null,
    circle: null,
    items: [],
    markers: new Map(),
    filter: "all",
    selected: null,
    lastPopupClose: 0,
    origin: null,
    busy: false,
  };

  function mapMessage(text, isError = false) {
    const el = $("mapStatus");
    if (!el) return;
    el.textContent = text;
    el.classList.toggle("is-error", isError);
  }

  function haversine(lat1, lon1, lat2, lon2) {
    const r = (d) => (d * Math.PI) / 180;
    const a =
      Math.sin(r(lat2 - lat1) / 2) ** 2 +
      Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(r(lon2 - lon1) / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  const fmtDist = (km) =>
    km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;

  // 100% Client-side fast geocoding (Zero external HTTP APIs)
  function geocodeLocal(query) {
    const raw = String(query || "").trim();
    const norm = raw.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!norm) return CITY_COORDS.jaipur;

    if (CITY_COORDS[norm]) return CITY_COORDS[norm];

    // Fast O(1) Indian PIN code prefix lookup (3-digit then 2-digit zone)
    if (/^\d{4,6}$/.test(norm)) {
      const c3 = PIN_3_CITY[norm.slice(0, 3)];
      if (c3 && CITY_COORDS[c3]) return CITY_COORDS[c3];
      const c2 = PIN_2_CITY[norm.slice(0, 2)];
      if (c2 && CITY_COORDS[c2]) return CITY_COORDS[c2];
    }

    // Prefix match first, then substring match against Indian cities
    for (const [k, v] of Object.entries(CITY_COORDS)) {
      if (k !== "india" && k !== "allindia" && k.startsWith(norm)) {
        return v;
      }
    }
    for (const [k, v] of Object.entries(CITY_COORDS)) {
      if (k !== "india" && k !== "allindia" && (norm.includes(k) || k.includes(norm))) {
        return v;
      }
    }

    // Fast pre-indexed search across shop names, localities, and addresses
    const tokens = raw.toLowerCase().split(/\s+/).filter(Boolean);
    const directHit = INDEXED_PLACES.find((p) =>
      tokens.every((tok) => p._blob.includes(tok)),
    );
    if (directHit) {
      return {
        latitude: directHit.lat,
        longitude: directHit.lon,
        label: directHit.name,
      };
    }

    return {
      latitude: CITY_COORDS.jaipur.latitude,
      longitude: CITY_COORDS.jaipur.longitude,
      label: raw,
    };
  }

  function showMap() {
    if (!$("quickCities").children.length) {
      $("quickCities").innerHTML =
        `<span>Try:</span>` +
        QUICK_CITIES.map(
          (c) =>
            `<button type="button" data-city="${esc(c)}">${esc(c)}</button>`,
        ).join("");
      renderChips();
    }
    if (!M.map) initMap();

    // Trigger progressive size refreshes as container unhides
    requestAnimationFrame(() => M.map && M.map.invalidateSize());
    setTimeout(() => M.map && M.map.invalidateSize(), 60);
    setTimeout(() => M.map && M.map.invalidateSize(), 200);

    if (!M.origin) {
      runSearch({ query: "Jaipur" });
    }
  }

  function initMap() {
    if (typeof L === "undefined") {
      console.warn("Leaflet library not loaded yet.");
      $("map").innerHTML =
        `<div class="place-empty">Loading Leaflet library…</div>`;
      return;
    }

    const mapEl = $("map");
    if (!mapEl) return;

    if (M.map) {
      try {
        M.map.invalidateSize();
        return M.map;
      } catch (_) {}
    }

    // Clean up if container had previous leaflet instance
    if (mapEl._leaflet_id) {
      try {
        mapEl._leaflet_id = null;
        mapEl.innerHTML = "";
      } catch (_) {}
    }

    if (L.Icon && L.Icon.Default) {
      L.Icon.Default.imagePath = "vendor/leaflet/images/";
    }

    // Initialize Leaflet map with Canvas renderer for instant marker rendering
    const map = L.map(mapEl, {
      preferCanvas: true,
      zoomControl: true,
      minZoom: 3,
      maxZoom: 18,
      fadeAnimation: false,
      zoomAnimation: true,
      markerZoomAnimation: false,
    }).setView([26.9124, 75.7873], 12);
    M.map = map;

    // Standard OpenStreetMap tiles (optimized idle loading for fast panning/searching)
    const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      keepBuffer: 2,
      updateWhenIdle: true,
      updateWhenZooming: false,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    });
    osm.addTo(map);

    M.group = L.layerGroup().addTo(map);

    map.on("popupclose", () => {
      M.lastPopupClose = Date.now();
    });
    map.on("click", (e) => {
      if (Date.now() - M.lastPopupClose < 300 || M.busy) return;
      runSearch({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
        label: "selected location",
      });
    });

    setTimeout(() => map.invalidateSize(), 50);
    setTimeout(() => map.invalidateSize(), 200);

    if (typeof ResizeObserver !== "undefined" && !M.resizeObserver) {
      M.resizeObserver = new ResizeObserver(() => {
        if (M.map && $("view-map") && !$("view-map").hidden) {
          M.map.invalidateSize({ debounceMoveEvents: true });
        }
      });
      M.resizeObserver.observe(mapEl);
    }

    return map;
  }

  function setBusy(busy) {
    M.busy = busy;
    $("mapSearchBtn").disabled = busy;
    $("mapLocateBtn").disabled = busy;
    $("mapSearchBtn").textContent = busy ? "Searching…" : "Search";
    $("map").style.cursor = busy ? "progress" : "";
  }

  // 100% Client-side Instant Search (Zero External APIs)
  function runSearch(input) {
    if (!M.map) initMap();
    if (!M.map) return;

    const radiusKm = Number($("mapRadius").value) || 10;
    let origin = null;

    if (input.latitude && input.longitude) {
      origin = {
        latitude: input.latitude,
        longitude: input.longitude,
        label: input.label || "the selected point",
      };
    } else if (input.query) {
      origin = geocodeLocal(input.query);
    } else {
      origin = CITY_COORDS.jaipur;
    }

    M.origin = origin;
    placeOrigin(origin, radiusKm);

    // Calculate distance across pre-indexed pan-India places (< 1ms)
    const scored = INDEXED_PLACES.map((p) => ({
      ...p,
      distance: haversine(origin.latitude, origin.longitude, p.lat, p.lon),
    }));

    let nearby;
    if (origin.allIndia) {
      nearby = scored;
    } else {
      nearby = scored.filter((p) => p.distance <= radiusKm * 1.25);
      if (!nearby.length) {
        nearby = [...scored].sort((a, b) => a.distance - b.distance).slice(0, 6);
      }
    }

    // Sort verified partner hubs first, then closest distance
    M.items = nearby.sort((a, b) => {
      if (a.verified && !b.verified) return -1;
      if (!a.verified && b.verified) return 1;
      return a.distance - b.distance;
    });

    M.selected = null;
    renderMapResults();

    const n = M.items.length;
    mapMessage(
      origin.allIndia
        ? `Showing all ${n} verified recycling hubs, electronics shops & scrap yards across India.`
        : n
          ? `${n} ${n === 1 ? "point" : "points"} found near ${origin.label}. Ready for drop-off.`
          : `No mapped places near ${origin.label}. Try a larger radius or a nearby city.`,
    );
  }

  function placeOrigin(origin, radiusKm) {
    if (!M.map) return;
    const ll = [origin.latitude, origin.longitude];
    if (M.originMarker) M.map.removeLayer(M.originMarker);
    if (M.circle) M.map.removeLayer(M.circle);

    if (origin.allIndia) {
      M.originMarker = null;
      M.circle = null;
      M.map.setView(ll, origin.zoom || 5, { animate: false });
      return;
    }

    M.originMarker = L.marker(ll, {
      icon: L.divIcon({
        className: "",
        html: '<div class="origin-pin"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      }),
      keyboard: false,
      interactive: false,
      zIndexOffset: 1000,
    }).addTo(M.map);
    M.circle = L.circle(ll, {
      radius: radiusKm * 1000,
      color: "#0f5a47",
      weight: 1.5,
      dashArray: "5 5",
      fillColor: "#0f5a47",
      fillOpacity: 0.05,
      interactive: false,
    }).addTo(M.map);

    const sz = M.map.getSize();
    if (sz.x > 80 && sz.y > 80) {
      try {
        M.map.fitBounds(M.circle.getBounds(), { padding: [20, 20], maxZoom: 14, animate: false });
      } catch (_) {
        M.map.setView(ll, 12, { animate: false });
      }
    } else {
      M.map.setView(ll, 12, { animate: false });
      setTimeout(() => {
        if (M.map && M.circle) {
          try {
            M.map.fitBounds(M.circle.getBounds(), { padding: [20, 20], maxZoom: 14, animate: false });
          } catch (_) {}
        }
      }, 60);
    }
  }

  function popupHtml(p) {
    const k = KINDS[p.kind] || KINDS.recycling;
    const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}`;
    return `<div class="pop">
      <strong>${esc(p.name)}</strong>
      ${p.verified ? `<div style="margin: 4px 0 6px;"><span class="verified-tag">✓ Verified Partner</span></div>` : ""}
      <span class="pop-type">${esc(k.label)} · ${esc(fmtDist(p.distance))} away</span>
      ${p.address ? `<p>${esc(p.address)}</p>` : ""}
      ${p.phone ? `<p>Phone: <a href="tel:${esc(p.phone.replace(/[^\d+]/g, ""))}">${esc(p.phone)}</a></p>` : ""}
      ${p.hours ? `<p>Hours: ${esc(p.hours)}</p>` : ""}
      <div class="pop-actions">
        ${state.user?.role === "user" ? `<button class="btn" type="button" data-use="${esc(p.key)}">Use for drop-off</button>` : ""}
        <a class="btn" href="${dirUrl}" target="_blank" rel="noopener noreferrer">Directions ↗</a>
        <a class="alt" href="${esc(p.osm)}" target="_blank" rel="noopener noreferrer">Map</a>
      </div>
    </div>`;
  }

  function visibleItems() {
    return M.filter === "all"
      ? M.items
      : M.items.filter((p) => p.kind === M.filter);
  }

  function renderChips() {
    const counts = { all: M.items.length, recycling: 0, shop: 0, scrap: 0 };
    M.items.forEach((p) => {
      if (counts[p.kind] !== undefined) counts[p.kind]++;
    });
    const defs = [
      ["all", "All", null],
      ["recycling", "Recycling points", "k-recycling"],
      ["shop", "Shops", "k-shop"],
      ["scrap", "Scrap yards", "k-scrap"],
    ];
    $("typeChips").innerHTML = defs
      .map(
        ([k, label, cls]) =>
          `<button type="button" class="chip ${cls || ""}" data-filter="${k}" aria-pressed="${M.filter === k}">${cls ? "<i></i>" : ""}${label}<span>${counts[k] || 0}</span></button>`,
      )
      .join("");
  }

  function renderMapResults() {
    renderChips();
    if (M.group) M.group.clearLayers();
    M.markers.clear();
    const items = visibleItems();
    for (const p of items) {
      const isVerified = Boolean(p.verified);
      const kindDef = KINDS[p.kind] || KINDS.recycling;
      const m = L.circleMarker([p.lat, p.lon], {
        radius: isVerified ? 9 : 7,
        weight: isVerified ? 2.5 : 1.5,
        color: isVerified ? "#10b981" : "#ffffff",
        fillColor: isVerified ? "#059669" : (kindDef.color || "#0f8a6a"),
        fillOpacity: 0.95,
        bubblingMouseEvents: false,
      }).addTo(M.group);
      m.bindPopup(popupHtml(p), { maxWidth: 280, autoPanPadding: [30, 30] });
      m.on("click", () => selectPlace(p.key, { fly: false, scrollList: true }));
      M.markers.set(p.key, m);
    }
    $("placeTitle").textContent = M.items.length
      ? `${items.length} ${items.length === 1 ? "place" : "places"}`
      : "Results";
    $("placeList").innerHTML = items.length
      ? items.map(placeItemHtml).join("")
      : `<li class="place-empty">${M.items.length ? "No places of this type. Choose another filter." : "Results will appear here."}</li>`;
  }

  function placeItemHtml(p) {
    const k = KINDS[p.kind] || KINDS.recycling;
    const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}`;
    return `<li class="place ${k.cls} ${p.verified ? "is-verified" : ""}" data-place="${esc(p.key)}" tabindex="0">
      <div class="place-top">
        <span class="place-name">${esc(p.name)}</span>
        <span class="place-dist">${esc(fmtDist(p.distance))}</span>
      </div>
      <div class="place-type" style="display:flex;align-items:center;gap:8px;">
        <span><i></i>${esc(k.label)}</span>
        ${p.verified ? `<span class="verified-tag"><svg class="i" style="width:11px;height:11px;margin-right:2px;"><use href="#i-check" /></svg>Certified Hub</span>` : ""}
      </div>
      ${p.address ? `<div class="place-addr">${esc(p.address)}</div>` : ""}
      <div class="place-meta">
        ${p.phone ? `<a href="tel:${esc(p.phone.replace(/[^\d+]/g, ""))}">${icon("phone")}${esc(p.phone)}</a>` : ""}
        ${p.hours ? `<span>${icon("clock")}${esc(p.hours)}</span>` : ""}
      </div>
      <div class="place-actions">
        ${state.user?.role === "user" ? `<button class="btn btn-sm btn-primary" type="button" data-use="${esc(p.key)}">Use for drop-off</button>` : ""}
        <a class="btn btn-sm" href="${dirUrl}" target="_blank" rel="noopener noreferrer">Directions ↗</a>
      </div>
    </li>`;
  }

  function selectPlace(key, { fly = true, scrollList = false } = {}) {
    M.selected = key;
    document
      .querySelectorAll(".place")
      .forEach((el) =>
        el.classList.toggle("is-selected", el.dataset.place === key),
      );
    const marker = M.markers.get(key);
    M.markers.forEach((m, k) => m.setStyle({ radius: k === key ? 10 : 7 }));
    if (marker && M.map) {
      marker.bringToFront();
      if (fly) {
        try {
          M.map.flyTo(marker.getLatLng(), Math.max(M.map.getZoom(), 14), {
            duration: 0.25,
          });
        } catch (_) {
          M.map.setView(marker.getLatLng(), 14);
        }
      }
      marker.openPopup();
    }
    if (scrollList)
      document
        .querySelector(`.place[data-place="${CSS.escape(key)}"]`)
        ?.scrollIntoView({ block: "nearest" });
  }

  function useForDropoff(key) {
    const p = M.items.find((x) => x.key === key);
    if (!p || state.user?.role !== "user") return;
    pendingDrop = p.address
      ? `${p.name}, ${p.address}`
      : `${p.name} (near ${M.origin?.label || "selected area"})`;
    location_hash("#/new");
    toast("Drop-off point added to your request");
  }

  function locate() {
    if (!navigator.geolocation) {
      mapMessage(
        "This browser does not support location. Search by city or PIN code instead.",
        true,
      );
      return;
    }
    setBusy(true);
    mapMessage("Waiting for location permission…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setBusy(false);
        runSearch({
          latitude: coords.latitude,
          longitude: coords.longitude,
          label: "your location",
        });
      },
      (err) => {
        setBusy(false);
        mapMessage(
          err.code === err.PERMISSION_DENIED
            ? "Location permission was declined. Search by city or PIN code instead."
            : "Your location could not be determined. Search by city or PIN code instead.",
          true,
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  /* ------------------------------------------------------------------
   * Event wiring
   * ------------------------------------------------------------------ */
  function wire() {
    $("loginTab").addEventListener("click", () => setAuthMode("login"));
    $("signupTab").addEventListener("click", () => setAuthMode("signup"));
    $("authForm").addEventListener("submit", submitAuth);
    document.querySelectorAll("[data-demo]").forEach((b) =>
      b.addEventListener("click", () => {
        const admin = b.dataset.demo === "admin";
        setAuthMode("login");
        $("authRole").value = admin ? "admin" : "user";
        $("authEmail").value = admin
          ? "admin@example.com"
          : "rahul@example.com";
        $("authPassword").value = "demo1234";
        $("authSubmit").focus();
      }),
    );
    const exploreBtn = $("exploreMapGuestBtn");
    if (exploreBtn) {
      exploreBtn.addEventListener("click", () => {
        startSession({ name: "Eco Explorer", email: "guest@ecocycle.org", role: "user" }).then(() => {
          location.hash = "#/map";
        });
      });
    }
    const togglePass = $("togglePasswordBtn");
    if (togglePass) {
      togglePass.addEventListener("click", () => {
        const passInput = $("authPassword");
        const iconUse = $("eyeIconUse") || togglePass.querySelector("use");
        const isSecret = passInput.type === "password";
        passInput.type = isSecret ? "text" : "password";
        togglePass.setAttribute("aria-label", isSecret ? "Hide password" : "Show password");
        if (iconUse) {
          iconUse.setAttribute("href", isSecret ? "#i-eye-off" : "#i-eye");
        }
      });
    }

    // Phase 3 Auth Enhancements
    $("toggleRoleLink")?.addEventListener("click", () => {
      const roleSelect = $("authRole");
      if (!roleSelect) return;
      const isOps = roleSelect.value === "admin";
      roleSelect.value = isOps ? "user" : "admin";
      $("toggleRoleLink").textContent = isOps
        ? "Sign in as operations / collection partner →"
        : "Sign in as citizen / user →";
      showToast(
        isOps ? "Role set to Citizen" : "Role set to Operations Admin",
        "info",
      );
    });

    $("googleAuthBtn")?.addEventListener("click", () => {
      showToast(
        "Google authentication is configured in the production environment.",
        "info",
      );
    });

    $("authForgotLink")?.addEventListener("click", (e) => {
      e.preventDefault();
      const email = $("authEmail")?.value.trim();
      if (email) {
        showToast(`Password recovery link sent to ${email}`, "success");
      } else {
        showToast("Enter your email above to receive a recovery link.", "warning");
      }
    });

    const authDemo = $("authDemoActions");
    if (authDemo) {
      const isDemo =
        new URLSearchParams(window.location.search).has("demo") ||
        localStorage.getItem("ecocycle-demo") === "true" ||
        window.NEXT_PUBLIC_DEMO === true;
      authDemo.classList.toggle("hidden", !isDemo);
    }
    $("logoutButton").addEventListener("click", () => void endSession());
    $("themeToggle").addEventListener("click", () =>
      setTheme(document.body.dataset.theme === "dark" ? "light" : "dark"),
    );
    $("pageTitle").tabIndex = -1;
    $("menuButton").setAttribute("aria-controls", "sidebar");
    $("menuButton").setAttribute("aria-expanded", "false");
    $("menuButton").addEventListener("click", () =>
      setNavOpen(!$("app").classList.contains("nav-open")),
    );
    $("scrim").addEventListener("click", () => setNavOpen(false));
    window.addEventListener("hashchange", route);
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        $("app").classList.contains("nav-open")
      ) {
        setNavOpen(false);
        $("menuButton").focus();
      }
      if (
        e.key === "/" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || "")
      ) {
        e.preventDefault();
        $("globalSearch").focus();
      }
    });

    $("requestForm").addEventListener("submit", submitRequest);
    document
      .querySelectorAll('input[name="fMethod"]')
      .forEach((r) => r.addEventListener("change", applyMethod));

    $("mapSearchForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const q = $("mapQuery").value.trim();
      if (!q) {
        mapMessage("Enter a city, shop, or PIN code.", true);
        $("mapQuery").focus();
        return;
      }
      runSearch({ query: q });
    });
    let mapSearchTimer = null;
    $("mapQuery").addEventListener("input", () => {
      clearTimeout(mapSearchTimer);
      const q = $("mapQuery").value.trim();
      if (q.length < 2) return;
      mapSearchTimer = setTimeout(() => {
        runSearch({ query: q });
      }, 120);
    });
    $("mapLocateBtn").addEventListener("click", locate);
    $("mapRadius").addEventListener("change", () => {
      if (M.origin && !M.busy)
        runSearch({
          latitude: M.origin.latitude,
          longitude: M.origin.longitude,
          label: M.origin.label,
        });
    });
    $("quickCities").addEventListener("click", (e) => {
      const b = e.target.closest("[data-city]");
      if (!b) return;
      $("mapQuery").value = b.dataset.city;
      runSearch({ query: b.dataset.city });
    });
    $("typeChips").addEventListener("click", (e) => {
      const b = e.target.closest("[data-filter]");
      if (!b) return;
      M.filter = b.dataset.filter;
      renderMapResults();
    });
    $("placeList").addEventListener("click", (e) => {
      const use = e.target.closest("[data-use]");
      if (use) {
        useForDropoff(use.dataset.use);
        return;
      }
      if (e.target.closest("a")) return;
      const li = e.target.closest("[data-place]");
      if (li) selectPlace(li.dataset.place);
    });
    $("placeList").addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const li = e.target.closest("[data-place]");
      if (li && e.target === li) {
        e.preventDefault();
        selectPlace(li.dataset.place);
      }
    });
    // Buttons inside Leaflet popups
    document.addEventListener("click", (e) => {
      const use = e.target.closest(".leaflet-popup [data-use]");
      if (use) useForDropoff(use.dataset.use);
    });

    // Delegated: open request details, quick actions, category shortcut
    document.addEventListener("click", async (e) => {
      const quick = e.target.closest("[data-quick]");
      if (quick && isAdmin()) {
        const r = findRequest(quick.dataset.id);
        if (r) {
          try {
            if (await setStatus(r, quick.dataset.quick))
              afterChange(
                `${displayId(r.id)} ${quick.dataset.quick.toLowerCase()}`,
              );
          } catch (error) {
            toast(`Could not update request: ${error.message}`, "error");
          }
        }
        return;
      }
      const cat = e.target.closest("[data-category]");
      if (cat) {
        pendingCategory = cat.dataset.category;
        location_hash("#/new");
        return;
      }
      const cancelBtn = e.target.closest("[data-cancel-row]");
      if (cancelBtn) {
        e.stopPropagation();
        const reqId = cancelBtn.dataset.cancelRow;
        const r = findRequest(reqId);
        if (r) {
          confirmDialog({
            title: `Cancel ${displayId(r.id)}?`,
            text: "This collection request will be marked as cancelled.",
          }).then(async (ok) => {
            if (!ok) return;
            try {
              if (await setStatus(r, "Cancelled"))
                afterChange(`${displayId(r.id)} cancelled`);
            } catch (error) {
              toast(`Could not cancel request: ${error.message}`, "error");
            }
          });
        }
        return;
      }
      const deleteBtn = e.target.closest("[data-delete-row]");
      if (deleteBtn) {
        e.stopPropagation();
        const reqId = deleteBtn.dataset.deleteRow;
        const r = findRequest(reqId);
        if (r) {
          confirmDialog({
            title: `Remove ${displayId(r.id)}?`,
            text: "This collection request will be permanently removed.",
            confirmLabel: "Remove",
          }).then(async (ok) => {
            if (!ok) return;
            try {
              await localApi(`/api/requests/${encodeURIComponent(r.id)}`, {
                method: "DELETE",
              });
              state.requests = state.requests.filter((x) => x.id !== r.id);
              if (state.openRequestId === r.id) closeDrawer();
              afterChange(`${displayId(r.id)} removed`);
            } catch (error) {
              toast(`Could not remove request: ${error.message}`, "error");
            }
          });
        }
        return;
      }
      const open = e.target.closest("[data-open]");
      if (open) openDrawer(open.dataset.open);
    });
    document.addEventListener("keydown", (e) => {
      if (
        (e.key === "Enter" || e.key === " ") &&
        e.target.matches("[data-open]") &&
        !e.target.matches("button, a")
      ) {
        e.preventDefault();
        openDrawer(e.target.dataset.open);
      }
      if (e.key === "Escape" && !$("drawer").hidden && $("modal").hidden)
        closeDrawer();
    });
    $("drawerClose").addEventListener("click", closeDrawer);
    $("drawerScrim").addEventListener("click", closeDrawer);
    $("rzpCloseBtn")?.addEventListener("click", closeRzpModal);
    $("rzpModal")?.addEventListener("click", (e) => {
      if (e.target === $("rzpModal")) closeRzpModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && $("rzpModal") && !$("rzpModal").hidden) {
        closeRzpModal();
      }
    });
    $("drawerBody").addEventListener("click", async (e) => {
      const r = findRequest(state.openRequestId);
      if (!r) return;
      if (e.target.closest("#drawerSave") && isAdmin()) {
        const v = $("drawerStatus").value;
        try {
          if (await setStatus(r, v))
            afterChange(`${displayId(r.id)} set to ${v}`);
          else toast("Status is unchanged");
        } catch (error) {
          toast(`Could not update request: ${error.message}`, "error");
        }
      }
      if (e.target.closest("#drawerDelete") && isAdmin()) {
        const ok = await confirmDialog({
          title: `Delete ${displayId(r.id)}?`,
          text: "This removes the request and its history. It can’t be undone.",
        });
        if (!ok) return;
        try {
          await localApi(`/api/requests/${encodeURIComponent(r.id)}`, {
            method: "DELETE",
          });
          state.requests = state.requests.filter((x) => x.id !== r.id);
          closeDrawer();
          afterChange(`${displayId(r.id)} deleted`);
        } catch (error) {
          toast(`Could not delete request: ${error.message}`, "error");
        }
      }
      if (e.target.closest("#drawerCancel") && !isAdmin()) {
        const ok = await confirmDialog({
          title: `Cancel ${displayId(r.id)}?`,
          text: "The request will be closed. You can submit a new one at any time.",
          confirmLabel: "Cancel request",
        });
        if (!ok) return;
        try {
          if (await setStatus(r, "Cancelled"))
            afterChange(`${displayId(r.id)} cancelled`);
        } catch (error) {
          toast(`Could not cancel request: ${error.message}`, "error");
        }
      }
    });
  }

  /* ------------------------------------------------------------------
   * Landing Page Interactions (React Bits Motion & Interactive Stepper)
   * ------------------------------------------------------------------ */
  function initLandingPage() {
    const landing = $("landing");
    if (!landing) return;

    // Sticky nav blur & shadow on scroll
    const nav = $("lpNav");
    if (nav) {
      const onScroll = () => {
        nav.classList.toggle("is-scrolled", window.scrollY > 20);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    // Mobile Hamburger Menu Sheet
    const hamburgerBtn = $("lpHamburgerBtn");
    const mobileSheet = $("lpMobileSheet");
    const sheetCloseBtn = $("lpSheetCloseBtn");
    if (hamburgerBtn && mobileSheet) {
      const toggleSheet = (open) => {
        mobileSheet.classList.toggle("is-open", open);
        hamburgerBtn.setAttribute("aria-expanded", String(open));
        document.body.style.overflow = open ? "hidden" : "";
      };
      hamburgerBtn.addEventListener("click", () => {
        const isOpen = mobileSheet.classList.contains("is-open");
        toggleSheet(!isOpen);
      });
      sheetCloseBtn?.addEventListener("click", () => toggleSheet(false));
      mobileSheet.querySelectorAll("a, button").forEach((el) => {
        el.addEventListener("click", () => toggleSheet(false));
      });
    }

    // Demo developer actions container visibility
    const demoActions = $("lpDemoActions");
    if (demoActions) {
      const isDemo =
        new URLSearchParams(window.location.search).has("demo") ||
        localStorage.getItem("ecocycle-demo") === "true" ||
        window.NEXT_PUBLIC_DEMO === true;
      demoActions.classList.toggle("hidden", !isDemo);
    }

    landing.querySelectorAll("[data-open-auth]").forEach((btn) => {
      btn.addEventListener("click", () => {
        openAuthGate(btn.dataset.openAuth === "signup" ? "signup" : "login");
      });
    });

    landing.querySelectorAll("[data-lp-map]").forEach((btn) => {
      btn.addEventListener("click", () => {
        startSession({
          name: "Eco Explorer",
          email: "guest@ecocycle.org",
          role: "user",
        });
        location_hash("#/map");
      });
    });

    landing.querySelectorAll("[data-lp-demo]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const isDemoAdmin = btn.dataset.lpDemo === "admin";
        openAuthGate("login");
        $("authRole").value = isDemoAdmin ? "admin" : "user";
        $("authEmail").value = isDemoAdmin ? "admin@example.com" : "rahul@example.com";
        $("authPassword").value = "demo1234";
        await submitAuth({ preventDefault: () => {} });
      });
    });

    $("authBackLandingBtn")?.addEventListener("click", () => {
      showLanding("landing");
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });

    // React Bits Spotlight pointer tracking on landing cards
    let lpSpotRaf = 0;
    landing.addEventListener(
      "pointermove",
      (e) => {
        if (!(e.target instanceof Element)) return;
        const card = e.target.closest(".lp-spotlight");
        if (!card || lpSpotRaf) return;
        lpSpotRaf = requestAnimationFrame(() => {
          lpSpotRaf = 0;
          const rect = card.getBoundingClientRect();
          card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
          card.style.setProperty("--my", `${e.clientY - rect.top}px`);
        });
      },
      { passive: true },
    );

    // React Bits Magnet CTA effect
    landing.querySelectorAll(".lp-btn-magnet").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
        const r = btn.getBoundingClientRect();
        const dx = Math.max(-5, Math.min(5, ((e.clientX - r.left) / r.width - 0.5) * 10));
        const dy = Math.max(-4, Math.min(4, ((e.clientY - r.top) / r.height - 0.5) * 8));
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      btn.addEventListener("pointerleave", () => {
        btn.style.transform = "";
      });
    });

    // React Bits CountUp observer for Impact band
    const countEls = landing.querySelectorAll("[data-lp-countup]");
    if (countEls.length && "IntersectionObserver" in window) {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            obs.unobserve(el);
            const target = Number(el.dataset.lpCountup) || 0;
            const dec = Number(el.dataset.lpDecimals) || 0;
            const suffix = el.dataset.lpSuffix || "";
            const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
            if (reduced) {
              el.textContent = `${dec ? target.toFixed(dec) : Math.round(target)}${suffix}`;
              return;
            }
            const start = performance.now();
            const dur = 800;
            const step = (now) => {
              const t = Math.min(1, (now - start) / dur);
              const eased = 1 - Math.pow(1 - t, 3);
              const val = target * eased;
              el.textContent = `${dec ? val.toFixed(dec) : Math.round(val)}${suffix}`;
              if (t < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          });
        },
        { threshold: 0.3 },
      );
      countEls.forEach((el) => obs.observe(el));
    }

    // Interactive Stepper data
    const LP_STEPS = [
      {
        tag: "Stage 01 · Citizen Portal",
        title: "Instant Pickup or Drop-Off Scheduling",
        desc: "Choose from 14 regulated e-waste streams (Computers, Mobile Phones, Batteries, Televisions, Networking Gear, and more). EcoCycle computes estimated diverted weight and battery safety instructions automatically before submission.",
        points: [
          "Real-time weight and CO₂ impact estimate",
          "Drop-off autofill directly from the Pan-India Leaflet map",
          "Instant cancellation or removal controls anytime",
        ],
      },
      {
        tag: "Stage 02 · Operations & Dispatch",
        title: "Verified Review & Collection Assignment",
        desc: "Operations administrators inspect incoming requests in real time, confirm safe handling requirements, and schedule certified collection vans or hub drop-off windows.",
        points: [
          "One-click approval & status progression timeline",
          "Full audit history recorded for every collection ID",
          "Automated badge alerts for awaiting review items",
        ],
      },
      {
        tag: "Stage 03 · Parts & Razorpay",
        title: "Trade Reusable Parts with Escrow Receipts",
        desc: "Before shredding, tested RAM sticks, SSDs, displays, adapters, and server PCBs can be listed in the circular marketplace and paid in INR via UPI, Cards, or Bank Account & IFSC.",
        points: [
          "HMAC-SHA256 verified Razorpay order and payment signatures",
          "Supports UPI ID, Debit/Credit Card, and Bank NEFT details",
          "Downloadable EcoCycle PDF payment receipts generated offline",
        ],
      },
      {
        tag: "Stage 04 · Sustainability Ledger",
        title: "Certified Recovery & Carbon Offset Accounting",
        desc: "Completed handovers automatically update your circular metrics—tracking total kilograms diverted, CO₂ avoided (1.44 kg/kg), recovered precious metals, and recovery completion rate.",
        points: [
          "Automatic per-user and platform-wide environmental telemetry",
          "Export clean CSV reports for audit and compliance",
          "CPCB & ISO 14001 circular lifecycle documentation",
        ],
      },
    ];

    landing.querySelectorAll("[data-lp-step]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.lpStep) || 0;
        const data = LP_STEPS[idx];
        if (!data) return;
        landing.querySelectorAll("[data-lp-step]").forEach((b, i) => {
          const active = i === idx;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-selected", String(active));
        });
        if ($("lpStageTag")) $("lpStageTag").textContent = data.tag;
        if ($("lpStageTitle")) $("lpStageTitle").textContent = data.title;
        if ($("lpStageDesc")) $("lpStageDesc").textContent = data.desc;
        if ($("lpStagePoints")) {
          $("lpStagePoints").innerHTML = data.points.map((pt) => `<li>${esc(pt)}</li>`).join("");
        }
      });
    });
  }

  /* ------------------------------------------------------------------
   * Init
   * ------------------------------------------------------------------ */
  setTheme(store.get(STORE.theme) === "dark" ? "dark" : "light");
  wire();
  initLandingPage();
  setAuthMode("login");
  localApi("/api/auth/session")
    .then((profile) => {
      if (!isProfile(profile)) {
        throw new Error("The server returned an invalid account.");
      }
      return startSession(profile);
    })
    .catch((error) => {
      const h = currentHash();
      if (h === "map") {
        startSession({ name: "Eco Explorer", email: "guest@ecocycle.org", role: "user" });
      } else if (h === "signin" || h === "signup") {
        openAuthGate(h === "signup" ? "signup" : "login");
      } else {
        showLanding("landing");
        if (!/^Please sign in|^Your session has expired/.test(error.message)) {
          $("authMessage").textContent = error.message;
        }
      }
    });
})();
