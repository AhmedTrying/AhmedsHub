import { db, schema } from "@/lib/db";
import { bad, json, readBody, serverError } from "@/lib/api";
import type { EstimateItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await readBody<EstimateItem>(req);
    if (!body.id || !body.estimateId) return bad("id and estimateId required");
    const [row] = await db.insert(schema.estimateItems).values(body).returning();
    return json(row, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
