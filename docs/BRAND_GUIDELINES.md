# Dharma Brand Guidelines

## Logo System

### Logo Overview
The Dharma logo is a minimal geometric tree built from interconnected nodes and thin lines, symbolizing:
- **Growth**: Upward branching tree structure
- **Collaboration**: Connected nodes representing teamwork
- **Progress**: Network-like interconnected relationships
- **Intelligence**: Clean, geometric, purposeful design

### Design Philosophy
- **Ultra-minimal**: Only essential elements
- **Geometric**: Clean lines and perfect circles
- **Symmetrical**: Balanced composition
- **Scalable**: Works from favicon to billboard
- **Premium**: Inspired by Notion, Linear, Stripe, Vercel

### Color Palette

#### Light Variant (Light backgrounds)
- **Primary**: `#1e5631` (Deep Green)
- **Accent**: `#d4af37` (Gold)
- **Text**: `#1a1a1a` (Dark)

#### Dark Variant (Dark backgrounds)
- **Primary**: `#4ade80` (Light Green)
- **Accent**: `#fbbf24` (Bright Gold)
- **Text**: `#ffffff` (White)

### Logo Sizes

```jsx
// Navbar & Hero sections
<DharmaLogo size="lg" variant="light" showWordmark={false} />

// Sidebar & compact areas
<DharmaLogo size="sm" variant="light" showWordmark={false} />

// Footer on dark background
<DharmaLogo size="md" variant="dark" showWordmark={false} />

// Full logo with wordmark (large displays)
<DharmaLogo size="lg" variant="light" showWordmark={true} />
```

### Usage Guidelines

**✅ DO:**
- Use light variant on light/white backgrounds
- Use dark variant on dark backgrounds
- Maintain minimum size of 24px for icon
- Add adequate breathing room around logo

**❌ DON'T:**
- Stretch or distort the logo
- Change the color scheme arbitrarily
- Use on backgrounds with insufficient contrast
- Rotate or flip the logo
- Add drop shadows on icon (container has subtle shadow)

### Icon-Only Version
Use when space is limited (favicon, app icons, small buttons)
- Perfect square container
- 24px - 64px recommended sizes
- Subtle rounded corner container

### Full Wordmark Version
Use when brand recognition is important
- Icon + "Dharma" text
- Available in light and dark variants
- Maintains proper spacing automatically

### Container Styling
The logo includes a subtle gradient background:
- Light variant: White gradient with green shadow
- Dark variant: Dark blue-gray gradient with green shadow
- Rounded corners for modern appearance

### Implementation

```jsx
import DharmaLogo from '@/components/DharmaLogo';

// Icon only, light background
<DharmaLogo size="md" variant="light" showWordmark={false} />

// Full logo with wordmark, dark background
<DharmaLogo size="lg" variant="dark" showWordmark={true} />

// Compact sidebar version
<DharmaLogo size="sm" variant="light" showWordmark={false} />
```

### Size Reference
- **xs**: 24px (favicon, tiny icons)
- **sm**: 32px (sidebar, compact nav)
- **md**: 40px (default, most uses)
- **lg**: 52px (hero sections, large displays)
- **xl**: 64px (landing page banner)

### Accessibility
- High contrast between primary and background
- Works for colorblind users
- Scalable SVG for all screen densities
- Semantic meaning through network tree metaphor

## Color Applications

### Primary Color (#1e5631 / #4ade80)
- Main icon strokes and nodes
- Primary UI elements
- Focus states

### Accent Color (#d4af37 / #fbbf24)
- Small highlight dots on leaf nodes
- Premium touch
- Selective emphasis

## File Structure
```
Frontend/
├── src/
│   └── components/
│       └── DharmaLogo.jsx       # Main logo component
│       ├── Navbar.jsx            # Uses light variant
│       ├── Footer.jsx            # Uses dark variant
│       └── layout/
│           └── Sidebar.jsx       # Uses light variant small
```

---

**Created**: March 9, 2026
**Version**: 1.0
**Designer**: AI Brand System
