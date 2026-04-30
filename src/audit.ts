import { logger } from "./logger.js";

export interface AuditEntry {
  tool: string;
  params: unknown;
  ok: boolean;
  durationMs: number;
  error?: string;
  remoteAddr?: string;
}

export function recordAudit(entry: AuditEntry): void {
  logger.info({ audit: entry }, `mcp.tool ${entry.tool} ${entry.ok ? "ok" : "ERR"} ${entry.durationMs}ms`);
}
