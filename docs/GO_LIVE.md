# Watchable TV — Go-Live Checklist

## Required before taking the first $75 payment

1. Replace all development secrets.
2. Set `NODE_ENV=production` and `BILLING_PROVIDER=stripe`.
3. Create the Stripe $75/month recurring price and set `STRIPE_PRICE_ID`.
4. Register `/api/billing/stripe/webhook` with Stripe and set `STRIPE_WEBHOOK_SECRET`.
5. Ingest only programming packages backed by a signed agreement. `rightsVerified` must remain false until the agreement is verified internally.
6. Remove or exclude all demo fixtures from production. Production startup does not seed them.
7. Confirm every promised premium and sports property exists in the launch package.
8. Confirm whether each feed permits DVR, catch-up and ad replacement before enabling those features.
9. Put Watchable behind TLS and a production reverse proxy/CDN.
10. Back up `DATABASE_PATH` continuously if SQLite is used for the initial single-node launch; migrate to managed PostgreSQL before multi-node scale.
11. Run `npm test` and the end-to-end payment/playback smoke test.
12. Have support escalation, refund, outage and content-takedown procedures active.

## Production scaling trigger

The included database is deliberately dependency-light and suitable for development and an initial single-node launch. Before horizontal scaling or a material subscriber base, move persistence to managed PostgreSQL and object storage for DVR assets. The business logic is isolated so that migration does not change the customer contract or content adapters.
