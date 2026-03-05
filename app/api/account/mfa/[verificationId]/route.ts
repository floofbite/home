import { NextResponse } from "next/server";
import { getAccessTokenRSC } from "@/app/logto";

/**
 * 删除 MFA 验证器
 * DELETE /api/account/mfa/[verificationId]
 * 
 * Headers: logto-verification-id (通过密码验证获取)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ verificationId: string }> }
) {
  try {
    const accessToken = await getAccessTokenRSC();

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { verificationId } = await params;
    const verificationRecordId = request.headers.get("logto-verification-id");

    if (!verificationRecordId) {
      return NextResponse.json(
        { error: "缺少验证记录 ID" },
        { status: 400 }
      );
    }

    const logtoEndpoint = process.env.LOGTO_ENDPOINT;

    const res = await fetch(
      `${logtoEndpoint}/api/my-account/mfa-verifications/${verificationId}`,
      {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "logto-verification-id": verificationRecordId,
        },
      }
    );

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      console.error("Delete MFA verification error:", res.status, errorText);
      return NextResponse.json(
        { error: `删除 MFA 验证器失败: ${res.status}` },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete MFA verification error:", error);
    return NextResponse.json(
      { error: "删除 MFA 验证器失败" },
      { status: 500 }
    );
  }
}

/**
 * 更新 MFA 验证器名称（仅 WebAuthn）
 * PATCH /api/account/mfa/[verificationId]
 * 
 * Body: { name: string }
 * Headers: logto-verification-id
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ verificationId: string }> }
) {
  try {
    const accessToken = await getAccessTokenRSC();

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { verificationId } = await params;
    const verificationRecordId = request.headers.get("logto-verification-id");

    if (!verificationRecordId) {
      return NextResponse.json(
        { error: "缺少验证记录 ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "缺少名称参数" },
        { status: 400 }
      );
    }

    const logtoEndpoint = process.env.LOGTO_ENDPOINT;

    const res = await fetch(
      `${logtoEndpoint}/api/my-account/mfa-verifications/${verificationId}/name`,
      {
        method: "PATCH",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "logto-verification-id": verificationRecordId,
          "content-type": "application/json",
        },
        body: JSON.stringify({ name }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      console.error("Update MFA name error:", res.status, errorText);
      return NextResponse.json(
        { error: `更新名称失败: ${res.status}` },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update MFA name error:", error);
    return NextResponse.json(
      { error: "更新名称失败" },
      { status: 500 }
    );
  }
}
