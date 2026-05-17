import { db, schema } from "@/lib/db";
import { bad, json, readBody, serverError } from "@/lib/api";
import type { Note } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await readBody<Note>(req);
    if (!body.id || !body.title) return bad("id and title required");
    const [row] = await db.insert(schema.notes).values(body).returning();
    return json(row, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
