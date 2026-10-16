import { NextResponse } from "next/server";

function readCookie(header: string | null, name: string) {
  const cookies = header?.split(";") ?? [];
  const match = cookies.find((cookie) => cookie.trim().startsWith(`${name}=`));
  return match ? decodeURIComponent(match.trim().slice(name.length + 1)) : null;
}

export async function GET(request: Request) {
  const session = readCookie(request.headers.get("cookie"), "sealcart-auth");

  if (!session) {
    return NextResponse.json({ user: null });
  }

  try {
    const user = JSON.parse(Buffer.from(session, "base64url").toString("utf8"));
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
