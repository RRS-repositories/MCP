import { z } from "zod";
import { crm } from "../crm-client.js";
import type { ToolDefinition } from "./types.js";

const inputShape = {
  path: z
    .string()
    .min(1)
    .describe(
      "Relative path inside the CRM-Finalised repo on the server (e.g. 'server.js', 'aiworker.js', 'dsar-review-worker/lib/textCache.js'). Cannot escape the repo or read .env / secrets."
    ),
  start_line: z.number().int().nonnegative().optional().describe("Optional 1-indexed start line"),
  end_line: z.number().int().positive().optional().describe("Optional 1-indexed end line"),
};

export const readSourceTool: ToolDefinition<typeof inputShape> = {
  name: "crm_read_source",
  description:
    "Read a source file from the CRM codebase on the server (Express monolith, workers, migrations, specs). Use to understand backend behaviour, find function definitions, or check what an endpoint actually does. .env files and node_modules are blocked.",
  inputShape,
  handler: async (input) => {
    const { path, start_line, end_line } = z.object(inputShape).parse(input);
    const result = await crm.get<{
      path: string;
      content: string;
      total_lines: number;
      truncated?: boolean;
    }>("/source/read", { path, start_line, end_line });
    return result;
  },
};
