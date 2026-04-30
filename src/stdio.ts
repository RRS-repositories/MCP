import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { buildMcpServer } from "./server.js";
import { logger } from "./logger.js";

async function main() {
  const server = buildMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info("crm-mcp stdio ready");
}

main().catch((err) => {
  logger.error({ err: err?.message ?? String(err) }, "stdio fatal");
  process.exit(1);
});
