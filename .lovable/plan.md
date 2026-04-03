

## Problem

The `.app-root` has `justify-content: center` and the inline styles on the JSX div also have `justifyContent: 'center'`. Combined with `min-height: 100dvh`, this pushes all content to the vertical middle — on tall screens the content falls below the fold, showing only a black starfield.

## Plan

Two files, two changes each:

### 1. `src/index.css` — `.app-root` rule (line 65-71)

Remove `justify-content: center`. Replace with `justify-content: flex-start` (or simply remove it). Keep everything else.

```css
.app-root {
  min-height: 100dvh;
  position: relative;
  display: flex;
  flex-direction: column;
}
```

### 2. `src/pages/Index.tsx` — inline styles on the two wrapper divs

**`.app-root` div**: Remove `justifyContent: 'center'` from the inline style. Keep `minHeight`, `display`, `flexDirection`, `alignItems`.

```tsx
<div className="app-root" style={{minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
```

**`.page-wrap` div**: No change needed — it already has top padding `48px` and no vertical centering.

This ensures content starts from the top with 48px padding, immediately visible on page load.

