import { z } from "zod";
import { crm } from "../crm-client.js";
import type { ToolDefinition } from "./types.js";

const inputShape = {
  case_id: z.number().int().positive().describe("Numeric case id"),
  fields: z
    .record(z.union([z.string(), z.number(), z.boolean(), z.null()]))
    .describe(
      "Object of field name → new value. Common fields: status, lender, claim_value, account_number, start_date, FRL_outcome, FRL_summary, complaint_state, sub_workflow."
    ),
  reason: z
    .string()
    .min(3)
    .describe("Short reason for the change — stored in the audit trail (e.g. 'Extracted from FRL letter')"),
  dry_run: z
    .boolean()
    .default(false)
    .describe("If true, return the would-be change without writing. Default false (writes are applied)."),
};

export const updateCaseFieldsTool: ToolDefinition<typeof inputShape> = {
  name: "crm_update_case_fields",
  description:
    "Update one or more fields on a case/claim. Supports both core fields (status, lender, claim_value) and extended fields (FRL_outcome, FRL_summary, complaint_state). Pass dry_run=true to preview the diff.",
  inputShape,
  handler: async (input) => {
    const { case_id, fields, reason, dry_run } = z.object(inputShape).parse(input);

    if (dry_run) {
      const before = await crm.get(`/cases/${case_id}`).catch(() => null);
      return {
        dry_run: true,
        case_id,
        proposed_fields: fields,
        reason,
        current_state: before,
      };
    }

    const result = await crm.patch(`/cases/${case_id}`, { ...fields, _mcp_reason: reason });
    await crm
      .post(`/contacts/${(result as { contact_id?: number })?.contact_id ?? 0}/notes`, {
        content: `[MCP] Updated case ${case_id}: ${Object.keys(fields).join(", ")} — ${reason}`,
        created_by: "mcp",
        created_by_name: "Claude (MCP)",
      })
      .catch(() => {});
    return { ok: true, case_id, updated_fields: Object.keys(fields), result };
  },
};
