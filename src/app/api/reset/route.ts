import { db, schema } from "@/lib/db";
import { sql } from "drizzle-orm";
import { json, serverError } from "@/lib/api";
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
} from "@/lib/seed";

export const dynamic = "force-dynamic";

/**
 * POST /api/reset
 * Wipe and reseed the workspace with the same data the prototype shipped.
 * Used by Settings → "Reset workspace".
 */
export async function POST() {
  try {
    await db.execute(sql`
      TRUNCATE TABLE
        project_tasks, activity, templates, rfqs,
        checklist_items, site_visits, notes, rates,
        estimate_items, estimates, projects, clients,
        settings, app_state
      RESTART IDENTITY
    `);

    await db.insert(schema.clients).values(seedClients);
    await db.insert(schema.projects).values(seedProjects);
    await db.insert(schema.estimates).values(seedEstimates);
    await db.insert(schema.estimateItems).values(seedEstimateItems);
    await db.insert(schema.rates).values(seedRates);
    await db.insert(schema.notes).values(seedNotes);
    await db.insert(schema.siteVisits).values(seedSiteVisits);
    await db.insert(schema.checklistItems).values(seedChecklistItems);
    await db.insert(schema.rfqs).values(seedRfqs);
    await db.insert(schema.templates).values(seedTemplates);
    await db.insert(schema.activity).values(seedActivity);
    await db.insert(schema.projectTasks).values(seedProjectTasks);
    await db.insert(schema.settings).values({ id: "default", ...seedSettings });
    await db.insert(schema.appState).values({
      key: "activeEstimateId",
      value: "est_1",
    });

    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}
