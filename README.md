# Watchable TV

**Watchable TV is a custom-built streaming media and entertainment platform.** It is not cable and it is not a white-label IPTV player.

> **Premium streaming + live programming + originals + creators + events + kids + culture — $75/month**

The customer pays **$75 per month upfront** with **no free trial**. Advertising, sponsorship, PPV and owned-IP economics sit alongside recurring subscription revenue.

## Programming identity

Watchable combines familiar premium/mainstream programming with programming conventional platforms underserve: Black/African American and diaspora; premium Spanish-language/Latino; Asian and Asian-American; Watchable Originals; Watchable Kids; comedy specials; Broadway/Off-Broadway, plays and musicals; concerts/music; sports; local/community; HBCU; optional faith/spiritual; anime; gaming/esports; documentaries/true crime; cooking/home/travel; dating/reality; podcasts/video podcasts; and short-form creator discovery.

The core adult acquisition audience is **21–49** while Watchable Kids strengthens household retention. English and Spanish are baseline product languages. Content can expose arbitrary closed captions, subtitles, alternate audio, audio description and sign-language tracks when those assets and rights are available.

## Ways to watch

- Web/PWA
- Mobile clients
- Watchable smart-TV clients
- Watchable Streamer for older/non-smart HDMI televisions

The subscription is the product. Hardware is an access method.

## Entertainment ecosystem

The codebase now models live premieres/countdowns/chat/aftershows, PPV, watch parties, gifts/subscription cards, family/kids profiles, accessibility preferences, offline/download rights, multilingual discovery, what's-on-now, continue watching, alerts, short-form discovery, creator storefront economics/fan clubs/financing, sponsorships, shoppable/QR advertising, franchise/IP rights, multiple content suppliers, backup playback, rights provenance/expiration, takedowns, fraud signals and audit trails.

Every Watchable Original can explicitly track downstream soundtrack, merchandise, books, games, live shows, licensing, international-remake, spin-off and character rights. Creator economics are represented as transparent title/deal/revenue records rather than opaque platform accounting.

See `docs/ENTERTAINMENT_ECOSYSTEM.md` for the full model.

## Content model

Licensed suppliers plug into Watchable without owning the customer experience:

```text
LICENSED_LINEAR
PREMIUM
FAST_AVOD
VOD
LOCAL_OTA
```

Commercial sources cannot be activated through the provided ingestion workflow unless rights are explicitly verified. Feed URLs alone never establish redistribution permission.

## Commercial flow

```text
Customer / salesperson / affiliate
 -> $75 payment
 -> Watchable account
 -> entitlement
 -> discovery / guide / VOD / events / DVR
 -> authorized playback
 -> ads / sponsorship / PPV where applicable
 -> recurring payment
 -> salesperson residual
```

The working sales-commission default remains configurable at 20% of collected subscription revenue ($15 on $75); it is not a permanent company-policy lock.

## Run and verify

Requires Node.js 22+ and FFmpeg for DVR recording tests.

```bash
cp .env.example .env
npm run seed
npm start
npm test
```

Local development uses mock billing; **production refuses to run with mock billing**. A commercial launch still requires real programming/talent rights, payment and infrastructure credentials, DRM/certification where contracts require it, and executed production/distribution agreements.

## Production documents

- `docs/ENTERTAINMENT_ECOSYSTEM.md`
- `docs/COMMERCIAL_COMPLETION.md`
- `docs/GO_LIVE.md`
- `docs/CONTENT_PROCUREMENT.md`
- `docs/ARCHITECTURE.md`
- `docs/SECURITY.md`
