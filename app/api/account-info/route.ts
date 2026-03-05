import { NextResponse } from "next/server";
import { getAccountInfo, getLogtoContext } from "@/lib/logto";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { isAuthenticated } = await getLogtoContext();

    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountInfo = await getAccountInfo();
    return NextResponse.json(accountInfo);
  } catch (error) {
    logger.error("Failed to get account info:", error);

    return NextResponse.json(
      { error: "Failed to fetch account info" },
      { status: 500 }
    );
  }
}
