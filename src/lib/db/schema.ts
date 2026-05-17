import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  bigint,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";

/* ============================ CLIENTS ============================ */
export const clients = pgTable("clients", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  contact: text("contact"),
  email: text("email"),
  phone: text("phone"),
});

/* ============================ PROJECTS ============================ */
export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  clientId: text("client_id").notNull().default(""),
  client: text("client").notNull(),
  location: text("location").notNull(),
  scope: jsonb("scope").$type<string[]>().notNull().default([]),
  status: text("status").notNull(),
  value: real("value").notNull().default(0),
  updated: text("updated").notNull().default(""),
  owner: text("owner").notNull(),
  priority: text("priority").notNull(),
  dueDate: text("due_date").notNull().default(""),
  next: text("next").notNull().default(""),
  estimateId: text("estimate_id"),
  pinned: boolean("pinned").notNull().default(false),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

/* ============================ ESTIMATES ============================ */
export const estimates = pgTable("estimates", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  name: text("name").notNull(),
  version: text("version").notNull(),
  quotationNumber: text("quotation_number").notNull(),
  validity: text("validity").notNull(),
  paymentTerms: text("payment_terms").notNull(),
  coverLetter: text("cover_letter").notNull().default(""),
  includeAssumptions: boolean("include_assumptions").notNull().default(true),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

/* ============================ ESTIMATE ITEMS ============================ */
export const estimateItems = pgTable("estimate_items", {
  id: text("id").primaryKey(),
  estimateId: text("estimate_id").notNull(),
  item: text("item").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  unit: text("unit").notNull(),
  qty: real("qty").notNull().default(0),
  cost: real("cost").notNull().default(0),
  markup: real("markup").notNull().default(0),
  notes: text("notes").notNull().default(""),
});

/* ============================ RATES ============================ */
export const rates = pgTable("rates", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  unit: text("unit").notNull(),
  rate: real("rate").notNull().default(0),
  last: text("last").notNull().default(""),
  source: text("source").notNull().default(""),
  notes: text("notes").notNull().default(""),
});

/* ============================ NOTES ============================ */
export const notes = pgTable("notes", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  projectId: text("project_id"),
  pinned: boolean("pinned").notNull().default(false),
  whenLabel: text("when_label").notNull().default(""),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

/* ============================ SITE VISITS ============================ */
export const siteVisits = pgTable("site_visits", {
  id: text("id").primaryKey(),
  projectId: text("project_id"),
  title: text("title").notNull(),
  date: text("date").notNull().default(""),
  contact: text("contact").notNull().default(""),
  phone: text("phone").notNull().default(""),
  gfa: text("gfa").notNull().default(""),
  hours: text("hours").notNull().default(""),
  notes: text("notes").notNull().default(""),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

/* ============================ CHECKLIST ITEMS ============================ */
export const checklistItems = pgTable("checklist_items", {
  id: text("id").primaryKey(),
  siteVisitId: text("site_visit_id").notNull(),
  groupName: text("group_name").notNull(),
  text: text("text").notNull(),
  done: boolean("done").notNull().default(false),
});

/* ============================ RFQs ============================ */
export const rfqs = pgTable("rfqs", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().default(""),
  name: text("name").notNull(),
  client: text("client").notNull(),
  status: text("status").notNull(),
  value: real("value").notNull().default(0),
  priority: text("priority").notNull(),
  dueDate: text("due_date").notNull().default(""),
  next: text("next").notNull().default(""),
});

/* ============================ TEMPLATES ============================ */
export const templates = pgTable("templates", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull().default(""),
  color: text("color").notNull().default(""),
  rows: integer("rows").notNull().default(0),
  used: integer("used").notNull().default(0),
  description: text("description").notNull().default(""),
  kind: text("kind").notNull(),
});

/* ============================ ACTIVITY ============================ */
export const activity = pgTable("activity", {
  id: text("id").primaryKey(),
  who: text("who").notNull(),
  what: text("what").notNull(),
  onLabel: text("on_label").notNull(),
  whenLabel: text("when_label").notNull().default(""),
  icon: text("icon").notNull().default(""),
  at: bigint("at", { mode: "number" }).notNull(),
});

/* ============================ PROJECT TASKS ============================ */
export const projectTasks = pgTable("project_tasks", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  text: text("text").notNull(),
  done: boolean("done").notNull().default(false),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

/* ============================ SETTINGS (singleton row) ============================ */
export const settings = pgTable("settings", {
  // Always the literal string "default"
  id: text("id").primaryKey(),
  personalName: text("personal_name").notNull().default("Ahmed H."),
  currency: text("currency").notNull().default("AED"),
  defaultMarkup: real("default_markup").notNull().default(20),
  workingHours: text("working_hours").notNull().default("06:00 – 18:00"),
  theme: text("theme").notNull().default("light"),
  exportDefault: text("export_default").notNull().default("PDF"),
  notifications: boolean("notifications").notNull().default(true),
});

/* ============================ APP STATE (single-user kv) ============================ */
export const appState = pgTable("app_state", {
  key: text("key").primaryKey(),
  value: text("value"),
});

/* Re-export types Drizzle infers from each table */
export type DBClient = typeof clients.$inferSelect;
export type DBProject = typeof projects.$inferSelect;
export type DBEstimate = typeof estimates.$inferSelect;
export type DBEstimateItem = typeof estimateItems.$inferSelect;
export type DBRate = typeof rates.$inferSelect;
export type DBNote = typeof notes.$inferSelect;
export type DBSiteVisit = typeof siteVisits.$inferSelect;
export type DBChecklistItem = typeof checklistItems.$inferSelect;
export type DBRFQ = typeof rfqs.$inferSelect;
export type DBTemplate = typeof templates.$inferSelect;
export type DBActivity = typeof activity.$inferSelect;
export type DBProjectTask = typeof projectTasks.$inferSelect;
export type DBSettings = typeof settings.$inferSelect;

void primaryKey; // imported for future composite keys
