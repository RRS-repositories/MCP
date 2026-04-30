import { z } from "zod";
import { crm } from "../crm-client.js";
import type { ToolDefinition } from "./types.js";

const inputShape = {
  contact_id: z.number().int().positive().describe("Numeric contact id (becomes client_id in the workflow record)"),
  workflow_type: z
    .string()
    .describe(
      "Workflow type. Common: 'id-chase', 'questionnaire-chase', 'loa-chase', 'dsar-send', 'frl-extraction', 'complaint-draft'."
    ),
  workflow_name: z.string().optional().describe("Friendly display name (defaults to workflow_type)"),
  total_steps: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("Number of steps in the workflow (default 4)"),
};

export const triggerWorkflowTool: ToolDefinition<typeof inputShape> = {
  name: "crm_trigger_workflow",
  description:
    "Trigger a CRM workflow for a contact. Common use cases: starting an ID chase sequence, sending a DSAR, kicking off questionnaire reminders, or queuing FRL extraction. Inserts a workflow_triggers row that the worker daemons pick up.",
  inputShape,
  handler: async (input) => {
    const { contact_id, workflow_type, workflow_name, total_steps } = z.object(inputShape).parse(input);
    const result = await crm.post("/workflows/trigger", {
      client_id: contact_id,
      workflow_type,
      workflow_name,
      total_steps,
      triggered_by: "mcp",
    });
    return { ok: true, workflow: result };
  },
};
