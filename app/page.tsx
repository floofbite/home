import { redirect } from "next/navigation";
import { getLogtoContext } from "./logto";

// Force dynamic rendering for auth check
export const dynamic = "force-dynamic";
import { Button } from "@/components/ui/button";
import {
  Card,

  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signIn } from "./logto";
import { LayoutGrid, Shield, Globe, ArrowRight } from "lucide-react";

export default async function HomePage() {
  const { isAuthenticated } = await getLogtoContext();

  if (isAuthenticated) {
    redirect("/dashboard");
  }

  async function handleSignIn() {
    "use server";
    await signIn();
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b px-4 lg:px-8">
        <div className="flex items-center gap-2 font-semibold">
          <LayoutGrid className="h-5 w-5" />
          <span>Account Portal</span>
        </div>
        <form action={handleSignIn}>
          <Button type="submit">登录</Button>
        </form>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
              统一管理您的
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                数字身份
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              安全的账户中心，便捷的服务门户。一站式管理您的个人资料、安全设置和所有接入的服务。
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <form action={handleSignIn}>
                <Button size="lg" className="gap-2">
                  开始使用
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t bg-muted/30 px-4 py-16">
          <div className="container mx-auto">
            <div className="grid gap-8 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                    <LayoutGrid className="h-5 w-5" />
                  </div>
                  <CardTitle>账户中心</CardTitle>
                  <CardDescription>
                    管理个人资料、安全设置和社交连接
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30">
                    <Shield className="h-5 w-5" />
                  </div>
                  <CardTitle>安全保护</CardTitle>
                  <CardDescription>
                    密码管理、双因素认证和会话控制
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30">
                    <Globe className="h-5 w-5" />
                  </div>
                  <CardTitle>服务门户</CardTitle>
                  <CardDescription>
                    一站式访问所有接入的工作和生活服务
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>Powered by Logto</p>
      </footer>
    </div>
  );
}
