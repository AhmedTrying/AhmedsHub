import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { bad, json, noContent, readBody, serverError } from "@/lib/api";
import type { RateItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const patch = await readBody<Partial<RateItem>>(req);
    const [row] = await db
      .update(schema.rates)
      .set(patch)
      .where(eq(schema.rates.id, params.id))
      .returning();
    if (!row) return bad("Rate not found", 404);
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
    await db.delete(schema.rates).where(eq(schema.rates.id, params.id));
    return noContent();
  } catch (e) {
    return serverError(e);
  }
}
