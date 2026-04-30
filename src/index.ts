import express from "express";
import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { config } from "./config.js";
import { logger } from "./logger.js";
import { buildMcpServer } from "./server.js";

const app = express();
app.use(express.json({ limit: "4mb" }));

app.get("/healthz", (_req, res) => {
  res.json({ ok: true, service: "crm-mcp", version: "0.1.0" });
});

function requireBearer(req: express.Request, res: express.Response, next: express.NextFunction) {
  const auth = req.headers.authorization ?? "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!token || token !== config.mcpApiKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

app.post("/mcp", requireBearer, async (req, res) => {
  const reqId = req.headers["x-request-id"]?.toString() ?? randomUUID();
  const log = logger.child({ reqId, ip: req.ip });
  log.info({ method: (req.body as { method?: string })?.method }, "mcp.request");

  try {
    const server = buildMcpServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on("close", () => {
      transport.close().catch(() => {});
      server.close().catch(() => {});
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err: any) {
    log.error({ err: err?.message ?? String(err) }, "mcp.error");
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal MCP server error" });
    }
  }
});

app.get("/mcp", (_req, res) => {
  res.status(405).json({ error: "Method Not Allowed — use POST /mcp" });
});

const server = app.listen(config.mcpPort, config.mcpBind, () => {
  logger.info(
    { bind: config.mcpBind, port: config.mcpPort, env: config.nodeEnv },
    "crm-mcp HTTP listening"
  );
});

function shutdown(signal: string) {
  logger.info({ signal }, "shutting down");
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
