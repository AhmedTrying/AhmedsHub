import type { ProjectStatus, Scope, Priority } from "./types";

export const statusTint: Record<ProjectStatus, string> = {
  New: "gray",
  "Site Visit": "yellow",
  Pricing: "blue",
  "Quotation Sent": "purple",
  "Follow Up": "orange",
  Won: "green",
  Lost: "red",
};

export const scopeTint: Record<Scope, string> = {
  HVAC: "blue",
  Cleaning: "green",
  MEP: "purple",
  Civil: "orange",
  "Pest Control": "yellow",
  Security: "gray",
  Landscaping: "green",
  Electrical: "yellow",
  Plumbing: "blue",
  Manpower: "gray",
  Consumables: "gray",
  Safety: "red",
};

export const priorityTint: Record<Priority, string> = {
  High: "red",
  Medium: "yellow",
  Low: "gray",
};

export const priorityDot: Record<Priority, string> = {
  High: "#D9534F",
  Medium: "#E8A33A",
  Low: "#9B9A93",
};

export const scopeOptions: Scope[] = [
  "HVAC",
  "Cleaning",
  "MEP",
  "Civil",
  "Pest Control",
  "Security",
  "Landscaping",
  "Electrical",
  "Plumbing",
  "Manpower",
  "Consumables",
  "Safety",
];

export const statusOptions: ProjectStatus[] = [
  "New",
  "Site Visit",
  "Pricing",
  "Quotation Sent",
  "Follow Up",
  "Won",
  "Lost",
];
