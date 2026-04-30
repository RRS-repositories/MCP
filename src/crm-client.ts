import { request } from "undici";
import { config } from "./config.js";
import { logger } from "./logger.js";

type Query = Record<string, string | number | boolean | undefined | null>;

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

export const crm = {
  async get<T = unknown>(path: string, query?: Query): Promise<T> {
    const url = buildUrl(path, query);
    const started = Date.now();
    const { statusCode, body } = await request(url, {
      method: "GET",
      headers: { "x-api-key": config.crmApiKey, accept: "application/json" },
    });
    const text = await body.text();
    const duration = Date.now() - started;
    logger.debug({ method: "GET", path, status: statusCode, ms: duration }, "crm.request");
    if (statusCode >= 400) throw new CrmApiError(statusCode, path, text);
    return text ? (JSON.parse(text) as T) : (undefined as T);
  },
};
