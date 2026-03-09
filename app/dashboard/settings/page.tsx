"use client";

import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Moon,
  Sun,
  Monitor,
  Globe,
  Trash2,
  AlertTriangle,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import type { FeaturesConfig } from "@/config/types";
import { isFeatureEnabled as isFeatureEnabledFromConfig } from "@/lib/config/feature-helpers";
import { usePublicConfig } from "@/hooks/use-public-config";
import { signOutAction } from "@/app/actions/auth";

// 语言存储 key
const LANGUAGE_STORAGE_KEY = "account-center-language";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { toast } = useToast();
  const { data: runtimeConfig, loading: configLoading } = usePublicConfig();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState("zh-CN");
  const [isUpdatingLanguage, setIsUpdatingLanguage] = useState(false);

  // 账户删除状态
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    confirmation: "",
    deleting: false,
  });

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

  // 避免水合不匹配，并从 localStorage 加载语言设置
  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  // 处理语言切换 - 同时保存到 localStorage 和 OIDC profile
  const handleLanguageChange = useCallback(async (value: string) => {
    setLanguage(value);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, value);
    setIsUpdatingLanguage(true);

    try {
      // 调用 API 更新到 OIDC profile 的 locale 字段
      const res = await fetch("/api/account/profile/details", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: value }),
      });

      if (!res.ok) {
        throw new Error("Failed to update language");
      }

      toast({
        title: "语言已更新",
        description: "语言偏好已保存到您的账户",
      });
    } catch {
      // 即使 API 调用失败，localStorage 中的设置仍然保留
      toast({
        title: "语言已更新",
        description: "已保存到本地，刷新页面后生效",
      });
    } finally {
      setIsUpdatingLanguage(false);
    }
  }, [toast]);

  // 处理账户删除
  const handleDeleteAccount = async () => {
    if (deleteDialog.confirmation !== "DELETE") {
      toast({
        variant: "destructive",
        title: "确认文本错误",
        description: '请输入 "DELETE" 以确认删除账户',
      });
      return;
    }

    setDeleteDialog((prev) => ({ ...prev, deleting: true }));

    try {
      const res = await fetch("/api/account/delete", {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "删除失败");
      }

      toast({
        title: "账户已删除",
        description: "您的账户已被永久删除",
      });

      // 删除后立即登出并离开 dashboard
      try {
        await signOutAction();
      } catch {
        router.replace("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Account deletion error:", error);
      setDeleteDialog((prev) => ({ ...prev, deleting: false }));

      toast({
        variant: "destructive",
        title: "删除失败",
        description: error instanceof Error ? error.message : "未知错误",
      });
    }
  };

  if (configLoading && !runtimeConfig) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载配置中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">偏好设置</h1>
        <p className="text-muted-foreground">
          自定义您的使用体验和个性化选项
        </p>
      </div>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-muted-foreground" />
            <CardTitle>外观</CardTitle>
          </div>
          <CardDescription>
            选择您喜欢的界面主题
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Button
              variant={mounted && theme === "light" ? "default" : "outline"}
              onClick={() => setTheme("light")}
              className="justify-start gap-3 h-auto py-4"
            >
              <Sun className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">浅色</p>
                <p className="text-xs text-muted-foreground">明亮的界面</p>
              </div>
            </Button>
            <Button
              variant={mounted && theme === "dark" ? "default" : "outline"}
              onClick={() => setTheme("dark")}
              className="justify-start gap-3 h-auto py-4"
            >
              <Moon className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">深色</p>
                <p className="text-xs text-muted-foreground">暗色的界面</p>
              </div>
            </Button>
            <Button
              variant={mounted && theme === "system" ? "default" : "outline"}
              onClick={() => setTheme("system")}
              className="justify-start gap-3 h-auto py-4"
            >
              <Monitor className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">跟随系统</p>
                <p className="text-xs text-muted-foreground">自动切换</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <CardTitle>语言</CardTitle>
          </div>
          <CardDescription>
            选择您的界面语言（保存到账户设置）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:max-w-xs">
            <Label>界面语言</Label>
            <Select value={language} onValueChange={handleLanguageChange} disabled={isUpdatingLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="选择语言" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zh-CN">简体中文</SelectItem>
                <SelectItem value="zh-TW">繁體中文</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {isUpdatingLanguage ? "保存中..." : "语言设置已同步到您的账户资料"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone - 危险操作区 */}
      {isFeatureEnabled("accountDeletion") && (
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">危险操作区</CardTitle>
            </div>
            <CardDescription>
              这些操作可能会对您的账户产生不可逆的影响
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trash2 className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">删除账户</p>
                  <p className="text-sm text-muted-foreground">
                    永久删除您的账户和所有数据，此操作不可逆转
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={() =>
                  setDeleteDialog((prev) => ({ ...prev, open: true }))
                }
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除账户
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Account Confirmation Dialog */}
      {isFeatureEnabled("accountDeletion") && (
        <Dialog
          open={deleteDialog.open}
          onOpenChange={(open) =>
            !deleteDialog.deleting &&
            setDeleteDialog((prev) => ({ ...prev, open, confirmation: "" }))
          }
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>确认删除账户</DialogTitle>
              <DialogDescription>
                此操作不可逆转。您的账户和所有数据将被永久删除。
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>警告</AlertTitle>
                <AlertDescription>
                  删除账户后，您的所有数据（包括个人资料、设置和关联数据）将被永久删除且无法恢复。
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label>确认操作</Label>
                <p className="text-sm text-muted-foreground">
                  请输入 <span className="font-mono font-bold">DELETE</span>{" "}
                  以确认删除您的账户
                </p>
                <Input
                  placeholder="输入 DELETE"
                  value={deleteDialog.confirmation}
                  onChange={(e) =>
                    setDeleteDialog((prev) => ({
                      ...prev,
                      confirmation: e.target.value,
                    }))
                  }
                  disabled={deleteDialog.deleting}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                disabled={deleteDialog.deleting}
                onClick={() =>
                  setDeleteDialog((prev) => ({
                    ...prev,
                    open: false,
                    confirmation: "",
                  }))
                }
              >
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleteDialog.deleting}
              >
                {deleteDialog.deleting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                确认删除
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
