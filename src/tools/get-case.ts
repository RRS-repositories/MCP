import { z } from "zod";
import { crm } from "../crm-client.js";
import type { ToolDefinition } from "./types.js";

const inputShape = {
  case_id: z.number().int().positive().describe("Numeric case id"),
  include_extended: z
    .boolean()
    .default(true)
    .describe("Whether to include extended case fields (FRL outcome, complaint state, etc.)"),
};

export const getCaseTool: ToolDefinition<typeof inputShape> = {
  name: "crm_get_case",
  description:
    "Get full state of a single case/claim including lender, status, claim value, dates, and (optionally) extended fields.",
  inputShape,
  handler: async (input) => {
    const { case_id, include_extended } = z.object(inputShape).parse(input);
    const baseCase = await crm.get(`/cases/${case_id}`);
    if (!include_extended) return { case: baseCase };
    const extended = await crm.get(`/cases/${case_id}/extended`).catch(() => null);
    return { case: baseCase, extended };
  },
};
