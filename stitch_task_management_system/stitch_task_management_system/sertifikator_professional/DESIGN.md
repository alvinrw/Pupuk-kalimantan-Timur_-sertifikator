---
name: Sertifikator Professional
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#404752'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#707783'
  outline-variant: '#c0c7d4'
  surface-tint: '#0060a8'
  primary: '#005ea4'
  on-primary: '#ffffff'
  primary-container: '#0077ce'
  on-primary-container: '#fdfcff'
  inverse-primary: '#a2c9ff'
  secondary: '#795900'
  on-secondary: '#ffffff'
  secondary-container: '#fec330'
  on-secondary-container: '#6f5100'
  tertiary: '#8f4a00'
  on-tertiary: '#ffffff'
  tertiary-container: '#b35e00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d3e4ff'
  primary-fixed-dim: '#a2c9ff'
  on-primary-fixed: '#001c38'
  on-primary-fixed-variant: '#004881'
  secondary-fixed: '#ffdfa0'
  secondary-fixed-dim: '#f8bd2a'
  on-secondary-fixed: '#261a00'
  on-secondary-fixed-variant: '#5c4300'
  tertiary-fixed: '#ffdcc4'
  tertiary-fixed-dim: '#ffb780'
  on-tertiary-fixed: '#2f1400'
  on-tertiary-fixed-variant: '#6f3800'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
  status-success: '#10B981'
  status-warning: '#F59E0B'
  status-error: '#EF4444'
  status-info: '#0EA5E9'
  border-subtle: '#E2E8F0'
  text-main: '#0F172A'
  text-muted: '#64748B'
typography:
  display-lg:
    fontFamily: Source Serif 4
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Source Serif 4
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-tabular:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
  unit: 4px
---

## Brand & Style

The design system is engineered for **Sertifikator**, an enterprise-grade certification management platform. The brand personality is rooted in **precision, efficiency, and industrial reliability**. It targets compliance officers, plant managers, and administrative leads who require a tool that manages high-density data without cognitive fatigue.

The design style is **Modern Enterprise Minimalism**. It prioritizes a clean, high-contrast interface that mimics the clarity of professional documentation while leveraging modern web ergonomics. Key characteristics include:
- **Information Density:** Optimized layouts for large data tables and OCR results.
- **Architectural Rigor:** A strict adherence to grid systems and functional spacing.
- **Subtle Elegance:** Using thin strokes and purposeful whitespace to prevent the UI from feeling cluttered despite its complexity.

## Colors

The palette is anchored by **Primary Blue (#1E88E5)**, representing the stability and trust required for legal and administrative compliance. **Secondary Yellow (#FBC02D)** is used sparingly for critical attention points, such as "Repair" statuses or "Akan Expired" alerts.

The background remains a clean, high-value white to maximize legibility. For status monitoring, we employ a semantic color logic:
- **Success (Layak/Aktif):** Emerald green for positive compliance.
- **Warning (Repair/Akan Expired):** Amber for items requiring attention.
- **Error (Tidak Layak/Expired):** Red for critical failures or lapses.

Neutral tones are pulled from the slate palette to provide a sophisticated, cool-toned environment that reduces eye strain during long-term use.

## Typography

Since *Sutasoma* is unavailable in our library, we have selected **Source Serif 4** as the headline typeface. Its sturdy, authoritative, and traditional literary structure mirrors the formal nature of certification documents.

**Hanken Grotesk** is chosen for body text. It is a sharp, contemporary sans-serif that remains legible at small sizes, making it ideal for dense data entry and document review panels.

**JetBrains Mono** is utilized for labels and tabular data. This provides a clear "technical" layer to the UI, distinguishing extracted OCR data and serial numbers from the standard interface text, reinforcing the feeling of precision.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid Grid**. The sidebar navigation is fixed at 260px, while the main content area utilizes a 12-column fluid grid to accommodate varying data widths.

We use a **4px baseline grid** for vertical rhythm. Spacing between related items should be 8px (2 units) or 16px (4 units). For large sections, 32px or 48px should be used to provide visual breathing room.

**Data Density Strategy:** 
Tables should utilize a "compact" row height (40px) by default, with an option for "relaxed" (56px) for mobile or touch-friendly views. Gutters within data tables are reduced to 12px to maximize the visible character count per column.

## Elevation & Depth

To maintain a "Minimalist Enterprise" feel, this design system avoids heavy shadows. Instead, it uses **Tonal Layering and Low-Contrast Outlines**:

- **Level 0 (Background):** Solid white or very light gray (#F8FAFC).
- **Level 1 (Cards/Tables):** Solid white with a 1px border (#E2E8F0).
- **Level 2 (Popovers/Modals):** Solid white with a 1px border and a very soft, ambient shadow (0px 4px 20px rgba(0,0,0,0.05)).
- **Interactions:** Subtle background color shifts (e.g., hover states using Primary Blue at 5% opacity) are preferred over lifting elements.

This flat-depth approach ensures the interface feels like a professional ledger rather than a consumer application.

## Shapes

We use a **Soft (0.25rem)** roundedness approach. This provides a modern touch without sacrificing the professional, "square" look expected in enterprise software. 

- **Buttons & Inputs:** 4px radius.
- **Cards & Modals:** 8px (rounded-lg) for a slightly softer container feel.
- **Status Badges:** Fully rounded (pill) to clearly distinguish them from interactive buttons or text inputs.

## Components

### Buttons
- **Primary:** Solid #1E88E5 with white text. No gradient.
- **Secondary:** Outline 1px #1E88E5 with primary colored text.
- **Ghost:** No border, text-only until hover. Used for "Cancel" or "Minor" actions.

### Status Badges (Chips)
Badges use a "soft-fill" style: a 10% opacity background of the semantic color with a 100% opacity text color. This ensures they are visible without being distracting.

### Data Tables
Tables are the core of the system. 
- **Headers:** Light gray background (#F1F5F9), uppercase JetBrains Mono text.
- **Rows:** Alternating zebra-striping (very subtle) or simple 1px bottom borders.
- **Indicators:** Small colored dots next to status text for quick visual scanning.

### Input Fields
- **Default:** 1px #E2E8F0 border with Hanken Grotesk text. 
- **Focus State:** 1px Primary Blue border with a 2px soft blue focus ring.
- **OCR Highlight:** Fields populated by AI extraction should have a very light yellow highlight background to signal they need verification.

### Navigation Sidebar
Dark-themed or High-Contrast Light. Use icons (e.g., Lucide-React) paired with the label-caps typography. Active states should be marked with a 3px vertical primary blue bar on the left edge.