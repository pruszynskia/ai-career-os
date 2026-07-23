import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Single-user MVP (ADR-003): one constant ownerId, no users table.
// TASK-003 (auth) will need this same value to scope the seeded session.
const SEED_OWNER_ID = 'seed-owner';

async function main() {
  await prisma.profile.upsert({
    where: { ownerId: SEED_OWNER_ID },
    update: {},
    create: {
      ownerId: SEED_OWNER_ID,
      summary: '',
      skills: [],
      experience: [],
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
