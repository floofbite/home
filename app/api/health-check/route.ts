import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

/**
 * 健康检查代理
 * GET /api/health-check?url=https://example.com
 *
 * 用于检查外部服务的可用性，避免前端直接请求遇到的 CORS 问题
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "缺少 url 参数" },
      { status: 400 }
    );
  }

  // 验证 URL 格式
  try {
    new URL(url);
  } catch {
    return NextResponse.json(
      { error: "无效的 URL" },
      { status: 400 }
    );
  }

  // 只允许 http 和 https 协议
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return NextResponse.json(
      { error: "只允许 http 和 https 协议" },
      { status: 400 }
    );
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const startTime = Date.now();
    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      // 不跟随重定向，只检查是否可达
      redirect: "manual",
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;

    // 2xx 和 3xx 都认为是在线的
    const isOnline = response.status < 400;

    return NextResponse.json({
      status: isOnline ? "online" : "offline",
      statusCode: response.status,
      latency,
    });
  } catch (error) {
    logger.debug(`Health check failed for ${url}:`, error);

    // 超时或网络错误
    return NextResponse.json(
      {
        status: "offline",
        error: error instanceof Error ? error.name : "Unknown error",
      },
      { status: 503 }
    );
  }
}
