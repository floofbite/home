"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Calendar,
  Globe,
  Languages,
  Mail,
  Smartphone,
  Link,
  Camera,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { AccountInfo } from "@/app/logto";
import { profileFields, getEnabledProfileFields, isFeatureEnabled } from "@/config/generated/features";
import { accountCenterUrls, getAccountCenterSuccessType, clearAccountCenterSuccessParam } from "@/lib/logto-account-ui";

// 图标映射
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  avatar: Camera,
  name: User,
  birthdate: Calendar,
  zoneinfo: Globe,
  locale: Languages,
  website: Link,
};

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // 表单状态
  const [formStates, setFormStates] = useState<
    Record<string, { value: string; open: boolean; saving: boolean }>
  >({});

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/account-info");
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/");
          return;
        }
        throw new Error("Failed to fetch account info");
      }
      const data = await res.json();
      setAccountInfo(data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({
        variant: "destructive",
        title: "加载失败",
        description: "无法加载账户信息，请刷新页面重试",
      });
    } finally {
      setLoading(false);
    }
  }, [router, toast]);

  // 检查 Account Center 返回的成功提示
  useEffect(() => {
    const successType = getAccountCenterSuccessType();
    if (successType) {
      const messages: Record<string, string> = {
        email: "邮箱地址已更新",
        phone: "手机号码已更新",
        username: "用户名已更新",
        password: "密码已更新",
      };
      toast({
        title: "更新成功",
        description: messages[successType] || "设置已更新",
      });
      clearAccountCenterSuccessParam();
      // 刷新账户信息
      fetchData();
    }
  }, [fetchData, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 处理基础资料更新（使用 Account API）
  const handleUpdateProfile = async (field: string, value: string) => {
    setFormStates((prev) => ({
      ...prev,
      [field]: { ...prev[field], saving: true },
    }));

    try {
      const endpoint = field === "avatar" || field === "name" || field === "username"
        ? "/api/account/profile"
        : "/api/account/profile/details";

      const body = field === "avatar" || field === "name" || field === "username"
        ? { [field]: value || null }
        : { [field]: value || "" };

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "更新失败");
      }

      await fetchData();

      setFormStates((prev) => ({
        ...prev,
        [field]: { ...prev[field], open: false, saving: false },
      }));

      toast({
        title: "保存成功",
        description: "您的资料已更新",
      });
    } catch (error) {
      console.error("Update error:", error);
      setFormStates((prev) => ({
        ...prev,
        [field]: { ...prev[field], saving: false },
      }));

      toast({
        variant: "destructive",
        title: "保存失败",
        description: error instanceof Error ? error.message : "未知错误",
      });
    }
  };

  // 获取字段值
  const getProfileValue = (field: string): string => {
    if (!accountInfo) return "";
    if (field === "avatar") return accountInfo.avatar || "";
    if (field === "name") return accountInfo.name || "";
    if (field === "username") return accountInfo.username || "";
    return accountInfo.profile?.[field as keyof typeof accountInfo.profile]?.toString() || "";
  };

  // 初始化表单状态
  const getFormState = (field: string) => {
    if (!formStates[field]) {
      return {
        value: getProfileValue(field),
        open: false,
        saving: false,
      };
    }
    return formStates[field];
  };

  const setFormState = (field: string, updates: Partial<typeof formStates[string]>) => {
    setFormStates((prev) => ({
      ...prev,
      [field]: { ...prev[field], ...updates },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  const enabledFields = getEnabledProfileFields().filter((f) => f.key !== "avatar");
  const avatarConfig = profileFields.avatar;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">个人资料</h1>
        <p className="text-muted-foreground">
          管理您的个人信息，包括姓名、联系方式和偏好设置
        </p>
      </div>

      {/* Avatar Card */}
      {avatarConfig.enabled && (
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 p-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-background">
                  {accountInfo?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={accountInfo.avatar} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-bold text-white">
                      {accountInfo?.name?.charAt(0) || accountInfo?.username?.charAt(0) || "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <Dialog
                  open={getFormState("avatar").open}
                  onOpenChange={(open) => {
                    if (!getFormState("avatar").saving) {
                      setFormState("avatar", {
                        open,
                        value: open ? getProfileValue("avatar") : "",
                      });
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{avatarConfig.label}</DialogTitle>
                      <DialogDescription>{avatarConfig.description}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>{avatarConfig.label} URL</Label>
                        <Input
                          placeholder={avatarConfig.placeholder}
                          value={getFormState("avatar").value}
                          onChange={(e) => setFormState("avatar", { value: e.target.value })}
                          type={avatarConfig.inputType}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline" disabled={getFormState("avatar").saving}>
                          取消
                        </Button>
                      </DialogClose>
                      <Button
                        onClick={() => handleUpdateProfile("avatar", getFormState("avatar").value)}
                        disabled={getFormState("avatar").saving}
                      >
                        {getFormState("avatar").saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        保存
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-semibold">{accountInfo?.name || "未设置姓名"}</h2>
                <p className="text-muted-foreground">@{accountInfo?.username}</p>
                <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <Badge variant="secondary" className="font-mono">ID: {accountInfo?.id}</Badge>
                  {accountInfo?.primaryEmail && (
                    <Badge variant="outline">{accountInfo.primaryEmail}</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Profile Cards Grid */}
      {enabledFields.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold">基本信息</h3>
          <div className="grid items-stretch gap-4 lg:gap-6 sm:grid-cols-2">
            {enabledFields.map(({ key, config }) => {
              const Icon = iconMap[key];
              const formState = getFormState(key);

              return (
                <Dialog
                  key={key}
                  open={formState.open}
                  onOpenChange={(open) => {
                    if (!formState.saving) {
                      setFormState(key, {
                        open,
                        value: open ? getProfileValue(key) : "",
                      });
                    }
                  }}
                >
                  <Card className="cursor-pointer transition-all hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
                        <CardTitle className="text-base">{config.label}</CardTitle>
                      </div>
                      <CardDescription>{getProfileValue(key) || config.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          {getProfileValue(key) ? "修改" : "添加"}
                        </Button>
                      </DialogTrigger>
                    </CardContent>
                  </Card>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>编辑{config.label}</DialogTitle>
                      <DialogDescription>{config.description}</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Label>{config.label}</Label>
                      <Input
                        placeholder={config.placeholder}
                        value={formState.value}
                        onChange={(e) => setFormState(key, { value: e.target.value })}
                        type={config.inputType}
                      />
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline" disabled={formState.saving}>
                          取消
                        </Button>
                      </DialogClose>
                      <Button
                        onClick={() => handleUpdateProfile(key, formState.value)}
                        disabled={formState.saving}
                      >
                        {formState.saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        保存
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              );
            })}
          </div>
        </div>
      )}

      {/* Contact Info - 使用 Logto Account Center UI */}
      <Card>
        <CardHeader>
          <CardTitle>联系方式</CardTitle>
          <CardDescription>
            管理您的邮箱、手机号和用户名
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">邮箱地址</p>
                <p className="text-sm text-muted-foreground">
                  {accountInfo?.primaryEmail || "未设置"}
                </p>
              </div>
            </div>
            {isFeatureEnabled("emailChange") ? (
              <Button variant="outline" size="sm" asChild>
                <a href={accountCenterUrls.email("/dashboard/profile")} target="_self">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {accountInfo?.primaryEmail ? "修改" : "添加"}
                </a>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                暂不允许修改
              </Button>
            )}
          </div>

          <Separator />

          {/* Phone */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">手机号码</p>
                <p className="text-sm text-muted-foreground">
                  {accountInfo?.primaryPhone || "未设置"}
                </p>
              </div>
            </div>
            {isFeatureEnabled("phoneChange") ? (
              <Button variant="outline" size="sm" asChild>
                <a href={accountCenterUrls.phone("/dashboard/profile")} target="_self">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {accountInfo?.primaryPhone ? "修改" : "添加"}
                </a>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                暂不允许修改
              </Button>
            )}
          </div>

          <Separator />

          {/* Username */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">用户名</p>
                <p className="text-sm text-muted-foreground">
                  @{accountInfo?.username || "未设置"}
                </p>
              </div>
            </div>
            {isFeatureEnabled("usernameChange") ? (
              <Button variant="outline" size="sm" asChild>
                <a href={accountCenterUrls.username("/dashboard/profile")} target="_self">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  修改
                </a>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                暂不允许修改
              </Button>
            )}
          </div>
        </CardContent>
      </Card>


    </div>
  );
}
