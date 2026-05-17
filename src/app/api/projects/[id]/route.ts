import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { bad, json, noContent, readBody, serverError } from "@/lib/api";
import type { Project } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const patch = await readBody<Partial<Project>>(req);
    const next = { ...patch, updated: "just now" };
    const [row] = await db
      .update(schema.projects)
      .set(next)
      .where(eq(schema.projects.id, params.id))
      .returning();
    if (!row) return bad("Project not found", 404);
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
    await db.delete(schema.projects).where(eq(schema.projects.id, params.id));
    return noContent();
  } catch (e) {
    return serverError(e);
  }
}
