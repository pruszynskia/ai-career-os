import type { Prisma } from '@prisma/client';

export type ApplicationBundle = Prisma.ApplicationGetPayload<{
  include: { jobOffer: true; sentCv: true };
}>;
