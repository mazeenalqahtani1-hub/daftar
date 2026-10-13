export const APP_NAME = "Daftar" as const;
export const APP_NAME_AR = "دفتر" as const;

export {
  EnvValidationError,
  commaListSchema,
  logLevelSchema,
  nodeEnvSchema,
  parseEnv,
  portSchema,
  secretSchema,
  type EnvIssue,
} from "./env";
