import { z } from "zod";
import { crm } from "../crm-client.js";
import type { ToolDefinition } from "./types.js";

const inputShape = {
  query: z
    .string()
    .min(2)
    .describe("Search string — matches contact name, email, phone, reference, lender, case fields"),
  limit: z.number().int().positive().max(100).default(25).describe("Max results to return"),
};

export const searchTool: ToolDefinition<typeof inputShape> = {
  name: "crm_search",
  description:
    "Search across contacts and cases. Returns a flat list of matches with type ('contact' | 'case'), id, headline, and key fields.",
  inputShape,
  handler: async (input) => {
    const { query, limit } = z.object(inputShape).parse(input);
    const results = await crm.get<unknown[]>("/search", { q: query, limit });
    return { query, count: Array.isArray(results) ? results.length : 0, results };
  },
};
