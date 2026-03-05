/**
 * Logto Account Center UI 工具函数
 * 文档: https://docs.logto.io/end-user-flows/account-settings/by-account-center-ui
 */

const LOGTO_ENDPOINT = process.env.NEXT_PUBLIC_LOGTO_ENDPOINT || process.env.LOGTO_ENDPOINT;

/**
 * 生成 Account Center UI URL
 * @param path - 页面路径 (如 /account/email)
 * @param redirectPath - 完成后跳转回的页面路径 (可选，默认当前页面)
 * @returns 完整的 URL
 */
export function getAccountCenterUrl(path: string, redirectPath?: string): string {
  const baseUrl = LOGTO_ENDPOINT?.replace(/\/$/, "");
  if (!baseUrl) {
    throw new Error("Logto endpoint is not configured");
  }

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const redirect = redirectPath 
    ? `${window.location.origin}${redirectPath}`
    : currentUrl;

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const encodedRedirect = encodeURIComponent(redirect);

  return `${baseUrl}${cleanPath}?redirect=${encodedRedirect}`;
}

// 快捷方法
export const accountCenterUrls = {
  /** 更新邮箱 */
  email: (redirect?: string) => getAccountCenterUrl("/account/email", redirect),
  /** 更新手机号 */
  phone: (redirect?: string) => getAccountCenterUrl("/account/phone", redirect),
  /** 更新用户名 */
  username: (redirect?: string) => getAccountCenterUrl("/account/username", redirect),
  /** 更新密码 */
  password: (redirect?: string) => getAccountCenterUrl("/account/password", redirect),
  /** 设置 TOTP 验证器 */
  authenticatorApp: (redirect?: string) => getAccountCenterUrl("/account/authenticator-app", redirect),
  /** 生成备份码 */
  generateBackupCodes: (redirect?: string) => getAccountCenterUrl("/account/backup-codes/generate", redirect),
  /** 管理备份码 */
  manageBackupCodes: (redirect?: string) => getAccountCenterUrl("/account/backup-codes/manage", redirect),
  /** 添加 Passkey */
  addPasskey: (redirect?: string) => getAccountCenterUrl("/account/passkey/add", redirect),
  /** 管理 Passkey */
  managePasskey: (redirect?: string) => getAccountCenterUrl("/account/passkey/manage", redirect),
};

/**
 * 检查 URL 中是否有 show_success 参数
 * @returns 成功类型或 null
 */
export function getAccountCenterSuccessType(): string | null {
  if (typeof window === "undefined") return null;
  
  const params = new URLSearchParams(window.location.search);
  return params.get("show_success");
}

/**
 * 清除 URL 中的 show_success 参数（不刷新页面）
 */
export function clearAccountCenterSuccessParam(): void {
  if (typeof window === "undefined") return;
  
  const url = new URL(window.location.href);
  url.searchParams.delete("show_success");
  window.history.replaceState({}, "", url.toString());
}
