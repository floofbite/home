import { NextResponse } from "next/server";
import { removeSocialIdentity, getLogtoContext, getSocialConnectors, getSocialIdentities } from "@/lib/logto";
import { SocialUnlinkSchema } from "@/lib/schemas";
import { isFeatureEnabled } from "@/config/features";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { isAuthenticated } = await getLogtoContext();

    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isFeatureEnabled("socialIdentities")) {
      return NextResponse.json(
        {
          socialIdentities: [],
          ssoIdentities: [],
          availableConnectors: [],
        },
        { status: 200 }
      );
    }

    const [identities, availableConnectors] = await Promise.all([
      getSocialIdentities(),
      Promise.resolve(getSocialConnectors()),
    ]);

    return NextResponse.json({
      ...identities,
      availableConnectors,
    });
  } catch (error) {
    logger.error("Get social identities error:", error);

    return NextResponse.json(
      { error: "获取社交身份失败" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const target = searchParams.get("target");

    const parseResult = SocialUnlinkSchema.safeParse({ target });
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "缺少目标平台参数" },
        { status: 400 }
      );
    }

    await removeSocialIdentity(parseResult.data.target);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Unlink social identity error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    if (errorMessage.includes("404")) {
      return NextResponse.json(
        { error: "未找到该社交身份" },
        { status: 404 }
      );
    }

    if (errorMessage.includes("422") || errorMessage.includes("cannot_remove")) {
      return NextResponse.json(
        { error: "无法移除该社交身份，可能是您唯一的登录方式" },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
