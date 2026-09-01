**Design QA — 分享签文粒子与二维码修正**

- Source visual truth: user-directed change applied to the previous rendered state at `/Users/connie/Documents/Codex/2026-08-31/1-lovable-webapp-github-vercel-lovable/work/repo/.artifacts/share-card-audit/implementation.png`
- Implementation screenshot: `/Users/connie/Documents/Codex/2026-08-31/1-lovable-webapp-github-vercel-lovable/work/repo/.artifacts/share-card-audit/final-no-rays-no-qr-frame.png`
- Combined comparison: `/Users/connie/Documents/Codex/2026-08-31/1-lovable-webapp-github-vercel-lovable/work/repo/.artifacts/share-card-audit/revised-comparison.png`
- Viewport: 1280 × 720 CSS px, density 1
- Source and implementation pixels: both 1280 px wide full-page captures; share-card preview is 420 × 672 CSS px; exported image remains 750 × 1200 px.
- State: share modal open, first fortune fixture, post-entry animation, live particle layer active.

**Findings**

- No actionable P0/P1/P2 findings remain.
- Typography: unchanged from the approved share-card direction; Chinese serif and mono URL hierarchy remain intact.
- Spacing/layout: the QR is reduced to 62 px, moved farther inward and upward, and has no surrounding outline. Its bottom edge is y=1164, safely above the single inner-frame bottom at y=1174.
- Colors/tokens: the QR yellow panel and external outline were both removed. Gold modules now sit directly on the same deep-violet field as the card.
- Image quality/assets: generated PNG remains 750 × 1200. QR quiet zone is preserved through a three-module deep-violet background rather than a contrasting yellow tile.
- Copy/content: invitation text and `cyberfortune.hiconnie.com` remain unchanged.
- Motion: the multilevel edge glow and breathing edge animation are removed. Only the entrance pop and the homepage particle model remain—particles spawn from the bottom, drift upward with sinusoidal lateral movement, fade over their lifetime, and draw no grid lines, vertical beams, or trails.

**Comparison History**

1. P2 — the previous QR tile used a yellow background and extended too close to/across the inner bottom frame. Fix: reduced QR to 62 px, moved it farther inward and upward, and removed the surrounding frame entirely.
2. P2 — the repeated outer strokes and breathing shadow produced the visible vertical rays shown in the user's screenshot. Fix: deleted the full multi-layer stroke loop and `shareCardGlow` animation; retained one low-opacity inner contour only.
3. P2 — the previous share overlay movement could read as directional vertical motion rather than the homepage's organic particles. Fix: replaced persistent particles with the homepage spawn/drift/fade model and explicitly removed all line drawing.
4. Post-fix evidence: the final capture has animation name `shareCardPop` only, a neutral black drop shadow, a full-card homepage-style particle canvas, and no console errors.

**Focused Region Evidence**

- The QR/footer region is visible in the full card at the same viewport. Coordinate verification supplements the screenshot because the footer is small at the 420 px preview width: QR outline bottom 1177 px versus inner-frame bottom 1178 px in the 750 × 1200 export coordinate system.

**Primary Interactions Tested**

- Share modal renders from the local preview route.
- 750 × 1200 PNG is generated and displayed.
- Particle canvas resolves exactly to the 420 × 672 preview bounds.
- Entrance pop remains active; breathing edge glow is removed.
- No horizontal overflow and no browser console errors.

**Implementation Checklist**

- [x] Remove all vertical/grid line drawing from share-card motion
- [x] Match homepage particle spawn/drift/fade behavior
- [x] Keep static export populated with soft particle points
- [x] Move QR completely inside inner card frame and remove its outline
- [x] Remove yellow QR background
- [x] Preserve reduced-motion fallback and static PNG export

final result: passed
