---
name: Systemic Precision
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#404753'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0ef'
  outline: '#707785'
  outline-variant: '#c0c7d6'
  surface-tint: '#005fae'
  primary: '#005daa'
  on-primary: '#ffffff'
  primary-container: '#0075d5'
  on-primary-container: '#fefcff'
  inverse-primary: '#a5c8ff'
  secondary: '#5d5f5f'
  on-secondary: '#ffffff'
  secondary-container: '#dfe0e0'
  on-secondary-container: '#616363'
  tertiary: '#005ab6'
  on-tertiary: '#ffffff'
  tertiary-container: '#1972de'
  on-tertiary-container: '#fefcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d4e3ff'
  primary-fixed-dim: '#a5c8ff'
  on-primary-fixed: '#001c3a'
  on-primary-fixed-variant: '#004785'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#d7e3ff'
  tertiary-fixed-dim: '#abc7ff'
  on-tertiary-fixed: '#001b3f'
  on-tertiary-fixed-variant: '#00458f'
  background: '#fcf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-page: 24px
---

## Brand & Style
The design system is engineered for high-density Enterprise Task & Resource Management. The brand personality is authoritative, systematic, and ultra-efficient, prioritizing information density over decorative elements. 

The aesthetic follows a **Modern Corporate Minimalism** approach. It utilizes a rigorous "Functional Logic" style where every visual treatment—from border weight to background tint—communicates data hierarchy. The goal is to reduce cognitive load in complex environments, providing a "heads-up display" feel that remains calm under heavy data loads.

## Colors
The palette is built on a "Utility-First" logic. 
- **Primary Blue** is reserved for interactive elements and primary actions. 
- **Secondary White** serves as the workspace layer (cards, tables, modals) to contrast against the **Light Gray** application background.
- **Semantic Colors** (Success, Warning, Danger) are strictly applied to status indicators, workload progress bars, and priority levels. 
- **Neutral Slate** is used for typography to maintain high legibility without the harshness of pure black.

## Typography
This design system uses **Inter** for its exceptional legibility at small sizes and high-density tracking. 
- **Headlines** use semi-bold and bold weights to anchor page sections. 
- **Body text** defaults to 14px for standard reading and 13px for high-density data tables and sidebars. 
- **Label-caps** are utilized for table headers and metadata categories to differentiate them from actionable content. 
- **Mobile scaling**: For screens below 768px, `display-lg` should scale down to 24px/32px line-height to maintain container integrity.

## Layout & Spacing
The system employs a **12-column fluid grid** with a 4px baseline rhythm. 
- **Density**: High-density views (tables/lists) use 8px (sm) vertical padding. Standard forms and cards use 16px (md) padding.
- **Breakpoints**: 
  - Mobile (<640px): 1-column, 16px page margins.
  - Tablet (640px - 1024px): 6-column, 24px margins.
  - Desktop (>1024px): 12-column, 24px margins, max-content width of 1440px.
- **Sidebars**: Collapsible left-hand navigation (240px expanded / 64px collapsed).

## Elevation & Depth
The design system uses **Tonal Layering** supplemented by **Low-Contrast Outlines** rather than heavy shadows to maintain a clean, professional "flat" look. 
- **Level 0 (Base)**: App background (#F5F5F5).
- **Level 1 (Surface)**: Cards and Table containers (#FFFFFF) with a 1px border (#E8E8E8).
- **Level 2 (Overlay)**: Modals and Popovers. These utilize a soft, diffused ambient shadow (0px 4px 12px rgba(0,0,0,0.08)) to differentiate from the primary workspace.
- **Hover States**: Interactive rows or cards should shift to a subtle tinted background (#F0F7FF) rather than rising in elevation.

## Shapes
The shape language is **Soft (0.25rem)**. This provides a modern touch while maintaining a precise, engineering-focused look. 
- **Buttons and Inputs**: 4px border radius.
- **Cards and Modals**: 8px (rounded-lg) for outer containers.
- **Status Badges**: 2px or fully square to maximize text space in tight columns.
- **Progress Bars**: 100% rounded ends (capsule) to distinguish them from structural containers.

## Components
- **Data Tables**: Zebra striping is discouraged; use 1px bottom borders. Headers are sticky with a slightly darker gray background (#FAFAFA).
- **Hierarchical Tree Views**: Use chevron icons for collapse/expand. Indentation should be 16px per level. Active nodes use a left-edge 3px primary color accent.
- **Status Badges (P1-P4)**: 
  - P1 (Critical): Red text, Red light-tint background.
  - P2 (High): Yellow text, Yellow light-tint background.
  - P3 (Medium): Blue text, Blue light-tint background.
  - P4 (Low): Gray text, Gray light-tint background.
- **Workload Progress Bars**: 8px height. 
  - Under 100%: Green (#52C41A).
  - At 100%: Yellow (#FAAD14).
  - Over 100%: Red (#FF4D4F).
- **Buttons**:
  - Primary: Solid #1890FF, White text.
  - Secondary: White background, 1px Gray border, Neutral text.
  - Danger: Ghost style (Red border/text) until hover, then Solid Red.
- **KPI Widgets**: Large `display-lg` numbers with `label-caps` descriptions. Include a small sparkline or percentage trend indicator.
- **Inputs**: 32px height for high density. Focus state uses a 2px primary color "halo" with 20% opacity.