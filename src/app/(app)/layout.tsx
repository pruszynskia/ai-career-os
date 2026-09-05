import { Sidebar } from '@/widgets/nav/sidebar';
import { Screen } from '@/shared/ui/primitives';
import { profileService } from '@/entities/profile/service';
import { OnboardingGate } from '@/features/onboarding/components/onboarding-gate';
import { getNotifications } from '@/features/notification/services/get-notifications.service';
import { getOwnerId } from '@/shared/auth/session';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ownerId = await getOwnerId();
  const [notifications, onboardedAt] = await Promise.all([
    getNotifications(ownerId),
    profileService.getOnboardedAt(ownerId),
  ]);
  const needsOnboarding = !onboardedAt;

  return (
    <div className="flex h-screen">
      <Sidebar notifications={notifications} />
      <Screen>
        <OnboardingGate needsOnboarding={needsOnboarding}>
          {children}
        </OnboardingGate>
      </Screen>
    </div>
  );
}
