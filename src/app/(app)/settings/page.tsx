import {
  aiUsageService,
  startOfCurrentMonth,
} from '@/entities/ai-usage/service';
import { profileService } from '@/entities/profile/service';
import { subscriptionService } from '@/entities/subscription/service';
import { DangerZone } from '@/features/account/components/danger-zone';
import { BillingPanel } from '@/features/billing/components/billing-panel';
import { UsageMeter } from '@/features/billing/components/usage-meter';
import { JobPreferencesForm } from '@/features/profile/components/job-preferences-form';
import { getOwnerId } from '@/shared/auth/session';
import { getPlanForOwner } from '@/shared/billing/entitlements';
import { AppPageLayout } from '@/shared/layouts';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { AnalyticsToggle } from '@/shared/analytics/analytics-toggle';
import { EmptyState } from '@/shared/ui/empty-state';
import { HStack, VStack } from '@/shared/ui/primitives';
import { ThemeToggle } from '@/shared/ui/theme-toggle';

export const dynamic = 'force-dynamic';

const SECTIONS = [
  { id: 'appearance', label: 'Appearance' },
  { id: 'job-preferences', label: 'Job preferences' },
  { id: 'billing', label: 'Billing' },
  { id: 'ai-usage', label: 'AI usage' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'danger-zone', label: 'Danger zone' },
] as const;

const NAV_LINK_CLASSNAME =
  'flex h-[30px] items-center rounded-md px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground';

export default async function SettingsPage() {
  const ownerId = await getOwnerId();
  const [profile, subscription, plan, used] = await Promise.all([
    profileService.findUnique(ownerId),
    subscriptionService.findByOwnerId(ownerId),
    getPlanForOwner(ownerId),
    aiUsageService.countForOwnerSince(ownerId, startOfCurrentMonth()),
  ]);

  return (
    <AppPageLayout eyebrow="Account" title="Settings">
      <HStack gap={8} align="start">
        <nav
          aria-label="Settings sections"
          className="flex w-[180px] shrink-0 flex-col gap-1"
        >
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={NAV_LINK_CLASSNAME}
            >
              {section.label}
            </a>
          ))}
        </nav>

        <VStack gap={6} className="min-w-0 flex-1">
          <Card id="appearance" className="scroll-mt-4">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent>
              <ThemeToggle />
            </CardContent>
          </Card>

          <div id="job-preferences" className="scroll-mt-4">
            {profile ? (
              <JobPreferencesForm preferences={profile} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Job preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <EmptyState
                    message="Upload your CV on the Profile page to set job preferences."
                    className="px-0 py-4"
                  />
                </CardContent>
              </Card>
            )}
          </div>

          <div id="billing" className="scroll-mt-4">
            <BillingPanel subscription={subscription} />
          </div>

          <div id="ai-usage" className="scroll-mt-4">
            <UsageMeter used={used} limit={plan.aiActionsPerMonth} />
          </div>

          <Card id="privacy" className="scroll-mt-4">
            <CardHeader>
              <CardTitle>Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <VStack gap={2}>
                <p className="text-body-sm text-muted-foreground">
                  Anonymous usage analytics (Google Analytics).
                </p>
                <AnalyticsToggle />
              </VStack>
            </CardContent>
          </Card>

          <div id="danger-zone" className="scroll-mt-4">
            <DangerZone />
          </div>
        </VStack>
      </HStack>
    </AppPageLayout>
  );
}
