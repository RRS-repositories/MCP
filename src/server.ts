import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { recordAudit } from "./audit.js";
import { allTools } from "./tools/index.js";
import { CrmApiError } from "./crm-client.js";
import { logger } from "./logger.js";

export function buildMcpServer(): McpServer {
  const server = new McpServer({
    name: "crm-mcp",
    version: "0.1.0",
  });

  for (const tool of allTools) {
    server.tool(
      tool.name,
      tool.description,
      tool.inputShape as never,
      (async (args: unknown) => {
        const started = Date.now();
        try {
          const result = await tool.handler(args as never);
          recordAudit({
            tool: tool.name,
            params: args,
            ok: true,
            durationMs: Date.now() - started,
          });
          return {
            content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
          };
        } catch (err: unknown) {
          const message =
            err instanceof CrmApiError
              ? err.message
              : err instanceof Error
                ? err.message
                : String(err);
          recordAudit({
            tool: tool.name,
            params: args,
            ok: false,
            durationMs: Date.now() - started,
            error: message,
          });
          logger.error({ tool: tool.name, err: message }, "tool.error");
          return {
            content: [{ type: "text" as const, text: `Error: ${message}` }],
            isError: true,
          };
        }
      }) as never
    );
  }

  return server;
}
