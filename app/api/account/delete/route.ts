import { NextResponse } from "next/server";
import { deleteUserAccount, getLogtoContext } from "@/app/logto";
import { isFeatureEnabled } from "@/config/generated/features";

export async function DELETE() {
  try {
    const { isAuthenticated } = await getLogtoContext();

    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 检查功能是否启用
    if (!isFeatureEnabled("accountDeletion")) {
      return NextResponse.json(
        { error: "账户删除功能未启用" },
        { status: 403 }
      );
    }

    // 调用删除账户API
    await deleteUserAccount();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Account deletion error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
