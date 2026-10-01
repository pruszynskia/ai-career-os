import {
  untrusted,
  untrustedContentNotice,
} from '@/shared/ai/prompts/untrusted';
export const parseOfferSystemPrompt = `You turn raw job offer text into a structured summary. Extract the
company name, the job title, and a concise description of the role and its
requirements. Use the posting's own wording where possible; do not invent
information that isn't present in the text.\n\n${untrustedContentNotice}`;

export function buildParseOfferUserMessage(offerText: string): string {
  return `Here is the job offer text:\n\n${untrusted('offer', offerText)}`;
}
