# Design QA — authenticated fortune flow

## Sources compared

- Current production entry: `outputs/login-redesign/01-current-home.png`
- Existing product language at 1280×720: `outputs/login-redesign/03-reference-1280.png`
- New mandatory auth gate: `outputs/login-redesign/02-new-auth.png`
- New user space: `outputs/login-redesign/04-user-space.png`

## Verification state

- Viewport: 1280×720 desktop
- State: unauthenticated auth gate; authenticated user-space preview with representative data
- Full-view comparison: completed in the same inspection pass
- Interaction checks: login/register tab switch, account entry, user-space dialog semantics, archive entry, profile controls

## Findings and fixes

- P1: Native file-upload control escaped the visual system in the profile card. Fixed by keeping the semantic label and fully hiding the native file input.
- No remaining P0/P1/P2 visual regressions were found.
- Auth and user-space screens retain the product’s ink-black, muted-gold, jade, serif, ornament, spacing, and narrow-column language.
- Login is now the only route into the product; user-space and archive access are presented as part of the same ritual rather than an injected utility button.

## Evidence limits

- Visual QA uses a local-only representative user for the authenticated screen; production authentication and storage policies are separately verified by build/database checks.
- A real email-confirmation round trip requires an end-user inbox and is not simulated.

final result: passed
