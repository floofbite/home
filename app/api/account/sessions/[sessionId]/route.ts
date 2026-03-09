import { NextResponse } from "next/server";
import { getLogtoContext } from "@/lib/logto";
import { isFeatureEnabled } from "@/config/features";
import { logger } from "@/lib/logger";

/**
 * 撤销用户会话
 * DELETE /api/account/sessions/[sessionId]
 *
 * 注意：Logto 目前未提供删除用户会话的 Management API。
 * 此端点暂时返回 501 Not Implemented，并提示用户使用 Logto Account Center 管理会话。
 *
 * 参考：https://openapi.logto.io/ - Users 部分目前没有会话管理端点
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { isAuthenticated } = await getLogtoContext();

    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 检查功能是否启用
    if (!isFeatureEnabled("sessions")) {
      return NextResponse.json(
        { error: "会话管理功能未启用" },
        { status: 403 }
      );
    }

    const { sessionId } = await params;

    logger.info(`Session revocation requested for ${sessionId}`);

    // Logto 目前没有提供删除用户会话的 API
    // 建议用户通过 Logto Account Center 管理会话
    return NextResponse.json(
      {
        error: "功能暂未实现",
        message: "Logto 目前未提供会话管理 API。如需管理会话，请退出后重新登录，或联系管理员。",
        code: "NOT_IMPLEMENTED",
      },
      { status: 501 }
    );
  } catch (error) {
    logger.error("Revoke session error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
