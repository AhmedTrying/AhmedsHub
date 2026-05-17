import { db, schema } from "@/lib/db";
import { bad, json, readBody, serverError } from "@/lib/api";
import type { EstimateItem } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * POST /api/estimate-items/bulk
 * Body: { items: EstimateItem[] }
 *
 * Used by the rate-picker modal to push multiple selected rates into an
 * estimate in a single round-trip.
 */
export async function POST(req: Request) {
  try {
    const body = await readBody<{ items: EstimateItem[] }>(req);
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return bad("items must be a non-empty array");
    }
    const rows = await db.insert(schema.estimateItems).values(body.items).returning();
    return json(rows, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
