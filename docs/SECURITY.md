# Watchable TV Security Baseline

- Passwords are hashed with scrypt and unique random salts.
- Browser sessions use HttpOnly SameSite cookies.
- Playback sessions are short-lived and separately signed.
- Production mode fails startup when billing/secrets are not configured.
- Supplier sources fail closed unless rights are explicitly verified.
- Stripe webhook signatures are HMAC verified with a five-minute tolerance.
- Audit events are recorded for registration, login, billing activation, playback and DVR actions.
- Premium DRM is treated as a supplier-driven production requirement. Widevine/FairPlay/PlayReady license-server integration must be completed according to the actual rights contract; Watchable does not implement fake DRM.
- Never store raw card numbers in Watchable. Stripe-hosted Checkout is the default production payment boundary.
