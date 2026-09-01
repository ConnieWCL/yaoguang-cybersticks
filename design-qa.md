**Design QA — 分享签文粒子与二维码修正**

- Source visual truth: user-directed change applied to the previous rendered state at `/Users/connie/Documents/Codex/2026-08-31/1-lovable-webapp-github-vercel-lovable/work/repo/.artifacts/share-card-audit/implementation.png`
- Implementation screenshot: `/Users/connie/Documents/Codex/2026-08-31/1-lovable-webapp-github-vercel-lovable/work/repo/.artifacts/share-card-audit/revised-no-lines.png`
- Combined comparison: `/Users/connie/Documents/Codex/2026-08-31/1-lovable-webapp-github-vercel-lovable/work/repo/.artifacts/share-card-audit/revised-comparison.png`
- Viewport: 1280 × 720 CSS px, density 1
- Source and implementation pixels: both 1280 px wide full-page captures; share-card preview is 420 × 672 CSS px; exported image remains 750 × 1200 px.
- State: share modal open, first fortune fixture, post-entry animation, live particle layer active.

**Findings**

- No actionable P0/P1/P2 findings remain.
- Typography: unchanged from the approved share-card direction; Chinese serif and mono URL hierarchy remain intact.
- Spacing/layout: QR image and its subtle outline now end at y=1177, inside the card's inner frame bottom at y=1178. It no longer crosses or visually interrupts the inner border.
- Colors/tokens: the QR yellow panel was removed. Gold modules now sit on the same deep-violet field as the card, with a low-opacity grade-color outline.
- Image quality/assets: generated PNG remains 750 × 1200. QR quiet zone is preserved through a three-module deep-violet background rather than a contrasting yellow tile.
- Copy/content: invitation text and `cyberfortune.hiconnie.com` remain unchanged.
- Motion: the preview now uses the homepage particle model—particles spawn from the bottom, drift upward with sinusoidal lateral movement, fade over their lifetime, and draw no grid lines, vertical beams, or trails.

**Comparison History**

1. P2 — the previous QR tile used a yellow background and extended too close to/across the inner bottom frame. Fix: reduced QR from 78 to 68 px, moved it inward and upward, removed the fill and glow, and kept only a subtle internal outline.
2. P2 — the previous share overlay movement could read as directional vertical motion rather than the homepage's organic particles. Fix: replaced persistent particles with the homepage spawn/drift/fade model and explicitly removed all line drawing.
3. Post-fix comparison: the revised capture shows the QR contained within the footer and the yellow panel removed; the particle canvas covers the entire 420 × 672 card and reports no console errors.

**Focused Region Evidence**

- The QR/footer region is visible in the full card at the same viewport. Coordinate verification supplements the screenshot because the footer is small at the 420 px preview width: QR outline bottom 1177 px versus inner-frame bottom 1178 px in the 750 × 1200 export coordinate system.

**Primary Interactions Tested**

- Share modal renders from the local preview route.
- 750 × 1200 PNG is generated and displayed.
- Particle canvas resolves exactly to the 420 × 672 preview bounds.
- Pop and breathing-glow animations remain active.
- No horizontal overflow and no browser console errors.

**Implementation Checklist**

- [x] Remove all vertical/grid line drawing from share-card motion
- [x] Match homepage particle spawn/drift/fade behavior
- [x] Keep static export populated with soft particle points
- [x] Move QR completely inside inner card frame
- [x] Remove yellow QR background
- [x] Preserve reduced-motion fallback and static PNG export

final result: passed
