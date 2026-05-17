/**
 * Idempotent DB seed.
 *
 *   npx tsx scripts/seed-db.ts
 *
 * Loads `.env.local`, connects to Neon, wipes every table, and inserts the
 * same seed data used by the localStorage prototype. Safe to re-run.
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";
import {
  seedClients,
  seedProjects,
  seedEstimates,
  seedEstimateItems,
  seedRates,
  seedNotes,
  seedSiteVisits,
  seedChecklistItems,
  seedRfqs,
  seedTemplates,
  seedActivity,
  seedProjectTasks,
  seedSettings,
} from "../src/lib/seed";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL missing. Run `npx vercel env pull .env.local`.");
}

const client = neon(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

async function main() {
  console.log("Wiping tables…");
  // Order matters only conceptually (no FKs declared) — but truncate them all.
  await db.execute(sql`
    TRUNCATE TABLE
      project_tasks, activity, templates, rfqs,
      checklist_items, site_visits, notes, rates,
      estimate_items, estimates, projects, clients,
      settings, app_state
    RESTART IDENTITY
  `);

  console.log("Inserting clients…");
  await db.insert(schema.clients).values(seedClients);

  console.log("Inserting projects…");
  await db.insert(schema.projects).values(
    seedProjects.map((p) => ({
      id: p.id,
      name: p.name,
      clientId: p.clientId,
      client: p.client,
      location: p.location,
      scope: p.scope,
      status: p.status,
      value: p.value,
      updated: p.updated,
      owner: p.owner,
      priority: p.priority,
      dueDate: p.dueDate,
      next: p.next,
      estimateId: p.estimateId ?? null,
      pinned: !!p.pinned,
      createdAt: p.createdAt,
    }))
  );

  console.log("Inserting estimates…");
  await db.insert(schema.estimates).values(seedEstimates);

  console.log("Inserting estimate items…");
  await db.insert(schema.estimateItems).values(seedEstimateItems);

  console.log("Inserting rates…");
  await db.insert(schema.rates).values(seedRates);

  console.log("Inserting notes…");
  await db.insert(schema.notes).values(seedNotes);

  console.log("Inserting site visits…");
  await db.insert(schema.siteVisits).values(seedSiteVisits);

  console.log("Inserting checklist items…");
  await db.insert(schema.checklistItems).values(seedChecklistItems);

  console.log("Inserting RFQs…");
  await db.insert(schema.rfqs).values(seedRfqs);

  console.log("Inserting templates…");
  await db.insert(schema.templates).values(seedTemplates);

  console.log("Inserting activity…");
  await db.insert(schema.activity).values(seedActivity);

  console.log("Inserting project tasks…");
  await db.insert(schema.projectTasks).values(seedProjectTasks);

  console.log("Inserting settings…");
  await db.insert(schema.settings).values({
    id: "default",
    personalName: seedSettings.personalName,
    currency: seedSettings.currency,
    defaultMarkup: seedSettings.defaultMarkup,
    workingHours: seedSettings.workingHours,
    theme: seedSettings.theme,
    exportDefault: seedSettings.exportDefault,
    notifications: seedSettings.notifications,
  });

  // Active estimate pointer
  await db.insert(schema.appState).values({
    key: "activeEstimateId",
    value: "est_1",
  });

  console.log("✓ Seed complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
