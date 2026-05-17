import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { bad, json, noContent, readBody, serverError } from "@/lib/api";
import type { Estimate } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const patch = await readBody<Partial<Estimate>>(req);
    const next = { ...patch, updatedAt: Date.now() };
    const [row] = await db
      .update(schema.estimates)
      .set(next)
      .where(eq(schema.estimates.id, params.id))
      .returning();
    if (!row) return bad("Estimate not found", 404);
    return json(row);
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.delete(schema.estimateItems).where(eq(schema.estimateItems.estimateId, params.id));
    await db.delete(schema.estimates).where(eq(schema.estimates.id, params.id));
    return noContent();
  } catch (e) {
    return serverError(e);
  }
}
