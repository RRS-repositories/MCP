import { request } from "undici";
import { config } from "./config.js";
import { logger } from "./logger.js";

type Query = Record<string, string | number | boolean | undefined | null>;
type Method = "GET" | "POST" | "PATCH" | "DELETE" | "PUT";

function buildUrl(path: string, query?: Query): string {
  const url = new URL(config.crmApiBaseUrl + path);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

export class CrmApiError extends Error {
  constructor(public readonly status: number, public readonly path: string, body: string) {
    super(`CRM API ${status} on ${path}: ${body.slice(0, 400)}`);
  }
}

async function send<T>(method: Method, path: string, query?: Query, body?: unknown): Promise<T> {
  const url = buildUrl(path, query);
  const started = Date.now();
  const headers: Record<string, string> = {
    "x-api-key": config.crmApiKey,
    accept: "application/json",
  };
  let payload: string | undefined;
  if (body !== undefined) {
    headers["content-type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const { statusCode, body: respBody } = await request(url, { method, headers, body: payload });
  const text = await respBody.text();
  const duration = Date.now() - started;
  logger.debug({ method, path, status: statusCode, ms: duration }, "crm.request");
  if (statusCode >= 400) throw new CrmApiError(statusCode, path, text);
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export const crm = {
  get: <T = unknown>(path: string, query?: Query) => send<T>("GET", path, query),
  post: <T = unknown>(path: string, body?: unknown, query?: Query) => send<T>("POST", path, query, body),
  patch: <T = unknown>(path: string, body?: unknown, query?: Query) => send<T>("PATCH", path, query, body),
  delete: <T = unknown>(path: string, query?: Query) => send<T>("DELETE", path, query),
  put: <T = unknown>(path: string, body?: unknown, query?: Query) => send<T>("PUT", path, query, body),
};
