# Design QA — sound, OTP, and motion

## Evidence

- Auth visual source: `outputs/login-redesign/02-new-auth.png`
- OTP implementation: `outputs/sensory-design/01-otp-screen.png`
- Email template preview: `outputs/sensory-design/02-email-template.png`
- Homepage source: `outputs/readability-audit/02-after-home.png`
- Homepage sound control: `outputs/sensory-design/03-sound-control.png`
- Viewport: 1280×720 CSS pixels, DPR 2
- State: unauthenticated OTP preview and authenticated idle homepage with three attempts

The two source/implementation pairs were opened together in one comparison pass.

## Findings and fixes

1. P1 — existing Web Audio could remain suspended in Safari/Chrome and silently fail. Replaced it with a resumable audio pipeline, master compression, persistent sound preference, and an explicit accessible sound toggle.
2. P2 — signup confirmation had no in-product OTP state. Added a six-digit, one-time-code-compatible verification card, resend action, and return path matching the existing auth language.
3. P2 — key overlays and first-use controls appeared abruptly. Added short entrance and press transitions to the header, ornament, vessel, auth card, account control, and user space.
4. Accessibility — CSS motion is disabled by the existing reduced-motion rule; background and button canvases now also stop animating when reduced motion is preferred.

## Fidelity surfaces

- Typography: existing serif and mono families retained; OTP uses a high-legibility mono treatment.
- Spacing: OTP card follows the original auth card grid; sound control remains in the existing top utility cluster.
- Color: no new palette introduced; gold remains primary, ink colors remain supporting, jade remains semantic.
- Assets: Lucide icons are reused; no fake image assets or decorative illustrations were introduced.
- Copy: terminology stays within the existing “命册 / 入册 / 验明” product language.

## Interaction and runtime checks

- Sound toggle updates `aria-pressed`, label, icon, and persisted state in both directions.
- OTP input is numeric, six-character-limited, and exposes `autocomplete=one-time-code`.
- Login and OTP layouts render without console errors.
- Build, targeted lint, and tests pass.

## External limitation

The OTP feature remains gated by `VITE_SUPABASE_EMAIL_OTP=false` in production until custom SMTP is configured. Supabase projects created on the Free plan after 2026-06-03 cannot customize Auth email templates while using the default SMTP service.

final result: passed
