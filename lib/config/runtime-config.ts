import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import { load as parseYaml } from "js-yaml";
import { z } from "zod";
import type {
  FeaturesConfig,
  ProfileFieldsConfig,
  PublicRuntimeConfig,
  Service,
  ServiceCategory,
} from "@/config/types";

const featureConfigSchema = z
  .object({
    enabled: z.boolean(),
    config: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

const profileFieldSchema = z
  .object({
    enabled: z.boolean(),
    label: z.string().min(1),
    description: z.string().min(1),
    placeholder: z.string().min(1).optional(),
    inputType: z.enum(["text", "date", "url"]).optional(),
    required: z.boolean().optional(),
  })
  .strict();

const socialConnectorSchema = z
  .object({
    target: z.string().min(1),
    connectorId: z.string().min(1).optional(),
    enabled: z.boolean(),
    displayName: z.string().min(1).optional(),
    icon: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
  })
  .strict();

const socialIdentitiesFeatureConfigSchema = z
  .object({
    enabled: z.boolean(),
    config: z
      .object({
        connectors: z.array(socialConnectorSchema).optional(),
      })
      .passthrough()
      .optional(),
  })
  .strict();

const featuresYamlSchema = z
  .object({
    features: z
      .object({
        emailChange: featureConfigSchema,
        phoneChange: featureConfigSchema,
        usernameChange: featureConfigSchema,
        mfa: z
          .object({
            totp: featureConfigSchema,
            backupCodes: featureConfigSchema,
            webAuthn: featureConfigSchema,
          })
          .strict(),
        passkey: featureConfigSchema,
        socialIdentities: socialIdentitiesFeatureConfigSchema,
        sessions: featureConfigSchema,
        accountDeletion: featureConfigSchema,
      })
      .strict(),
    profileFields: z
      .object({
        avatar: profileFieldSchema,
        name: profileFieldSchema,
        birthdate: profileFieldSchema,
        zoneinfo: profileFieldSchema,
        locale: profileFieldSchema,
        website: profileFieldSchema,
      })
      .strict(),
  })
  .strict();

const servicesYamlSchema = z
  .object({
    serviceCategories: z
      .array(
        z
          .object({
            id: z.string().min(1),
            name: z.string().min(1),
            iconName: z.string().min(1),
            description: z.string().min(1),
          })
          .strict()
      )
      .min(1),
    services: z
      .array(
        z
          .object({
            id: z.string().min(1),
            name: z.string().min(1),
            description: z.string().min(1),
            icon: z.string().min(1),
            iconName: z.string().min(1),
            href: z.string().url(),
            ping: z.string().url().optional(),
            category: z.string().min(1),
            isNew: z.boolean().optional(),
            isPopular: z.boolean().optional(),
          })
          .strict()
      )
      .min(1),
  })
  .strict();

interface RuntimeConfigData {
  features: FeaturesConfig;
  profileFields: ProfileFieldsConfig;
  serviceCategories: ServiceCategory[];
  services: Service[];
  configHash: string;
}

function resolveConfigDir(): string {
  const dir = process.env.CONFIG_DIR ?? "deploy";
  if (isAbsolute(dir)) {
    return dir;
  }

  return resolve(process.cwd(), dir);
}

function parseYamlFile(filePath: string): unknown {
  const raw = readFileSync(filePath, "utf8");
  return parseYaml(raw);
}

function createConfigHash(input: unknown): string {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

function validateCrossReferences(
  serviceCategories: ServiceCategory[],
  services: Service[]
): void {
  const categoryIds = new Set(serviceCategories.map((category) => category.id));
  for (const service of services) {
    if (!categoryIds.has(service.category)) {
      throw new Error(`Service '${service.id}' references unknown category '${service.category}'`);
    }
  }
}

function loadFromMountedConfig(configDir: string): RuntimeConfigData | null {
  const featuresFile = resolve(configDir, "features.yaml");
  const servicesFile = resolve(configDir, "services.yaml");
  const featuresExampleFile = resolve(configDir, "features.yaml.example");
  const servicesExampleFile = resolve(configDir, "services.yaml.example");

  const resolvedFeaturesFile = existsSync(featuresFile) ? featuresFile : featuresExampleFile;
  const resolvedServicesFile = existsSync(servicesFile) ? servicesFile : servicesExampleFile;

  if (!existsSync(resolvedFeaturesFile) || !existsSync(resolvedServicesFile)) {
    return null;
  }

  const featuresRaw = parseYamlFile(resolvedFeaturesFile);
  const servicesRaw = parseYamlFile(resolvedServicesFile);

  const parsedFeatures = featuresYamlSchema.parse(featuresRaw);
  const parsedServices = servicesYamlSchema.parse(servicesRaw);

  validateCrossReferences(parsedServices.serviceCategories, parsedServices.services);

  const configHash = createConfigHash({
    features: parsedFeatures,
    services: parsedServices,
  });

  return {
    features: parsedFeatures.features,
    profileFields: parsedFeatures.profileFields,
    serviceCategories: parsedServices.serviceCategories,
    services: parsedServices.services,
    configHash,
  };
}

const configDir = resolveConfigDir();
const runtimeData = loadFromMountedConfig(configDir);

if (!runtimeData) {
  throw new Error(
    `Runtime config not found in '${configDir}'. Required files: features.yaml/services.yaml (or .example variants)`
  );
}

export const features = runtimeData.features;
export const profileFields = runtimeData.profileFields;
export const serviceCategories = runtimeData.serviceCategories;
export const services = runtimeData.services;
export const configHash = runtimeData.configHash;

export function getPublicRuntimeConfig(): PublicRuntimeConfig {
  return {
    features,
    profileFields,
    serviceCategories,
    services,
    configHash,
  };
}

export function validateRuntimeConfig(): { configDir: string; configHash: string } {
  const mounted = loadFromMountedConfig(configDir);
  if (!mounted) {
    throw new Error(
      `Runtime config not found in '${configDir}'. Required files: features.yaml/services.yaml (or .example variants)`
    );
  }

  return {
    configDir,
    configHash: mounted.configHash,
  };
}
