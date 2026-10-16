import { NextResponse } from "next/server";

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
};

type GoogleUserInfo = {
  name?: string;
  email?: string;
  picture?: string;
};

function getRedirectUri(request: Request) {
  const origin = new URL(request.url).origin;
  return process.env.GOOGLE_REDIRECT_URI ?? `${origin}/api/auth/google/callback`;
}

function encodeSession(user: { name: string; email: string; avatar?: string; provider: string; signedInAt: string }) {
  return Buffer.from(JSON.stringify(user)).toString("base64url");
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!code || !clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/login?auth=google-failed", request.url));
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getRedirectUri(request),
      grant_type: "authorization_code"
    })
  });

  const tokenData = (await tokenResponse.json()) as GoogleTokenResponse;

  if (!tokenResponse.ok || !tokenData.access_token) {
    return NextResponse.redirect(new URL("/login?auth=google-failed", request.url));
  }

  const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });
  const googleUser = (await userResponse.json()) as GoogleUserInfo;

  if (!userResponse.ok || !googleUser.email) {
    return NextResponse.redirect(new URL("/login?auth=google-failed", request.url));
  }

  const user = {
    name: googleUser.name ?? googleUser.email.split("@")[0],
    email: googleUser.email,
    avatar: googleUser.picture,
    provider: "Google",
    signedInAt: new Date().toISOString()
  };

  const response = NextResponse.redirect(new URL("/account", request.url));
  response.cookies.set("sealcart-auth", encodeSession(user), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  return response;
}
