'use client';

import { setConsent } from '@/shared/analytics/analytics';
import { Button } from '@/shared/ui/button';

function ConsentBanner() {
  return (
    <div
      role="region"
      aria-label="Analytics consent"
      className="fixed inset-x-0 bottom-0 z-50 flex flex-col gap-3 border-t border-border bg-popover p-4 sm:flex-row sm:items-center sm:justify-between max-md:bottom-16"
    >
      <p className="text-body-sm text-muted-foreground">
        We use Google Analytics to see which pages and features get used. It
        only loads if you accept, and you can turn it off anytime in Settings.
      </p>
      <div className="flex shrink-0 gap-2">
        <Button variant="secondary" onClick={() => setConsent('denied')}>
          Decline
        </Button>
        <Button variant="primary" onClick={() => setConsent('granted')}>
          Accept
        </Button>
      </div>
    </div>
  );
}

export { ConsentBanner };
