# OpenClaw Mission Control - Design Brief

## Reference Design: Financial Dashboard UI

This design brief defines a consistent design system for the OpenClaw Mission Control Panel, staying true to the visual language of the reference Financial Dashboard screenshot.

---

## 1. Overall Design Philosophy

### Minimalist & Functional
- Clean, generous whitespace usage (whitespace-heavy layout)
- Rounded corner cards (border-radius: 16px-24px)
- Soft shadows for depth perception (card elevation)
- Grid-based layout, consistent spacing
- Content-focused, minimal decorative elements

### Neomorphism Effect
- Cards with subtle shadows on white or light gray surfaces
- Inner shadow (inset shadow) can be used on some interactive elements
- Balance between flat design and neomorphism

---

## 2. Color Palette

### Primary Colors
```
Accent/Primary:    #E8654A (Burnt Orange/Terra Cotta)
Accent Hover:      #D4553A
Accent Light:      #FDF0ED (Accent at 5-10% opacity)
```

### Neutral Colors
```
Background:        #F5F5F0 (Warm Off-White / Cream)
Card Background:   #FFFFFF
Card Alt:          #FAFAF8
Text Primary:      #1A1A1A (Near-black dark gray)
Text Secondary:    #6B6B6B (Medium gray)
Text Muted:        #9B9B9B (Light gray)
Border:            #E8E8E4 (Very light gray)
Divider:           #F0F0EC
```

### Status Colors
```
Success:           #34A853 (Green)
Warning:           #FBBC04 (Amber)
Error:             #EA4335 (Red)
Info:              #4285F4 (Blue)
```

### Chart Colors
```
Chart Primary:     #E8654A (Accent)
Chart Secondary:   #1A1A1A (Black)
Chart Tertiary:    #F0C4B8 (Light orange/pink)
Chart Quaternary:  #FDE8E0 (Very light orange)
Chart Quinary:     #6B6B6B (Gray)
```

---

## 3. Typography

### Font Family
```
Primary Font:      "Inter" (Google Fonts)
Monospace Font:    "JetBrains Mono" or "Fira Code" (for code/logs)
```

### Font Scale
```
Display/Hero:      32px / 40px line-height / font-weight: 700
H1:                24px / 32px line-height / font-weight: 700
H2:                20px / 28px line-height / font-weight: 600
H3:                16px / 24px line-height / font-weight: 600
Body:              14px / 20px line-height / font-weight: 400
Body Small:        13px / 18px line-height / font-weight: 400
Caption:           12px / 16px line-height / font-weight: 400
Overline:          11px / 14px line-height / font-weight: 500 / uppercase / letter-spacing: 0.5px
```

### Large Numbers (Metrics)
- Font-size: 28px-36px
- Font-weight: 700
- Color: #1A1A1A
- Currency/unit: 14px, font-weight: 400, color: #6B6B6B

---

## 4. Spacing & Grid System

### Base Unit: 4px

```
xs:    4px
sm:    8px
md:    12px
lg:    16px
xl:    20px
2xl:   24px
3xl:   32px
4xl:   48px
```

### Page Layout
```
Sidebar Width:        240px (collapsed: 64px)
Top Bar Height:       64px
Content Padding:      24px
Card Gap:             16px-20px
Max Content Width:    1440px
```

### Grid
- Main content area: CSS Grid or Flexbox
- Dashboard cards: 12-column grid
- Responsive breakpoints:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
  - `2xl`: 1536px

---

## 5. Component Design Details

### 5.1 Cards
```css
.card {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #E8E8E4;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
```

### 5.2 Buttons

**Primary Button:**
```css
.btn-primary {
  background: #E8654A;
  color: #FFFFFF;
  border-radius: 24px; /* Pill shape */
  padding: 10px 24px;
  font-weight: 500;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #D4553A;
}
```

**Secondary/Outline Button:**
```css
.btn-secondary {
  background: transparent;
  color: #1A1A1A;
  border: 1.5px solid #E8E8E4;
  border-radius: 24px;
  padding: 10px 24px;
  font-weight: 500;
  font-size: 14px;
}
```

**Icon Button:**
```css
.btn-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1.5px solid #E8E8E4;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}
```

### 5.3 Badge / Tag
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  gap: 6px;
}

.badge-active {
  background: #E8F5E9;
  color: #2E7D32;
}

.badge-idle {
  background: #FFF8E1;
  color: #F57F17;
}

.badge-error {
  background: #FFEBEE;
  color: #C62828;
}

.badge-neutral {
  background: #F5F5F0;
  color: #6B6B6B;
}
```

### 5.4 Stat Card (As in Reference)
```
┌─────────────────────────────┐
│  [icon]                     │
│                             │
│  Metric Label    (caption)  │
│  $23,194.80      (display)  │
│                             │
│  [sparkline/mini chart]     │
│                             │
│  ↑ 12.5%  vs last week     │
└─────────────────────────────┘
```
- Icon: 24x24, inside a soft background circle
- Label: 12px, text-secondary
- Value: 28-36px, font-weight: 700, text-primary
- Trend: 12px, success/error color with arrow icon

### 5.5 Sidebar Navigation
```
┌──────────────────┐
│  [Logo] OpenClaw │
│  Mission Control │
│──────────────────│
│                  │
│  ● Dashboard     │
│  ○ Gateways      │
│  ○ Agents        │
│  ○ Logs          │
│  ○ Team Office   │
│  ○ Cron Jobs     │
│  ○ Calendar      │
│  ○ Tasks         │
│                  │
│──────────────────│
│  ⚙ Settings      │
│  👤 Profile       │
└──────────────────┘
```
- Active item: 3px accent border on left edge, background: accent-light (#FDF0ED), text: accent color
- Hover: Background #F5F5F0
- Icons: Lucide React (consistent 20px stroke-width: 1.5)

### 5.6 Donut/Gauge Chart (Like the Reference Growth Rate)
- SVG-based circular progress indicator
- Center large number: 28px, bold
- Sub label: 12px, text-secondary
- Fill with accent color, gray background track

### 5.7 Area/Bar Chart (Like the Reference Annual Profits)
- Uses Recharts library
- Colors: Pink/orange tones, nested circles or gradient area
- Grid lines: Very thin (#F0F0EC), dashed
- Axis labels: 12px, text-muted

---

## 6. Iconography

### Icon Library: Lucide React
- Stroke width: 1.5px
- Size: 16px (inline), 20px (navigation), 24px (feature icons)
- Color: Context-dependent (text-secondary or accent)

### Usage Areas
```
Dashboard:     LayoutDashboard
Gateways:      Radio / Network
Agents:        Bot / Users
Logs:          FileText / ScrollText
Team Office:   Building2 / Gamepad2
Cron Jobs:     Clock / Timer
Calendar:      Calendar
Tasks:         KanbanSquare / CheckSquare
Settings:      Settings
```

---

## 7. Animations & Transitions

### General Principles
- Fast and smooth (150-300ms)
- Ease-out or cubic-bezier(0.4, 0, 0.2, 1)
- Purposeful animations only (attention, feedback)

### Specific Animations
```
Card Hover:        transform: translateY(-2px), shadow increase, 200ms
Button Click:      scale(0.98), 100ms
Page Transition:   opacity fade, 200ms
Sidebar Toggle:    width transition, 250ms
Badge Pulse:       Subtle pulse animation for active agents
Skeleton Loading:  Shimmer effect (left-to-right gradient animation)
Number Counter:    Smooth count-up animation on number changes
```

---

## 8. Responsive Behavior

### Desktop (>1280px)
- Full sidebar open
- 3-4 column grid cards
- All details visible

### Tablet (768px-1280px)
- Collapsed sidebar (icons only)
- 2 column grid cards
- Some details hidden

### Mobile (<768px)
- Bottom navigation bar
- Single column layout
- Full-width cards
- Swipe gestures for Kanban

---

## 9. Dark Mode (Optional/Future)

### Dark Palette
```
Background:        #0F0F0F
Card Background:   #1A1A1A
Card Border:       #2A2A2A
Text Primary:      #F5F5F0
Text Secondary:    #9B9B9B
Accent:            #E8654A (Unchanged)
```

---

## 10. shadcn/ui Component Mapping

| Design Element | shadcn/ui Component | Customization |
|----------------|---------------------|--------------|
| Stat Card | Card | Custom padding, border-radius: 20px |
| Navigation | Sidebar (shadcn) | Accent color, custom active state |
| Data Table | Table + DataTable | Custom header styling |
| Dropdown | DropdownMenu | Pill-shape trigger |
| Dialog/Modal | Dialog | Rounded corners, backdrop blur |
| Tabs | Tabs | Pill-style tab triggers |
| Badge | Badge | Custom color variants |
| Input | Input | Rounded, subtle border |
| Select | Select | Custom dropdown styling |
| Toast | Sonner | Accent color, position: bottom-right |
| Tooltip | Tooltip | Dark bg, 12px font |
| Progress | Progress | Accent color fill |
| Calendar | Calendar | Custom day cell styling |
| Command | Command | Quick action palette (Cmd+K) |
| Sheet | Sheet | Sidebar mobile view |

---

## 11. Tailwind CSS Theme Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#E8654A',
          hover: '#D4553A',
          light: '#FDF0ED',
          50: '#FDE8E0',
          100: '#F0C4B8',
        },
        surface: {
          DEFAULT: '#F5F5F0',
          card: '#FFFFFF',
          'card-alt': '#FAFAF8',
        },
        content: {
          primary: '#1A1A1A',
          secondary: '#6B6B6B',
          muted: '#9B9B9B',
        },
        border: {
          DEFAULT: '#E8E8E4',
          divider: '#F0F0EC',
        }
      },
      borderRadius: {
        'card': '20px',
        'pill': '9999px',
        'btn': '24px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08)',
        'card-active': '0 2px 8px rgba(0,0,0,0.06)',
      }
    }
  }
}
```

---

## 12. Layout Structure (Wireframe)

```
┌─────────────────────────────────────────────────────────┐
│  [Sidebar]  │           [Top Bar]                       │
│             │  Logo  Search   User Avatar  Notifications│
│  ● Dash     │───────────────────────────────────────────│
│  ○ Gates    │                                           │
│  ○ Agents   │           [Content Area]                  │
│  ○ Logs     │                                           │
│  ○ Office   │   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│  ○ Cron     │   │Card │ │Card │ │Card │ │Card │      │
│  ○ Calendar │   └─────┘ └─────┘ └─────┘ └─────┘      │
│  ○ Tasks    │                                           │
│             │   ┌───────────┐ ┌───────────────┐        │
│             │   │           │ │               │        │
│             │   │  Chart    │ │  Activity     │        │
│             │   │           │ │  Manager      │        │
│             │   └───────────┘ └───────────────┘        │
│  ⚙ Settings │                                           │
└─────────────────────────────────────────────────────────┘
```

This layout follows the grid structure from the reference design: summary cards at the top, larger charts and activity managers below.
