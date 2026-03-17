# Feature Brief: Team/Office (Pixel Office)

## Reference Files
- Design: [02-DESIGN-BRIEF.md](./02-DESIGN-BRIEF.md)
- Research: [01-RESEARCH-REFERENCES.md](./01-RESEARCH-REFERENCES.md)

---

## 1. Purpose

The Team/Office page visualizes OpenClaw agents in a pixel art virtual office environment. Each agent is represented as a character (sprite/avatar) whose status (working, idle, error) is reflected in real-time. This page provides both a fun and functional way to display team status.

---

## 2. Inspiration Sources (From Research)

Multiple pixel office implementations exist in the community:
- **OpenClaw Live Workspace**: Chrome extension, pixel-art office, agents as NPCs
- **Star-Office-UI**: Pixel office with characters, daily notes, guest agents
- **Claw Empire**: Virtual autonomous company simulator managed from the CEO's desk
- **TenacitOS**: 3D voxel office with one avatar per agent via React Three Fiber
- **OpenClaw Office (WW-AI-Lab)**: Isometric virtual office, real-time via WebSocket

---

## 3. Page Sections

### 3.1 Pixel Office Canvas (Main Area)

The canvas occupies the majority of the page:

```
┌──────────────────────────────────────────────────────────┐
│                    PIXEL OFFICE                          │
│                                                          │
│    ┌──────┐     ┌──────┐     ┌──────┐                   │
│    │ Desk │     │ Desk │     │ Desk │                    │
│    │ 🤖💻 │     │ 🤖💤 │     │ 🤖❌ │                    │
│    │ dev  │     │ qa   │     │ ops  │                    │
│    └──────┘     └──────┘     └──────┘                    │
│                                                          │
│    ┌──────┐     ┌──────┐     ☕                          │
│    │ Desk │     │ Desk │     Break                       │
│    │ 🤖💻 │     │      │     Room                        │
│    │ data │     │ empty│                                 │
│    └──────┘     └──────┘                                 │
│                                                          │
│    📋 Meeting Room          🌿 Plant    📚 Library       │
└──────────────────────────────────────────────────────────┘
```

#### Canvas Technical Details
- **Technology**: HTML5 Canvas or React + CSS Grid (pixel art style)
- **Alternative**: React Three Fiber for 2.5D/isometric view
- **Scale**: Pixel-based, 16x16 or 32x32 tile size
- **Resolution**: Responsive scaling based on container

#### Office Elements
| Element | Pixel Art | Description |
|---------|-----------|-------------|
| Desk | 32x32 tile | Each agent is assigned a desk |
| Computer | On the desk | Screen lights up for active agents |
| Character (Agent) | 16x16 sprite | Animated, status-based |
| Break Room | Break room area | Idle agents move here |
| Meeting Room | Central area | Agents actively collaborating are shown here |
| Decorations | Plants, bookshelf, etc. | Atmosphere builders |

#### Agent Sprite States
| State | Animation | Visual Cue |
|-------|-----------|------------|
| **Active/Working** | Sitting at desk, typing animation | Screen lit (green/blue), activity bubble |
| **Idle** | In break room or dozing at desk | "Zzz" bubble, dim screen |
| **Processing** | At desk, thinking animation | "..." thought bubble |
| **Error** | Red exclamation mark | Red "!" bubble, error flash |
| **Offline** | Empty desk | Character invisible, desk dimmed |

#### Activity Bubbles
Live activity display above the agent:
```
  ┌─────────────────┐
  │ 📝 Writing tests │
  └────────┬────────┘
           │
         🤖
```
- Brief description of current task/action
- Tool call icons (file read, code write, test run, etc.)
- Updates every 3-5 seconds

### 3.2 Agent Interaction Panel (On Click)

Mini panel that opens when clicking an agent on the canvas:

```
┌──────────────────────────────┐
│  [Avatar] dev-agent          │
│  ● Active | claude-sonnet    │
│──────────────────────────────│
│  Current: Writing unit tests │
│  Tokens: 8,420               │
│  Cost: $0.56                 │
│──────────────────────────────│
│  [Send Command]              │
│  [View Details →]            │
│  [View Logs →]               │
└──────────────────────────────┘
```

### 3.3 Office Settings / Layout Editor

Allows the user to customize the office layout:

- **Drag & Drop**: Position desks by dragging
- **Theme Selection**: Different office themes (modern, retro, space, nature)
- **Add Elements**: Add decorative items (plants, posters, whiteboards)
- **Agent Assignment**: Determine which agent sits at which desk
- **Save/Load**: Save and restore layouts

### 3.4 Office Stats Bar (Bottom or Side Panel)

```
┌──────────────────────────────────────────────────────────┐
│  👥 5 Active  |  💤 2 Idle  |  ❌ 1 Error  |  📊 $4.32 │
│  🔄 Last activity: dev-agent completed PR review (2m ago)│
└──────────────────────────────────────────────────────────┘
```

### 3.5 Team Performance Heatmap

Below or to the right of the office canvas:
- Daily/weekly activity heatmap (similar to GitHub contribution chart)
- Per-agent: When each agent is most active
- Color intensity: Represents activity level

---

## 4. Technical Implementation Options

### Option A: HTML5 Canvas + React (Recommended)
```
Advantages:
- Full control, high performance
- Pixel-perfect rendering
- Sprite animations are straightforward
- Lightweight, minimal dependencies

Disadvantages:
- Manual click handling on canvas
- Accessibility challenges
```

### Option B: CSS Grid + React (Simple Alternative)
```
Advantages:
- DOM-based, easy interaction
- Accessibility-friendly
- Can use shadcn/ui components

Disadvantages:
- Sprite animations limited to CSS
- Harder to achieve pixel art feel
```

### Option C: React Three Fiber (3D/Isometric)
```
Advantages:
- Impressive visuals
- 2.5D isometric perspective
- Rich animation capabilities

Disadvantages:
- Heavy dependency (Three.js)
- Performance concerns
- Complex implementation
```

**Recommendation**: Start with Option A (Canvas) using pixel art sprites. Simple, performant, and fun.

---

## 5. Sprite Assets

### Required Sprites
```
sprites/
  characters/
    agent-idle.png        (16x16, 4 frame animation)
    agent-working.png     (16x16, 8 frame animation)
    agent-thinking.png    (16x16, 4 frame animation)
    agent-error.png       (16x16, 2 frame animation)
    agent-sleeping.png    (16x16, 4 frame animation)
  furniture/
    desk.png              (32x32)
    desk-with-pc.png      (32x32)
    chair.png             (16x16)
    plant.png             (16x16)
    bookshelf.png         (32x64)
    whiteboard.png        (48x32)
    coffee-machine.png    (16x32)
  rooms/
    floor-tile.png        (16x16, tileable)
    wall.png              (16x16, tileable)
    meeting-table.png     (64x32)
    break-room-bg.png     (96x64)
  bubbles/
    speech-bubble.png     (variable)
    thought-bubble.png    (variable)
    error-bubble.png      (variable)
    zzz-bubble.png        (variable)
```

### Color Palette (Pixel Art)
Aligned with the reference design color palette:
- Main orange: #E8654A (accent elements)
- Black: #1A1A1A (outlines)
- Light gray: #F5F5F0 (floor)
- White: #FFFFFF (desks, walls)
- Status colors: Green, yellow, red

---

## 6. State Management

```typescript
interface OfficeState {
  layout: OfficeLayout;
  agents: OfficeAgent[];
  selectedAgent: string | null;
  isEditing: boolean; // layout edit mode
  theme: 'modern' | 'retro' | 'space' | 'nature';
  zoom: number; // 0.5 - 2.0
  camera: { x: number; y: number }; // pan offset
}

interface OfficeLayout {
  width: number; // tile count
  height: number; // tile count
  tiles: TileType[][]; // floor, wall, etc.
  furniture: FurnitureItem[];
  decorations: DecorationItem[];
}

interface OfficeAgent {
  agentId: string;
  position: { x: number; y: number }; // tile coordinates
  deskId: string;
  spriteState: 'idle' | 'working' | 'thinking' | 'error' | 'sleeping';
  currentAction: string; // "Writing tests", "Reading files", etc.
  bubble: BubbleType | null;
}

interface FurnitureItem {
  id: string;
  type: 'desk' | 'chair' | 'plant' | 'bookshelf' | 'whiteboard' | 'coffee-machine' | 'meeting-table';
  position: { x: number; y: number };
  rotation: 0 | 90 | 180 | 270;
  assignedAgent?: string;
}
```

---

## 7. User Interactions

| Interaction | Behavior |
|-------------|----------|
| Agent sprite click | Show mini info panel |
| Agent sprite double-click | Navigate to Agent detail page |
| Canvas drag | Pan (camera movement) |
| Scroll | Zoom in/out |
| "Edit Layout" toggle | Enable drag & drop editing mode |
| Add decoration | Drag & drop from element palette |
| "Send Command" (from panel) | Send quick command to agent |
| Theme change | Change office visual theme |

---

## 8. Technical Components

```
src/
  components/
    office/
      PixelCanvas.tsx         // Main canvas renderer
      OfficeRenderer.tsx       // Office drawing logic
      AgentSprite.tsx          // Agent character render
      SpeechBubble.tsx         // Activity bubble
      AgentInfoPanel.tsx       // Click-to-open panel
      OfficeEditor.tsx         // Layout editing mode
      OfficeStatBar.tsx        // Bottom stats bar
      ActivityHeatmap.tsx      // Performance heatmap
      ThemeSelector.tsx        // Theme selector
  hooks/
    useOffice.ts
    useOfficeLayout.ts
    useSpriteAnimation.ts
    useCanvasInteraction.ts
  assets/
    sprites/                   // Pixel art sprite files
  pages/
    office/
      page.tsx
```
