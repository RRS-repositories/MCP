import { z } from "zod";
import { crm } from "../crm-client.js";
import type { ToolDefinition } from "./types.js";

const inputShape = {
  contact_id: z.number().int().positive().describe("Numeric contact id"),
  fields: z
    .record(z.union([z.string(), z.number(), z.boolean(), z.null()]))
    .describe(
      "Object of field name → new value. Common: first_name, last_name, email, phone, dob, address_line_1, postal_code."
    ),
  reason: z.string().min(3).describe("Reason for the change — for audit trail"),
  use_extended: z
    .boolean()
    .default(false)
    .describe(
      "If true, route through PATCH /contacts/:id/extended (use for fields not in the core contact schema)"
    ),
};

export const updateContactFieldsTool: ToolDefinition<typeof inputShape> = {
  name: "crm_update_contact_fields",
  description:
    "Update fields on a contact record. Use for name, email, phone, address corrections. Pass use_extended=true for extended/custom fields.",
  inputShape,
  handler: async (input) => {
    const { contact_id, fields, reason, use_extended } = z.object(inputShape).parse(input);
    const path = use_extended ? `/contacts/${contact_id}/extended` : `/contacts/${contact_id}`;
    const result = await crm.patch(path, { ...fields, _mcp_reason: reason });
    return { ok: true, contact_id, updated_fields: Object.keys(fields), result };
  },
};
