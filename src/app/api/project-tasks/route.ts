import { db, schema } from "@/lib/db";
import { bad, json, readBody, serverError } from "@/lib/api";
import type { ProjectTask } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await readBody<ProjectTask>(req);
    if (!body.id || !body.projectId) return bad("id and projectId required");
    const [row] = await db.insert(schema.projectTasks).values(body).returning();
    return json(row, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
