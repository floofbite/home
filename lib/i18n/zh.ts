/**
 * 中文语言包
 */

export const zh = {
  // Common
  common: {
    loading: "加载中...",
    save: "保存",
    cancel: "取消",
    confirm: "确认",
    delete: "删除",
    edit: "编辑",
    add: "添加",
    remove: "移除",
    close: "关闭",
    back: "返回",
    next: "下一步",
    done: "完成",
    error: "错误",
    success: "成功",
    warning: "警告",
    info: "提示",
    optional: "可选",
    required: "必填",
  },

  // Navigation
  nav: {
    dashboard: "账户概览",
    profile: "个人资料",
    security: "安全设置",
    connections: "社交连接",
    settings: "偏好设置",
    portal: "服务门户",
    signOut: "退出登录",
  },

  // Dashboard
  dashboard: {
    title: "账户概览",
    description: "管理您的账户信息、安全设置和个性化偏好",
    welcome: "欢迎回来",
    lastSignIn: "上次登录",
    email: "邮箱",
    phone: "手机",
    password: "密码",
    passwordSet: "已设置",
    passwordNotSet: "未设置",
    registerTime: "注册时间",
    quickActions: {
      profile: "个人资料",
      profileDesc: "编辑您的个人信息和头像",
      security: "安全设置",
      securityDesc: "管理密码和双因素认证",
      connections: "社交连接",
      connectionsDesc: "绑定第三方账号快捷登录",
      portal: "服务门户",
      portalDesc: "访问所有已接入的服务",
    },
    securityStatus: {
      title: "安全状态",
      loginPassword: "登录密码",
      mfa: "双因素认证",
      socialBinding: "社交账号绑定",
    },
  },

  // Profile
  profile: {
    title: "个人资料",
    description: "管理您的个人信息，包括姓名、联系方式和偏好设置",
    basicInfo: "基本信息",
    contactInfo: "联系方式",
    avatar: {
      title: "头像",
      description: "您的个人头像",
      placeholder: "https://example.com/avatar.jpg",
    },
    fields: {
      name: "显示名称",
      nameDesc: "您的公开显示名称",
      username: "用户名",
      usernameDesc: "您的唯一标识",
      birthdate: "出生日期",
      zoneinfo: "时区",
      locale: "语言",
      website: "个人网站",
      email: "邮箱地址",
      phone: "手机号码",
    },
    notSet: "未设置",
    editInAccountCenter: "在账户中心修改",
    notAllowed: "暂不允许修改",
  },

  // Security
  security: {
    title: "安全设置",
    description: "管理您的密码、双因素认证和其他安全选项",
    password: {
      title: "登录密码",
      description: "定期更换密码可以保护您的账户安全",
      current: "当前密码",
      new: "新密码",
      confirm: "确认新密码",
      set: "密码已设置",
      notSet: "未设置密码",
      changeInAccountCenter: "在账户中心修改",
    },
    mfa: {
      title: "双因素认证 (2FA)",
      description: "添加额外的安全层，保护您的账户免受未经授权的访问",
      totp: "身份验证器应用",
      totpDesc: "使用 Google Authenticator、Microsoft Authenticator 等应用",
      passkey: "Passkey (密钥)",
      passkeyDesc: "使用指纹、面容识别或设备 PIN 码登录",
      backupCodes: "备用恢复码",
      backupCodesDesc: "生成一次性恢复码，用于紧急登录",
      requireOtherMfa: "需先启用其他 MFA",
    },
    loginHistory: {
      title: "登录记录",
      description: "查看您最近的登录活动",
      empty: "暂无登录记录",
      ip: "IP",
      device: "设备",
    },
    tips: {
      title: "安全建议",
      strongPassword: "使用包含字母、数字和符号的强密码",
      enableMfa: "启用双因素认证以增强账户安全",
      checkHistory: "定期检查登录记录，识别异常登录行为",
      publicDevice: "不要在公共设备上保存登录状态",
    },
  },

  // Connections
  connections: {
    title: "社交连接",
    description: "绑定第三方账号，实现快捷登录",
    warning: "解绑社交账号后，您将无法使用该账号登录。请确保您有其他登录方式。",
    connected: "已绑定的账号",
    connectedDesc: "您可以使用这些账号快捷登录",
    available: "可绑定的账号",
    availableDesc: "绑定更多账号，提供更多登录方式",
    allConnected: "所有可用的社交账号已绑定",
    unlink: "解绑",
    bind: "绑定",
    confirmUnlink: "确认解绑社交账号",
    unlinkWarning: "您确定要解绑 {name} 账号吗？解绑后您将无法使用该账号登录。",
    about: {
      title: "关于社交登录",
      quickLogin: "绑定后，您可以使用社交账号直接登录，无需输入密码",
      privacy: "您的社交账号信息仅用于身份验证，我们不会获取额外的权限",
      control: "您可以随时解绑社交账号，但请确保至少保留一种登录方式",
    },
  },

  // Toast Messages
  toast: {
    saveSuccess: "保存成功",
    saveError: "保存失败",
    updateSuccess: "更新成功",
    updateError: "更新失败",
    unlinkSuccess: "解绑成功",
    unlinkError: "解绑失败",
    loadError: "加载失败",
    passwordChanged: "密码已更新",
    passwordError: "密码修改失败",
  },
} as const;

export type Zh = typeof zh;
