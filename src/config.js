import path from 'node:path';

export const config = Object.freeze({
  port: Number(process.env.PORT || 8787),
  baseUrl: process.env.BASE_URL || 'http://localhost:8787',
  databasePath: process.env.DATABASE_PATH || path.resolve('data/watchable.db'),
  sessionSecret: process.env.SESSION_SECRET || 'dev-session-secret-change-me',
  playbackSigningSecret: process.env.PLAYBACK_SIGNING_SECRET || 'dev-playback-secret-change-me',
  billingProvider: process.env.BILLING_PROVIDER || 'mock',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripePriceId: process.env.STRIPE_PRICE_ID || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  commissionRate: Number(process.env.COMMISSION_RATE || '0.20'),
  adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'change-me'
});

export const PLAN = Object.freeze({
  id: 'watchable-tv-monthly',
  name: 'Watchable TV',
  amountCents: 7500,
  currency: 'usd',
  interval: 'month',
  trialDays: 0,
  advertisingSupported: true
});


export function validateProductionConfig() {
  if (process.env.NODE_ENV !== 'production') return [];
  const errors=[];
  if (config.billingProvider !== 'stripe') errors.push('BILLING_PROVIDER must be stripe in production');
  if (!config.stripeSecretKey) errors.push('STRIPE_SECRET_KEY required');
  if (!config.stripePriceId) errors.push('STRIPE_PRICE_ID required');
  if (!config.stripeWebhookSecret) errors.push('STRIPE_WEBHOOK_SECRET required');
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) errors.push('SESSION_SECRET must be at least 32 characters');
  if (!process.env.PLAYBACK_SIGNING_SECRET || process.env.PLAYBACK_SIGNING_SECRET.length < 32) errors.push('PLAYBACK_SIGNING_SECRET must be at least 32 characters');
  return errors;
}
