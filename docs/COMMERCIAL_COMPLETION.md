# Watchable TV — Commercial Completion Standard

Watchable TV is commercially complete only when a real customer can pay $75, receive an active account, watch the contracted launch lineup on a supported client, use the guide/search/DVR features permitted by the rights agreements, and the originating salesperson's residual is recorded from collected revenue.

## Software gates

- [x] $75/month plan, paid upfront, no trial
- [x] Customer registration and secure password hashing
- [x] Session authentication
- [x] Recurring billing adapter with Stripe Checkout support
- [x] Stripe webhook verification and recurring invoice commission logic
- [x] Salesperson/affiliate attribution and residual ledger
- [x] Live channel registry and normalized content-source adapters
- [x] VOD registry
- [x] Rights windows and U.S. territory enforcement
- [x] Refuse activation of unverified commercial content sources
- [x] Entitlement-gated short-lived playback sessions
- [x] Unified EPG data model
- [x] DVR scheduling and FFmpeg recording worker when DVR rights are granted
- [x] Search, profiles, favorites and watch-surface APIs
- [x] Advertising campaign/decision/event primitives
- [x] Web/PWA client
- [x] Living-room TV client surface
- [x] Samsung Tizen and LG webOS packaging shells
- [x] Watchable Streamer kiosk target
- [x] Docker deployment target
- [x] Health endpoint and audit events
- [x] Automated tests for core commercial flow

## External launch gates

These cannot be completed by source code alone:

- [ ] Signed programming agreement(s) covering the channels and VOD actually advertised to customers
- [ ] Confirmed rights for Max/HBO, STARZ and Paramount+/SHOWTIME components included in the $75 launch promise
- [ ] Confirmed sports rights for the sports channels/events advertised at launch
- [ ] Contract terms specifying DVR, catch-up, advertising, devices, concurrency, territories and DRM requirements
- [ ] Production feed/API credentials from the selected programming suppliers
- [ ] Stripe production account, $75 recurring Price ID and webhook secret
- [ ] Production domain/TLS and hosting credentials
- [ ] DRM partner/license-server integration if required by premium suppliers
- [ ] App-store developer accounts/certification for stores used at launch
- [ ] Production streamer hardware selection and certification if the Watchable Streamer is sold at launch
- [ ] Final media/telecom counsel review of programming, privacy, advertising and consumer terms

## Definition of first commercial customer

1. Customer reaches Watchable TV signup.
2. Customer pays $75 before access begins.
3. Billing webhook marks the subscription active.
4. Sales attribution is preserved if a rep/affiliate originated the customer.
5. Customer signs in from web, mobile/PWA, supported smart TV, or Watchable Streamer.
6. Guide and catalog contain only currently licensed programming.
7. Playback requires an active subscription and valid territorial/window rights.
8. Next successful monthly payment produces the salesperson residual automatically.
9. Cancellation or failed subscription state removes entitlement according to billing policy.
