import { config, PLAN } from './config.js';
import { getDb } from './db.js';
import { id, now, timingSafeEqual } from './util.js';
import crypto from 'node:crypto';

export async function createCheckout({ user, repCode }) {
  if (config.billingProvider === 'stripe') return createStripeCheckout({ user, repCode });
  return createMockCheckout({ user, repCode });
}

function resolveRep(repCode) {
  if (!repCode) return null;
  return getDb().prepare('SELECT * FROM reps WHERE code=? AND status=?').get(repCode.trim().toUpperCase(), 'active') || null;
}

function upsertSubscription({ userId, status, billingProvider, providerCustomerId = null, providerSubscriptionId = null, rep = null, periodEnd = null }) {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM subscriptions WHERE user_id=?').get(userId);
  const ts = now();
  if (existing) {
    db.prepare(`UPDATE subscriptions SET status=?,billing_provider=?,provider_customer_id=?,provider_subscription_id=?,current_period_end=?,originating_rep_id=COALESCE(originating_rep_id,?),commission_rate=COALESCE(commission_rate,?),updated_at=? WHERE user_id=?`)
      .run(status,billingProvider,providerCustomerId,providerSubscriptionId,periodEnd,rep?.id ?? null,rep?.default_rate ?? config.commissionRate,ts,userId);
    return db.prepare('SELECT * FROM subscriptions WHERE user_id=?').get(userId);
  }
  const subscriptionId = id('sub');
  db.prepare(`INSERT INTO subscriptions (id,user_id,plan_id,status,billing_provider,provider_customer_id,provider_subscription_id,current_period_end,originating_rep_id,commission_rate,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(subscriptionId,userId,PLAN.id,status,billingProvider,providerCustomerId,providerSubscriptionId,periodEnd,rep?.id ?? null,rep?.default_rate ?? config.commissionRate,ts,ts);
  return db.prepare('SELECT * FROM subscriptions WHERE id=?').get(subscriptionId);
}

function awardCommission({ subscription, paymentReference, grossCents }) {
  if (!subscription?.originating_rep_id) return null;
  const db = getDb();
  const existing = db.prepare('SELECT * FROM commission_events WHERE payment_reference=?').get(paymentReference);
  if (existing) return existing;
  const rate = Number(subscription.commission_rate || config.commissionRate);
  const commissionCents = Math.round(grossCents * rate);
  const event = { id: id('com'), repId: subscription.originating_rep_id, userId: subscription.user_id, subscriptionId: subscription.id, paymentReference, grossCents, rate, commissionCents, status: 'earned', createdAt: now() };
  db.prepare(`INSERT INTO commission_events (id,rep_id,user_id,subscription_id,payment_reference,gross_cents,rate,commission_cents,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)`)
    .run(event.id,event.repId,event.userId,event.subscriptionId,event.paymentReference,event.grossCents,event.rate,event.commissionCents,event.status,event.createdAt);
  return event;
}

function createMockCheckout({ user, repCode }) {
  const rep = resolveRep(repCode);
  const periodEnd = new Date(Date.now() + 30 * 86400000).toISOString();
  const subscription = upsertSubscription({ userId: user.id, status: 'active', billingProvider: 'mock', providerSubscriptionId: id('mocksub'), rep, periodEnd });
  awardCommission({ subscription, paymentReference: id('mockpay'), grossCents: PLAN.amountCents });
  return { provider: 'mock', activated: true, redirectUrl: '/app.html?activated=1', subscription };
}

async function stripeRequest(path, body) {
  if (!config.stripeSecretKey) throw new Error('STRIPE_SECRET_KEY is required');
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.stripeSecretKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body)
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message || `Stripe request failed (${response.status})`);
  return payload;
}

async function createStripeCheckout({ user, repCode }) {
  if (!config.stripePriceId) throw new Error('STRIPE_PRICE_ID is required');
  const session = await stripeRequest('checkout/sessions', {
    mode: 'subscription',
    'line_items[0][price]': config.stripePriceId,
    'line_items[0][quantity]': '1',
    customer_email: user.email,
    client_reference_id: user.id,
    success_url: `${config.baseUrl}/app.html?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.baseUrl}/subscribe.html?checkout=cancel`,
    'metadata[user_id]': user.id,
    'metadata[rep_code]': repCode || ''
  });
  upsertSubscription({ userId: user.id, status: 'pending', billingProvider: 'stripe', rep: resolveRep(repCode) });
  return { provider: 'stripe', activated: false, redirectUrl: session.url, sessionId: session.id };
}

export function getSubscription(userId) {
  return getDb().prepare('SELECT * FROM subscriptions WHERE user_id=?').get(userId) || null;
}

export function isEntitled(userId) {
  const sub = getSubscription(userId);
  return !!sub && ['active','trialing'].includes(sub.status) && (!sub.current_period_end || Date.parse(sub.current_period_end) > Date.now());
}

export function listCommissionSummary(repId) {
  const db = getDb();
  const totals = db.prepare(`SELECT COUNT(*) event_count, COALESCE(SUM(commission_cents),0) commission_cents FROM commission_events WHERE rep_id=? AND status='earned'`).get(repId);
  const active = db.prepare(`SELECT COUNT(*) active_customers FROM subscriptions WHERE originating_rep_id=? AND status='active'`).get(repId);
  return { ...totals, ...active };
}

export async function handleStripeWebhook(rawBody, signature) {
  if (!config.stripeWebhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET is required');
  verifyStripeSignature(rawBody, signature, config.stripeWebhookSecret);
  const event = JSON.parse(rawBody);
  const obj = event.data?.object || {};
  if (event.type === 'checkout.session.completed' && obj.mode === 'subscription') {
    const userId = obj.metadata?.user_id || obj.client_reference_id;
    if (userId) {
      const rep = resolveRep(obj.metadata?.rep_code || '');
      upsertSubscription({userId,status:'active',billingProvider:'stripe',providerCustomerId:obj.customer||null,providerSubscriptionId:obj.subscription||null,rep});
    }
  } else if (event.type === 'invoice.paid') {
    const providerSub = typeof obj.subscription === 'string' ? obj.subscription : obj.parent?.subscription_details?.subscription;
    const subscription = providerSub ? getDb().prepare('SELECT * FROM subscriptions WHERE provider_subscription_id=?').get(providerSub) : null;
    if (subscription) {
      getDb().prepare("UPDATE subscriptions SET status='active',updated_at=? WHERE id=?").run(now(),subscription.id);
      awardCommission({subscription,paymentReference:obj.id,grossCents:Number(obj.amount_paid||PLAN.amountCents)});
    }
  } else if (event.type === 'customer.subscription.updated') {
    const subscription = getDb().prepare('SELECT * FROM subscriptions WHERE provider_subscription_id=?').get(obj.id);
    if (subscription) getDb().prepare('UPDATE subscriptions SET status=?,current_period_end=?,updated_at=? WHERE id=?').run(obj.status,obj.current_period_end?new Date(obj.current_period_end*1000).toISOString():null,now(),subscription.id);
  } else if (event.type === 'customer.subscription.deleted') {
    getDb().prepare("UPDATE subscriptions SET status='canceled',updated_at=? WHERE provider_subscription_id=?").run(now(),obj.id);
  }
  return {received:true,type:event.type};
}

function verifyStripeSignature(rawBody, signature, secret) {
  if (!signature) throw new Error('Missing Stripe-Signature');
  const parts=Object.fromEntries(signature.split(',').map(part=>{const [k,v]=part.split('=');return [k,v]}));
  const timestamp=Number(parts.t); const v1=parts.v1;
  if (!timestamp || !v1) throw new Error('Invalid Stripe-Signature');
  if (Math.abs(Math.floor(Date.now()/1000)-timestamp)>300) throw new Error('Stripe webhook timestamp outside tolerance');
  const expected=crypto.createHmac('sha256',secret).update(`${timestamp}.${rawBody}`).digest('hex');
  if (!timingSafeEqual(expected,v1)) throw new Error('Invalid Stripe webhook signature');
}


export { PLAN, awardCommission, upsertSubscription };
