import { z } from "zod";
import { crm } from "../crm-client.js";
import type { ToolDefinition } from "./types.js";

const inputShape = {
  reference: z.string().optional().describe("Client reference number (e.g. '218095096')"),
  email: z.string().email().optional().describe("Client email address"),
  name: z.string().optional().describe("Client full name (used as fuzzy search if reference/email not provided)"),
};

const InputSchema = z.object(inputShape).refine(
  (v) => Boolean(v.reference || v.email || v.name),
  { message: "Provide at least one of: reference, email, name" }
);

export const lookupContactTool: ToolDefinition<typeof inputShape> = {
  name: "crm_lookup_contact",
  description:
    "Look up a CRM contact by reference number, email, or name. Returns a contact summary with id, name, email, phone, and basic case counts.",
  inputShape,
  handler: async (input) => {
    const args = InputSchema.parse(input);

    if (args.reference) {
      const contact = await crm.get<unknown>(`/contacts/ref/${encodeURIComponent(args.reference)}`);
      return { matched_by: "reference", contact };
    }

    const query = args.email ?? args.name ?? "";
    const results = await crm.get<unknown[]>("/search", { q: query });
    return { matched_by: args.email ? "email" : "name", query, results };
  },
};
