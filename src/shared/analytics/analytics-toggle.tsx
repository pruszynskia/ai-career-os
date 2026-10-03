'use client';

import { useSyncExternalStore } from 'react';

import {
  getConsent,
  setConsent,
  subscribeConsent,
} from '@/shared/analytics/analytics';
import { SegmentedControl, SegmentedControlItem } from '@/shared/ui/primitives';

function AnalyticsToggle() {
  const consent = useSyncExternalStore(
    subscribeConsent,
    getConsent,
    () => null,
  );

  return (
    <SegmentedControl
      aria-label="Analytics"
      value={consent === 'granted' ? 'granted' : 'denied'}
      onValueChange={(value) =>
        setConsent(value === 'granted' ? 'granted' : 'denied')
      }
    >
      <SegmentedControlItem value="granted">On</SegmentedControlItem>
      <SegmentedControlItem value="denied">Off</SegmentedControlItem>
    </SegmentedControl>
  );
}

export { AnalyticsToggle };
