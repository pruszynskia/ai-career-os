import type {
  ParsedProfile,
  ParsedProfileScore,
} from '@/entities/profile/types';
import { profileService } from '@/entities/profile/service';
import { CvUploadForm } from '@/features/cv/components/cv-upload-form';
import { OptimizeCvPanel } from '@/features/cv/components/optimize-cv-panel';
import { ProfileScoreCard } from '@/features/cv/components/profile-score-card';
import { ProfileSummary } from '@/features/cv/components/profile-summary';
import { JobPreferencesForm } from '@/features/profile/components/job-preferences-form';
import { getOwnerId } from '@/shared/auth/session';
import { AppPageLayout } from '@/shared/layouts';
import { EmptyState } from '@/shared/ui/empty-state';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const ownerId = await getOwnerId();
  const profile = await profileService.findUnique(ownerId);

  return (
    <AppPageLayout title="Profile">
      <CvUploadForm />

      {profile ? (
        <>
          {profile.score ? (
            <ProfileScoreCard score={profile.score as ParsedProfileScore} />
          ) : null}
          <ProfileSummary
            profile={{
              summary: profile.summary,
              skills: profile.skills,
              experience: profile.experience as ParsedProfile['experience'],
              projects: (profile.projects ?? []) as ParsedProfile['projects'],
            }}
          />
          <OptimizeCvPanel />
          <JobPreferencesForm preferences={profile} />
        </>
      ) : (
        <EmptyState message="No profile yet — upload your CV to get started." />
      )}
    </AppPageLayout>
  );
}
