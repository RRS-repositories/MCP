import { z } from "zod";
import { crm } from "../crm-client.js";
import type { ToolDefinition } from "./types.js";

const inputShape = {
  contact_id: z.number().int().positive().describe("Numeric contact id"),
};

export const getContactTool: ToolDefinition<typeof inputShape> = {
  name: "crm_get_contact",
  description:
    "Get a full contact record plus all of their claims/cases. Returns contact details and an array of case summaries.",
  inputShape,
  handler: async (input) => {
    const { contact_id } = z.object(inputShape).parse(input);
    const [contact, claims] = await Promise.all([
      crm.get(`/contacts/${contact_id}`),
      crm.get(`/contacts/${contact_id}/claims`),
    ]);
    return { contact, claims };
  },
};
