import { z } from "zod";
import { crm } from "../crm-client.js";
import type { ToolDefinition } from "./types.js";

const inputShape = {
  contact_id: z.number().int().positive().describe("Numeric contact id"),
  limit: z.number().int().positive().max(500).default(100).describe("Max events"),
};

export const getTimelineTool: ToolDefinition<typeof inputShape> = {
  name: "crm_get_timeline",
  description:
    "Get the action/communication timeline for a contact: status changes, emails sent, documents uploaded, notes added, workflow steps. Most recent first.",
  inputShape,
  handler: async (input) => {
    const { contact_id, limit } = z.object(inputShape).parse(input);
    const timeline = await crm.get<unknown[]>(`/contacts/${contact_id}/communications`, { limit });
    return { contact_id, count: Array.isArray(timeline) ? timeline.length : 0, timeline };
  },
};
