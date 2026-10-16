import { NextResponse } from "next/server";

function getRedirectUri(request: Request) {
  const origin = new URL(request.url).origin;
  return process.env.GOOGLE_REDIRECT_URI ?? `${origin}/api/auth/google/callback`;
}

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/login?auth=google-config-required", request.url));
  }

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", getRedirectUri(request));
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("prompt", "select_account");

  return NextResponse.redirect(authUrl);
}
