import type { ParsedProfile } from '@/entities/profile/types';
import { profileService } from '@/entities/profile/service';
import { CvUploadForm } from '@/features/cv/components/cv-upload-form';
import { OptimizeCvPanel } from '@/features/cv/components/optimize-cv-panel';
import { ProfileSummary } from '@/features/cv/components/profile-summary';
import { getOwnerId } from '@/shared/auth/session';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const ownerId = await getOwnerId();
  const profile = await profileService.findUnique(ownerId);

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
