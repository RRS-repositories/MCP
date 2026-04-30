import { z } from "zod";
import { crm } from "../crm-client.js";
import type { ToolDefinition } from "./types.js";

const inputShape = {
  contact_id: z
    .number()
    .int()
    .positive()
    .describe("Numeric contact id (notes are attached to the contact, not the case)"),
  content: z.string().min(1).describe("Note text"),
  pinned: z.boolean().default(false).describe("Pin this note to the top"),
};

export const addCaseNoteTool: ToolDefinition<typeof inputShape> = {
  name: "crm_add_case_note",
  description:
    "Add a note to a contact's record. Notes are visible to the team and appear in the contact timeline. Use for documenting decisions, observations, FRL summaries, or things to follow up on.",
  inputShape,
  handler: async (input) => {
    const { contact_id, content, pinned } = z.object(inputShape).parse(input);
    const result = await crm.post(`/contacts/${contact_id}/notes`, {
      content,
      pinned,
      created_by: "mcp",
      created_by_name: "Claude (MCP)",
    });
    return { ok: true, note: result };
  },
};
