# Prompts

One file per prompt, named after the feature it serves (e.g. `parse-cv.ts`,
`optimize-cv.ts`). Each file exports a system prompt string and a
`buildUserMessage(input)` function that formats the caller's input into the
user message content. No shared prompt framework — feature code imports what
it needs and passes the result to `AiService.generateStructured`.
