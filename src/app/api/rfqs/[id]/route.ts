import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { bad, json, readBody, serverError } from "@/lib/api";
import type { RFQ } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const patch = await readBody<Partial<RFQ>>(req);
    const [row] = await db
      .update(schema.rfqs)
      .set(patch)
      .where(eq(schema.rfqs.id, params.id))
      .returning();
    if (!row) return bad("RFQ not found", 404);
    return json(row);
  } catch (e) {
    return serverError(e);
  }
}
