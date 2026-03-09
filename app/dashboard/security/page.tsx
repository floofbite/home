"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Key,
  Shield,
  Smartphone,
  History,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Monitor,
  ExternalLink,
} from "lucide-react";
import { AccountInfo, LoginHistoryRecord, MfaVerification } from "@/lib/logto";
import type { FeaturesConfig } from "@/config/types";
import { isFeatureEnabled as isFeatureEnabledFromConfig } from "@/lib/config/feature-helpers";
import { usePublicConfig } from "@/hooks/use-public-config";
import { accountCenterUrls, getAccountCenterSuccessType, clearAccountCenterSuccessParam } from "@/lib/logto-account-ui";

// 只显示最近 7 天的登录记录，最多 10 条
const MAX_LOGIN_HISTORY_DAYS = 7;
const MAX_LOGIN_HISTORY_ITEMS = 10;

export default function SecurityPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: runtimeConfig, loading: configLoading } = usePublicConfig();
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryRecord[]>([]);
  const [mfaVerifications, setMfaVerifications] = useState<MfaVerification[]>([]);
  const [loading, setLoading] = useState(true);

  const runtimeFeatures = runtimeConfig?.features;

  const isFeatureEnabled = useCallback(
    (featureKey: keyof FeaturesConfig, subFeatureKey?: string): boolean => {
      if (!runtimeFeatures) {
        return false;
      }

      return isFeatureEnabledFromConfig(runtimeFeatures, featureKey, subFeatureKey);
    },
    [runtimeFeatures]
  );

  const fetchData = useCallback(async () => {
    try {
      const shouldFetchMfa =
        isFeatureEnabled("mfa", "totp") ||
        isFeatureEnabled("mfa", "backupCodes") ||
        isFeatureEnabled("mfa", "webAuthn") ||
        isFeatureEnabled("passkey");

      const [accountRes, historyRes, mfaRes] = await Promise.all([
        fetch("/api/account-info"),
        isFeatureEnabled("sessions") ? fetch("/api/account/sessions") : Promise.resolve(null),
        shouldFetchMfa ? fetch("/api/account/mfa") : Promise.resolve(null),
      ]);

      if (!accountRes.ok) {
        if (accountRes.status === 401) {
          router.push("/");
          return;
        }
        throw new Error("Failed to fetch account info");
      }
      const accountData = await accountRes.json();
      setAccountInfo(accountData);

      if (historyRes && historyRes.ok) {
        const historyData = await historyRes.json();
        // 过滤最近 7 天的记录，最多 10 条
        const cutoffTime = Date.now() - MAX_LOGIN_HISTORY_DAYS * 24 * 60 * 60 * 1000;
        const filtered = historyData
          .filter((record: LoginHistoryRecord) => record.timestamp >= cutoffTime)
          .slice(0, MAX_LOGIN_HISTORY_ITEMS);
        setLoginHistory(filtered);
      }

      if (mfaRes && mfaRes.ok) {
        const mfaData = await mfaRes.json();
        setMfaVerifications(mfaData);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [router, isFeatureEnabled]);

  // 检查 Account Center 返回的成功提示
  useEffect(() => {
    const successType = getAccountCenterSuccessType();
    if (successType) {
      const messages: Record<string, string> = {
        password: "密码已更新",
        email: "邮箱地址已更新",
        phone: "手机号码已更新",
        username: "用户名已更新",
        mfa: "MFA 设置已更新",
      };
      toast({
        title: "更新成功",
        description: messages[successType] || "安全设置已更新",
      });
      clearAccountCenterSuccessParam();
      // 刷新账户信息
      fetchData();
    }
  }, [fetchData, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 格式化时间
  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "刚刚";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} 分钟前`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} 小时前`;
    return `${Math.floor(seconds / 86400)} 天前`;
  };

  const formatDateTime = (timestamp: number) =>
    new Date(timestamp).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

  // 获取 MFA 状态
  // 注意：Logto API 返回的 type 字段可能是 "Totp", "WebAuthn", "BackupCode"
  // 但实际返回的值可能大小写不同，这里使用大小写不敏感的匹配
  const getMfaStatus = () => {
    const totpEnabled = mfaVerifications.some(v => 
      v.type?.toLowerCase() === "totp"
    );
    const webAuthnEnabled = mfaVerifications.some(v => 
      v.type?.toLowerCase() === "webauthn"
    );
    const backupCodeEnabled = mfaVerifications.some(v => 
      v.type?.toLowerCase() === "backupcode"
    );
    
    return {
      hasMfa: mfaVerifications.length > 0,
      totpEnabled,
      webAuthnEnabled,
      backupCodeEnabled,
      hasOtherMfaMethod: totpEnabled || webAuthnEnabled,
    };
  };

  const mfaStatus = getMfaStatus();

  if (loading || (configLoading && !runtimeConfig)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">安全设置</h1>
        <p className="text-muted-foreground">
          管理您的密码、双因素认证和其他安全选项
        </p>
      </div>

      {/* Password Section - 跳转到 Logto Account Center */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-muted-foreground" />
            <CardTitle>登录密码</CardTitle>
          </div>
          <CardDescription>
            定期更换密码可以保护您的账户安全
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {accountInfo?.hasPassword ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              <div>
                <p className="font-medium">
                  {accountInfo?.hasPassword ? "密码已设置" : "未设置密码"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {accountInfo?.hasPassword
                    ? "建议定期更换密码"
                    : "设置密码以保护您的账户"}
                </p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <a href={accountCenterUrls.password("/dashboard/security")} target="_self">
                <ExternalLink className="mr-2 h-4 w-4" />
                {accountInfo?.hasPassword ? "修改密码" : "设置密码"}
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* MFA Section - 跳转到 Logto Account Center UI */}
      {isFeatureEnabled("mfa", "totp") || isFeatureEnabled("passkey") ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <CardTitle>双因素认证 (2FA)</CardTitle>
            </div>
            <CardDescription>
              {mfaStatus.hasMfa 
                ? `已设置 ${mfaVerifications.length} 个验证方式` 
                : "添加额外的安全层，保护您的账户免受未经授权的访问"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* TOTP */}
            {isFeatureEnabled("mfa", "totp") && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {mfaStatus.totpEnabled ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">身份验证器应用</p>
                      <p className="text-sm text-muted-foreground">
                        {mfaStatus.totpEnabled 
                          ? "已设置" 
                          : "使用 Google Authenticator、Microsoft Authenticator 等应用"}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={accountCenterUrls.authenticatorApp("/dashboard/security")} target="_self">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      {mfaStatus.totpEnabled ? "管理" : "设置"}
                    </a>
                  </Button>
                </div>
                <Separator />
              </>
            )}

            {/* Passkey */}
            {isFeatureEnabled("passkey") && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {mfaStatus.webAuthnEnabled ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Key className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">Passkey (密钥)</p>
                      <p className="text-sm text-muted-foreground">
                        {mfaStatus.webAuthnEnabled
                          ? "已设置"
                          : "使用指纹、面容识别或设备 PIN 码登录"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={accountCenterUrls.addPasskey("/dashboard/security")} target="_self">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {mfaStatus.webAuthnEnabled ? "添加" : "设置"}
                      </a>
                    </Button>
                    {mfaStatus.webAuthnEnabled && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={accountCenterUrls.managePasskey("/dashboard/security")} target="_self">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          管理
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Backup Codes */}
            {isFeatureEnabled("mfa", "backupCodes") && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {mfaStatus.backupCodeEnabled ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Key className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">备用恢复码</p>
                    <p className="text-sm text-muted-foreground">
                      {mfaStatus.backupCodeEnabled
                        ? "已生成"
                        : mfaStatus.hasOtherMfaMethod
                          ? "生成一次性恢复码，用于紧急登录"
                          : "需先启用其他 MFA 方式"}
                    </p>
                  </div>
                </div>
                {mfaStatus.hasOtherMfaMethod ? (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={accountCenterUrls.generateBackupCodes("/dashboard/security")} target="_self">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {mfaStatus.backupCodeEnabled ? "重新生成" : "生成"}
                      </a>
                    </Button>
                    {mfaStatus.backupCodeEnabled && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={accountCenterUrls.manageBackupCodes("/dashboard/security")} target="_self">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          管理
                        </a>
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    需先启用其他 MFA
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <CardTitle>双因素认证</CardTitle>
            </div>
            <CardDescription>
              添加额外的安全层，保护您的账户免受未经授权的访问
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Badge variant="secondary">功能已禁用</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Login History - 限制显示最近 7 天，最多 10 条 */}
      {isFeatureEnabled("sessions") ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" />
              <CardTitle>登录记录</CardTitle>
            </div>
            <CardDescription>
              查看您最近 {MAX_LOGIN_HISTORY_DAYS} 天内的登录活动（最多 {MAX_LOGIN_HISTORY_ITEMS} 条）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loginHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  最近 {MAX_LOGIN_HISTORY_DAYS} 天内暂无登录记录
                </p>
              ) : (
                <>
                  {loginHistory.map((record) => (
                    <div
                      key={record.id}
                      className="rounded-lg border p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            <Monitor className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{record.applicationName}</p>
                            <p className="text-sm text-muted-foreground truncate">事件: {record.event}</p>
                          </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <p>{formatDateTime(record.timestamp)}</p>
                          <p>{formatTimeAgo(record.timestamp)}</p>
                        </div>
                      </div>
                      {(record.ip || record.userAgent) && (
                        <div className="mt-3 text-xs text-muted-foreground space-y-1">
                          {record.ip && <p>IP: {record.ip}</p>}
                          {record.userAgent && <p className="truncate">设备: {record.userAgent}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                  {loginHistory.length >= MAX_LOGIN_HISTORY_ITEMS && (
                    <p className="text-center text-xs text-muted-foreground">
                      仅显示最近 {MAX_LOGIN_HISTORY_ITEMS} 条记录
                    </p>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" />
              <CardTitle>登录记录</CardTitle>
            </div>
            <CardDescription>
              查看您最近的登录活动
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Badge variant="secondary">功能已禁用</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Tips */}
      <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <CardTitle className="text-yellow-800 dark:text-yellow-200">安全建议</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
            <li>使用包含字母、数字和符号的强密码</li>
            <li>启用双因素认证以增强账户安全</li>
            <li>定期检查登录记录，识别异常登录行为</li>
            <li>不要在公共设备上保存登录状态</li>
          </ul>
        </CardContent>
      </Card>

    </div>
  );
}
