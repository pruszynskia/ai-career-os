import { PrismaClient } from '@prisma/client';
import { SEED_OWNER_ID } from '../src/shared/auth/owner';

const prisma = new PrismaClient();

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
