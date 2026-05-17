import { db, schema } from "@/lib/db";
import { bad, json, readBody, serverError } from "@/lib/api";
import type { ActivityItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await readBody<ActivityItem>(req);
    if (!body.id || !body.who) return bad("id and who required");
    const [row] = await db.insert(schema.activity).values(body).returning();
    return json(row, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
