import { z } from 'zod';

import { getAiService } from '../src/shared/ai/service';

const greetingSchema = z.object({
  greeting: z.string(),
  language: z.string(),
});

async function main() {
  const result = await getAiService().generateStructured({
    messages: [
      {
        role: 'system',
        content: 'You produce a short greeting in the requested language.',
      },
      { role: 'user', content: 'Say hello in French.' },
    ],
    schema: greetingSchema,
    schemaName: 'greeting',
  });

  console.log(result);
}

main();
