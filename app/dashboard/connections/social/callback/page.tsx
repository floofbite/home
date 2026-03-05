"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

function pickConnectorData(searchParams: URLSearchParams): Record<string, unknown> {
  const connectorData: Record<string, unknown> = {};

  for (const [key, value] of searchParams.entries()) {
    if (key === "target") {
      continue;
    }

    const existing = connectorData[key];

    if (existing === undefined) {
      connectorData[key] = value;
      continue;
    }

    connectorData[key] = Array.isArray(existing)
      ? [...existing, value]
      : [existing, value];
  }

  return connectorData;
}

export default function SocialCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    let active = true;

    const completeBinding = async () => {
      try {
        const target = searchParams.get("target");
        const state = searchParams.get("state");

        if (!target || !state) {
          throw new Error("缺少社交绑定回调参数");
        }

        const connectorData = pickConnectorData(searchParams);

        if (Object.keys(connectorData).length === 0) {
          throw new Error("未获取到有效的社交授权数据");
        }

        const res = await fetch("/api/account/identities/social/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            target,
            state,
            connectorData,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.error || "社交绑定失败");
        }

        if (!active) return;

        toast({
          title: "绑定成功",
          description: "社交账号已成功绑定",
        });

        router.replace("/dashboard/connections?show_success=social");
      } catch (error) {
        if (!active) return;

        toast({
          variant: "destructive",
          title: "绑定失败",
          description: error instanceof Error ? error.message : "未知错误",
        });

        router.replace("/dashboard/connections");
      }
    };

    completeBinding();

    return () => {
      active = false;
    };
  }, [router, searchParams, toast]);

  return (
    <div className="flex items-center justify-center min-h-[320px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">正在完成社交账号绑定...</p>
      </div>
    </div>
  );
}
