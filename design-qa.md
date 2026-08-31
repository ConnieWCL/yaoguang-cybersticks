# Design QA — homepage readability refinement

## Visual truth and implementation

- Source visual truth: `outputs/readability-audit/01-before-home.png`
- Revised desktop implementation: `outputs/readability-audit/02-after-home.png`
- Revised mobile implementation: `outputs/readability-audit/03-after-mobile.png`
- Desktop viewport/CSS size: 1280×720, device pixel ratio 2
- Mobile viewport/CSS size: 390×844, no horizontal overflow
- State: authenticated, idle, three draws remaining; representative local-only user

## Full-view comparison

The before and after desktop captures were opened together in one comparison pass. The revised screen keeps the same ink-black background, gold display title, circular fortune vessel, serif/mono typography, ornament, and narrow ritual composition. The readable content area grows from 480px to 540px, and secondary information is promoted from low-contrast microcopy to readable supporting copy.

## Focused checks

- Typography: subtitle 11→14px; vessel hint 10→13px; idle prompt 13→15px; draw count 10→13px; account name 11→14px; fortune poem 14→16px; interpretation 13→15px.
- Spacing: larger account control, 176px fortune vessel, wider 540px content column, and calmer vertical gaps.
- Colors: homepage copy now uses a three-level hierarchy—gold primary, `ink2` secondary, `ink3` tertiary. Jade and rose remain reserved for meaningful fortune/account states.
- Assets: no assets were replaced or approximated; existing ornament and icon sources remain intact.
- Copy: no additional decorative labels were introduced; existing information was consolidated into clearer hierarchy.

## Comparison history

1. P1 — supporting text was 8–11px and used very dim foreground tokens on the near-black background. This made the account entry, subtitle, action hint, remaining count, and footer difficult to read.
2. Fix — raised small text to 12–15px, increased optical weight/contrast, reduced letter spacing, enlarged the central interaction, and standardized homepage copy colors.
3. Post-fix evidence — `02-after-home.png` and `03-after-mobile.png`; desktop and 390px mobile are readable without changing the visual language or introducing overflow.

## Runtime checks

- Primary controls remain exposed with the same labels and semantics.
- No browser console errors. Existing React Router v7 future-flag development warnings are unrelated to this change.

final result: passed
