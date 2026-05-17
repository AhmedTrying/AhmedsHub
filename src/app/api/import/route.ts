import { db, schema } from "@/lib/db";
import { sql } from "drizzle-orm";
import { bad, json, readBody, serverError } from "@/lib/api";

export const dynamic = "force-dynamic";

interface ImportPayload {
  data?: {
    clients?: unknown[];
    projects?: unknown[];
    estimates?: unknown[];
    estimateItems?: unknown[];
    rates?: unknown[];
    notes?: unknown[];
    siteVisits?: unknown[];
    checklistItems?: unknown[];
    rfqs?: unknown[];
    templates?: unknown[];
    activity?: unknown[];
    projectTasks?: unknown[];
    settings?: Record<string, unknown>;
  };
}

/**
 * POST /api/import — wipes everything and inserts the provided payload.
 * Accepts both `{ data: {...} }` (export envelope) and bare `{...}` shapes.
 */
export async function POST(req: Request) {
  try {
    const body = await readBody<ImportPayload>(req);
    const d = body.data ?? (body as unknown as ImportPayload["data"]);
    if (!d) return bad("Empty payload");

    await db.execute(sql`
      TRUNCATE TABLE
        project_tasks, activity, templates, rfqs,
        checklist_items, site_visits, notes, rates,
        estimate_items, estimates, projects, clients,
        settings, app_state
      RESTART IDENTITY
    `);

    type AnyTable = Parameters<typeof db.insert>[0];
    const ins = async <T extends Record<string, unknown>>(
      table: keyof typeof schema,
      rows: T[] | undefined
    ) => {
      if (!rows || rows.length === 0) return;
      const t = schema[table] as unknown as AnyTable;
      await db.insert(t).values(rows as never);
    };

    await ins("clients", d.clients as never[]);
    await ins("projects", d.projects as never[]);
    await ins("estimates", d.estimates as never[]);
    await ins("estimateItems", d.estimateItems as never[]);
    await ins("rates", d.rates as never[]);
    await ins("notes", d.notes as never[]);
    await ins("siteVisits", d.siteVisits as never[]);
    await ins("checklistItems", d.checklistItems as never[]);
    await ins("rfqs", d.rfqs as never[]);
    await ins("templates", d.templates as never[]);
    await ins("activity", d.activity as never[]);
    await ins("projectTasks", d.projectTasks as never[]);

    if (d.settings) {
      await db.insert(schema.settings).values({ id: "default", ...d.settings } as never);
    }

    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}
