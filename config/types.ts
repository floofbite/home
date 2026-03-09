export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconName: string;
  href: string;
  ping?: string;
  category: string;
  isNew?: boolean;
  isPopular?: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
  iconName: string;
  description: string;
}

export interface FeatureConfig {
  enabled: boolean;
  config?: Record<string, unknown>;
}

export interface SocialConnectorConfig {
  target: string;
  connectorId?: string;
  enabled: boolean;
  displayName?: string;
  icon?: string;
  description?: string;
}

export interface SocialIdentitiesFeatureConfig extends FeatureConfig {
  config?: {
    connectors?: SocialConnectorConfig[];
  } & Record<string, unknown>;
}

export interface FeaturesConfig {
  emailChange: FeatureConfig;
  phoneChange: FeatureConfig;
  usernameChange: FeatureConfig;
  mfa: {
    totp: FeatureConfig;
    backupCodes: FeatureConfig;
    webAuthn: FeatureConfig;
  };
  passkey: FeatureConfig;
  socialIdentities: SocialIdentitiesFeatureConfig;
  sessions: FeatureConfig;
  accountDeletion: FeatureConfig;
}

export interface ProfileFieldConfig {
  enabled: boolean;
  label: string;
  description: string;
  placeholder?: string;
  inputType?: "text" | "date" | "url";
  required?: boolean;
}

export interface ProfileFieldsConfig {
  avatar: ProfileFieldConfig;
  name: ProfileFieldConfig;
  birthdate: ProfileFieldConfig;
  zoneinfo: ProfileFieldConfig;
  locale: ProfileFieldConfig;
  website: ProfileFieldConfig;
}

export interface PublicRuntimeConfig {
  features: FeaturesConfig;
  profileFields: ProfileFieldsConfig;
  serviceCategories: ServiceCategory[];
  services: Service[];
  configHash: string;
}
