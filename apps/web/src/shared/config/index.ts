import { loadWebEnv } from "./env";

/** Validated once at startup: the app refuses to boot with a bad configuration. */
export const env = loadWebEnv(import.meta.env);
