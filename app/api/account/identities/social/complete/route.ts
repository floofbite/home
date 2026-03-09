import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  addSocialIdentity,
  getLogtoContext,
  getSocialConnectorByTarget,
  verifySocialVerification,
} from "@/lib/logto";
import { SocialCompleteSchema } from "@/lib/schemas";
import { isFeatureEnabled } from "@/config/features";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const SOCIAL_BINDING_COOKIE_PREFIX = "social_binding_";

function getCookieName(target: string): string {
  return `${SOCIAL_BINDING_COOKIE_PREFIX}${encodeURIComponent(target)}`;
}

function tryParseCookieValue(
  raw: string | undefined
): { state?: string; verificationRecordId?: string } | undefined {
  if (!raw) return undefined;

  try {
    const parsed = JSON.parse(raw) as {
      state?: string;
      verificationRecordId?: string;
    };

    return parsed;
  } catch {
    return undefined;
  }
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
    const parseResult = SocialCompleteSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "无效的请求参数" },
        { status: 400 }
      );
    }

    const { target, state, connectorData, identityVerificationId } = parseResult.data;

    const connector = getSocialConnectorByTarget(target);
    if (!connector) {
      return NextResponse.json(
        { error: `不支持的社交连接器: ${target}` },
        { status: 404 }
      );
    }

    const cookieStore = await cookies();
    const cookieName = getCookieName(target);
    const sessionData = tryParseCookieValue(cookieStore.get(cookieName)?.value);

    if (!sessionData?.state || !sessionData?.verificationRecordId) {
      return NextResponse.json(
        { error: "社交连接会话不存在或已过期，请重试" },
        { status: 400 }
      );
    }

    if (sessionData.state !== state) {
      logger.warn("Social binding state mismatch", {
        target,
        expectedState: sessionData.state,
        actualState: state,
      });

      cookieStore.delete(cookieName);

      return NextResponse.json(
        { error: "状态校验失败，请重试" },
        { status: 400 }
      );
    }

    const verified = await verifySocialVerification(
      sessionData.verificationRecordId,
      connectorData
    );

    await addSocialIdentity(
      verified.verificationRecordId,
      identityVerificationId
    );

    cookieStore.delete(cookieName);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Complete social binding error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    if (errorMessage.includes("identity_already_in_use")) {
      return NextResponse.json(
        { error: "该社交账号已绑定到其他账户" },
        { status: 422 }
      );
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
