import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { json, readBody, serverError } from "@/lib/api";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/app-state/[key]
 * Body: { value: string | null }
 *
 * Upserts a row in the tiny `app_state` kv table.  Used for things like the
 * `activeEstimateId` pointer.
 */
export async function PATCH(
  req: Request,
  { params }: { params: { key: string } }
) {
  try {
    const { value } = await readBody<{ value: string | null }>(req);

    // Try update first; if no row, insert.
    const updated = await db
      .update(schema.appState)
      .set({ value })
      .where(eq(schema.appState.key, params.key))
      .returning();

    if (updated.length === 0) {
      await db.insert(schema.appState).values({ key: params.key, value });
    }

    return json({ key: params.key, value });
  } catch (e) {
    return serverError(e);
  }
}
