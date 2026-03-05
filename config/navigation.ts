/**
 * 共享导航配置
 * 用于 Sidebar 和 Navbar 组件
 */

import {
  UserCircle,
  Shield,
  Link2,
  Settings,
  LayoutGrid,
  Globe,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

/**
 * 主导航项（账户中心）
 */
export const mainNavItems: NavItem[] = [
  {
    title: "账户概览",
    href: "/dashboard",
    icon: LayoutGrid,
    description: "查看账户状态和快捷入口",
  },
  {
    title: "个人资料",
    href: "/dashboard/profile",
    icon: UserCircle,
    description: "管理个人信息和联系方式",
  },
  {
    title: "安全设置",
    href: "/dashboard/security",
    icon: Shield,
    description: "密码、MFA 和登录记录",
  },
  {
    title: "社交连接",
    href: "/dashboard/connections",
    icon: Link2,
    description: "绑定第三方登录账号",
  },
  {
    title: "偏好设置",
    href: "/dashboard/settings",
    icon: Settings,
    description: "界面和通知偏好",
  },
];

/**
 * 辅助导航项
 */
export const auxiliaryNavItems: NavItem[] = [
  {
    title: "服务门户",
    href: "/portal",
    icon: Globe,
    description: "访问所有已接入的服务",
  },
];

/**
 * 检查导航项是否匹配当前路径
 */
export function isNavItemActive(itemHref: string, currentPath: string): boolean {
  if (itemHref === "/dashboard") {
    return currentPath === itemHref;
  }
  return currentPath === itemHref || currentPath.startsWith(`${itemHref}/`);
}

/**
 * 根据路径获取当前导航项
 */
export function getActiveNavItem(path: string): NavItem | undefined {
  return mainNavItems.find((item) => isNavItemActive(item.href, path));
}
