/* global React */
// ============ DUMMY DATA ============
const PROJECTS = [
  { id: "p1", name: "Marina Heights Tower — Annual FM", client: "Damac Properties", location: "Dubai Marina", scope: ["Cleaning", "HVAC", "Pest Control"], status: "Quotation Sent", value: 482000, updated: "2h ago", owner: "Ahmed", priority: "High", dueDate: "May 22", next: "Follow-up call with Procurement" },
  { id: "p2", name: "JLT Cluster B — Reactive MEP", client: "Better Homes", location: "JLT, Dubai", scope: ["MEP", "Electrical", "Plumbing"], status: "Pricing", value: 138500, updated: "5h ago", owner: "Ahmed", priority: "Medium", dueDate: "May 20", next: "Finalize manpower rates" },
  { id: "p3", name: "Al Quoz Warehouse Cleaning", client: "Al Futtaim Logistics", location: "Al Quoz, Dubai", scope: ["Cleaning"], status: "Site Visit", value: 96000, updated: "Yesterday", owner: "Ahmed", priority: "Medium", dueDate: "May 18", next: "Site visit scheduled 3pm" },
  { id: "p4", name: "Mira Townhouses Landscaping", client: "Emaar Communities", location: "Mira, Reem", scope: ["Landscaping"], status: "New", value: 0, updated: "Today", owner: "Ahmed", priority: "Low", dueDate: "May 25", next: "Request scope clarification" },
  { id: "p5", name: "Sharjah Corniche Mall HVAC PPM", client: "Lulu Group", location: "Sharjah", scope: ["HVAC"], status: "Follow Up", value: 215000, updated: "2d ago", owner: "Ahmed", priority: "High", dueDate: "May 19", next: "Send revised quotation v2" },
  { id: "p6", name: "DIFC Office Refresh — Deep Clean", client: "Standard Chartered", location: "DIFC, Dubai", scope: ["Cleaning"], status: "Won", value: 64500, updated: "3d ago", owner: "Ahmed", priority: "Medium", dueDate: "—", next: "Hand over to operations" },
  { id: "p7", name: "Yas Island Villas Pest Control", client: "Aldar Estates", location: "Yas Island, Abu Dhabi", scope: ["Pest Control"], status: "Lost", value: 0, updated: "1w ago", owner: "Ahmed", priority: "Low", dueDate: "—", next: "Lost to incumbent — debrief" },
  { id: "p8", name: "Mall of the Emirates Tenant Civil Works", client: "Majid Al Futtaim", location: "Al Barsha, Dubai", scope: ["Civil", "MEP"], status: "Pricing", value: 312000, updated: "4h ago", owner: "Ahmed", priority: "High", dueDate: "May 21", next: "Cost-up by EOD Wednesday" },
];

const RATES = [
  { id: "r1", name: "Cleaning operative — Day shift", category: "Manpower", unit: "month", rate: 2400, last: "May 12", source: "Aqua Bright LLC", notes: "Includes uniforms & insurance" },
  { id: "r2", name: "Deep cleaning per sqm", category: "Cleaning", unit: "sqm", rate: 6.50, last: "May 10", source: "Internal benchmark", notes: "Excl. consumables" },
  { id: "r3", name: "HVAC filter — pleated MERV 8", category: "HVAC", unit: "pc", rate: 38, last: "May 9", source: "Camfil ME", notes: "20×20×2 std" },
  { id: "r4", name: "AHU coil chemical clean", category: "HVAC", unit: "unit", rate: 480, last: "May 5", source: "Subcontractor — TKS", notes: "Per unit, ≤15TR" },
  { id: "r5", name: "Pest control — quarterly visit", category: "Pest Control", unit: "visit", rate: 350, last: "Apr 28", source: "Rentokil Boecker", notes: "1–3 BR residential" },
  { id: "r6", name: "Generator inspection (≤500 kVA)", category: "Electrical", unit: "visit", rate: 650, last: "Apr 26", source: "PowerGen FZE", notes: "Monthly PPM" },
  { id: "r7", name: "Plumbing repair allowance", category: "Plumbing", unit: "month", rate: 1200, last: "Apr 22", source: "Allowance", notes: "Materials excluded" },
  { id: "r8", name: "Cleaning consumables kit", category: "Consumables", unit: "month", rate: 320, last: "Apr 18", source: "Sara Hygiene", notes: "Per 1000 sqm GFA" },
  { id: "r9", name: "Safety officer — site visits", category: "Safety", unit: "day", rate: 720, last: "Apr 15", source: "Internal", notes: "Required for hot works" },
  { id: "r10", name: "Civil patch repair (concrete)", category: "Civil", unit: "sqm", rate: 140, last: "Apr 11", source: "Al Naboodah", notes: "≤20mm depth" },
  { id: "r11", name: "MV switchgear inspection", category: "Electrical", unit: "panel", rate: 1100, last: "Apr 8", source: "ABB AE", notes: "Annual PPM" },
  { id: "r12", name: "Carpet shampooing", category: "Cleaning", unit: "sqm", rate: 4.20, last: "Apr 4", source: "Aqua Bright LLC", notes: "Min 200 sqm" },
];

const ESTIMATE_ITEMS_SEED = [
  { id: "e1", item: "C-01", desc: "Monthly cleaning manpower — 4 operatives, day shift", category: "Manpower", unit: "month", qty: 12, cost: 9600, markup: 18, notes: "1 supervisor included" },
  { id: "e2", item: "C-02", desc: "Cleaning consumables (chemicals + paper)", category: "Consumables", unit: "month", qty: 12, cost: 320, markup: 22, notes: "Per 1000 sqm" },
  { id: "e3", item: "H-01", desc: "AHU filter replacement — pleated MERV 8", category: "HVAC", unit: "pc", qty: 64, cost: 38, markup: 25, notes: "Quarterly cycle ×4" },
  { id: "e4", item: "H-02", desc: "AHU coil chemical clean", category: "HVAC", unit: "unit", qty: 16, cost: 480, markup: 25, notes: "Twice per year" },
  { id: "e5", item: "P-01", desc: "Pest control — quarterly visits, common areas", category: "Pest Control", unit: "visit", qty: 4, cost: 350, markup: 30, notes: "All BoH areas" },
  { id: "e6", item: "E-01", desc: "Generator inspection — 400 kVA standby", category: "Electrical", unit: "visit", qty: 12, cost: 650, markup: 22, notes: "Monthly PPM" },
  { id: "e7", item: "PL-01", desc: "Plumbing repair allowance", category: "Plumbing", unit: "month", qty: 12, cost: 1200, markup: 15, notes: "Materials excluded" },
];

const NOTES_SEED = [
  { id: "n1", title: "Client prefers monthly contract", body: "Marina Heights procurement said annual lump sum is hard to approve. Pitch monthly billing in cover letter.", tags: ["Marina Heights", "Pricing"], project: "p1", pinned: true, when: "Today" },
  { id: "n2", title: "Confirm if consumables are included", body: "For DIFC scope, ask if chemicals + paper consumables fall under FM or tenant supply. Affects price by ~AED 4k.", tags: ["DIFC", "Scope"], project: "p6", pinned: true, when: "Today" },
  { id: "n3", title: "Manager: re-check manpower calc", body: "Faisal flagged that I used 240 working hours; UAE standard is 208 for 5-day week. Re-run rates.", tags: ["Internal", "Action"], project: null, pinned: false, when: "Yesterday" },
  { id: "n4", title: "Need supplier rate for HVAC filters", body: "Camfil quoted 38 AED/pc but ask for bulk pricing >200 pcs. Also try AAF.", tags: ["HVAC", "Supplier"], project: "p1", pinned: false, when: "Yesterday" },
  { id: "n5", title: "JLT — access only via service lift", body: "Building manager will issue gate passes 24h ahead. Tools >2m need approval.", tags: ["JLT", "Site"], project: "p2", pinned: false, when: "2 days ago" },
  { id: "n6", title: "Boecker is incumbent at Yas Villas", body: "Renewal at AED 95k. We pitched 87k but lost on relationship. Lesson: lead with response time SLA.", tags: ["Lost", "Pest Control"], project: "p7", pinned: false, when: "1 week ago" },
];

const CHECKLIST_SEED = {
  "General": [
    { id: "g1", text: "Take site photos (entrance, BoH, plantrooms)", done: true },
    { id: "g2", text: "Confirm working hours & access windows", done: true },
    { id: "g3", text: "Ask for floor plans / area takeoffs", done: false },
    { id: "g4", text: "Check access restrictions (lifts, parking)", done: false },
    { id: "g5", text: "Confirm contract duration & start date", done: true },
    { id: "g6", text: "Note material responsibility (client vs FM)", done: false },
  ],
  "Cleaning": [
    { id: "c1", text: "Count toilets / wash basins", done: true },
    { id: "c2", text: "Measure carpet vs hard floor sqm", done: false },
    { id: "c3", text: "Identify high-traffic vs low-traffic zones", done: false },
    { id: "c4", text: "Confirm shift pattern (day / night / split)", done: true },
  ],
  "HVAC": [
    { id: "h1", text: "Count AHU / FCU units & TR rating", done: true },
    { id: "h2", text: "Note filter sizes & accessibility", done: false },
    { id: "h3", text: "Check BMS availability & access", done: false },
  ],
  "Electrical": [
    { id: "e1", text: "Identify panels & switchgear", done: false },
    { id: "e2", text: "Generator make, model, kVA rating", done: false },
    { id: "e3", text: "Standby UPS units & runtime", done: false },
  ],
  "Plumbing": [
    { id: "p1", text: "Locate water tanks & pumps", done: true },
    { id: "p2", text: "Booster pump make & maintenance log", done: false },
  ],
  "Civil": [
    { id: "ci1", text: "Note façade type & accessibility", done: false },
    { id: "ci2", text: "Identify any visible water damage / cracks", done: false },
  ],
  "Safety": [
    { id: "s1", text: "Permit-to-work requirements", done: false },
    { id: "s2", text: "PPE policy & induction needed?", done: true },
    { id: "s3", text: "Fire / hot works restrictions", done: false },
  ],
};

const ACTIVITY = [
  { who: "You", what: "saved estimate", on: "Marina Heights Tower — v3", when: "12 min ago", icon: "estimate" },
  { who: "You", what: "added rate", on: "AHU coil chemical clean", when: "1h ago", icon: "rates" },
  { who: "Faisal", what: "commented on", on: "JLT Cluster B — Reactive MEP", when: "2h ago", icon: "notes" },
  { who: "You", what: "moved RFQ to Quotation Sent", on: "Marina Heights Tower", when: "3h ago", icon: "kanban" },
  { who: "You", what: "completed site visit", on: "Al Quoz Warehouse", when: "Yesterday", icon: "site" },
  { who: "You", what: "created project", on: "Mira Townhouses Landscaping", when: "Yesterday", icon: "projects" },
];

const TEMPLATES = [
  { id: "t1", name: "Cleaning estimate — Annual contract", icon: "🧽", color: "green", rows: 14, used: 8, desc: "Manpower + consumables + deep clean cycles. Tuned for residential towers ≥10 floors." },
  { id: "t2", name: "HVAC PPM template", icon: "❄", color: "blue", rows: 9, used: 12, desc: "AHU / FCU filter, coil clean, BMS check, quarterly cycle. Includes filter takeoff sheet." },
  { id: "t3", name: "MEP reactive maintenance", icon: "⚡", color: "purple", rows: 11, used: 5, desc: "Call-out + materials allowance + on-call manpower. Good for small commercial." },
  { id: "t4", name: "Pest control quarterly", icon: "🪲", color: "yellow", rows: 5, used: 9, desc: "BoH + common areas, 4 visits/year. Excl. bait stations & rodent traps." },
  { id: "t5", name: "Site visit report", icon: "📋", color: "gray", rows: 22, used: 18, desc: "Pre-filled checklist + observations + photo grid. Exports to PDF in 1 click." },
  { id: "t6", name: "Quotation assumptions", icon: "📄", color: "orange", rows: 16, used: 14, desc: "Standard inclusions, exclusions, validity, payment terms. Edit per client." },
];

Object.assign(window, {
  PROJECTS, RATES, ESTIMATE_ITEMS_SEED, NOTES_SEED, CHECKLIST_SEED, ACTIVITY, TEMPLATES
});
