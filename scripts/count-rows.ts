import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL missing");
}
const sql = neon(process.env.DATABASE_URL);

const tables = [
  "clients",
  "projects",
  "estimates",
  "estimate_items",
  "rates",
  "notes",
  "site_visits",
  "checklist_items",
  "rfqs",
  "templates",
  "activity",
  "project_tasks",
  "settings",
  "app_state",
];

async function main() {
  for (const t of tables) {
    const r = await sql.query(`SELECT count(*)::int AS n FROM ${t}`);
    console.log(`${t.padEnd(20)} ${(r as { n: number }[])[0].n}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
