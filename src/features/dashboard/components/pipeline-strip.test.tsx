import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import type { ApplicationBundle } from '@/entities/application/types';
import type { JobOffer } from '@/entities/job-offer/types';

import { PipelineStrip } from './pipeline-strip';

function offer(id: string): JobOffer {
  return {
    id,
    ownerId: 'owner-1',
    url: null,
    source: 'RAW_TEXT',
    rawContent: '',
    company: 'Acme',
    title: 'Engineer',
    description: '',
    matchScore: 80,
    fit: null,
    expiresAt: null,
    isExpired: false,
    isFavorite: false,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };
}

function application(
  id: string,
  status: ApplicationBundle['status'],
): ApplicationBundle {
  return {
    id,
    ownerId: 'owner-1',
    jobOfferId: id,
    sentCvId: 'cv-1',
    recruiterMessage: '',
    status,
    notes: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    jobOffer: offer(id),
    sentCv: {} as ApplicationBundle['sentCv'],
    isExpired: false,
  };
}

describe('PipelineStrip', () => {
  it('counts each open status once and buckets terminal outcomes into the Closed lane', () => {
    const applications = [
      application('a1', 'APPLIED'),
      application('a2', 'APPLIED'),
      application('a3', 'HR'),
      application('a4', 'REJECTED'),
      application('a5', 'OFFER'),
    ];
    const html = renderToStaticMarkup(
      <PipelineStrip applications={applications} />,
    );

    // Open-stage cells: Applied 2, HR 1, the rest 0.
    expect(html).toMatch(/Applied[\s\S]*?>2</);
    expect(html).toMatch(/HR[\s\S]*?>1</);
    // Closed lane keeps the terminal outcomes out of the open-stage counts.
    expect(html).toContain('Closed');
    expect(html).toMatch(/Offer[\s\S]*?>1</);
    expect(html).toMatch(/Rejected[\s\S]*?>1</);
  });

  it('renders every open status at zero for an account with no applications', () => {
    const html = renderToStaticMarkup(<PipelineStrip applications={[]} />);
    expect(html.match(/>0</g)?.length).toBeGreaterThanOrEqual(5);
  });
});
