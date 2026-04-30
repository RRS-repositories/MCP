import { z } from "zod";
import { crm } from "../crm-client.js";
import type { ToolDefinition } from "./types.js";

const inputShape = {
  case_id: z.number().int().positive().describe("Numeric case id"),
  new_status: z
    .string()
    .min(2)
    .describe(
      "Target status. Canonical workflow: New Lead → LOA Sent → LOA Uploaded → LOA Signed → DSAR Prepared → DSAR Sent → DSAR Received → FRL Sent → FRL Received → Offer Received → Offer Accepted/Rejected → Settled."
    ),
  reason: z.string().min(3).describe("Reason for the status change — for audit trail"),
};

export const setCaseStatusTool: ToolDefinition<typeof inputShape> = {
  name: "crm_set_case_status",
  description:
    "Change a case's status. Logs the change in the case's status history table. Use this rather than crm_update_case_fields when only changing status — it goes through the proper status transition handler with side effects (timeline events, workflow triggers, notifications).",
  inputShape,
  handler: async (input) => {
    const { case_id, new_status, reason } = z.object(inputShape).parse(input);
    const result = await crm.patch(`/cases/${case_id}`, {
      status: new_status,
      _mcp_reason: reason,
    });
    return { ok: true, case_id, new_status, result };
  },
};
