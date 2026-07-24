import type { ParsedProfile } from '@/entities/profile/types';
import { profileService } from '@/entities/profile/service';
import { CvUploadForm } from '@/features/cv/components/cv-upload-form';
import { OptimizeCvPanel } from '@/features/cv/components/optimize-cv-panel';
import { ProfileSummary } from '@/features/cv/components/profile-summary';
import { SEED_OWNER_ID } from '@/shared/auth/owner';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const profile = await profileService.findUnique({
    where: { ownerId: SEED_OWNER_ID },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Profile</h1>

      <CvUploadForm />

      {profile ? (
        <>
          <ProfileSummary
            profile={{
              summary: profile.summary,
              skills: profile.skills,
              experience: profile.experience as ParsedProfile['experience'],
            }}
          />
          <OptimizeCvPanel />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          No profile yet — upload your CV to get started.
        </p>
      )}
    </div>
  );
}
