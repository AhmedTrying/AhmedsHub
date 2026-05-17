/**
 * Non-interactive migration applier.
 *
 *   npx tsx scripts/apply-migrations.ts
 *
 * Reads every .sql file in ./drizzle (skipping meta/) and executes each
 * statement against Neon. Safer for CI and Windows shells than `drizzle-kit push`,
 * which needs a TTY for prompts.
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import * as fs from "node:fs";
import * as path from "node:path";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL missing. Add it to .env.local.");
}

const sql = neon(process.env.DATABASE_URL);

const migrationsDir = path.join(process.cwd(), "drizzle");
const files = fs
  .readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.error("No .sql migration files found. Run `npm run db:generate` first.");
  process.exit(1);
}

async function main() {
  for (const file of files) {
    const full = path.join(migrationsDir, file);
    const raw = fs.readFileSync(full, "utf8");
    // Drizzle separates statements with a literal `--> statement-breakpoint` line.
    const statements = raw
      .split(/-->\s*statement-breakpoint/g)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    console.log(`\n▸ ${file}  (${statements.length} statement${statements.length === 1 ? "" : "s"})`);
    for (const [i, stmt] of statements.entries()) {
      try {
        await sql.query(stmt);
        const firstLine = stmt.split("\n")[0].slice(0, 80);
        console.log(`  ✓ [${i + 1}] ${firstLine}…`);
      } catch (e: unknown) {
        const msg = (e as Error).message;
        if (msg.includes("already exists")) {
          console.log(`  · [${i + 1}] skipped (already exists)`);
          continue;
        }
        console.error(`  ✗ [${i + 1}] failed:`, msg);
        throw e;
      }
    }
  }
  console.log("\n✓ All migrations applied.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
