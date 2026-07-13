import { NextResponse } from "next/server";
import { ADMIN_COOKIE, makeSession, passwordMatches } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let password = "";
  try {
    const body = await request.json();
    password = (body.password ?? "").toString();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Admin access isn't configured yet." },
      { status: 503 },
    );
  }
  if (!passwordMatches(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, makeSession(7), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return res;
}
