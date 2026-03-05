import { z } from "zod";

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

export const servicesConfigSchema = z
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
            href: z.url(),
            ping: z.url().optional(),
            category: z.string().min(1),
            isNew: z.boolean().optional(),
            isPopular: z.boolean().optional(),
          })
          .strict()
      )
      .min(1),
  })
  .strict();

export const featuresConfigSchema = z
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
        socialIdentities: featureConfigSchema,
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

export type ServicesConfigSource = z.infer<typeof servicesConfigSchema>;
export type FeaturesConfigSource = z.infer<typeof featuresConfigSchema>;
