import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL env var is missing. Run `npx vercel env pull .env.local` or set it in your environment."
  );
}

// Pass cache: "no-store" so Next.js (which wraps the global fetch in App Router
// with a request-memoizing cache) doesn't serve stale rows after a mutation.
// See https://neon.tech/docs/serverless/serverless-driver#caching-and-data-freshness
const sql = neon(process.env.DATABASE_URL, {
  fetchOptions: { cache: "no-store" },
});

export const db = drizzle(sql, { schema });
export { schema };
