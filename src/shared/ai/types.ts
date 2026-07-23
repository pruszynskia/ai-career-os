import type { z } from 'zod';

export type AiRole = 'system' | 'user';

export interface AiMessage {
  role: AiRole;
  content: string;
}

export interface StructuredCallOptions<Schema extends z.ZodObject> {
  messages: AiMessage[];
  schema: Schema;
  schemaName: string;
  maxTokens?: number;
}

export interface AiService {
  generateStructured<Schema extends z.ZodObject>(
    options: StructuredCallOptions<Schema>,
  ): Promise<z.infer<Schema>>;
}
