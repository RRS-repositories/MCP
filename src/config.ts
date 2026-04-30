import { config as dotenvConfig } from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

// Resolve .env relative to the compiled script's location, not process.cwd().
// This makes stdio-over-SSH work regardless of where the user shells in from.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenvConfig({ path: resolve(__dirname, "..", ".env") });
// Also try one level up (when running from src/ during dev)
dotenvConfig({ path: resolve(__dirname, "..", "..", ".env") });

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
  mcpApiKey: optional("MCP_API_KEY", "stdio-no-key-needed"),
  mcpPort: parseInt(optional("MCP_PORT", "5050"), 10),
  mcpBind: optional("MCP_BIND", "127.0.0.1"),
  logLevel: optional("LOG_LEVEL", "info"),
  nodeEnv: optional("NODE_ENV", "development"),
};
