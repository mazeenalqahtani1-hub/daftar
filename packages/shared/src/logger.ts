import { pino, type Logger } from "pino";

export type { Logger };

/** Fields that must never reach logs (tokens, OTPs, credentials, personal data). */
const REDACTED_PATHS = [
  "req.headers.authorization",
  "req.headers.cookie",
  "authorization",
  "cookie",
  "*.password",
  "*.token",
  "*.otp",
  "*.code",
  "*.phone",
  "*.secret",
  "*.apiKey",
];

export function createLogger(level: string, service: string): Logger {
  return pino({
    level,
    base: { service },
    redact: { paths: REDACTED_PATHS, censor: "[redacted]" },
    timestamp: pino.stdTimeFunctions.isoTime,
  });
}
