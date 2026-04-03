# 爻光 · 赛博签 — UI 重设计文件

## 文件清单

```
src/
├── App.tsx                    ← 替换根组件
├── index.css                  ← 替换全局样式（完整重写）
├── pages/
│   └── Index.tsx              ← 替换主页（完整重写）
├── components/
│   ├── InkCanvas.tsx          ← 新增：粒子背景画布
│   └── LuckBar.tsx            ← 新增：运势动态进度条
├── hooks/
│   └── useSound.ts            ← 新增：Web Audio 声效钩子
└── data/
    └── fortunes.ts            ← 新增：卦象数据库（8卦，可扩展至64卦）
```

## 如何集成进你的 Lovable 项目

1. **直接替换** `src/index.css` 和 `src/pages/Index.tsx`
2. **新建** `src/components/InkCanvas.tsx`、`LuckBar.tsx`
3. **新建** `src/hooks/useSound.ts`
4. **新建** `src/data/fortunes.ts`
5. 确保 `src/App.tsx` 只导入 `Index` 并挂载 `index.css`

## 设计说明

### 视觉层次
- **三层配色**：金（尊贵/大吉）→ 翠（和顺/平）→ 玫（感情）+ 冷靛（谨慎）
- **字体**：ZCOOL XiaoWei（标题/仙气）+ Noto Serif SC（正文/典雅）+ Share Tech Mono（数据/赛博）
- **深空黑底** (#07060f) 营造虚空感，粒子飘动模拟香烟袅袅

### 移动端
- `max-width: 480px` 单列，`100dvh` 支持现代刘海屏
- `env(safe-area-inset-bottom)` 适配 iPhone 底部安全区
- `clamp()` 字号响应式，320px~480px 无断层
- `@media (prefers-reduced-motion)` 无障碍支持

### 交互动效
- **摇签**：CSS keyframe 杯体振动 + Web Audio 沙沙声
- **签出现**：translateY spring 动效 + 金属敲击 C-E-G 和弦
- **卡片入场**：错位 stagger reveal（诗句逐行浮现）
- **进度条**：1.4s spring 曲线填充
- **分享**：native share sheet / clipboard fallback

## 扩展卦象
在 `src/data/fortunes.ts` 的 `FORTUNES` 数组中继续添加对象，
字段格式参照现有 8 条，`id` 对应易经卦序（1-64）。
