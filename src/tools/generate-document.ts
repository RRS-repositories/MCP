import { z } from "zod";
import { crm } from "../crm-client.js";
import type { ToolDefinition } from "./types.js";

const inputShape = {
  contact_id: z.number().int().positive().describe("Numeric contact id"),
  case_id: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("Optional: scope to a specific case/claim. Required for lender-specific docs (LOA, complaint)."),
  template_type: z
    .string()
    .describe(
      "Template name. Common: 'LOA', 'Cover Letter', 'Complaint Letter', 'Counter Response', 'FOS Complaint Form', 'Acceptance Form'."
    ),
  variables: z
    .record(z.union([z.string(), z.number(), z.boolean(), z.null()]))
    .optional()
    .describe(
      "Optional template variables that override merge-field defaults (e.g. { complaint_paragraphs: '...' })"
    ),
};

export const generateDocumentTool: ToolDefinition<typeof inputShape> = {
  name: "crm_generate_document",
  description:
    "Generate a CRM document from a template (LOA, cover letter, complaint letter, counter-response, etc.) for a specific contact/case. Returns the S3 key of the generated PDF/DOCX, which can then be sent or downloaded.",
  inputShape,
  handler: async (input) => {
    const { contact_id, case_id, template_type, variables } = z.object(inputShape).parse(input);
    const result = await crm.post("/documents/generate", {
      contact_id,
      case_id,
      template_type,
      variables: variables ?? {},
    });
    return { ok: true, document: result };
  },
};
