import type { z, ZodRawShape } from "zod";

export interface ToolDefinition<Shape extends ZodRawShape> {
  name: string;
  description: string;
  inputShape: Shape;
  handler: (input: z.infer<z.ZodObject<Shape>>) => Promise<unknown>;
}
