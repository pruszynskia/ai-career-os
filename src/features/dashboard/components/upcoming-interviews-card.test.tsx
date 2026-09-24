import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import type { ApplicationBundle } from '@/entities/application/types';
import type { JobOffer } from '@/entities/job-offer/types';

import { UpcomingInterviewsCard } from './upcoming-interviews-card';

function offer(id: string): JobOffer {
  return {
    id,
    ownerId: 'owner-1',
    url: null,
    source: 'RAW_TEXT',
    rawContent: '',
    company: 'Acme',
    title: 'Staff Engineer',
    description: '',
    matchScore: 88,
    fit: null,
    expiresAt: null,
    isExpired: false,
    isFavorite: false,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };
}

function application(id: string): ApplicationBundle {
  return {
    id,
    ownerId: 'owner-1',
    jobOfferId: id,
    sentCvId: 'cv-1',
    recruiterMessage: '',
    status: 'HR',
    notes: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    jobOffer: offer(id),
    sentCv: {} as ApplicationBundle['sentCv'],
    isExpired: false,
  };
}

describe('UpcomingInterviewsCard', () => {
  it('renders the same application row for both the mobile list and the desktop table', () => {
    const html = renderToStaticMarkup(
      <UpcomingInterviewsCard applications={[application('a1')]} />,
    );

    // The mobile ListRow and the desktop GridTable both link to the same
    // offer, so this href (and thus the underlying row data) appears
    // exactly twice - once per breakpoint variant, no data divergence.
    expect(html.match(/href="\/offers\/a1"/g)?.length).toBe(2);
  });
});
