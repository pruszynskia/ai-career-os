'use client';

import { useSyncExternalStore } from 'react';
import Script from 'next/script';

import { getConsent, subscribeConsent } from '@/shared/analytics/analytics';
import { ConsentBanner } from '@/shared/analytics/consent-banner';

interface GoogleAnalyticsProps {
  measurementId: string;
  nonce: string | undefined;
}

function GoogleAnalytics({ measurementId, nonce }: GoogleAnalyticsProps) {
  // Server snapshot is null so the first client render matches the server.
  const consent = useSyncExternalStore(
    subscribeConsent,
    getConsent,
    () => null,
  );

  if (consent === 'denied') return null;
  if (consent === null) return <ConsentBanner />;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
        nonce={nonce}
      />
      <Script id="ga-init" strategy="afterInteractive" nonce={nonce}>
        {`window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${measurementId}',{allow_google_signals:false,allow_ad_personalization_signals:false});`}
      </Script>
    </>
  );
}

export { GoogleAnalytics };
