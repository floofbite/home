/**
 * Logto 客户端方法封装
 * 基于 @logto/next 的 Server Actions
 */

import {
  getLogtoContext as _getLogtoContext,
  signIn as _signIn,
  signOut as _signOut,
  getAccessTokenRSC as _getAccessTokenRSC,
  handleSignIn as _handleSignIn,
} from "@logto/next/server-actions";

import { logtoConfig } from "./config";

/**
 * 获取 Logto 上下文（认证状态）
 */
export const getLogtoContext = () => _getLogtoContext(logtoConfig);

/**
 * 登录
 */
export const signIn = () => _signIn(logtoConfig);

/**
 * 登出
 */
export const signOut = () => _signOut(logtoConfig);

/**
 * 处理登录回调
 */
export const handleSignIn = (searchParams: URLSearchParams) =>
  _handleSignIn(logtoConfig, searchParams);

/**
 * 获取 Access Token (RSC)
 */
export const getAccessTokenRSC = () => _getAccessTokenRSC(logtoConfig);

/**
 * 获取带认证的请求头
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const accessToken = await getAccessTokenRSC();
  return {
    authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}
