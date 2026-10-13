import type { ErrorHandler, NotFoundHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { AppEnv } from "../types";

export type ErrorBody = { error: { code: string; message: string; requestId: string } };

const STATUS_CODES: Readonly<Record<number, string>> = {
  400: "bad_request",
  401: "unauthorized",
  403: "forbidden",
  404: "not_found",
  409: "conflict",
  413: "payload_too_large",
  422: "unprocessable",
  429: "rate_limited",
};

function body(code: string, message: string, requestId: string): ErrorBody {
  return { error: { code, message, requestId } };
}

export const notFound: NotFoundHandler<AppEnv> = (c) =>
  c.json(body("not_found", "Resource not found", c.get("requestId")), 404);

/** Never leaks internals: unknown errors are logged server-side and returned as a generic 500. */
export const onError: ErrorHandler<AppEnv> = (error, c) => {
  const requestId = c.get("requestId");
  if (error instanceof HTTPException) {
    const code = STATUS_CODES[error.status] ?? "http_error";
    return c.json(body(code, error.message || code, requestId), error.status);
  }
  c.get("logger").error({ err: error, requestId }, "unhandled error");
  return c.json(body("internal_error", "Internal server error", requestId), 500);
};
