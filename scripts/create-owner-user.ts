import { createAdminClient } from '@/shared/db/admin';

async function main() {
  const email = process.env.AUTH_OWNER_EMAIL;
  const password = process.env.AUTH_OWNER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Set AUTH_OWNER_EMAIL and AUTH_OWNER_PASSWORD before running this script.',
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) throw error;

  console.log(`Created owner user ${data.user.email} (${data.user.id}).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
