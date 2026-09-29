import type {
  ParsedProfile,
  ParsedProfileScore,
} from '@/entities/profile/types';
import { profileService } from '@/entities/profile/service';
import { ImportConnectionsForm } from '@/features/contact/components/import-connections-form';
import { CoverLetterUploadForm } from '@/features/cv/components/cover-letter-upload-form';
import { CvUploadForm } from '@/features/cv/components/cv-upload-form';
import { OptimizeCoverLetterPanel } from '@/features/cv/components/optimize-cover-letter-panel';
import { OptimizeCvPanel } from '@/features/cv/components/optimize-cv-panel';
import { ProfileScoreCard } from '@/features/cv/components/profile-score-card';
import { ProfileSummary } from '@/features/cv/components/profile-summary';
import { EvidenceReview } from '@/features/profile/components/evidence-review';
import { getOwnerId } from '@/shared/auth/session';
import { AppPageLayout } from '@/shared/layouts';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const ownerId = await getOwnerId();
  const profile = await profileService.findUnique(ownerId);

  return (
    <AppPageLayout eyebrow="Account" title="Profile">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-5">
          {profile ? (
            <>
              <ProfileSummary
                profile={{
                  summary: profile.summary,
                  skills: profile.skills,
                  experience: profile.experience as ParsedProfile['experience'],
                  projects: (profile.projects ??
                    []) as ParsedProfile['projects'],
                }}
              />
              <EvidenceReview evidence={profile.evidence} />
            </>
          ) : (
            <EmptyState message="No profile yet — upload your CV to get started." />
          )}
        </div>

        <div className="flex flex-col gap-5">
          {profile?.score ? (
            <ProfileScoreCard score={profile.score as ParsedProfileScore} />
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Uploads</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <CvUploadForm />
              <div className="border-t border-border pt-4">
                <CoverLetterUploadForm />
              </div>
              <div className="border-t border-border pt-4">
                <ImportConnectionsForm />
              </div>
            </CardContent>
          </Card>

          {profile ? <OptimizeCvPanel /> : null}
          <OptimizeCoverLetterPanel />
        </div>
      </div>
    </AppPageLayout>
  );
}
