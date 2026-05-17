import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { json, readBody, serverError } from "@/lib/api";
import type { Settings } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/settings — upserts the singleton row with id="default".
 */
export async function PATCH(req: Request) {
  try {
    const patch = await readBody<Partial<Settings>>(req);
    const [row] = await db
      .update(schema.settings)
      .set(patch)
      .where(eq(schema.settings.id, "default"))
      .returning();
    return json(row);
  } catch (e) {
    return serverError(e);
  }
}
