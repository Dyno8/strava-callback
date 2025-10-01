import crypto from "node:crypto";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";

function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(input: string): Buffer {
  const pad = 4 - (input.length % 4);
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/") + (pad < 4 ? "=".repeat(pad) : "");
  return Buffer.from(normalized, "base64");
}

function verifyState(state: string, secret: string): { telegramId: number } {
  const parts = state.split(".");
  if (parts.length !== 2) {
    throw new Error("Invalid state payload");
  }
  const [payloadRaw, providedSignature] = parts;
  const expectedSignature = base64UrlEncode(
    crypto.createHmac("sha256", secret).update(payloadRaw).digest()
  );
  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    throw new Error("State signature mismatch");
  }
  const payloadJson = base64UrlDecode(payloadRaw).toString("utf8");
  const payload = JSON.parse(payloadJson) as { telegramId?: number; issuedAt?: number };
  if (!payload.telegramId) {
    throw new Error("State payload missing telegramId");
  }
  if (payload.issuedAt && Date.now() - payload.issuedAt > 5 * 60 * 1000) {
    throw new Error("State token expired");
  }
  return { telegramId: payload.telegramId };
}

async function exchangeCodeWithStrava(code: string) {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Strava credentials are not configured");
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code",
  });

  const response = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    const err = new Error("Failed to exchange code with Strava");
    (err as any).details = errorText;
    throw err;
  }

  return response.json();
}

async function notifyBot(telegramId: number, tokens: unknown, code: string) {
  const botExchangeUrl = process.env.BOT_OAUTH_URL;
  if (!botExchangeUrl) {
    return;
  }

  const response = await fetch(botExchangeUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ telegramId, code, tokens }),
  });
  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(`Bot exchange endpoint responded with ${response.status}: ${details}`);
  }
}

async function notifyTelegram(telegramId: number, message: string) {
  const botToken = process.env.TELEGRAM_TOKEN;
  if (!botToken) {
    return;
  }

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: telegramId,
      text: message,
    }),
  });
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const secret = process.env.STATE_SECRET;

  if (!code || !state) {
    return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
  }
  if (!secret) {
    return NextResponse.json({ error: "STATE_SECRET is not configured" }, { status: 500 });
  }

  try {
    const { telegramId } = verifyState(state, secret);
    const tokens = await exchangeCodeWithStrava(code);
    await notifyBot(telegramId, tokens, code);
    await notifyTelegram(
      telegramId,
      "✅ Strava account linked! You can return to the bot and upload GPX files."
    );

    const redirectUrl = process.env.SUCCESS_REDIRECT_URL;
    if (redirectUrl) {
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    const payload =
      error && typeof error === "object" && "details" in error ? (error as any).details : undefined;
    console.error("Strava callback error", error, payload);
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message, details: payload }, { status: 400 });
  }
}
