---
phase: 4
title: "Summary Page Redesign"
status: completed
priority: P2
effort: "1h"
dependencies: [3]
---

# Phase 4: Summary Page Redesign

## Overview

Redesign `summary-page.tsx` and `dialectic-diagram.tsx` to match the new black/white/yellow theme.
Hero: giant LÒNG YÊU NƯỚC keyword in yellow. Score, case study text, dialectic diagram
section all restyled. No logic changes — same REST fetch and route.

## Target Layout

```
┌────────────────────────────────────────────────┐
│                                                │
│              HERO SECTION                      │
│   (min-h-screen, flex col, center, black bg)   │
│                                                │
│   MLN111 · TRIẾT HỌC MÁC - LÊNIN             │
│   [tiny yellow label, tracking-widest]         │
│                                                │
│        LÒNG YÊU NƯỚC                          │
│   [text-game-xl font-black yellow, massive]    │
│                                                │
│   [Score badge: 40 điểm — yellow border card] │
│                                                │
│   Case study headline                          │
│   [text-game-md white bold]                    │
│                                                │
│   Body text                                    │
│   [text-game-sm muted, max-w-3xl, leading]     │
│                                                │
├────────────────────────────────────────────────┤
│                                                │
│   DIALECTIC DIAGRAM SECTION                    │
│   [bg-[#111111], py-20]                        │
│   Title: "Sơ đồ quan hệ biện chứng" [yellow]  │
│   <DialecticDiagram />                         │
│                                                │
├────────────────────────────────────────────────┤
│                                                │
│   CLOSING QUOTE SECTION                        │
│   [centered, max-w-2xl, italic white quote]    │
│   [yellow left border accent]                  │
│                                                │
└────────────────────────────────────────────────┘
```

## Related Code Files

- Modify: `client/src/views/summary-page.tsx` — full rewrite matching new tokens
- Modify: `client/src/components/dialectic-diagram.tsx` — replace hardcoded blue/brown SVG colors with black/yellow theme

## Implementation Steps

1. Update `dialectic-diagram.tsx` SVG colors to use dark surfaces, yellow borders/arrows, and readable white/muted text
2. Rewrite `summary-page.tsx`:
   - Hero: full black section, centered, KEYWORD in `text-game-xl font-black text-yellow`
   - Score badge: `border border-yellow/40 bg-yellow/5 rounded-2xl px-8 py-4`
   - Case study text: `text-game-sm text-muted` max-w-3xl
   - Diagram section: `bg-surface py-20`
   - Closing quote: `border-l-4 border-yellow pl-6 italic text-white`

## Success Criteria

- [x] Keyword displayed in `text-game-xl text-yellow font-black`
- [x] Score shows correct value fetched from `/api/state`
- [x] Dialectic diagram renders in the same black/white/yellow visual language
- [x] Closing quote visible with yellow left border
- [x] Page background is black, consistent with game panel
- [x] No TypeScript errors

## Risk Assessment

Low. `DialecticDiagram` is a standalone component; restyle only SVG presentation and preserve its public component contract.
