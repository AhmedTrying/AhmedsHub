import { db, schema } from "@/lib/db";
import { bad, json, readBody, serverError } from "@/lib/api";
import type { ChecklistItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await readBody<ChecklistItem>(req);
    if (!body.id || !body.siteVisitId) return bad("id and siteVisitId required");
    const [row] = await db.insert(schema.checklistItems).values(body).returning();
    return json(row, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
