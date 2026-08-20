# Watchable TV

**A custom-built premium television streaming service.**

> **Live TV + Premium Channels + Sports + Movies + Shows + DVR — $75/month**

Watchable TV is a fully owned subscription television platform designed as a modern cable-TV alternative. The customer pays **$75 per month, upfront**, with **no free trial**. The core service includes live television, premium programming, selected national sports, movies, series, VOD, DVR, a unified guide, search, profiles, and multi-device access.

Watchable TV is not a white-label IPTV service and does not depend on third-party media-player products. The customer experience, account system, billing, guide, entitlement logic, playback authorization, advertising systems, sales attribution, analytics, and supported client applications are Watchable-owned software.

## Core commercial offer

```text
WATCHABLE TV
$75/month
Paid upfront
No free trial
Advertising-supported
Premium programming included
```

The $75 service is intended to include:

- live television;
- ad-supported HBO / Max programming or equivalent licensed premium rights;
- STARZ;
- Paramount+ / SHOWTIME programming or equivalent licensed premium rights;
- selected high-value national sports;
- entertainment, news, lifestyle, family, and cultural programming;
- FAST channels;
- licensed movies and television on demand;
- cloud DVR;
- a unified electronic program guide;
- search and discovery;
- profiles, favorites, and continue watching;
- supported multi-device viewing.

Premium programming is part of the core Watchable TV proposition rather than a collection of customer-paid add-ons.

## Customer access

One Watchable TV subscription is designed to work across multiple Watchable-owned clients.

```text
Watchable Account
├── Web app
├── iPhone / Android app
├── Smart-TV apps
└── Watchable Streamer
```

### Web

Customers can subscribe, sign in, browse, and watch through the Watchable web application.

### Mobile

Watchable Mobile provides the same account, entitlements, guide, profiles, watch history, and playback experience on supported phones and tablets.

### Smart TVs

Watchable builds and maintains its own applications for supported modern smart-TV platforms. Smart-TV apps are distribution surfaces for Watchable TV; they do not define or control the service.

### Watchable Streamer

For non-smart televisions and older smart televisions that cannot adequately run Watchable software, Watchable can provide or sell a dedicated streaming device containing the compute, networking, operating environment, playback software, and HDMI output needed to run Watchable TV.

The streamer is optional hardware. **The subscription service is the product.**

## Platform ownership

Watchable owns the customer-facing and operational software stack.

```text
Viewer clients
├── Web
├── Mobile
├── Smart TV
└── Watchable Streamer
        │
        ▼
Watchable identity and accounts
├── Customers
├── Households
├── Profiles
├── Devices
├── Sessions
└── Subscription state
        │
        ▼
Watchable content control plane
├── Catalog
├── Channels
├── Programs
├── VOD assets
├── Collections
├── EPG
├── Rights
└── Entitlements
        │
        ▼
Watchable playback layer
├── Playback authorization
├── Secure session issuance
├── DRM integration where required
├── Concurrent-stream controls
├── Geo/territory enforcement
├── DVR
└── Playback health
        │
        ▼
Watchable monetization
├── $75 recurring subscription
├── Advertising
├── Sales attribution
├── Residual commissions
└── Revenue analytics
```

## Content procurement model

Watchable TV acquires authorized programming as inventory while retaining ownership of the platform.

The preferred procurement model is:

```text
Licensed content owners
        │
        ▼
Licensed programming aggregators / distributors
        │
        ▼
Watchable ingestion + rights layer
        │
        ▼
Watchable TV
```

Watchable prioritizes legitimate programming aggregators that can supply multiple authorized U.S. channels, premium rights, FAST channels, VOD libraries, metadata, and/or sports through a small number of commercial relationships.

Direct programmer negotiations are used selectively when an important content property cannot be obtained economically through aggregation.

A supplier is an inventory source, **not the Watchable platform**.

## Normalized content-source model

Watchable normalizes external programming into a small set of internal source classes.

```text
LICENSED_LINEAR
PREMIUM
FAST_AVOD
VOD
LOCAL_OTA
```

Every external supplier maps into Watchable-owned channel, program, asset, rights, and playback contracts so suppliers can be added or replaced without redesigning the customer experience.

## Programming economics

Watchable is designed backward from the fixed **$75 monthly retail price**.

The current internal programming objective is approximately:

```text
Total programming target: $20–$25 per active subscriber/month
```

This is a private commercial target rather than a claimed market wholesale rate.

The content architecture is intended to concentrate programming spend on the content most likely to acquire and retain customers while using lower-cost, ad-supported, revenue-share, FAST, VOD, and locally received inventory to create breadth.

### Premium anchors

Watchable targets ad-supported wholesale forms of premium programming where available, because the service itself contains advertising and does not require the added cost of ad-free consumer versions.

### Paid live television

Watchable buys a curated group of high-value live networks rather than reproducing every low-value channel in a traditional cable bundle.

### Sports

Sports rights are selected according to customer-acquisition and retention value per programming dollar. Watchable does not assume that every regional sports network, league network, or secondary sports channel belongs in the base package.

### FAST / AVOD

FAST and ad-supported VOD provide substantial catalog and guide breadth without traditional per-channel cable economics. Advertising inventory is monetized only where Watchable's distribution agreement explicitly permits it.

### Local television

Where technically and legally appropriate, Watchable can integrate a household's own over-the-air local reception into the Watchable guide rather than retransmitting the local station itself. This can provide a unified local-channel experience while avoiding unnecessary recurring retransmission expense.

## Rights engine

Watchable treats every content asset as a rights-bearing commercial object.

Each licensed asset or channel can carry records such as:

```text
supplier
territory
linear_rights
vod_rights
dvr_rights
catchup_rights
device_rules
concurrent_stream_limit
start_date
expiration_date
subscriber_rate
minimum_commitment
ad_inventory_terms
```

Playback occurs only when the customer's subscription and the applicable content rights permit it.

## Unified guide

The Watchable guide is source-independent.

A customer may see licensed streams, premium programming, FAST channels, VOD, and locally received OTA channels inside one experience even though those assets originate from different authorized sources.

```text
HOME
LIVE
SPORTS
PREMIUM
MOVIES
SHOWS
DVR
SEARCH
```

Customers should not need to understand content suppliers, feed formats, playlist URLs, or separate media-player applications.

## Billing

The core commercial flow is:

```text
Customer selects Watchable TV
    -> pays $75 upfront
    -> account becomes active
    -> entitlements are issued
    -> customer watches on supported Watchable clients
    -> recurring billing maintains access
```

There is no launch free-trial requirement in the Watchable TV model.

Failed, refunded, disputed, canceled, or expired subscriptions are reflected in entitlement state and downstream commission calculations.

## Sales and affiliates

Watchable is designed for direct sales, field sales, professional sales representatives, affiliates, referrals, and digital acquisition.

Every customer can be associated with an originating salesperson or affiliate.

```text
Salesperson / affiliate
    -> customer signup
    -> successful $75 payment
    -> active subscription
    -> residual commission ledger
```

The intended compensation model uses recurring percentage-based residuals on successfully collected subscription revenue while the originated customer remains active. Final commission percentages remain a commercial configuration rather than a hard-coded platform assumption.

The platform tracks:

- originating rep or affiliate;
- subscriber status;
- payments actually collected;
- commission rate;
- residual amount;
- reversals and chargebacks;
- cancellations;
- payout history;
- retention by salesperson.

## Advertising

Watchable TV is advertising-supported even though it is a paid service.

Potential advertising inventory includes:

- Watchable-owned advertising surfaces;
- permitted FAST inventory;
- permitted VOD inventory;
- sponsorships;
- local advertising;
- programmatic advertising;
- branded programming.

Watchable only inserts or replaces advertising where the applicable rights agreement permits it.

## Revenue architecture

```text
Primary
└── $75/month Watchable TV subscription

Secondary
├── Advertising
├── Sponsorships
├── Future original programming
├── Future content licensing
└── Optional hardware revenue
```

The primary launch business is the recurring Watchable TV subscription rather than hardware sales or a free streaming tier.

## Operating economics

An illustrative internal model is:

```text
$75.00  subscription revenue
- sales residual
- programming cost
- payments / delivery / support
+ advertising contribution
= Watchable contribution per subscriber
```

Using a 20% salesperson residual, $22 programming target, and $6 variable payment/delivery/support assumption as an example:

```text
$75 - $15 - $22 - $6 = $32
```

That $32 figure is a planning scenario, not a guaranteed margin. Actual programming, infrastructure, payment, support, advertising, tax, hardware, refund, and acquisition economics determine realized contribution.

## Customer experience standard

The intended Watchable TV experience is simple:

```text
Subscribe
    -> Pay $75
    -> Sign in
    -> Watch
```

The customer should not need to configure playlists, M3U URLs, EPG URLs, developer settings, third-party IPTV players, or content-provider credentials merely to use the core Watchable service.

## Launch priorities

Watchable TV's first commercial release is not complete until the following chain works end to end:

```text
Customer acquisition
    -> $75 payment
    -> account activation
    -> salesperson attribution
    -> device/session activation
    -> catalog + EPG
    -> authorized playback
    -> VOD / live / premium access
    -> DVR
    -> advertising
    -> recurring billing
    -> residual commission accounting
    -> support + operational monitoring
```

## Distribution expansion

Watchable does not wait for every smart-TV store to approve an application before the company can exist.

The platform can launch through supported web, mobile, direct-install, and Watchable Streamer surfaces while smart-TV distribution expands in parallel.

Future supported surfaces can include:

- Samsung smart TVs;
- LG webOS TVs;
- Android / Google TV;
- Roku;
- Apple TV;
- additional connected-TV platforms.

## Future home internet

Watchable TV may later be paired with a separate Watchable home-internet offering. Internet is not required for the initial television-platform launch architecture and should not delay Watchable TV's first revenue.

## Commercial completion standard

Watchable TV is commercially complete only when it has:

- working custom software;
- real subscriber billing;
- real licensed programming;
- proven rights enforcement;
- reliable playback;
- supported customer devices;
- advertising operations;
- sales attribution and residual accounting;
- customer support and operational monitoring;
- deployment readiness;
- documented unit economics;
- paying customers;
- retention evidence.

## Repository boundary

This repository is the controlled public product, architecture, service, and technical-documentation surface for Watchable TV.

Proprietary production source code, customer data, confidential programming agreements, supplier rate sheets, private cost ceilings, advertising contracts, security material, deployment secrets, and other sensitive commercial assets should remain in private systems.

## Ownership and licensing

Watchable TV is independently designed and developed by **Charles Castillo**, Software Engineer and AI Systems Engineer.

All rights reserved. No source, architecture, branding, content, documentation, programming, distribution, or commercial rights are granted without explicit written authorization.
