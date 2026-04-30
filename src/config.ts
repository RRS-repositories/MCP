import "dotenv/config";

function required(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) throw new Error(`Missing required env var: ${name}`);
  return v.trim();
}

function optional(name: string, fallback: string): string {
  return (process.env[name] ?? fallback).trim();
}

export const config = {
  crmApiBaseUrl: required("CRM_API_BASE_URL").replace(/\/$/, ""),
  crmApiKey: required("CRM_API_KEY"),
  mcpApiKey: required("MCP_API_KEY"),
  mcpPort: parseInt(optional("MCP_PORT", "5050"), 10),
  mcpBind: optional("MCP_BIND", "127.0.0.1"),
  logLevel: optional("LOG_LEVEL", "info"),
  nodeEnv: optional("NODE_ENV", "development"),
};
