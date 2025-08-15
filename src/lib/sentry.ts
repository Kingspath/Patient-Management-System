import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'https://5c543bef42932d11dad57e07eac96959@o4509146460258304.ingest.de.sentry.io/4509146466156624',
  environment: process.env.NODE_ENV || 'development',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

export default Sentry;