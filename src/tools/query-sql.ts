import { z } from "zod";
import { crm } from "../crm-client.js";
import type { ToolDefinition } from "./types.js";

const inputShape = {
  sql: z
    .string()
    .min(7)
    .describe(
      "Read-only SQL query. Must start with SELECT or WITH. Multiple statements rejected. Examples: SELECT * FROM cases WHERE status = 'FRL Received' LIMIT 50;"
    ),
  max_rows: z
    .number()
    .int()
    .positive()
    .max(1000)
    .default(200)
    .describe("Maximum rows to return (server caps at 1000)"),
};

export const querySqlTool: ToolDefinition<typeof inputShape> = {
  name: "crm_query_sql",
  description:
    "Run a read-only SQL query against the CRM Postgres database. Only SELECT and WITH queries allowed. Returns rows + columns. Use for ad-hoc data questions where no specific tool exists. Tables: contacts, cases, documents, notes, action_logs, workflow_triggers, claim_statuses, communications, message_templates, system_logs, etc.",
  inputShape,
  handler: async (input) => {
    const { sql, max_rows } = z.object(inputShape).parse(input);
    const result = await crm.post<{
      rows: unknown[];
      rowCount: number;
      columns: string[];
      truncated?: boolean;
    }>("/query/select", { sql, max_rows });
    return result;
  },
};
