import { z } from "zod";
import { crm } from "../crm-client.js";
import type { ToolDefinition } from "./types.js";

const inputShape = {};

export const listLendersTool: ToolDefinition<typeof inputShape> = {
  name: "crm_list_lenders",
  description:
    "List all known lenders in the CRM directory (canonical names + aliases). Use this when you need to resolve an ambiguous lender name to a canonical one.",
  inputShape,
  handler: async () => {
    const lenders = await crm.get<unknown[]>("/contacts/reference-map").catch(() => null);
    if (lenders) return { source: "/contacts/reference-map", lenders };
    const fallback = await crm.get<unknown[]>("/templates/email").catch(() => []);
    return { source: "fallback", lenders: fallback };
  },
};
