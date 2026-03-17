# Feature Brief: Gateways

## Reference Files
- Design: [02-DESIGN-BRIEF.md](./02-DESIGN-BRIEF.md)
- Research: [01-RESEARCH-REFERENCES.md](./01-RESEARCH-REFERENCES.md)

---

## 1. Purpose

The Gateway page provides a central interface for managing and monitoring the OpenClaw Gateway's status, connected channels, WebSocket connections, and system metrics. The Gateway is the heart of OpenClaw — it controls all messaging surfaces, agent routing, and the event system.

---

## 2. Gateway Architecture (Reference Info)

The OpenClaw Gateway runs as a long-lived daemon:
- Manages connections to messaging platforms
- Provides a WebSocket API (JSON payload, text frames)
- Emits system events (cron tick, heartbeat)
- Queues operations and starts agent runs
- Saves results to memory

### Protocol
- All clients connect via WebSocket
- Device identity + challenge/nonce authentication
- Scope: status, channels, models, chat, agent, sessions, nodes, approvals

---

## 3. Page Sections

### 3.1 Gateway Status Header (Hero Section)

```
┌──────────────────────────────────────────────────────────┐
│  🟢 Gateway Online                      v2.4.1          │
│                                                          │
│  Uptime: 14 days, 6 hours, 23 min    Last Ping: 12ms   │
│                                                          │
│  [Restart Gateway]  [View Logs]  [Settings]              │
└──────────────────────────────────────────────────────────┘
```

- Status indicator: Large green/red/yellow dot
- Gateway version number
- Uptime info
- Last ping/latency
- Action buttons: Restart (danger confirm), Go to Logs, Settings

### 3.2 System Resources

4 gauge/progress cards:

| Metric | Visualization | Detail |
|--------|---------------|--------|
| CPU | Circular gauge + percentage | Per-core breakdown tooltip |
| Memory | Progress bar + used/total | RSS, Heap detail |
| Disk | Progress bar + used/total | OpenClaw workspace size |
| Network | Sparkline | In/Out bandwidth |

### 3.3 Connected Channels

A card for each channel:

```
┌─────────────────────────────┐
│  [Telegram Icon]  Telegram  │
│  Status: ● Connected        │
│  Messages Today: 47         │
│  Last Activity: 2 min ago   │
│                              │
│  [Disconnect]  [Configure]   │
└─────────────────────────────┘
```

Supported channels:
- Telegram
- WhatsApp
- Slack
- Discord
- Signal
- iMessage
- Google Chat
- Custom webhooks

Each channel card includes:
- Platform icon and name
- Connection status badge
- Today's message count
- Last activity time
- Disconnect / Configure buttons

### 3.4 WebSocket Connections (Active Connections)

Table format showing active WebSocket clients:

| Column | Description |
|--------|-------------|
| Client ID | Unique connection identifier |
| Type | operator / node / web-ui / cli |
| Device | Device info |
| Connected At | Connection time |
| Last Activity | Last activity time |
| Messages | Sent/received message count |
| Actions | Disconnect button |

### 3.5 Event Stream (Live Event Feed)

Real-time event log:
- All events emitted by the Gateway
- Filter: Event type (heartbeat, cron, agent, channel, error)
- Timestamp + event type badge + event detail
- Auto-scroll (toggleable)
- Pause/resume button

### 3.6 Model Configuration

List of available LLM models and settings:

| Model | Provider | Status | Default |
|-------|----------|--------|---------|
| gpt-4o | OpenAI | ● Active | ✓ |
| claude-sonnet-4-5-20250514 | Anthropic | ● Active | |
| gemini-2.5-pro | Google | ○ Inactive | |

For each model:
- Enable/disable toggle
- Set as default model
- API key status (masked)
- Token limits

### 3.7 Security & Access

- Approval flows: List of pending approvals
- Permission controls: Commands agents are allowed to execute
- API key management (masked display)
- Connection security settings (Tailscale integration, etc.)

---

## 4. State Management

```typescript
interface GatewayState {
  status: 'online' | 'offline' | 'degraded' | 'restarting';
  version: string;
  uptime: number; // seconds
  lastPing: number; // ms

  resources: {
    cpu: { usage: number; cores: number[]; };
    memory: { used: number; total: number; rss: number; heap: number; };
    disk: { used: number; total: number; workspaceSize: number; };
    network: { inbound: number; outbound: number; history: number[]; };
  };

  channels: Channel[];
  connections: WebSocketConnection[];
  events: GatewayEvent[];
  models: ModelConfig[];
  pendingApprovals: Approval[];
}

interface Channel {
  id: string;
  platform: 'telegram' | 'whatsapp' | 'slack' | 'discord' | 'signal' | 'imessage' | 'gchat' | 'webhook';
  status: 'connected' | 'disconnected' | 'error';
  messagesToday: number;
  lastActivity: Date;
  config: Record<string, any>;
}
```

---

## 5. User Interactions

| Interaction | Behavior |
|-------------|----------|
| Gateway Restart | Confirmation dialog → Restart command via WebSocket |
| Channel Disconnect | Confirmation → Disconnect channel |
| Channel Configure | Modal/Sheet with channel settings |
| WS Client Disconnect | Confirmation → Disconnect client |
| Event filter change | Filter event stream |
| Model toggle | Enable/disable model |
| Approval accept/reject | Advance approval flow |

---

## 6. Real-time Updates

- **WebSocket Subscription**: Gateway status, resource metrics, events
- **Polling Fallback**: HTTP status check every 10 seconds
- **Heartbeat**: Gateway heartbeat check every 30 seconds
- **Auto-reconnect**: Automatic reconnection on disconnect (exponential backoff)

---

## 7. Technical Components

```
src/
  components/
    gateway/
      GatewayStatusHero.tsx
      SystemResources.tsx
      ResourceGauge.tsx
      ChannelCard.tsx
      ChannelList.tsx
      ConnectionsTable.tsx
      EventStream.tsx
      ModelConfig.tsx
      SecurityPanel.tsx
      ApprovalList.tsx
  hooks/
    useGatewayStatus.ts
    useGatewayEvents.ts
    useSystemResources.ts
  pages/
    gateway/
      page.tsx
```
