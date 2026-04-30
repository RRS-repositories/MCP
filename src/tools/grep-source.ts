import { z } from "zod";
import { crm } from "../crm-client.js";
import type { ToolDefinition } from "./types.js";

const inputShape = {
  pattern: z.string().min(1).describe("Search pattern (regex) — passed to ripgrep"),
  glob: z
    .string()
    .optional()
    .describe("Optional file glob filter (e.g. '*.js', 'workers/**/*.js')"),
  max_results: z
    .number()
    .int()
    .positive()
    .max(500)
    .default(100)
    .describe("Max matches to return"),
  ignore_case: z.boolean().default(true).describe("Case-insensitive match (default true)"),
};

export const grepSourceTool: ToolDefinition<typeof inputShape> = {
  name: "crm_grep_source",
  description:
    "Search the CRM codebase for a pattern across all source files. Returns matching lines with file path and line number. Use to find where functions are defined, where endpoints are mounted, or where a constant/config value lives.",
  inputShape,
  handler: async (input) => {
    const { pattern, glob, max_results, ignore_case } = z.object(inputShape).parse(input);
    const result = await crm.post<{
      matches: Array<{ file: string; line: number; content: string }>;
      truncated: boolean;
      total: number;
    }>("/source/grep", { pattern, glob, max_results, ignore_case });
    return result;
  },
};
