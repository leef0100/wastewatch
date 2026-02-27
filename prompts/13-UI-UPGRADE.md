# 13-UI-UPGRADE.md — WasteWatch Site-Wide Visual Upgrade

> **Complete UI overhaul for WasteWatch: From generic AI-generated to refined institutional authority.**
>
> Next.js 16.1.6 (App Router) | React 19.2.3 | TypeScript strict | Tailwind CSS 4 | shadcn/ui | Recharts 3.7.0 | D3 7.9.0 | Framer Motion (add if not present)

This prompt transforms WasteWatch from a generic, template-looking application into a polished, authoritative, government-grade platform that feels custom-built — not AI-generated. The visual direction is **"Sentinel V2: Refined Depth"** — institutional authority with modern micro-interactions, layered depth, subtle animation, and data-first hierarchy.

---

## DESIGN PHILOSOPHY — "SENTINEL V2: REFINED DEPTH"

**Core Principles:**
1. **Institutional authority first** — Navy gradients, sharp hierarchy, serif headings, trust signals
2. **Depth through layering** — Subtle shadows, border treatments, background gradients (not flat)
3. **Micro-interactions everywhere** — Hover states, entrance animations, progress indicators, transitions
4. **Data is the hero** — Monospace numbers, sparklines, progress bars, color-coded severity
5. **Zero generic patterns** — No default shadcn gray, no unthemed components, no raw Tailwind defaults

**Visual References:** Bloomberg Terminal meets gov.uk meets Vercel's polish level. Think: if the U.S. Treasury Department hired a top-tier design agency.

**What makes it NOT look AI-generated:**
- Gradient navy hero (not flat solid color)
- Subtle grid overlay patterns on dark sections
- Frosted glass panels with backdrop-filter
- Animated progress bars in metric cards
- Hover-triggered accent borders that draw in from the left
- Table rows that subtly shift on hover
- Staggered fade-up entrance animations
- Live indicator dots with pulse animations
- Custom compliance badge cards (not just text)
- Layered box shadows (not single shadow or none)
- Rounded dashboard container with depth
- Section labels with decorative line prefix

---

## STEP 1: DESIGN TOKEN OVERHAUL

### 1.1 Updated Color System

**Replace the current color tokens in `globals.css` with the Sentinel V2 palette.**

The current palette is too muted and generic. The new palette adds depth through gradient-capable navy tones, a true accent blue, and better-differentiated severity colors.

**Light Mode:**
```css
--background: #f4f5f7;          /* Warm gray — NOT pure white, not cold gray */
--foreground: #0c1222;          /* Near-black with blue undertone */
--card: #ffffff;
--card-foreground: #0c1222;
--primary: #0a1f38;             /* Deep navy — authoritative, not generic blue */
--primary-mid: #122d4d;         /* For gradients */
--primary-light: #1a3f6b;       /* For gradient endpoints */
--primary-foreground: #ffffff;
--secondary: #f0f2f6;           /* Cool light gray for stripes/alternating */
--secondary-foreground: #364152;
--muted: #f0f2f6;
--muted-foreground: #637083;    /* NOT #a1a1aa (too light) — must be readable */
--accent: #1d6ce0;              /* True blue accent — interactive, not navy */
--accent-light: #e8f0fe;        /* Accent background for badges/tags */
--accent-foreground: #ffffff;
--destructive: #c4161c;         /* Government red — deeper than default */
--destructive-foreground: #ffffff;
--border: #d2d7e0;              /* Slightly blue-tinted gray, not warm gray */
--border-light: #e8ebf0;        /* For inner borders, table rows */
--input: #d2d7e0;
--ring: #1d6ce0;                /* Focus ring = accent, not primary */

/* Severity system — MUST be distinct and purposeful */
--severity-critical: #c4161c;
--severity-critical-bg: #fef2f2;
--severity-warning: #b47a0a;    /* Dark gold — NOT bright yellow */
--severity-warning-bg: #fefce8;
--severity-info: #1d6ce0;
--severity-info-bg: #e8f0fe;
--severity-success: #0a7b3e;
--severity-success-bg: #ecfdf5;

/* Chart colors — sequential, not random */
--chart-1: #1d6ce0;
--chart-2: #c4161c;
--chart-3: #0a7b3e;
--chart-4: #b47a0a;
--chart-5: #7c3aed;

/* Sidebar — gradient-capable */
--sidebar: #0a1f38;
--sidebar-foreground: rgba(255,255,255,0.7);
--sidebar-primary: #1d6ce0;
--sidebar-accent: #122d4d;
--sidebar-border: rgba(255,255,255,0.06);
```

**Dark Mode:**
```css
--background: #0b1120;
--foreground: #e2e8f0;
--card: #111827;
--primary: #1d6ce0;
--primary-foreground: #ffffff;
--accent: #3b82f6;
--accent-light: rgba(59,130,246,0.1);
--border: #1e293b;
--border-light: #1a2332;
--muted-foreground: #94a3b8;
--sidebar: #070d1a;
```

**Action items:**
- [ ] Update all CSS variables in `globals.css`
- [ ] Verify WCAG AA contrast for every foreground/background pair (4.5:1 body, 3:1 large text)
- [ ] Remove any hardcoded hex colors in components — all must reference CSS variables
- [ ] Add `--primary-mid` and `--primary-light` for gradient support
- [ ] Add `--border-light` for inner/subtle borders
- [ ] Add `--accent-light` for badge/tag backgrounds

### 1.2 Typography Refinement

**Keep the existing font stack** (Merriweather + Source Sans 3 + JetBrains Mono) — it's strong. But enforce consistent usage:

```
HEADINGS (h1-h3):   font-heading (Merriweather) — ALWAYS serif for authority
SUBHEADINGS (h4-h6): font-sans (Source Sans 3) weight 600-700
BODY TEXT:           font-sans (Source Sans 3) weight 400-500
DATA/NUMBERS:        font-data (JetBrains Mono) — ALL monetary values, counts, scores, percentages
LABELS:              font-sans weight 600, uppercase, letter-spacing 1-1.5px, font-size 10-11px
UI ELEMENTS:         font-sans weight 500-600, font-size 13-14px
```

**Action items:**
- [ ] Audit every heading — ensure h1-h3 use `font-heading` (serif), not sans-serif
- [ ] Audit every number display — ensure monetary values, counts, scores use `font-data` (mono)
- [ ] Audit every label — ensure section labels are uppercase, 10-11px, letter-spacing 1-1.5px
- [ ] Ensure consistent font sizes: body 14-15px, small labels 10-11px, headings 26-44px
- [ ] Remove any inline font overrides that break the hierarchy

### 1.3 Shadow System

**Replace flat borders with layered shadows for depth.** The current UI relies too heavily on borders alone.

```css
/* Add to Tailwind config or CSS utilities */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
--shadow-md: 0 1px 3px rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.05);
--shadow-lg: 0 1px 3px rgba(0,0,0,0.03), 0 8px 40px rgba(0,0,0,0.07);
--shadow-navy: 0 2px 6px rgba(10,31,56,0.25);
--shadow-accent: 0 1px 2px rgba(29,108,224,0.3), 0 0 0 0 rgba(29,108,224,0.2);
--shadow-hover: 0 4px 12px rgba(10,31,56,0.15);
```

**Action items:**
- [ ] Add shadow system to CSS/Tailwind config
- [ ] Apply `shadow-md` to all Card components (not just border)
- [ ] Apply `shadow-lg` on hover for interactive cards
- [ ] Apply `shadow-navy` to the logo mark and primary buttons
- [ ] Apply `shadow-accent` to accent/CTA buttons
- [ ] Header: add `shadow-sm` (subtle bottom shadow, not just border)

### 1.4 Border Radius System

**Keep the current radius scale but enforce consistency:**
```
Buttons, inputs, tags: 6px (rounded-md)
Cards, panels:         12px (rounded-xl)
Badges, pills:         4px (rounded) OR 999px (full pill)
Logo mark:             6-8px
Dashboard container:   12px
Modals:                16px
```

**Action items:**
- [ ] Audit all components for radius consistency
- [ ] Cards should NEVER be `rounded-sm` or `rounded` — always `rounded-xl` (12px)
- [ ] Buttons should be `rounded-md` (6px), not `rounded-lg` or `rounded-full`

---

## STEP 2: GLOBAL ANIMATION SYSTEM

### 2.1 Install & Configure Framer Motion

If not already present, install Framer Motion for React-native animations:

```bash
npm install framer-motion
```

### 2.2 Core Animation Utilities

**Create `src/lib/animations.ts`:**

```typescript
// Entrance animation variants
export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }
  })
}

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.4, delay, ease: 'easeOut' }
  })
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (delay: number = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }
  })
}

export const slideInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: (delay: number = 0) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }
  })
}

// Stagger container
export const staggerContainer = (staggerDelay: number = 0.08) => ({
  hidden: {},
  visible: { transition: { staggerChildren: staggerDelay } }
})

// Number counter animation (for stat cards)
export const counterAnimation = {
  duration: 1000,
  ease: [0.16, 1, 0.3, 1] as const
}

// Bar grow (for progress bars and chart bars)
export const barGrow = {
  hidden: { scaleX: 0 },
  visible: (delay: number = 0) => ({
    scaleX: 1,
    transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }
  })
}

// Hover variants
export const cardHover = {
  rest: { boxShadow: 'var(--shadow-md)', y: 0 },
  hover: {
    boxShadow: 'var(--shadow-lg)',
    y: -2,
    transition: { duration: 0.2 }
  }
}

export const rowHover = {
  rest: { x: 0, backgroundColor: 'transparent' },
  hover: {
    x: 2,
    backgroundColor: 'var(--accent-light)',
    transition: { duration: 0.15 }
  }
}
```

### 2.3 AnimatedSection Wrapper Component

**Create `src/components/ui/animated-section.tsx`:**

A reusable wrapper that triggers fade-up animation when the element enters the viewport using Framer Motion's `useInView`.

```typescript
'use client'
import { motion, useInView } from 'framer-motion'
import { useRef, type ReactNode } from 'react'
import { fadeUp, staggerContainer } from '@/lib/animations'

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  delay?: number
  stagger?: boolean
  staggerDelay?: number
}

export function AnimatedSection({
  children, className, delay = 0, stagger = false, staggerDelay = 0.08
}: AnimatedSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  if (stagger) {
    return (
      <motion.div
        ref={ref}
        className={className}
        variants={staggerContainer(staggerDelay)}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {children}
    </motion.div>
  )
}
```

### 2.4 Animation Rules

**Where to animate:**
- Page sections on scroll entry (fade-up, staggered)
- Stat card values (counter animation on mount)
- Progress bars / metric bars (grow from left on mount)
- Table rows (subtle slide-right on hover)
- Cards (lift + shadow on hover)
- Buttons (translateY(-1px) + shadow increase on hover)
- Badges/tags (fade-in on mount)
- Navigation active indicator (width animation)
- Sidebar items (subtle background transition on hover)
- Charts (bars grow from bottom, lines draw in)

**Where NOT to animate:**
- Do NOT animate text color changes (jarring)
- Do NOT use bounce easing (unprofessional for government platform)
- Do NOT animate more than 300ms for hover states (feels sluggish)
- Do NOT add loading skeleton animations to elements that load instantly
- Do NOT use spring physics for entrance animations (use cubic-bezier)
- Do NOT animate layout shifts (CLS penalty)

**Timing guidelines:**
- Hover transitions: 150-200ms
- Entrance animations: 400-600ms
- Stagger delay between items: 60-100ms
- Counter/number animations: 800-1200ms
- Progress bar fill: 600-1000ms
- Page transition: 300ms

---

## STEP 3: COMPONENT-BY-COMPONENT UPGRADE

### 3.1 Header Component (`src/components/layout/Header.tsx`)

**Current issues:** Flat, no depth, generic border, no interaction feedback.

**Upgrades:**
- [ ] Add `shadow-sm` beneath header (replace plain border-bottom with `border-bottom + box-shadow`)
- [ ] Logo mark: add `rounded-md` (6px), gradient background (`linear-gradient(135deg, var(--primary), var(--primary-light))`), and `shadow-navy`
- [ ] Logo mark hover: `scale(1.05)` transform with shadow increase
- [ ] Navigation links: replace border-bottom active state with pill-style active (`background: var(--accent-light); color: var(--accent); border-radius: 6px; padding: 6px 14px;`)
- [ ] Active nav item: add animated underline indicator below the header bar (small 20px line, accent colored, `border-draw` animation)
- [ ] Nav link hover: add `background: var(--secondary)` with 150ms transition
- [ ] Search input: add subtle focus ring animation (`ring-2 ring-accent/30` on focus)
- [ ] Notification bell: add pulse animation when there are unread flags (CSS `animation: pulse 2s ease-in-out infinite`)
- [ ] User avatar: add `ring-2 ring-accent/10` border, hover to `ring-accent/30`
- [ ] Sticky header should have `backdrop-filter: blur(12px)` with semi-transparent background for scroll-through effect

### 3.2 Sidebar Component (`src/components/layout/Sidebar.tsx`)

**Current issues:** Flat solid background, basic hover states, no visual hierarchy.

**Upgrades:**
- [ ] Background: replace solid `--sidebar` with `linear-gradient(180deg, var(--primary), #061424)` — adds depth
- [ ] Active item: replace solid background with `linear-gradient(90deg, rgba(29,108,224,0.15), transparent)` and left border color `var(--accent)` instead of gold
- [ ] Active item icon: add subtle glow (`filter: drop-shadow(0 0 4px var(--accent))`)
- [ ] Hover state: `background: rgba(255,255,255,0.03)` — barely visible but responsive
- [ ] Section dividers: `border-color: rgba(255,255,255,0.06)` not solid white/gray
- [ ] Red flag count badge: add pulse animation, use `border-radius: 10px` (pill shape), `min-width: 20px` centered
- [ ] Collapse/expand: ensure smooth 300ms transition on width AND content opacity
- [ ] Logo icon: if using gold, keep it — but add subtle glow on hover

### 3.3 Stat Cards (`src/components/dashboard/StatCard.tsx`)

**Current issues:** Flat, no interaction, numbers appear static.

**Upgrades:**
- [ ] Add `shadow-md` to card, `shadow-lg` on hover with `translateY(-2px)` lift
- [ ] Add animated progress bar beneath each stat: 3px height, colored by stat type, fills from left on mount (0.8s ease-out)
- [ ] Hover: add accent top-border that draws in from left (`transform: scaleX(0) → scaleX(1)` on hover, `transform-origin: left`, 300ms)
- [ ] Number display: animate counting up from 0 on mount (use `useSpring` or custom counter hook, 1000ms duration)
- [ ] Trend indicator: add colored background pill (`padding: 2px 6px; border-radius: 3px; background: severity-color/10`)
- [ ] Add sparkline mini-chart to each card (7-9 tiny bars showing recent trend, rightmost bar full opacity, others faded)
- [ ] Card background on hover: subtle `var(--secondary)` background transition

### 3.4 Data Tables (TopVendorsTable, Flag lists, etc.)

**Current issues:** Generic table styling, no interaction, visually flat.

**Upgrades:**
- [ ] Header row: `background: var(--secondary); font-size: 10px; font-weight: 600-700; text-transform: uppercase; letter-spacing: 0.8px;`
- [ ] Data rows: hover state slides row 2px right (`translateX(2px)`) with `var(--accent-light)` background (150ms)
- [ ] Alternating rows: use `var(--secondary)` for odd rows, white for even
- [ ] Vendor names: add colored dot indicator (8px circle) before name, colored by severity
- [ ] OR add vendor initials in colored circle avatar (28px, rounded-md, severity-colored background)
- [ ] Risk scores: replace text badges with visual risk bars (48px wide, 6px height, colored fill proportional to risk)
- [ ] Severity badges: add `border: 1px solid severity-color/10` for depth (not just background color)
- [ ] Flag count dots: replace text with visual dots (7px circles, colored by severity)
- [ ] Add "Showing X of Y" metadata text in table header bar
- [ ] Add Export/Filter action buttons in table header bar
- [ ] Money values: MUST use `font-data` (JetBrains Mono) for tabular alignment

### 3.5 Charts (Recharts Components)

**Current issues:** Default Recharts styling, no custom theming, tooltips generic.

**Upgrades:**
- [ ] All chart containers: add `rounded-xl shadow-md` wrapper with proper padding
- [ ] Tooltip: custom styled — `background: var(--card); border: 1px solid var(--border); border-radius: 8px; box-shadow: var(--shadow-md); padding: 12px 16px;`
- [ ] Tooltip values: use `font-data` for numbers
- [ ] Grid lines: `stroke: var(--border-light)` (subtle, not prominent)
- [ ] Axis labels: `fill: var(--muted-foreground); font-size: 11px; font-family: var(--font-sans);`
- [ ] Bar charts: add `radius={[4, 4, 0, 0]}` for rounded top corners
- [ ] Bar chart hover: increase opacity/brightness of hovered bar
- [ ] Line charts: `strokeWidth: 2`, area fill with gradient (`opacity: 0.15 → 0`)
- [ ] Anomaly dots: `r={5}` with `stroke: var(--destructive); fill: var(--destructive); filter: drop-shadow(0 0 4px var(--destructive))`
- [ ] Chart animations: enable Recharts `isAnimationActive` with custom 800ms duration
- [ ] Legend: custom styled, not default — use small colored dots + labels
- [ ] Benford's Law chart: show expected vs. observed with distinct visual treatment (solid fill vs. dashed outline)

### 3.6 Cards & Panels (General)

**Current issues:** All cards look the same, no visual hierarchy.

**Upgrades:**
- [ ] Primary cards (stats, key metrics): `shadow-md`, `rounded-xl`, border
- [ ] Secondary cards (feature cards, how-it-works): `shadow-sm`, `rounded-xl`, border, hover lifts to `shadow-lg`
- [ ] Alert/flag cards: add left colored border (3px, severity-colored) — removes generic feel
- [ ] Investigation cards: add subtle gradient background on the left edge
- [ ] Empty state cards: add dashed border instead of solid
- [ ] Loading state: skeleton with subtle shimmer animation (gradient sweep left-to-right)

### 3.7 Buttons

**Current issues:** Flat, no depth, no hover polish.

**Upgrades:**
- [ ] Primary button: add `linear-gradient(180deg, var(--primary-mid), var(--primary))` background with `box-shadow: 0 1px 3px rgba(10,31,56,0.3), inset 0 1px 0 rgba(255,255,255,0.06)` — adds glass-like depth
- [ ] Primary hover: `translateY(-1px)` + increased shadow
- [ ] Accent/CTA button: `background: var(--accent)` with `box-shadow: var(--shadow-accent)`
- [ ] Accent hover: deeper blue + shadow glow increase
- [ ] Outline button: `border: 1px solid var(--border); shadow-sm;` → hover: `border-color: var(--accent); color: var(--accent); background: var(--accent-light);`
- [ ] Ghost button on dark backgrounds: `background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);` → hover: `background: rgba(255,255,255,0.1);`
- [ ] All buttons: add `overflow: hidden; position: relative;` with `::after` pseudo-element for subtle top gradient overlay
- [ ] Disabled: `opacity: 0.5; cursor: not-allowed; pointer-events: none;`

### 3.8 Badges & Tags

**Current issues:** Default shadcn badges, no severity distinction.

**Upgrades:**
- [ ] Severity badges: add `border: 1px solid color/10` for extra depth
- [ ] Tag labels: `text-transform: uppercase; letter-spacing: 0.5px; font-size: 10px; font-weight: 700;`
- [ ] Status pills (Live, Active): add pulsing dot (6px circle, `animation: pulse 2s ease-in-out infinite`)
- [ ] Count badges (flag counts, notifications): pill shape (`border-radius: 10px`), min-width 20px for centering
- [ ] Feature tags: `border-radius: 4px; padding: 3px 10px;` with color-coded background

### 3.9 Forms & Inputs

**Current issues:** Default input styling, no focus feedback.

**Upgrades:**
- [ ] Focus state: `ring-2 ring-accent/30 border-accent` with 200ms transition
- [ ] Input padding: ensure consistent `px-3 py-2` (not too tight)
- [ ] Labels: `font-size: 13px; font-weight: 600; color: var(--ink-soft);`
- [ ] Helper text: `font-size: 12px; color: var(--muted-foreground);`
- [ ] Error state: `border-destructive ring-destructive/20` with error message in `text-destructive font-size: 12px`
- [ ] Select dropdowns: custom styled with chevron, not browser default
- [ ] Search input: add magnifying glass icon inside with `text-muted-foreground`

---

## STEP 4: PAGE-SPECIFIC UPGRADES

### 4.1 Landing Page (`src/app/page.tsx`)

**This is the most impactful page to upgrade. It's the first impression.**

- [ ] **Official banner:** keep the navy bar, add system status indicator on the right (green dot + "System operational")
- [ ] **Hero section:** replace flat solid navy with `linear-gradient(175deg, var(--primary) 0%, #071526 65%, #0d2240 100%)`
- [ ] **Hero grid overlay:** add subtle CSS grid pattern `background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 40px 40px;`
- [ ] **Hero accent glow:** add radial-gradient pseudo-element (`rgba(29,108,224,0.08)`) behind hero content, top-right area
- [ ] **Hero tag:** styled as frosted pill with dot indicator, not plain text
- [ ] **Hero headings:** staggered fade-up animation (0.08s delay between elements)
- [ ] **Hero stats panel:** frosted glass card on the right side (`backdrop-filter: blur(10px); background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px;`) with "Live Platform Metrics" header and trend indicators
- [ ] **Case study section:** use larger typography for stat numbers (48px+, mono font), colored by severity
- [ ] **Pricing CTA:** gradient navy background matching hero, not flat
- [ ] **Compliance badges:** upgrade from plain text to interactive cards with icons in colored squares, border, hover lift
- [ ] **How it works:** add connecting dashed line between steps, step numbers in large colored squares (64px), hover lifts entire card
- [ ] **All sections:** add `AnimatedSection` wrapper for scroll-triggered entrance

### 4.2 Dashboard (`src/app/dashboard/page.tsx`)

- [ ] **Page title area:** add section label (`PLATFORM PREVIEW` style, uppercase, accent colored, with decorative left line)
- [ ] **Stat cards grid:** stagger entrance animation (0.1s between cards)
- [ ] **Stat cards:** implement ALL upgrades from 3.3 (progress bars, sparklines, counters, hover borders)
- [ ] **Tab bar:** active tab has `font-weight: 700; color: var(--accent); border-bottom: 2px solid var(--accent);`
- [ ] **Tab badge (flag count):** red pill badge with count
- [ ] **Charts:** implement ALL upgrades from 3.5
- [ ] **Vendor table:** implement ALL upgrades from 3.4
- [ ] **Live indicator:** add "Updated X min ago" with green dot in breadcrumb area

### 4.3 Flags Page (`src/app/dashboard/flags/`)

- [ ] Flag list items: add left severity border (3px colored)
- [ ] Severity filter pills: active state with filled background + border
- [ ] Flag detail view: evidence section with timeline visualization
- [ ] Triage actions: clear CTA buttons with severity-appropriate styling

### 4.4 Vendors Page (`src/app/dashboard/vendors/`)

- [ ] Vendor cards: initials avatar (colored by risk), risk bar visualization
- [ ] Vendor detail: historical spending chart with anomaly highlights
- [ ] Risk score: large visual display with circular progress or bar

### 4.5 Reports Page (`src/app/dashboard/reports/`)

- [ ] Report list: card layout with status badges, date, type
- [ ] Export buttons: clear primary/secondary hierarchy
- [ ] Report preview: styled document preview card

### 4.6 Investigations Page (`src/app/dashboard/investigations/`)

- [ ] Investigation cards: status timeline, evidence count badges
- [ ] Entity network graph: styled nodes/edges with severity coloring
- [ ] Notes section: clean text editor styling

### 4.7 Settings Page (`src/app/dashboard/settings/`)

- [ ] Section cards: grouped with clear headings
- [ ] Toggle switches: accent colored when active
- [ ] Audit log table: implement table upgrades from 3.4

### 4.8 Trial/Onboarding Pages

- [ ] Upload dropzone: dashed border with accent color, animated on drag-over
- [ ] Processing state: animated spinner with rotating analysis messages
- [ ] Teaser results: frosted glass blur with "Upgrade to unlock" overlay
- [ ] Onboarding steps: progress indicator with numbered steps

---

## STEP 5: DARK MODE POLISH

**Dark mode should not be an afterthought.** Every upgrade must work in both modes.

- [ ] Test every component in dark mode after changes
- [ ] Dark mode cards: `background: #111827` with `border: 1px solid #1e293b` — NOT transparent
- [ ] Dark mode gradients: navy hero becomes deeper (`#070d1a → #0f172a`)
- [ ] Dark mode accent: `#3b82f6` (brighter than light mode to maintain contrast)
- [ ] Dark mode severity colors: slightly brighter versions for contrast
- [ ] Dark mode shadows: increase opacity slightly (darker bg needs stronger shadows to be visible)
- [ ] Dark mode hover states: `rgba(255,255,255,0.03)` instead of `var(--secondary)`
- [ ] Glass panels in dark: `backdrop-filter: blur(10px); background: rgba(17,24,39,0.8);`

---

## STEP 6: RESPONSIVE POLISH

- [ ] Mobile sidebar: slides in as overlay, not push-aside
- [ ] Mobile header: hamburger menu, hide nav links
- [ ] Mobile stat cards: 2-column grid (not single column — wastes space)
- [ ] Mobile tables: hide non-essential columns (transactions, flag dots) — keep vendor, amount, severity
- [ ] Mobile hero: stack vertically, hide stats panel (show simpler inline stats)
- [ ] Touch targets: minimum 44px height for all interactive elements
- [ ] Mobile charts: reduce height, ensure touch-friendly tooltips

---

## STEP 7: LOADING & EMPTY STATES

- [ ] Skeleton loading: create `Skeleton` component with shimmer animation (gradient sweep, 1.5s infinite)
- [ ] Apply skeleton to: stat cards, table rows, chart containers, sidebar items
- [ ] Empty state illustrations: simple SVG or icon + text (not just "No data")
- [ ] Empty state for tables: "No vendors flagged" with muted icon, centered
- [ ] Empty state for charts: "Insufficient data for analysis" with dashed border container
- [ ] Error states: red-tinted card with error icon, retry button

---

## STEP 8: MICRO-INTERACTION AUDIT

**After all component upgrades, audit the full application for missing interactions:**

- [ ] Every clickable element has a hover state
- [ ] Every button has active/pressed state (`translateY(1px)` to simulate depth)
- [ ] Every input has focus visible state (for keyboard navigation accessibility)
- [ ] Every card has hover feedback (shadow change OR border change OR lift)
- [ ] Every table row has hover state
- [ ] Every badge/tag has consistent border treatment
- [ ] Every icon button has hover circle/background
- [ ] Navigation transitions are smooth (no layout jumps)
- [ ] Page transitions don't flash white/blank
- [ ] Sidebar collapse/expand is animated (not instant)
- [ ] Dropdown menus have entry animation (scale-in from trigger)
- [ ] Toast notifications slide in from top-right with exit animation
- [ ] Modal dialogs have backdrop fade-in + content scale-in

---

## STEP 9: FINAL VERIFICATION

### 9.1 Visual Diff Checklist

Open every page and verify these are NO LONGER true:
- [ ] Headers use sans-serif (should be serif for h1-h3)
- [ ] Cards have no shadow (should have shadow-md minimum)
- [ ] Buttons are flat (should have gradient + shadow)
- [ ] Tables have no hover state
- [ ] Numbers use sans-serif font (should use mono/data font)
- [ ] Badges are plain colored rectangles (should have border + rounded corners)
- [ ] Hero is flat solid color (should be gradient with grid overlay)
- [ ] Sidebar is flat solid color (should be gradient)
- [ ] No animations on page load
- [ ] All cards look identical (should have visual hierarchy)

### 9.2 Performance Check

- [ ] Verify animations don't cause jank (use `will-change` sparingly, prefer `transform` and `opacity`)
- [ ] Verify Framer Motion bundle size is acceptable (tree-shake unused features)
- [ ] Verify no layout shifts from animations (CLS < 0.1)
- [ ] Verify backdrop-filter has fallback for unsupported browsers
- [ ] Lighthouse Performance score > 90

### 9.3 Accessibility Check

- [ ] All animations respect `prefers-reduced-motion` — disable or reduce when set
- [ ] All hover states have keyboard-equivalent focus states
- [ ] Color contrast passes WCAG AA for all new color combinations
- [ ] Animated content doesn't auto-play for more than 5 seconds without user control

### 9.4 Build Verification

- [ ] `tsc --noEmit` passes clean
- [ ] `npm run build` succeeds
- [ ] No console errors in browser
- [ ] Dark mode toggle works correctly with all new styles

---

## AUDIT SUMMARY TEMPLATE

```
## UI UPGRADE SUMMARY
**Prompt:** 13-UI-UPGRADE.md
**Direction:** Sentinel V2 — Refined Depth
**Total Components Upgraded:** [count]
**New Components Created:** [count]
**Files Modified:** [count]
**Files Created:** [count]
**Animation Library Added:** Framer Motion
**Build Status:** Pass | Fail
**TypeScript Check:** Pass | Fail
**Dark Mode Status:** Verified | Issues Found
**Accessibility Notes:** [prefers-reduced-motion, contrast ratios]
**Performance Notes:** [Lighthouse scores, CLS, animation perf]
**Confidence Level:** High | Medium | Low
```
