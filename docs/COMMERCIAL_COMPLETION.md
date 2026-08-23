# Watchable TV — Commercial Completion Standard

Watchable is not considered commercially complete because a feature name exists. A capability is complete only when its state transition, authorization, failure behavior, operator workflow and verification path exist.

## Software gates closed

- [x] $75/month core subscription, paid upfront, no trial
- [x] Secure browser sessions plus bearer-token sessions for native clients
- [x] Stripe subscription adapter and verified subscription webhook processing
- [x] Salesperson/affiliate attribution and recurring residual ledger
- [x] PPV, gifts, creator products and recurring fan-club commerce
- [x] Fan memberships follow paid / past-due / canceled recurring billing state
- [x] Gift fulfillment returns a usable gift code and redemption grants/extends subscription time
- [x] Multiple licensed source adapters and fail-closed supplier-rights activation
- [x] Rights windows, territories, provenance, expiration and takedown enforcement
- [x] PPV entitlement enforced at the underlying asset playback boundary
- [x] DVR and offline downloads fail closed when rights are absent
- [x] Device and concurrent-stream limits
- [x] Playback watermark identifiers and fraud-risk playback blocks
- [x] Contract-permitted backup playback-source failover data
- [x] Web/PWA customer experience
- [x] Native Expo mobile client with secure session storage, playback and offline download support
- [x] Shared 10-foot living-room client with keyboard/remote focus navigation
- [x] Samsung Tizen and LG webOS packaging surfaces
- [x] Watchable Streamer kiosk target
- [x] Universal and voice search where client capabilities permit
- [x] Multilingual discovery and arbitrary audio/caption/subtitle/accessibility track model
- [x] English/Spanish baseline and development fixtures spanning additional languages
- [x] Kids profiles, rating controls and accessibility preferences
- [x] Continue watching, alerts, watch parties, live events/chat, shorts and DVR recommendations
- [x] Multiview API for 2–4 authorized streams
- [x] Black/Latino/Spanish/Asian, Kids, Stage, Music, HBCU, anime, comedy and other programming categories represented as first-class catalog surfaces
- [x] Public creator discovery separated from private creator revenue/financing data
- [x] Creator submissions, fan clubs, financing records, storefront products and creator revenue ledger
- [x] Franchise/IP rights for soundtrack, merchandise, books, games, live shows, licensing, remakes, spin-offs and characters
- [x] Sponsors, sponsorship placements, national/local/shoppable/QR ad campaign model
- [x] Ad decisions refuse licensor inventory Watchable is not authorized to control
- [x] Admin media-operations console and API for creators, pitches, production, rights, sponsors, ads, products, events and franchises
- [x] Production readiness endpoint
- [x] Idempotent additive schema upgrades for existing Watchable databases
- [x] Persistent SQLite backup command for single-node launch
- [x] Docker target and health/readiness endpoints
- [x] GitHub Actions verification workflow for Node 22 and 24
- [x] Expanded automated test source covering subscription, rights, playback, DVR, offline, multilingual, creator privacy, gifting and PPV enforcement

## Verification gate

- [ ] Confirm the latest published branch passes `npm run check` on Node 22 and Node 24. The workflow is committed, but the connected GitHub workflow reader available in this session does not expose push-triggered runs, so this gate must remain visibly unverified rather than being assumed green.

## External launch gates

These require real-world contracts, credentials, hardware or professional review and cannot truthfully be manufactured by source code:

- [ ] Signed U.S. programming agreement(s) covering the exact launch catalog
- [ ] Licensed ad-supported Max/HBO component, STARZ and Paramount+/SHOWTIME component promised in the $75 package
- [ ] Licensed sports, Spanish-language, Black/diaspora, Asian, kids, stage/Broadway, music/concert, theatrical and other programming actually marketed at launch
- [ ] Contract terms explicitly defining DVR, downloads, catch-up, ad inventory, territories, devices, concurrency, PPV and backup feeds
- [ ] Production supplier feed/API/metadata credentials
- [ ] DRM license-server/provider credentials and integration specifications where premium suppliers require DRM
- [ ] Stripe live account credentials, live $75 Price ID and webhook secret
- [ ] Production hosting with persistent storage, domain and TLS
- [ ] Production video/DVR storage/CDN arrangement if cloud DVR is offered beyond a single-node persistent-volume launch
- [ ] Smart-TV/mobile store developer accounts and certification for stores used at launch
- [ ] Physical Watchable Streamer hardware selection/certification if hardware ships at launch
- [ ] Executed creator/talent/production/sponsorship agreements for any named creator, comedian, Broadway producer, musician or filmmaker
- [ ] Final media, privacy, advertising, consumer, tax and contractual counsel review

## Scale gate

The current control plane can launch on one durable application node with persistent SQLite storage and backups while licensed video is delivered by supplier/CDN infrastructure. Before horizontal multi-node scale, move the transactional control database to a shared production database (for example PostgreSQL) and move DVR objects to shared object storage/CDN. This is a scale gate, not permission to run an ephemeral filesystem in production.

## Definition of first commercial customer

1. Customer reaches Watchable signup from web, mobile or supported TV surface.
2. Customer pays $75 before subscription access starts.
3. Verified billing state activates the account.
4. Sales attribution is preserved when a rep/affiliate originated the customer.
5. The visible guide/catalog contains only currently authorized programming.
6. Playback re-checks subscription, supplier, territory/window, takedown, PPV, device, concurrency and fraud rules.
7. Captions/audio/subtitles/accessibility tracks are exposed according to delivered assets.
8. DVR/offline/ads execute only when the contract grants those rights.
9. Recurring subscription or fan payment changes immediately affect entitlement/commission state.
10. Operators can manage content, rights, ads, sponsorship, creator projects and events without editing the database manually.
