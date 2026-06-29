import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";

export const runtime = "nodejs";

const convexUrl =
  process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL ?? "";

// Reference the mutation by name so this route compiles without the
// generated Convex types present (they appear after `npx convex dev`).
const createMessage = makeFunctionReference<"mutation">("messages:create");

export async function POST(request: Request) {
  let body: { name?: string; email?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = (body.name ?? "").toString().trim();
  const email = (body.email ?? "").toString().trim();
  const message = (body.message ?? "").toString().trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Please fill in your name, email, and message." },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  // Persist to Convex when configured.
  if (convexUrl) {
    try {
      const client = new ConvexHttpClient(convexUrl);
      await client.mutation(createMessage, { name, email, message });
    } catch (err) {
      console.error("Convex write failed:", err);
      return NextResponse.json(
        { error: "We couldn't save your message just now. Please try again." },
        { status: 502 },
      );
    }
  } else {
    // No database configured yet — don't lose the message in logs.
    console.warn(
      "[contact] NEXT_PUBLIC_CONVEX_URL not set; message not persisted:",
      { name, email, message },
    );
  }

  return NextResponse.json({ ok: true });
}
