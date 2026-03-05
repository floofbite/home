import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSocialVerification, getLogtoContext, getSocialConnectorByTarget } from "@/lib/logto";
import { SocialStartSchema } from "@/lib/schemas";
import { isFeatureEnabled } from "@/config/generated/features";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const SOCIAL_BINDING_COOKIE_PREFIX = "social_binding_";
const SOCIAL_BINDING_TTL_SECONDS = 10 * 60;
const AUTHORIZATION_URI_TTL_SECONDS = 5 * 60;

function getCookieName(target: string): string {
  return `${SOCIAL_BINDING_COOKIE_PREFIX}${encodeURIComponent(target)}`;
}

function getHeaderFirstValue(headers: Headers, key: string): string | undefined {
  const raw = headers.get(key);
  if (!raw) {
    return undefined;
  }

  const first = raw.split(",")[0]?.trim();
  return first || undefined;
}

function resolveAppOrigin(request: Request): string {
  const callbackBaseUrl = process.env.SOCIAL_BINDING_CALLBACK_BASE_URL;

  if (callbackBaseUrl) {
    try {
      return new URL(callbackBaseUrl).origin.replace(/\/$/, "");
    } catch {
      logger.warn("Invalid SOCIAL_BINDING_CALLBACK_BASE_URL, fallback to request headers", {
        callbackBaseUrl,
      });
    }
  }

  const forwardedHost =
    getHeaderFirstValue(request.headers, "x-forwarded-host") ??
    getHeaderFirstValue(request.headers, "host");

  if (forwardedHost) {
    const forwardedProto = getHeaderFirstValue(request.headers, "x-forwarded-proto");
    const protocol = forwardedProto ?? (process.env.NODE_ENV === "production" ? "https" : "http");

    return `${protocol}://${forwardedHost}`.replace(/\/$/, "");
  }

  const envBaseUrl = process.env.NODE_ENV === "production"
    ? process.env.BASE_URL_PROD
    : process.env.BASE_URL_DEV;

  if (envBaseUrl) {
    try {
      return new URL(envBaseUrl).origin.replace(/\/$/, "");
    } catch {
      logger.warn("Invalid BASE_URL value, fallback to request origin", {
        envBaseUrl,
      });
    }
  }

  return new URL(request.url).origin.replace(/\/$/, "");
}

function isLocalhostOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function resolveRedirectUri(request: Request, target: string): string {
  const origin = resolveAppOrigin(request);

  if (isLocalhostOrigin(origin)) {
    logger.warn("Social redirect is using localhost origin", { origin, target });
  }

  return `${origin}/dashboard/connections/social/callback?target=${encodeURIComponent(target)}`;
}

function isRedirectUriConfigError(message: string): boolean {
  return /(invalid[_\s-]?redirect[_\s-]?uri|redirect[_\s-]?uri[^\n]*illegal)/i.test(message);
}

export async function POST(request: Request) {
  try {
    const { isAuthenticated } = await getLogtoContext();

    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isFeatureEnabled("socialIdentities")) {
      return NextResponse.json(
        { error: "社交身份功能未启用" },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = SocialStartSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "无效的请求参数" },
        { status: 400 }
      );
    }

    const { target } = parseResult.data;
    const connector = getSocialConnectorByTarget(target);

    if (!connector) {
      return NextResponse.json(
        { error: `不支持的社交连接器: ${target}` },
        { status: 404 }
      );
    }

    if (!connector.connectorId) {
      return NextResponse.json(
        { error: `连接器 ${target} 未配置 connectorId` },
        { status: 400 }
      );
    }

    const state = crypto.randomUUID();
    const redirectUri = resolveRedirectUri(request, target);

    const verification = await createSocialVerification(
      connector.connectorId,
      state,
      redirectUri
    );

    const expiresAtMs = Number.parseInt(verification.expiresAt, 10);
    const now = Date.now();
    const expiresInSeconds = Number.isFinite(expiresAtMs)
      ? Math.max(1, Math.floor((expiresAtMs - now) / 1000))
      : SOCIAL_BINDING_TTL_SECONDS;

    const cookieStore = await cookies();
    cookieStore.set(getCookieName(target), JSON.stringify({
      state,
      verificationRecordId: verification.verificationRecordId,
    }), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: Math.min(SOCIAL_BINDING_TTL_SECONDS, Math.max(AUTHORIZATION_URI_TTL_SECONDS, expiresInSeconds)),
    });

    return NextResponse.json({
      authorizationUri: verification.authorizationUri,
    });
  } catch (error) {
    logger.error("Start social binding error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    if (isRedirectUriConfigError(errorMessage)) {
      return NextResponse.json(
        {
          error: "redirect_uri 不合法。当前使用的是应用回调地址，请在第三方平台白名单中注册：{应用域名}/dashboard/connections/social/callback，并确保与实际协议/域名/端口完全一致。",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
