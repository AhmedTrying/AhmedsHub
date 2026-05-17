import { db, schema } from "@/lib/db";
import { json, serverError } from "@/lib/api";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/state — single round-trip to hydrate the entire client store.
 *
 * Returns the same shape the Zustand store keeps in memory. Settings is the
 * `default` singleton row, unwrapped. `activeEstimateId` is pulled from the
 * `app_state` kv table.
 */
export async function GET() {
  try {
    const [
      clients,
      projects,
      estimates,
      estimateItems,
      rates,
      notes,
      siteVisits,
      checklistItems,
      rfqs,
      templates,
      activity,
      projectTasks,
      settingsRows,
      activeEstimateRow,
    ] = await Promise.all([
      db.select().from(schema.clients),
      db.select().from(schema.projects),
      db.select().from(schema.estimates),
      db.select().from(schema.estimateItems),
      db.select().from(schema.rates),
      db.select().from(schema.notes),
      db.select().from(schema.siteVisits),
      db.select().from(schema.checklistItems),
      db.select().from(schema.rfqs),
      db.select().from(schema.templates),
      db.select().from(schema.activity),
      db.select().from(schema.projectTasks),
      db.select().from(schema.settings).where(eq(schema.settings.id, "default")),
      db
        .select()
        .from(schema.appState)
        .where(eq(schema.appState.key, "activeEstimateId")),
    ]);

    const settings = settingsRows[0] ?? null;
    const activeEstimateId = activeEstimateRow[0]?.value ?? null;

    return json({
      clients,
      projects,
      estimates,
      estimateItems,
      rates,
      notes,
      siteVisits,
      checklistItems,
      rfqs,
      templates,
      activity: activity.sort((a, b) => b.at - a.at),
      projectTasks,
      settings,
      activeEstimateId,
    });
  } catch (e) {
    return serverError(e);
  }
}
