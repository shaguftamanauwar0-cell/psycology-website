import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";

export const runtime = "nodejs";

const convexUrl =
  process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL ?? "";

const createIntake = makeFunctionReference<"mutation">("intakes:create");

type Body = {
  name?: string;
  age?: unknown;
  gender?: string;
  location?: string;
  email?: string;
  reason?: string;
  feelings?: unknown;
  topics?: unknown;
  spokenBefore?: string;
  language?: string;
  desiredOutcome?: string;
  notes?: string;
};

const asStringArray = (val: unknown): string[] =>
  Array.isArray(val)
    ? val.filter((x): x is string => typeof x === "string").slice(0, 20)
    : [];

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = (body.name ?? "").toString().trim();
  const email = (body.email ?? "").toString().trim();
  const gender = (body.gender ?? "").toString().trim();
  const age = Number(body.age);

  if (!name || !email || !gender || !Number.isFinite(age)) {
    return NextResponse.json(
      { error: "Please complete the required fields." },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const payload = {
    name,
    age: Math.max(0, Math.min(120, Math.round(age))),
    gender,
    location: (body.location ?? "").toString().trim() || undefined,
    email,
    reason: (body.reason ?? "").toString().trim() || undefined,
    feelings: asStringArray(body.feelings),
    topics: asStringArray(body.topics),
    spokenBefore: (body.spokenBefore ?? "").toString().trim() || undefined,
    language: (body.language ?? "").toString().trim() || undefined,
    desiredOutcome: (body.desiredOutcome ?? "").toString().trim() || undefined,
    notes: (body.notes ?? "").toString().trim() || undefined,
  };

  if (convexUrl) {
    try {
      const client = new ConvexHttpClient(convexUrl);
      await client.mutation(createIntake, payload);
    } catch (err) {
      console.error("Convex intake write failed:", err);
      return NextResponse.json(
        { error: "We couldn't save your details just now. Please try again." },
        { status: 502 },
      );
    }
  } else {
    console.warn("[intake] NEXT_PUBLIC_CONVEX_URL not set; not persisted:", {
      name,
      email,
    });
  }

  return NextResponse.json({ ok: true });
}
