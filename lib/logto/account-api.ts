/**
 * Logto Account API 封装
 * 用户自服务操作（需要用户 Access Token）
 */

import { logger } from "@/lib/logger";
import { logtoConfig } from "./config";
import { getAccessTokenRSC } from "./client";
import type {
  AccountInfo,
  VerificationResponse,
  VerificationCodeResponse,
  MfaVerification,
  TotpSecretResponse,
  BackupCodesResponse,
  BackupCodesStatusResponse,
} from "./types";

const API_BASE = () => logtoConfig.endpoint;

/**
 * 获取账户信息
 */
export async function getAccountInfo(): Promise<AccountInfo> {
  const accessToken = await getAccessTokenRSC();
  const res = await fetch(`${API_BASE()}/api/my-account`, {
    headers: { authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`获取账户信息失败: ${res.status} - ${errorText}`);
  }

  return res.json();
}

/**
 * 更新账户基本信息
 */
export async function updateAccountInfo(data: {
  username?: string;
  name?: string;
  avatar?: string | null;
  customData?: Record<string, unknown>;
}): Promise<unknown> {
  // 过滤处理数据
  const filteredData: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      if (key === "username") {
        const trimmedValue = value.trim();
        if (trimmedValue) filteredData[key] = trimmedValue;
      } else {
        filteredData[key] = value;
      }
    } else if (value !== undefined) {
      filteredData[key] = value;
    }
  }

  logger.devLog("Updating account", { fields: Object.keys(filteredData) });

  const accessToken = await getAccessTokenRSC();
  const res = await fetch(`${API_BASE()}/api/my-account`, {
    method: "PATCH",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(filteredData),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`更新账户信息失败: ${res.status} - ${errorText}`);
  }

  return res.json();
}

/**
 * 更新详细资料
 */
export async function updateProfileInfo(data: {
  familyName?: string;
  givenName?: string;
  middleName?: string;
  nickname?: string;
  preferredUsername?: string;
  profile?: string;
  website?: string;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
}): Promise<unknown> {
  const filteredData: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      filteredData[key] = value;
    }
  }

  logger.devLog("Updating profile", { fields: Object.keys(filteredData) });

  const accessToken = await getAccessTokenRSC();
  const res = await fetch(`${API_BASE()}/api/my-account/profile`, {
    method: "PATCH",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(filteredData),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`更新个人资料失败: ${res.status} - ${errorText}`);
  }

  return res.json();
}

// ============ Verification ============

/**
 * 验证密码
 */
export async function verifyPassword(password: string): Promise<VerificationResponse> {
  const accessToken = await getAccessTokenRSC();

  const res = await fetch(`${API_BASE()}/api/verifications/password`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`密码验证失败: ${res.status} - ${errorText}`);
  }

  return res.json();
}

/**
 * 发送验证码
 */
export async function sendVerificationCode(
  type: "email" | "phone",
  value: string
): Promise<VerificationCodeResponse> {
  const accessToken = await getAccessTokenRSC();

  const res = await fetch(`${API_BASE()}/api/verifications/verification-code`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ identifier: { type, value } }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`发送验证码失败: ${res.status} - ${errorText}`);
  }

  return res.json();
}

/**
 * 验证验证码
 */
export async function verifyCode(
  type: "email" | "phone",
  value: string,
  verificationId: string,
  code: string
): Promise<VerificationResponse> {
  const accessToken = await getAccessTokenRSC();

  const res = await fetch(`${API_BASE()}/api/verifications/verification-code/verify`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      identifier: { type, value },
      verificationId,
      code,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`验证码验证失败: ${res.status} - ${errorText}`);
  }

  return res.json();
}

// ============ Password ============

/**
 * 更新密码
 */
export async function updatePassword(
  newPassword: string,
  verificationRecordId: string
): Promise<void> {
  const accessToken = await getAccessTokenRSC();

  const res = await fetch(`${API_BASE()}/api/my-account/password`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "logto-verification-id": verificationRecordId,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password: newPassword }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`密码更新失败: ${res.status} - ${errorText}`);
  }
}

// ============ Email & Phone ============

/**
 * 更新主邮箱
 */
export async function updatePrimaryEmail(
  email: string,
  identityVerificationId: string,
  newEmailVerificationId: string
): Promise<void> {
  const accessToken = await getAccessTokenRSC();

  const res = await fetch(`${API_BASE()}/api/my-account/primary-email`, {
    method: "PATCH",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "logto-verification-id": identityVerificationId,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      newIdentifierVerificationRecordId: newEmailVerificationId,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`邮箱更新失败: ${res.status} - ${errorText}`);
  }
}

/**
 * 移除主邮箱
 */
export async function removePrimaryEmail(verificationRecordId: string): Promise<void> {
  const accessToken = await getAccessTokenRSC();

  const res = await fetch(`${API_BASE()}/api/my-account/primary-email`, {
    method: "DELETE",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "logto-verification-id": verificationRecordId,
    },
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`邮箱移除失败: ${res.status} - ${errorText}`);
  }
}

/**
 * 更新主手机
 */
export async function updatePrimaryPhone(
  phone: string,
  identityVerificationId: string,
  newPhoneVerificationId: string
): Promise<void> {
  const accessToken = await getAccessTokenRSC();

  const res = await fetch(`${API_BASE()}/api/my-account/primary-phone`, {
    method: "PATCH",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "logto-verification-id": identityVerificationId,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone,
      newIdentifierVerificationRecordId: newPhoneVerificationId,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`手机号更新失败: ${res.status} - ${errorText}`);
  }
}

/**
 * 移除主手机
 */
export async function removePrimaryPhone(verificationRecordId: string): Promise<void> {
  const accessToken = await getAccessTokenRSC();

  const res = await fetch(`${API_BASE()}/api/my-account/primary-phone`, {
    method: "DELETE",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "logto-verification-id": verificationRecordId,
    },
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`手机号移除失败: ${res.status} - ${errorText}`);
  }
}

// ============ MFA ============

/**
 * 生成 TOTP 密钥
 */
export async function generateTotpSecret(): Promise<TotpSecretResponse> {
  const accessToken = await getAccessTokenRSC();

  const res = await fetch(
    `${API_BASE()}/api/my-account/mfa-verifications/totp-secret/generate`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`TOTP 密钥生成失败: ${res.status} - ${errorText}`);
  }

  return res.json();
}

/**
 * 绑定 MFA 因子
 */
export async function bindMfaFactor(
  type: "Totp" | "WebAuthn" | "BackupCode",
  verificationRecordId: string,
  secret?: string,
  codes?: string[]
): Promise<void> {
  const accessToken = await getAccessTokenRSC();

  const body: Record<string, unknown> = { type };
  if (secret) body.secret = secret;
  if (codes) body.codes = codes;
  if (type !== "BackupCode") {
    body.newIdentifierVerificationRecordId = verificationRecordId;
  }

  const res = await fetch(`${API_BASE()}/api/my-account/mfa-verifications`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "logto-verification-id": verificationRecordId,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`MFA 因子绑定失败: ${res.status} - ${errorText}`);
  }
}

/**
 * 获取所有 MFA 验证因子
 */
export async function getMfaVerifications(): Promise<MfaVerification[]> {
  const accessToken = await getAccessTokenRSC();

  const res = await fetch(`${API_BASE()}/api/my-account/mfa-verifications`, {
    headers: { authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`获取 MFA 验证因子失败: ${res.status} - ${errorText}`);
  }

  return res.json();
}

/**
 * 删除 MFA 验证因子
 */
export async function deleteMfaVerification(
  verificationId: string,
  identityVerificationId: string
): Promise<void> {
  const accessToken = await getAccessTokenRSC();

  const res = await fetch(
    `${API_BASE()}/api/my-account/mfa-verifications/${verificationId}`,
    {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "logto-verification-id": identityVerificationId,
      },
    }
  );

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`MFA 验证因子删除失败: ${res.status} - ${errorText}`);
  }
}

/**
 * 生成备份码
 */
export async function generateBackupCodes(): Promise<BackupCodesResponse> {
  const accessToken = await getAccessTokenRSC();

  const res = await fetch(
    `${API_BASE()}/api/my-account/mfa-verifications/backup-codes/generate`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`备份码生成失败: ${res.status} - ${errorText}`);
  }

  return res.json();
}

/**
 * 查看备份码状态
 */
export async function getBackupCodes(): Promise<BackupCodesStatusResponse> {
  const accessToken = await getAccessTokenRSC();

  const res = await fetch(`${API_BASE()}/api/my-account/mfa-verifications/backup-codes`, {
    headers: { authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`获取备份码失败: ${res.status} - ${errorText}`);
  }

  return res.json();
}
