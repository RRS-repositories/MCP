import { z } from "zod";
import { crm } from "../crm-client.js";
import type { ToolDefinition } from "./types.js";

const inputShape = {
  to: z.string().email().describe("Recipient email address"),
  subject: z.string().min(1).describe("Email subject"),
  body_html: z
    .string()
    .optional()
    .describe("HTML body of the email. Use this OR body_text (one is required)."),
  body_text: z.string().optional().describe("Plain-text body of the email. Used as fallback if body_html absent."),
  contact_id: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("If known, the contact id this email is associated with — used for the action log"),
};

const InputSchema = z
  .object(inputShape)
  .refine((v) => Boolean(v.body_html || v.body_text), {
    message: "Provide body_html or body_text",
  });

export const sendEmailTool: ToolDefinition<typeof inputShape> = {
  name: "crm_send_email",
  description:
    "Send an email from the Rowan Rose Solicitors mailbox. Logs the send to action_logs and links to the contact if contact_id is provided. Subject to EMAIL_DRAFT_MODE — if the CRM is in draft mode, the email is logged but not actually sent.",
  inputShape,
  handler: async (input) => {
    const { to, subject, body_html, body_text, contact_id } = InputSchema.parse(input);
    const result = await crm.post("/email/send", {
      to,
      subject,
      html: body_html,
      text: body_text,
      contact_id,
    });
    return { ok: true, ...((result as object) ?? {}) };
  },
};
