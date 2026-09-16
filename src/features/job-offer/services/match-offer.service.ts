import 'server-only';

import { z } from 'zod';

import { cvDocumentService } from '@/entities/cv-document/service';
import { jobOfferService } from '@/entities/job-offer/service';
import { getOfferOrThrow } from '@/entities/job-offer/service';
import type { FitAssessment } from '@/entities/job-offer/types';
import { profileService } from '@/entities/profile/service';
import type { JobPreferences } from '@/entities/profile/types';
import {
  computeHrCallbackProbability,
  computeMatchScore,
  computeMechanicalSubscores,
  recommendedActionForScore,
} from '@/features/job-offer/services/mechanical-subscores';
import {
  buildMatchOfferUserMessage,
  matchOfferSystemPrompt,
} from '@/shared/ai/prompts/match-offer';
import { getMeteredAiService } from '@/shared/ai/service';
import { getOwnerId } from '@/shared/auth/session';

const NO_PREFERENCES: JobPreferences = {
  workMode: null,
  salaryMin: null,
  salaryMax: null,
  salaryCurrency: null,
  specialization: null,
  employmentType: null,
  seniority: null,
  preferredTechnologies: [],
  companySize: null,
  industries: [],
  locationPreferences: [],
};

const judgmentCriterionSchema = z.object({
  score: z.number().int().min(0).max(100),
  reasoning: z.string(),
});

const matchOfferResponseSchema = z.object({
  technicalMatch: judgmentCriterionSchema,
  seniorityMatch: judgmentCriterionSchema,
  architectureExperience: judgmentCriterionSchema,
  companyAttractiveness: judgmentCriterionSchema,
  experienceSimilarity: judgmentCriterionSchema,
  missingSkills: z.array(z.string()),
  absentButTrue: z.array(z.string()),
});

export async function matchOffer(id: string) {
  const ownerId = await getOwnerId();
  const offer = await getOfferOrThrow(id);
  const masterCv = await cvDocumentService.getMasterOrThrow(
    ownerId,
    'Upload a CV before using it for this offer.',
  );
  const profile = await profileService.findUnique(ownerId);
  const preferences: JobPreferences = profile ?? NO_PREFERENCES;

  // Mechanical scoring, callback modifiers and the AI judgment call all
  // read rawContent, not description - description is the AI-condensed
  // summary from add-offer and drops salary/work-mode/volume/urgency
  // signals, and seniority-band wording, that rawContent still has.
  const mechanical = computeMechanicalSubscores(preferences, offer.rawContent);

  const aiService = await getMeteredAiService('match_offer');
  const judgment = await aiService.generateStructured({
    messages: [
      { role: 'system', content: matchOfferSystemPrompt },
      {
        role: 'user',
        content: buildMatchOfferUserMessage(
          masterCv.content,
          offer.rawContent,
          mechanical,
          { skills: profile?.skills ?? [], experience: profile?.experience ?? [] },
        ),
      },
    ],
    schema: matchOfferResponseSchema,
    schemaName: 'offer_fit_assessment',
  });

  const criteria: FitAssessment['criteria'] = {
    technicalMatch: judgment.technicalMatch,
    seniorityMatch: judgment.seniorityMatch,
    coreStack: mechanical.coreStack,
    industry: mechanical.industry,
    workMode: mechanical.workMode,
    salary: mechanical.salary,
    architectureExperience: judgment.architectureExperience,
    companyAttractiveness: judgment.companyAttractiveness,
    experienceSimilarity: judgment.experienceSimilarity,
  };

  const matchScore = computeMatchScore(criteria);
  const { hrCallbackProbability, callbackModifiers } =
    computeHrCallbackProbability({
      matchScore,
      offerText: offer.rawContent,
      seniorityScore: criteria.seniorityMatch.score,
      industryScore: criteria.industry.score,
    });

  const fit: FitAssessment = {
    criteria,
    missingSkills: judgment.missingSkills,
    absentButTrue: judgment.absentButTrue,
    hrCallbackProbability,
    callbackModifiers,
    recommendedAction: recommendedActionForScore(matchScore),
  };

  return jobOfferService.update(offer.id, { matchScore, fit });
}
