**Design QA — 分享签文动态预览 / 静态导出**

- Source visual truth: `/Users/connie/.codex/generated_images/01a05388-7c01-7d00-9aa8-f1d0f4135f5d/exec-83b9915f-8403-4de2-9803-dc11f8d0efcc.png`
- Implementation screenshot: `/Users/connie/Documents/Codex/2026-08-31/1-lovable-webapp-github-vercel-lovable/work/repo/.artifacts/share-card-audit/implementation.png`
- Focused implementation screenshot: `/Users/connie/Documents/Codex/2026-08-31/1-lovable-webapp-github-vercel-lovable/work/repo/.artifacts/share-card-audit/implementation-card.png`
- Combined comparison: `/Users/connie/Documents/Codex/2026-08-31/1-lovable-webapp-github-vercel-lovable/work/repo/.artifacts/share-card-audit/comparison.png`
- Viewport: 1280 × 720 CSS px; device screenshot output 1280 px wide (density 1)
- Source pixels: 992 × 1586; implementation export: 750 × 1200; rendered preview: 420 × 672 CSS px
- Normalization: both portrait cards were fit proportionally into equal-width columns in the combined comparison; no density-based mismatch was filed.
- State: share modal open, first fortune fixture, post-entry animation state, floating-particle layer active.

**Findings**

- No actionable P0/P1/P2 findings remain.
- Typography: the implementation preserves the product's existing Chinese serif + mono hierarchy. Display title, divination label, body copy, metrics, URL and CTA remain distinguishable at the rendered preview size.
- Spacing/layout: the portrait ratio, central fortune hierarchy and bottom invitation signature match the selected direction. The QR code is anchored in the footer rather than floating over the main reading.
- Colors/tokens: the card now uses the fortune grade color for its layered border glow, background light field, particles and QR frame. The background is deep violet-black instead of flat black.
- Image quality/assets: export remains a native 750 × 1200 PNG. The QR uses dark modules on a muted-gold quiet zone for scanning reliability while still matching the card palette. No placeholder or approximate third-party assets were introduced.
- Copy/content: the invitation and `cyberfortune.hiconnie.com` URL are retained in the footer; the share controls use the current custom domain.
- Motion: the preview uses a spring-like pop entrance, a 3.2-second breathing glow, and continuously drifting grade-color particles. `prefers-reduced-motion` disables these effects.

**Comparison History**

1. Initial comparison found the QR treatment visually integrated but too low-contrast for dependable scanning (P2). Fix: changed to deep-plum modules on a muted-gold quiet zone, kept the grade-color glow frame, and increased the QR quiet zone to three modules.
2. Post-fix evidence: implementation screenshot and focused crop above; QR remains part of the footer signature, while the foreground/background relationship now follows conventional high-contrast QR polarity. No remaining P0/P1/P2 mismatch was found.

**Focused Region Evidence**

- Focused crop covers the entire animated preview because the full card is only 420 × 672 CSS px; separate sub-crops would reduce legibility rather than improve comparison.

**Primary Interactions Tested**

- Share modal renders from the local preview route.
- 750 × 1200 PNG source is generated and displayed.
- Pop and glow animations are attached; particle canvas resolves to the full card bounds.
- Save/share and copy-link controls render and remain enabled.
- Console checked: no application errors; only existing React Router future-version warnings.

**Residual Test Gap / Follow-up Polish**

- The in-app browser kept its 1280 × 720 viewport when a temporary mobile override was requested, so this pass relies on the existing `min(calc(100vw - 32px), 420px)` responsive sizing for narrow screens. This is a P3 verification gap, not an observed defect.

**Implementation Checklist**

- [x] Grade-color glow border and violet-black particle background
- [x] Pop entrance and breathing edge animation
- [x] Reduced-motion fallback
- [x] Footer invitation signature with current custom domain
- [x] High-contrast, integrated QR treatment
- [x] Static PNG export preserved

final result: passed
