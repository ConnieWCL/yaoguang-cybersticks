# Progressive Auth Entry — Design QA

## Evidence

- Source visual truth: `/Users/connie/Documents/Codex/2026-08-31/1-lovable-webapp-github-vercel-lovable/work/repo/outputs/login-redesign/02-new-auth.png`
- Desktop implementation: `/Users/connie/Documents/Codex/2026-08-31/1-lovable-webapp-github-vercel-lovable/work/repo/outputs/onboarding-redesign/01-desktop-entry-chooser.png`
- Mobile implementation: `/Users/connie/Documents/Codex/2026-08-31/1-lovable-webapp-github-vercel-lovable/work/repo/outputs/onboarding-redesign/02-mobile-account-form.png`
- Combined comparison: `/Users/connie/Documents/Codex/2026-08-31/1-lovable-webapp-github-vercel-lovable/work/repo/outputs/onboarding-redesign/03-desktop-comparison.png`
- Desktop viewport and pixels: 1280 × 720 CSS px / 1280 × 720 image px.
- Mobile viewport and pixels: 390 × 844 CSS px / 390 × 844 image px.
- Density normalization: desktop source and implementation are both 1280 × 720 and were compared at native size.
- State: unauthenticated visitor; chooser open after clicking the fortune vessel; mobile account form open after choosing username/password.

## Findings

- No actionable P0/P1/P2 differences remain.
- Fonts and typography: existing Noto Serif SC and Share Tech Mono hierarchy, weights, letter spacing, and muted helper-copy treatment are preserved.
- Spacing and layout rhythm: the 460 px desktop card, seal overlap, internal rhythm, and mobile bottom-sheet treatment align with the existing auth language. No clipped controls or horizontal overflow was observed.
- Colors and visual tokens: gold, jade, purple-black surfaces, translucent borders, glow, and backdrop blur reuse the current site tokens and retain clear state distinction.
- Image and asset fidelity: no new raster or decorative assets were needed. Existing icon-library glyphs are used consistently; no placeholder imagery was introduced.
- Copy and content: the chooser clearly explains cross-device account storage versus browser-local guest storage and promises automatic continuation after selection.

## Full-view Comparison

The combined desktop evidence preserves the source card proportion, border treatment, seal motif, subdued backdrop, typography hierarchy, and restrained gold/jade accents. The new three-way chooser changes information architecture intentionally while remaining within the established visual system.

## Focused Region Comparison

The mobile account-form screenshot checks inputs, tabs, benefits, button hierarchy, guest fallback, close/back controls, and small-copy wrapping. A separate crop was unnecessary because these controls remain legible at native 390 px width.

## Interaction Verification

- A new visitor sees the full drawing page before authentication.
- Clicking the vessel opens the three-option chooser.
- Closing the chooser returns to the unchanged drawing page.
- Username/password and email-code choices open the existing forms.
- Choosing guest mode closes the chooser and automatically completes the pending draw.
- The top account ribbon opens the chooser while unauthenticated.
- Returning from the guest account space opens the same chooser.
- Existing authenticated or guest sessions bypass the chooser.
- Browser console error check: no errors observed.
- Production build: passed.
- Automated tests: passed.
- Repository-wide lint is still blocked by three pre-existing template-rule errors outside the changed files (`ui/command.tsx`, `ui/textarea.tsx`, and `tailwind.config.ts`).

## Comparison History

- Initial interaction pass found that “返回账号登录” exited guest mode but no longer opened an auth surface after removal of the full-page gate. Fix: it now exits guest mode, closes user space, and opens the shared chooser.
- Initial state pass found that a cancelled pending draw could resume after a later account-only login. Fix: cancelling clears the pending draw intent; successful login or guest selection resumes only the original draw.
- Post-fix desktop and mobile evidence show no remaining P0/P1/P2 issues.

## Follow-up Polish

- P3: consider adding a strict keyboard focus trap inside the modal in a future accessibility pass.

final result: passed
