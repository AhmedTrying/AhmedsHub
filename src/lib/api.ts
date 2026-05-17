import { NextResponse } from "next/server";

export const json = <T>(data: T, init?: ResponseInit) =>
  NextResponse.json(data, init);

export const noContent = () => new NextResponse(null, { status: 204 });

export const bad = (msg: string, status = 400) =>
  NextResponse.json({ error: msg }, { status });

export const serverError = (e: unknown) => {
  const msg = e instanceof Error ? e.message : "Unknown error";
  console.error("[api]", msg);
  return NextResponse.json({ error: msg }, { status: 500 });
};

/** Parse a request JSON body or return a 400 helper. */
export async function readBody<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new Error("Invalid JSON body");
  }
}
