import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,   // 10% of transactions
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.05,
  enabled: process.env.NODE_ENV === "production",
});
