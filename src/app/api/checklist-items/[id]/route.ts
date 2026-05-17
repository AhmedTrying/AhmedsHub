import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { bad, json, noContent, readBody, serverError } from "@/lib/api";
import type { ChecklistItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const patch = await readBody<Partial<ChecklistItem>>(req);
    const [row] = await db
      .update(schema.checklistItems)
      .set(patch)
      .where(eq(schema.checklistItems.id, params.id))
      .returning();
    if (!row) return bad("Checklist item not found", 404);
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
    await db.delete(schema.checklistItems).where(eq(schema.checklistItems.id, params.id));
    return noContent();
  } catch (e) {
    return serverError(e);
  }
}
