import type { ParsedProfile } from '@/entities/profile/types';
import { profileService } from '@/entities/profile/service';
import { CvUploadForm } from '@/features/cv/components/cv-upload-form';
import { OptimizeCvPanel } from '@/features/cv/components/optimize-cv-panel';
import { ProfileSummary } from '@/features/cv/components/profile-summary';
import { getOwnerId } from '@/shared/auth/session';
import { EmptyState } from '@/shared/ui/empty-state';
import { PageHeader } from '@/shared/ui/page-header';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const ownerId = await getOwnerId();
  const profile = await profileService.findUnique(ownerId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Profile" />

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
        <EmptyState message="No profile yet — upload your CV to get started." />
      )}
    </div>
  );
}
