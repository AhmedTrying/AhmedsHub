export type Priority = "High" | "Medium" | "Low";

export type ProjectStatus =
  | "New"
  | "Site Visit"
  | "Pricing"
  | "Quotation Sent"
  | "Follow Up"
  | "Won"
  | "Lost";

export type Scope =
  | "HVAC"
  | "Cleaning"
  | "MEP"
  | "Civil"
  | "Pest Control"
  | "Security"
  | "Landscaping"
  | "Electrical"
  | "Plumbing"
  | "Manpower"
  | "Consumables"
  | "Safety";

export interface Client {
  id: string;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  client: string;
  location: string;
  scope: Scope[];
  status: ProjectStatus;
  value: number;
  updated: string;
  owner: string;
  priority: Priority;
  dueDate: string;
  next: string;
  estimateId?: string;
  pinned?: boolean;
  createdAt: number;
}

export interface EstimateItem {
  id: string;
  estimateId: string;
  item: string;
  desc: string;
  category: Scope;
  unit: string;
  qty: number;
  cost: number;
  markup: number;
  notes: string;
}

export interface Estimate {
  id: string;
  projectId: string;
  name: string;
  version: string;
  quotationNumber: string;
  validity: string;
  paymentTerms: string;
  coverLetter: string;
  includeAssumptions: boolean;
  updatedAt: number;
  createdAt: number;
}

export interface RateItem {
  id: string;
  name: string;
  category: Scope;
  unit: string;
  rate: number;
  last: string;
  source: string;
  notes: string;
}

export interface ChecklistItem {
  id: string;
  siteVisitId: string;
  group: string;
  text: string;
  done: boolean;
}

export interface SiteVisit {
  id: string;
  projectId: string | null;
  title: string;
  date: string;
  contact: string;
  phone: string;
  gfa: string;
  hours: string;
  notes: string;
  createdAt: number;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  text: string;
  done: boolean;
  createdAt: number;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  tags: string[];
  project: string | null;
  pinned: boolean;
  when: string;
  createdAt: number;
}

export interface RFQ {
  id: string;
  projectId: string;
  name: string;
  client: string;
  status: ProjectStatus;
  value: number;
  priority: Priority;
  dueDate: string;
  next: string;
}

export interface Template {
  id: string;
  name: string;
  icon: string;
  color: string;
  rows: number;
  used: number;
  desc: string;
  kind: "estimate" | "checklist" | "report";
}

export type Theme = "light" | "dark";

export interface Settings {
  personalName: string;
  currency: "AED" | "USD" | "EUR" | "SAR" | "QAR";
  defaultMarkup: number;
  workingHours: string;
  theme: Theme;
  exportDefault: "PDF" | "Excel" | "Both";
  notifications: boolean;
}

export interface ActivityItem {
  id: string;
  who: string;
  what: string;
  on: string;
  when: string;
  icon: string;
  at: number;
}
