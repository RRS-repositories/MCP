import { z } from "zod";
import { crm } from "../crm-client.js";
import type { ToolDefinition } from "./types.js";

const inputShape = {
  s3_key: z
    .string()
    .min(3)
    .describe("Full S3 key of the document (the 'id' field returned by crm_list_documents)"),
  max_chars: z
    .number()
    .int()
    .positive()
    .max(200_000)
    .default(60_000)
    .describe("Truncate extracted text to this many characters (default 60k)"),
};

export const readDocumentTool: ToolDefinition<typeof inputShape> = {
  name: "crm_read_document",
  description:
    "Extract text from a CRM document (PDF/DOCX) stored in S3. Use the s3_key returned by crm_list_documents. Returns plain text, optionally truncated.",
  inputShape,
  handler: async (input) => {
    const { s3_key, max_chars } = z.object(inputShape).parse(input);
    const result = await crm.get<{ text?: string; pages?: number; mime?: string }>(
      "/documents/extract-text",
      { key: s3_key }
    );
    const text = result.text ?? "";
    const truncated = text.length > max_chars;
    return {
      s3_key,
      mime: result.mime,
      pages: result.pages,
      char_count: text.length,
      truncated,
      text: truncated ? text.slice(0, max_chars) : text,
    };
  },
};
