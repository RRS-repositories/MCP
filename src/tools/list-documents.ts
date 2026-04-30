import { z } from "zod";
import { crm } from "../crm-client.js";
import type { ToolDefinition } from "./types.js";

const inputShape = {
  contact_id: z.number().int().positive().describe("Numeric contact id whose documents to list"),
  case_id: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("Optional: scope to a single claim/lender"),
  lender: z
    .string()
    .optional()
    .describe("Optional: filter to documents for a specific lender (alternative to case_id)"),
  category: z
    .string()
    .optional()
    .describe(
      "Optional client-side filter on category (e.g. 'Final Response Letter (FRL)', 'Bank Statement', 'DSAR')"
    ),
};

export const listDocumentsTool: ToolDefinition<typeof inputShape> = {
  name: "crm_list_documents",
  description:
    "List documents stored in S3 for a contact. Each item includes id (S3 key), name, type, category, lender tags, size, and uploaded date. Use case_id or lender to scope to one claim.",
  inputShape,
  handler: async (input) => {
    const { contact_id, case_id, lender, category } = z.object(inputShape).parse(input);

    if (case_id) {
      const out = await crm.get<{ claim: unknown; documents: unknown[] }>(
        `/contacts/${contact_id}/claims/${case_id}/documents`
      );
      const documents = category
        ? (out.documents as Array<{ category?: string }>).filter(
            (d) => (d.category ?? "").toLowerCase() === category.toLowerCase()
          )
        : out.documents;
      return { claim: out.claim, count: documents.length, documents };
    }

    const docs = await crm.get<unknown[]>(`/contacts/${contact_id}/documents`, { lender });
    const filtered = category
      ? (docs as Array<{ category?: string }>).filter(
          (d) => (d.category ?? "").toLowerCase() === category.toLowerCase()
        )
      : docs;
    return { count: filtered.length, documents: filtered };
  },
};
