import { getLogtoContext, getAccountInfo, AccountInfo, getMfaVerifications, getSocialIdentities } from "@/lib/logto";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import {
  UserCircle,
  Shield,
  Link2,
  ArrowRight,
  Calendar,
  Mail,
  Smartphone,
  Key,
  Globe,
} from "lucide-react";
import { formatDate, formatRelativeTime } from "@/lib/utils";

export default async function DashboardPage() {
  const { isAuthenticated, claims } = await getLogtoContext();
  let accountInfo: AccountInfo | { error: string } | null = null;
  let mfaVerifications: { type?: string }[] = [];
  let socialIdentities: { socialIdentities: unknown[] } = { socialIdentities: [] };

  if (isAuthenticated) {
    try {
      [accountInfo, mfaVerifications, socialIdentities] = await Promise.all([
        getAccountInfo(),
        getMfaVerifications().catch(() => []),
        getSocialIdentities().catch(() => ({ socialIdentities: [] })),
      ]);
    } catch {
      accountInfo = { error: "获取账户信息失败" };
    }
  }

  const displayInfo = accountInfo && !("error" in accountInfo) ? accountInfo : null;
  const hasMfa = mfaVerifications.length > 0;
  const socialCount = socialIdentities.socialIdentities.length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">账户概览</h1>
        <p className="text-muted-foreground">
          管理您的账户信息、安全设置和个性化偏好
        </p>
      </div>

      {/* Welcome Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-white/20">
              {(displayInfo?.avatar || claims?.picture) && (
                <AvatarImage 
                  src={displayInfo?.avatar || claims?.picture || ""} 
                  alt={claims?.name || claims?.username || "用户"} 
                />
              )}
              <AvatarFallback className="bg-white/20 text-xl font-bold text-white">
                {claims?.name?.charAt(0) || claims?.username?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">
                欢迎回来，{claims?.name || claims?.username || "用户"}
              </h2>
              <p className="text-white/80">
                上次登录: {displayInfo?.lastSignInAt ? formatRelativeTime(displayInfo.lastSignInAt) : "未知"}
              </p>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="grid gap-4 lg:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">邮箱</p>
                <p className="font-medium">{displayInfo?.primaryEmail || "未设置"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">手机</p>
                <p className="font-medium">{displayInfo?.primaryPhone || "未设置"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">密码</p>
                <Badge variant={displayInfo?.hasPassword ? "default" : "secondary"}>
                  {displayInfo?.hasPassword ? "已设置" : "未设置"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">注册时间</p>
                <p className="font-medium">
                  {displayInfo?.createdAt ? formatDate(displayInfo.createdAt).split(" ")[0] : "-"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid items-stretch gap-4 lg:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/profile" className="h-full">
          <Card className="group h-full cursor-pointer transition-all hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-900/30">
                <UserCircle className="h-5 w-5" />
              </div>
              <CardTitle className="pt-3">个人资料</CardTitle>
              <CardDescription>编辑您的个人信息和头像</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" size="sm" className="gap-1 px-0 group-hover:gap-2 transition-all">
                查看详情 <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/security" className="h-full">
          <Card className="group h-full cursor-pointer transition-all hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 transition-colors group-hover:bg-green-600 group-hover:text-white dark:bg-green-900/30">
                <Shield className="h-5 w-5" />
              </div>
              <CardTitle className="pt-3">安全设置</CardTitle>
              <CardDescription>管理密码和双因素认证</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" size="sm" className="gap-1 px-0 group-hover:gap-2 transition-all">
                查看详情 <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/connections" className="h-full">
          <Card className="group h-full cursor-pointer transition-all hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white dark:bg-purple-900/30">
                <Link2 className="h-5 w-5" />
              </div>
              <CardTitle className="pt-3">社交连接</CardTitle>
              <CardDescription>绑定第三方账号快捷登录</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" size="sm" className="gap-1 px-0 group-hover:gap-2 transition-all">
                查看详情 <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/portal" className="h-full">
          <Card className="group h-full cursor-pointer transition-all hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 transition-colors group-hover:bg-orange-600 group-hover:text-white dark:bg-orange-900/30">
                <Globe className="h-5 w-5" />
              </div>
              <CardTitle className="pt-3">服务门户</CardTitle>
              <CardDescription>访问所有已接入的服务</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" size="sm" className="gap-1 px-0 group-hover:gap-2 transition-all">
                进入门户 <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Security Status */}
      <Card>
        <CardHeader>
          <CardTitle>安全状态</CardTitle>
          <CardDescription>您的账户安全状况概览</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-muted-foreground" />
                <span>登录密码</span>
              </div>
              <Badge variant={displayInfo?.hasPassword ? "default" : "destructive"}>
                {displayInfo?.hasPassword ? "已设置" : "未设置"}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span>双因素认证</span>
              </div>
              <Link href="/dashboard/security">
                <Badge variant={hasMfa ? "default" : "secondary"} className="cursor-pointer hover:bg-primary/90">
                  {hasMfa ? `已设置 (${mfaVerifications.length} 个)` : "未设置"}
                </Badge>
              </Link>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link2 className="h-5 w-5 text-muted-foreground" />
                <span>社交账号绑定</span>
              </div>
              <Link href="/dashboard/connections">
                <Badge variant={socialCount > 0 ? "default" : "secondary"} className="cursor-pointer hover:bg-primary/90">
                  {socialCount > 0 ? `已绑定 ${socialCount} 个` : "未绑定"}
                </Badge>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
