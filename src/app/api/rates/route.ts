import { db, schema } from "@/lib/db";
import { bad, json, readBody, serverError } from "@/lib/api";
import type { RateItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await readBody<RateItem>(req);
    if (!body.id || !body.name) return bad("id and name required");
    const [row] = await db.insert(schema.rates).values(body).returning();
    return json(row, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
