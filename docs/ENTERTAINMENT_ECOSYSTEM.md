# Watchable Entertainment Ecosystem

Watchable is a streaming media company, not cable. The $75 subscription is the recurring consumer foundation; the platform also supports advertising, sponsorship, PPV, creator economics, owned IP and international licensing.

## Programming pillars

Mainstream premium; Black/African American and diaspora; premium Spanish-language/Latino; Asian and Asian-American; Watchable Originals; Watchable Kids; comedy and filmed specials; Broadway/Off-Broadway, plays and musicals; concerts/music; sports; local/community; HBCU; optional faith/spiritual; anime; gaming/esports; documentaries/true crime; cooking/home/travel; dating/reality; podcasts/video podcasts; and short-form creator discovery.

## Audience and localization

Primary adult acquisition audience: 21–49, while Watchable Kids serves household retention. English and Spanish are baseline product languages. The asset model supports arbitrary audio, closed-caption, subtitle, audio-description and sign-language tracks so suppliers and Watchable Originals can add as many languages as rights/localization assets permit. Originals should deliver caption masters, transcripts and localization-ready materials.

## Live and transactional

`live_events`, `event_chat` and `ppv_entitlements` support premieres, countdowns, concerts, comedy, stage performances, sports/events, PPV and aftershows. Watch parties provide synchronized social viewing primitives. Alerts cover premieres, games and events. Gift codes support subscription cards and gifting.

## Creators

Creators receive storefront/fan-club primitives, title-level deal records, transparent revenue events, financing/advance records and performance-linked economics. Supported deal shapes include creator-owned distribution, co-production, Watchable Originals and audience partnerships. Watchable should prefer clear ownership and revenue terms over opaque buyouts.

## Franchise economics

Every Watchable Original can maintain downstream rights for soundtrack, merchandise, books, games, live shows, licensing, international remakes, spin-offs and character/IP exploitation. `franchises` and `franchise_rights` make these rights explicit instead of burying them in notes.

## Advertising and sponsorship

Advertising can be national, local, branded, shoppable or creator-specific. Campaigns support QR payloads. `ad_inventory_rights` records which inventory Watchable may monetize or replace, preventing the ad stack from assuming rights it does not own. Sponsors and sponsorship placements can attach to collections, creators, originals, events and live programming.

## Customer experience

The platform supports universal metadata search, discovery by language/category/mood, what's-on-now, personalized profiles, kids mode, rating controls, accessibility presets, continue watching, alerts, watch parties, offline/download rights, DVR, short-form discovery and multilingual metadata. Multiview and voice are client capabilities built over the same playback/search APIs.

## Resilience and trust

Multiple suppliers and backup playback URLs are modeled separately from rights. Rights provenance and expiration tracking, takedowns, audit logs, device fingerprints, playback watermark tokens and fraud events provide the enforcement layer. Backup playback is only used where the applicable contract permits it.

## International by design

Territories live on content rights rather than being hard-coded to the U.S. Originals should be contracted and mastered with future Latin America, Caribbean, Africa, Europe and Asia distribution in mind. International expansion is therefore a rights/catalog operation, not a platform rewrite.

## External launch gates

Code cannot manufacture programming rights, talent agreements, production financing, DRM credentials, app-store certification, payment credentials or physical studio land. Those remain procurement/execution gates. The software should fail closed whenever those rights or credentials are absent.
