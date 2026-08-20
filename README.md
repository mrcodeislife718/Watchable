# Watchable TV

**Watchable TV is a custom-built, advertising-supported premium television streaming service.**

> **Live TV + Premium Entertainment + Sports + Movies + Shows + DVR — $75/month**

The customer pays **$75 per month upfront**. There is **no free trial**. Watchable TV is designed so premium programming is part of the core service rather than a pile of customer-paid add-ons.

## Product

Watchable TV targets a launch package containing licensed live television, an ad-supported Max/HBO component, STARZ, a Paramount+/SHOWTIME component, selected high-value sports, entertainment/news/family programming, FAST channels, licensed VOD, cloud DVR where rights allow it, one guide, search, profiles, favorites and multi-device access.

Watchable owns the customer platform. It does not require TiviMate, IPTV Smarters, Fire TV, or a white-label OTT application.

## Ways to watch

- Web/PWA
- Mobile/PWA, with native store clients as distribution expands
- Watchable smart-TV clients
- Watchable Streamer for older or non-smart HDMI televisions

The subscription is the product. Hardware is only an access method.

## Commercial flow

```text
Customer / salesperson / affiliate
          -> $75 payment
          -> Watchable account
          -> active subscription
          -> content entitlement
          -> guide / VOD / DVR
          -> short-lived authorized playback
          -> next successful payment
          -> recurring salesperson residual
```

The default working commission rate is **20% of collected subscription revenue** ($15 on a $75 payment). It is configurable and is not hard-coded as a permanent company policy.

## Content model

Watchable can ingest programming from multiple licensed suppliers without changing the client applications.

```text
LICENSED_LINEAR
PREMIUM
FAST_AVOD
VOD
LOCAL_OTA
```

Commercial sources cannot be activated through the provided ingestion workflow unless rights are explicitly marked verified. Feed URLs alone do not establish redistribution permission.

## Run locally

Requires Node.js 22+ and FFmpeg for DVR recording tests.

```bash
cp .env.example .env
npm run seed
npm start
```

Open `http://localhost:8787`.

Local development defaults to a mock billing adapter so the full activation path can be exercised without charging a card. **Production mode refuses to run with mock billing.** Stripe Checkout is the production billing adapter.

## Test

```bash
npm test
```

The suite verifies password security, subscription activation, residual commission accounting, entitlement-gated playback, DVR scheduling, rights-safe supplier ingestion and catalog normalization.

## Supplier ingestion

After a programming agreement is verified, normalize the supplier package to `config/content-pack.example.json` and run:

```bash
node scripts/ingest-package.js path/to/licensed-package.json
```

## Production

See:

- `docs/COMMERCIAL_COMPLETION.md`
- `docs/GO_LIVE.md`
- `docs/CONTENT_PROCUREMENT.md`
- `docs/ARCHITECTURE.md`
- `docs/SECURITY.md`

The software can be completed independently; a real commercial launch still requires actual programming rights, production payment credentials, infrastructure credentials and any DRM/certification required by the signed programming agreements.
