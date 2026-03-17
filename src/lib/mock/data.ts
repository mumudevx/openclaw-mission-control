import {
  subHours,
  subMinutes,
  subSeconds,
  addDays,
  startOfMonth,
  endOfMonth,
  setDate,
  setHours,
} from 'date-fns';

import type {
  Agent,
  Task,
  Gateway,
  Channel,
  CronJob,
  LogEntry,
  LogLevel,
  LogSource,
  CalendarEvent,
  GatewayEvent,
  ChatMessage,
  AgentActivity,
  AgentSession,
} from '@/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const now = new Date();
const iso = (d: Date) => d.toISOString();

// ---------------------------------------------------------------------------
// 1. Mock Agents
// ---------------------------------------------------------------------------

export const mockAgents: Agent[] = [
  {
    id: 'agent-001',
    name: 'ResearchBot',
    model: 'gpt-4',
    status: 'active',
    description: 'Performs deep research across multiple data sources and synthesises findings.',
    avatar: '/avatars/research.png',
    tokenUsage: { prompt: 182_400, completion: 94_300, total: 276_700 },
    costTotal: 42.15,
    activeSessions: 2,
    lastActive: iso(subMinutes(now, 3)),
    tasks: ['task-001', 'task-004'],
    createdAt: iso(subHours(now, 720)),
    updatedAt: iso(subMinutes(now, 3)),
  },
  {
    id: 'agent-002',
    name: 'CodeAssistant',
    model: 'claude-3-opus',
    status: 'active',
    description: 'Generates, reviews, and refactors code across multiple languages.',
    avatar: '/avatars/code.png',
    tokenUsage: { prompt: 312_000, completion: 188_500, total: 500_500 },
    costTotal: 48.72,
    activeSessions: 3,
    lastActive: iso(subMinutes(now, 1)),
    tasks: ['task-002', 'task-005', 'task-009'],
    createdAt: iso(subHours(now, 680)),
    updatedAt: iso(subMinutes(now, 1)),
  },
  {
    id: 'agent-003',
    name: 'DataAnalyzer',
    model: 'gpt-4',
    status: 'idle',
    description: 'Analyses datasets, generates visualisations, and produces statistical reports.',
    avatar: '/avatars/data.png',
    tokenUsage: { prompt: 95_200, completion: 47_800, total: 143_000 },
    costTotal: 18.90,
    activeSessions: 0,
    lastActive: iso(subHours(now, 2)),
    tasks: ['task-003'],
    createdAt: iso(subHours(now, 500)),
    updatedAt: iso(subHours(now, 2)),
  },
  {
    id: 'agent-004',
    name: 'ContentWriter',
    model: 'claude-3-sonnet',
    status: 'active',
    description: 'Drafts blog posts, marketing copy, and documentation.',
    avatar: '/avatars/writer.png',
    tokenUsage: { prompt: 210_000, completion: 165_000, total: 375_000 },
    costTotal: 12.35,
    activeSessions: 1,
    lastActive: iso(subMinutes(now, 15)),
    tasks: ['task-006', 'task-010'],
    createdAt: iso(subHours(now, 400)),
    updatedAt: iso(subMinutes(now, 15)),
  },
  {
    id: 'agent-005',
    name: 'SecurityGuard',
    model: 'gpt-4',
    status: 'active',
    description: 'Monitors systems for vulnerabilities and enforces security policies.',
    avatar: '/avatars/security.png',
    tokenUsage: { prompt: 67_500, completion: 32_100, total: 99_600 },
    costTotal: 15.60,
    activeSessions: 1,
    lastActive: iso(subMinutes(now, 8)),
    tasks: ['task-007'],
    createdAt: iso(subHours(now, 600)),
    updatedAt: iso(subMinutes(now, 8)),
  },
  {
    id: 'agent-006',
    name: 'TaskRunner',
    model: 'gpt-3.5-turbo',
    status: 'error',
    description: 'Executes automated workflows and scheduled jobs.',
    avatar: '/avatars/runner.png',
    tokenUsage: { prompt: 45_000, completion: 22_000, total: 67_000 },
    costTotal: 0.85,
    activeSessions: 0,
    lastActive: iso(subHours(now, 1)),
    tasks: ['task-008'],
    createdAt: iso(subHours(now, 350)),
    updatedAt: iso(subHours(now, 1)),
  },
  {
    id: 'agent-007',
    name: 'ChatBot',
    model: 'gpt-3.5-turbo',
    status: 'active',
    description: 'Handles user-facing conversations and support tickets.',
    avatar: '/avatars/chat.png',
    tokenUsage: { prompt: 128_000, completion: 96_000, total: 224_000 },
    costTotal: 2.40,
    activeSessions: 4,
    lastActive: iso(subSeconds(now, 30)),
    tasks: ['task-011', 'task-012'],
    createdAt: iso(subHours(now, 300)),
    updatedAt: iso(subSeconds(now, 30)),
  },
  {
    id: 'agent-008',
    name: 'DevOps',
    model: 'claude-3-sonnet',
    status: 'offline',
    description: 'Manages deployments, CI/CD pipelines, and infrastructure monitoring.',
    avatar: '/avatars/devops.png',
    tokenUsage: { prompt: 8_200, completion: 4_100, total: 12_300 },
    costTotal: 1.10,
    activeSessions: 0,
    lastActive: iso(subHours(now, 12)),
    tasks: [],
    createdAt: iso(subHours(now, 200)),
    updatedAt: iso(subHours(now, 12)),
  },
];

// ---------------------------------------------------------------------------
// 2. Mock Tasks
// ---------------------------------------------------------------------------

export const mockTasks: Task[] = [
  {
    id: 'task-001',
    title: 'Analyze competitor pricing data',
    description: 'Scrape and compare pricing across top 5 competitors.',
    status: 'in_progress',
    priority: 'high',
    assigneeId: 'agent-001',
    dueDate: iso(addDays(now, 3)),
    createdAt: iso(subHours(now, 48)),
    updatedAt: iso(subHours(now, 1)),
    labels: ['research', 'priority'],
    subtasks: [
      { id: 'st-001a', title: 'Identify competitor URLs', completed: true },
      { id: 'st-001b', title: 'Extract pricing tables', completed: false },
    ],
  },
  {
    id: 'task-002',
    title: 'Refactor authentication module',
    description: 'Migrate from JWT to session-based auth with refresh tokens.',
    status: 'in_progress',
    priority: 'urgent',
    assigneeId: 'agent-002',
    dueDate: iso(addDays(now, 1)),
    createdAt: iso(subHours(now, 72)),
    updatedAt: iso(subMinutes(now, 45)),
    labels: ['engineering', 'security'],
    subtasks: [
      { id: 'st-002a', title: 'Design new auth flow', completed: true },
      { id: 'st-002b', title: 'Implement session store', completed: true },
      { id: 'st-002c', title: 'Write migration script', completed: false },
    ],
  },
  {
    id: 'task-003',
    title: 'Generate weekly report',
    description: 'Compile KPIs and generate the executive summary for this week.',
    status: 'assigned',
    priority: 'medium',
    assigneeId: 'agent-003',
    dueDate: iso(addDays(now, 2)),
    createdAt: iso(subHours(now, 24)),
    updatedAt: iso(subHours(now, 6)),
    labels: ['reporting'],
    subtasks: [],
  },
  {
    id: 'task-004',
    title: 'Research new LLM providers',
    description: 'Evaluate Mistral, Gemini, and Llama 3 for integration feasibility.',
    status: 'review',
    priority: 'medium',
    assigneeId: 'agent-001',
    createdAt: iso(subHours(now, 120)),
    updatedAt: iso(subHours(now, 4)),
    labels: ['research', 'evaluation'],
    subtasks: [
      { id: 'st-004a', title: 'Benchmark latency', completed: true },
      { id: 'st-004b', title: 'Compare token costs', completed: true },
      { id: 'st-004c', title: 'Draft recommendation', completed: true },
    ],
  },
  {
    id: 'task-005',
    title: 'Deploy monitoring dashboard',
    description: 'Set up Grafana dashboards for real-time agent metrics.',
    status: 'testing',
    priority: 'high',
    assigneeId: 'agent-002',
    dueDate: iso(addDays(now, 5)),
    createdAt: iso(subHours(now, 96)),
    updatedAt: iso(subHours(now, 3)),
    labels: ['devops', 'monitoring'],
    subtasks: [
      { id: 'st-005a', title: 'Provision Grafana instance', completed: true },
      { id: 'st-005b', title: 'Create dashboard panels', completed: true },
      { id: 'st-005c', title: 'Configure alerting rules', completed: false },
    ],
  },
  {
    id: 'task-006',
    title: 'Write onboarding documentation',
    description: 'Create step-by-step guides for new team members.',
    status: 'in_progress',
    priority: 'low',
    assigneeId: 'agent-004',
    createdAt: iso(subHours(now, 168)),
    updatedAt: iso(subHours(now, 8)),
    labels: ['documentation'],
    subtasks: [
      { id: 'st-006a', title: 'Draft getting started guide', completed: true },
      { id: 'st-006b', title: 'Add architecture overview', completed: false },
    ],
  },
  {
    id: 'task-007',
    title: 'Run quarterly security audit',
    description: 'Perform penetration testing and vulnerability scanning on all endpoints.',
    status: 'assigned',
    priority: 'urgent',
    assigneeId: 'agent-005',
    dueDate: iso(addDays(now, 7)),
    createdAt: iso(subHours(now, 36)),
    updatedAt: iso(subHours(now, 12)),
    labels: ['security', 'audit'],
    subtasks: [],
  },
  {
    id: 'task-008',
    title: 'Fix cron job retry logic',
    description: 'TaskRunner fails silently when retries are exhausted.',
    status: 'backlog',
    priority: 'high',
    createdAt: iso(subHours(now, 200)),
    updatedAt: iso(subHours(now, 200)),
    labels: ['bug', 'cron'],
    subtasks: [],
  },
  {
    id: 'task-009',
    title: 'Implement rate limiter middleware',
    description: 'Add per-agent rate limiting to protect downstream APIs.',
    status: 'done',
    priority: 'high',
    assigneeId: 'agent-002',
    createdAt: iso(subHours(now, 240)),
    updatedAt: iso(subHours(now, 24)),
    labels: ['engineering', 'security'],
    subtasks: [
      { id: 'st-009a', title: 'Design rate limit algorithm', completed: true },
      { id: 'st-009b', title: 'Add Redis backing store', completed: true },
      { id: 'st-009c', title: 'Write integration tests', completed: true },
    ],
  },
  {
    id: 'task-010',
    title: 'Draft Q1 blog post',
    description: 'Write a recap of product updates and achievements for Q1.',
    status: 'review',
    priority: 'low',
    assigneeId: 'agent-004',
    dueDate: iso(addDays(now, 4)),
    createdAt: iso(subHours(now, 80)),
    updatedAt: iso(subHours(now, 5)),
    labels: ['content', 'marketing'],
    subtasks: [
      { id: 'st-010a', title: 'Outline key topics', completed: true },
      { id: 'st-010b', title: 'Write first draft', completed: true },
    ],
  },
  {
    id: 'task-011',
    title: 'Set up Telegram bot commands',
    description: 'Register slash commands for the Telegram channel integration.',
    status: 'done',
    priority: 'medium',
    assigneeId: 'agent-007',
    createdAt: iso(subHours(now, 150)),
    updatedAt: iso(subHours(now, 48)),
    labels: ['integration', 'telegram'],
    subtasks: [],
  },
  {
    id: 'task-012',
    title: 'Improve chat response latency',
    description: 'Reduce P95 latency from 2.5s to under 1s for ChatBot.',
    status: 'inbox',
    priority: 'high',
    createdAt: iso(subHours(now, 10)),
    updatedAt: iso(subHours(now, 10)),
    labels: ['performance'],
    subtasks: [],
  },
  {
    id: 'task-013',
    title: 'Add WebSocket reconnection strategy',
    description: 'Implement exponential backoff when gateway connections drop.',
    status: 'backlog',
    priority: 'medium',
    createdAt: iso(subHours(now, 300)),
    updatedAt: iso(subHours(now, 300)),
    labels: ['engineering', 'gateway'],
    subtasks: [],
  },
  {
    id: 'task-014',
    title: 'Create agent performance leaderboard',
    description: 'Build a dashboard widget ranking agents by efficiency metrics.',
    status: 'inbox',
    priority: 'low',
    createdAt: iso(subHours(now, 20)),
    updatedAt: iso(subHours(now, 20)),
    labels: ['feature', 'dashboard'],
    subtasks: [],
  },
  {
    id: 'task-015',
    title: 'Migrate database to PostgreSQL 16',
    description: 'Upgrade from PostgreSQL 14 with zero-downtime migration.',
    status: 'testing',
    priority: 'urgent',
    assigneeId: 'agent-002',
    dueDate: iso(addDays(now, 2)),
    createdAt: iso(subHours(now, 60)),
    updatedAt: iso(subHours(now, 2)),
    labels: ['devops', 'database'],
    subtasks: [
      { id: 'st-015a', title: 'Set up PG 16 replica', completed: true },
      { id: 'st-015b', title: 'Run data validation', completed: false },
    ],
  },
];

// ---------------------------------------------------------------------------
// 3. Mock Gateway
// ---------------------------------------------------------------------------

export const mockGateway: Gateway = {
  id: 'gw-001',
  url: 'wss://gateway.openclaw.local',
  status: 'connected',
  uptime: 86_472,
  connectedAt: iso(subSeconds(now, 86_472)),
  version: '2.4.1',
  resources: {
    cpu: 45.2,
    memory: { used: 8.1, total: 16 },
    disk: { used: 124.5, total: 500 },
    network: { in: 1250.4, out: 870.6 },
  },
};

// ---------------------------------------------------------------------------
// 4. Mock Channels
// ---------------------------------------------------------------------------

export const mockChannels: Channel[] = [
  {
    id: 'ch-001',
    name: 'Telegram',
    type: 'telegram',
    status: 'active',
    connectedAt: iso(subHours(now, 720)),
    messageCount: 14_832,
  },
  {
    id: 'ch-002',
    name: 'WhatsApp',
    type: 'whatsapp',
    status: 'active',
    connectedAt: iso(subHours(now, 480)),
    messageCount: 8_219,
  },
  {
    id: 'ch-003',
    name: 'Slack',
    type: 'slack',
    status: 'active',
    connectedAt: iso(subHours(now, 600)),
    messageCount: 23_417,
  },
  {
    id: 'ch-004',
    name: 'Discord',
    type: 'discord',
    status: 'inactive',
    connectedAt: iso(subHours(now, 1000)),
    messageCount: 3_602,
  },
  {
    id: 'ch-005',
    name: 'Web',
    type: 'web',
    status: 'active',
    connectedAt: iso(subHours(now, 360)),
    messageCount: 41_085,
  },
];

// ---------------------------------------------------------------------------
// 5. Mock Cron Jobs
// ---------------------------------------------------------------------------

export const mockCronJobs: CronJob[] = [
  {
    id: 'cron-001',
    name: 'Daily Report',
    description: 'Generates and distributes the daily executive summary.',
    expression: '0 9 * * *',
    status: 'active',
    lastRun: iso(subHours(now, 15)),
    nextRun: iso(addDays(now, 0.375)),
    runCount: 142,
    failCount: 3,
    createdAt: iso(subHours(now, 3600)),
    agentId: 'agent-003',
  },
  {
    id: 'cron-002',
    name: 'Hourly Health Check',
    description: 'Pings all agents and channels to verify availability.',
    expression: '0 * * * *',
    status: 'active',
    lastRun: iso(subMinutes(now, 42)),
    nextRun: iso(subMinutes(now, -18)),
    runCount: 4_320,
    failCount: 12,
    createdAt: iso(subHours(now, 4320)),
    agentId: 'agent-005',
  },
  {
    id: 'cron-003',
    name: 'Weekly Backup',
    description: 'Creates a full backup of the database and configuration.',
    expression: '0 2 * * 0',
    status: 'active',
    lastRun: iso(subHours(now, 120)),
    nextRun: iso(addDays(now, 5)),
    runCount: 26,
    failCount: 1,
    createdAt: iso(subHours(now, 4400)),
  },
  {
    id: 'cron-004',
    name: 'Data Sync',
    description: 'Synchronises external data feeds every 15 minutes.',
    expression: '*/15 * * * *',
    status: 'running',
    lastRun: iso(subMinutes(now, 8)),
    nextRun: iso(subMinutes(now, -7)),
    runCount: 17_280,
    failCount: 45,
    createdAt: iso(subHours(now, 4320)),
    agentId: 'agent-006',
  },
  {
    id: 'cron-005',
    name: 'Cache Cleanup',
    description: 'Purges expired cache entries and reclaims memory.',
    expression: '0 3 * * *',
    status: 'paused',
    lastRun: iso(subHours(now, 27)),
    nextRun: iso(addDays(now, 0.125)),
    runCount: 89,
    failCount: 0,
    createdAt: iso(subHours(now, 2160)),
  },
  {
    id: 'cron-006',
    name: 'Monthly Analytics',
    description: 'Aggregates monthly usage metrics and generates the analytics report.',
    expression: '0 0 1 * *',
    status: 'failed',
    lastRun: iso(subHours(now, 408)),
    nextRun: iso(addDays(now, 14)),
    runCount: 5,
    failCount: 2,
    createdAt: iso(subHours(now, 4000)),
    agentId: 'agent-003',
  },
];

// ---------------------------------------------------------------------------
// 6. Mock Logs (Generator)
// ---------------------------------------------------------------------------

const logMessages: Record<LogLevel, string[]> = {
  debug: [
    'Cache hit for key user:session:4f92',
    'WebSocket heartbeat acknowledged',
    'Token refresh scheduled in 300s',
    'Query execution time: 12ms',
  ],
  info: [
    'Agent ResearchBot started new session',
    'Task task-001 moved to in_progress',
    'Channel Telegram connected successfully',
    'Cron job Daily Report completed in 4.2s',
    'New WebSocket connection from client web-ui',
    'Database migration applied: v2.4.1',
    'Rate limiter reset for agent-002',
    'Health check passed for all 5 active agents',
  ],
  warn: [
    'Agent TaskRunner response time exceeds 5s threshold',
    'Memory usage at 82% - approaching limit',
    'Rate limit reached for agent-002 (150 req/min)',
    'Cron job Data Sync completed with partial errors',
    'Discord channel reconnection attempt 3 of 5',
  ],
  error: [
    'Agent TaskRunner failed: connection timeout',
    'Cron job Monthly Analytics exited with code 1',
    'Database connection pool exhausted',
    'Failed to deliver message to Discord channel',
  ],
  critical: [
    'Gateway connection lost - initiating failover',
    'Database primary node unreachable',
  ],
};

const logSources: LogSource[] = ['agent', 'gateway', 'cron', 'system', 'task', 'user'];

export function generateMockLogs(count: number): LogEntry[] {
  const logs: LogEntry[] = [];

  for (let i = 0; i < count; i++) {
    // Weight distribution: ~50% info, ~25% debug, ~15% warn, ~8% error, ~2% critical
    const roll = Math.random();
    let level: LogLevel;
    if (roll < 0.25) level = 'debug';
    else if (roll < 0.75) level = 'info';
    else if (roll < 0.90) level = 'warn';
    else if (roll < 0.98) level = 'error';
    else level = 'critical';

    const messages = logMessages[level];
    const message = messages[Math.floor(Math.random() * messages.length)];
    const source = logSources[Math.floor(Math.random() * logSources.length)];

    const secondsAgo = Math.floor(Math.random() * 86_400);
    const timestamp = subSeconds(now, secondsAgo);

    logs.push({
      id: `log-${String(i + 1).padStart(5, '0')}`,
      level,
      source,
      message,
      timestamp: iso(timestamp),
      agentId: source === 'agent' ? mockAgents[Math.floor(Math.random() * mockAgents.length)].id : undefined,
    });
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export const mockLogs: LogEntry[] = generateMockLogs(50);

// ---------------------------------------------------------------------------
// 7. Mock Calendar Events
// ---------------------------------------------------------------------------

const monthStart = startOfMonth(now);
const monthEnd = endOfMonth(now);
const totalDays = monthEnd.getDate();

function dayInMonth(day: number, hour = 9): Date {
  return setHours(setDate(monthStart, Math.min(day, totalDays)), hour);
}

export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: 'evt-001',
    title: 'Daily Report Generation',
    description: 'Automated daily executive summary.',
    type: 'cron',
    startDate: iso(dayInMonth(1, 9)),
    allDay: false,
    color: '#3b82f6',
    relatedId: 'cron-001',
  },
  {
    id: 'evt-002',
    title: 'Competitor Analysis Due',
    description: 'Deadline for competitor pricing task.',
    type: 'task_deadline',
    startDate: iso(dayInMonth(5, 17)),
    allDay: false,
    color: '#ef4444',
    relatedId: 'task-001',
  },
  {
    id: 'evt-003',
    title: 'Team Standup',
    description: 'Weekly sync with the AI operations team.',
    type: 'user_event',
    startDate: iso(dayInMonth(7, 10)),
    endDate: iso(dayInMonth(7, 11)),
    allDay: false,
    color: '#8b5cf6',
  },
  {
    id: 'evt-004',
    title: 'Security Audit Kickoff',
    description: 'Begin quarterly penetration testing.',
    type: 'agent_task',
    startDate: iso(dayInMonth(10, 9)),
    endDate: iso(dayInMonth(10, 17)),
    allDay: false,
    color: '#f59e0b',
    relatedId: 'task-007',
  },
  {
    id: 'evt-005',
    title: 'Database Migration Window',
    description: 'Scheduled downtime for PostgreSQL 16 upgrade.',
    type: 'milestone',
    startDate: iso(dayInMonth(12, 2)),
    endDate: iso(dayInMonth(12, 6)),
    allDay: false,
    color: '#10b981',
    relatedId: 'task-015',
  },
  {
    id: 'evt-006',
    title: 'Weekly Backup',
    type: 'cron',
    startDate: iso(dayInMonth(14, 2)),
    allDay: false,
    color: '#3b82f6',
    relatedId: 'cron-003',
  },
  {
    id: 'evt-007',
    title: 'Blog Post Review',
    description: 'Final review of the Q1 blog post.',
    type: 'task_deadline',
    startDate: iso(dayInMonth(18, 15)),
    allDay: false,
    color: '#ef4444',
    relatedId: 'task-010',
  },
  {
    id: 'evt-008',
    title: 'Agent Performance Review',
    description: 'Monthly evaluation of all agent efficiency metrics.',
    type: 'user_event',
    startDate: iso(dayInMonth(20, 14)),
    endDate: iso(dayInMonth(20, 16)),
    allDay: false,
    color: '#8b5cf6',
  },
  {
    id: 'evt-009',
    title: 'LLM Cost Optimisation Sprint',
    description: 'Focused sprint to reduce token spend by 15%.',
    type: 'milestone',
    startDate: iso(dayInMonth(22)),
    endDate: iso(dayInMonth(26)),
    allDay: true,
    color: '#10b981',
  },
  {
    id: 'evt-010',
    title: 'Monthly Analytics Run',
    description: 'End-of-month analytics aggregation.',
    type: 'cron',
    startDate: iso(dayInMonth(totalDays, 0)),
    allDay: false,
    color: '#3b82f6',
    relatedId: 'cron-006',
  },
];

// ---------------------------------------------------------------------------
// 8. Mock Gateway Events
// ---------------------------------------------------------------------------

const gatewayEventTemplates: { type: string; source: string; message: string }[] = [
  { type: 'connection', source: 'web-ui', message: 'Client connected from 192.168.1.42' },
  { type: 'connection', source: 'agent-001', message: 'Agent ResearchBot established WebSocket' },
  { type: 'disconnection', source: 'agent-008', message: 'Agent DevOps disconnected (timeout)' },
  { type: 'message', source: 'ch-001', message: 'Telegram: incoming message routed to ChatBot' },
  { type: 'message', source: 'ch-003', message: 'Slack: command /status received' },
  { type: 'message', source: 'ch-005', message: 'Web: user session initiated' },
  { type: 'heartbeat', source: 'system', message: 'Heartbeat: all agents responsive' },
  { type: 'heartbeat', source: 'system', message: 'Heartbeat: 7/8 agents responsive' },
  { type: 'error', source: 'ch-004', message: 'Discord channel: authentication token expired' },
  { type: 'error', source: 'agent-006', message: 'TaskRunner: unhandled exception in job executor' },
  { type: 'config', source: 'admin', message: 'Rate limit updated: 200 req/min for agent-002' },
  { type: 'config', source: 'admin', message: 'Channel Discord set to inactive' },
  { type: 'connection', source: 'agent-002', message: 'Agent CodeAssistant reconnected after brief drop' },
  { type: 'message', source: 'ch-002', message: 'WhatsApp: media attachment processed (2.1 MB)' },
  { type: 'scaling', source: 'system', message: 'Auto-scaling: worker pool increased to 4' },
  { type: 'scaling', source: 'system', message: 'Auto-scaling: worker pool reduced to 2' },
  { type: 'connection', source: 'agent-007', message: 'Agent ChatBot opened 3 concurrent sessions' },
  { type: 'message', source: 'ch-001', message: 'Telegram: broadcast sent to 128 subscribers' },
  { type: 'error', source: 'gateway', message: 'TLS certificate renewal warning: 7 days remaining' },
  { type: 'heartbeat', source: 'system', message: 'System resources nominal: CPU 45%, MEM 51%' },
];

export const mockGatewayEvents: GatewayEvent[] = gatewayEventTemplates.map(
  (template, i) => ({
    id: `gw-evt-${String(i + 1).padStart(3, '0')}`,
    type: template.type,
    source: template.source,
    message: template.message,
    timestamp: iso(subMinutes(now, i * 7 + Math.floor(Math.random() * 5))),
  }),
);

// ---------------------------------------------------------------------------
// 9. Mock Dashboard Stats
// ---------------------------------------------------------------------------

export interface DashboardStats {
  activeAgents: number;
  activeTasks: number;
  gatewayStatus: 'connected' | 'disconnected' | 'connecting';
  todayCost: number;
  cronJobs: number;
}

export const mockDashboardStats: DashboardStats = {
  activeAgents: 5,
  activeTasks: 12,
  gatewayStatus: 'connected',
  todayCost: 23.45,
  cronJobs: 4,
};

// ---------------------------------------------------------------------------
// 10. Mock Chat Messages
// ---------------------------------------------------------------------------

export const mockChatMessages: ChatMessage[] = [
  // agent-001 ResearchBot
  { id: 'msg-001', agentId: 'agent-001', role: 'user', content: 'Analyze the top 5 competitors in the SaaS analytics space.', timestamp: iso(subMinutes(now, 120)) },
  { id: 'msg-002', agentId: 'agent-001', role: 'assistant', content: 'I\'ve identified the top 5 competitors: Mixpanel, Amplitude, Heap, PostHog, and Pendo. Starting deep-dive analysis on pricing, features, and market positioning.', timestamp: iso(subMinutes(now, 119)) },
  { id: 'msg-003', agentId: 'agent-001', role: 'user', content: 'Focus on their pricing tiers and enterprise features.', timestamp: iso(subMinutes(now, 90)) },
  { id: 'msg-004', agentId: 'agent-001', role: 'assistant', content: 'Noted. I\'ll create a comparison matrix covering free tier limits, pro pricing, and enterprise-specific features like SSO, RBAC, and data retention policies.', timestamp: iso(subMinutes(now, 89)) },
  // agent-002 CodeAssistant
  { id: 'msg-005', agentId: 'agent-002', role: 'user', content: 'Refactor the auth middleware to use session-based tokens instead of JWT.', timestamp: iso(subMinutes(now, 60)) },
  { id: 'msg-006', agentId: 'agent-002', role: 'assistant', content: 'I\'ll start by creating the session store interface, then migrate the middleware. I\'ll preserve backward compatibility during the transition.', timestamp: iso(subMinutes(now, 59)) },
  { id: 'msg-007', agentId: 'agent-002', role: 'user', content: 'Make sure to add refresh token rotation.', timestamp: iso(subMinutes(now, 45)) },
  { id: 'msg-008', agentId: 'agent-002', role: 'assistant', content: 'Implementing refresh token rotation with a 7-day sliding window. Each refresh generates a new token pair and invalidates the old refresh token to prevent replay attacks.', timestamp: iso(subMinutes(now, 44)) },
  { id: 'msg-009', agentId: 'agent-002', role: 'system', content: 'Session store migration completed. 3 files modified, 2 new files created.', timestamp: iso(subMinutes(now, 30)) },
  // agent-003 DataAnalyzer
  { id: 'msg-010', agentId: 'agent-003', role: 'user', content: 'Generate a weekly KPI report for the executive team.', timestamp: iso(subHours(now, 3)) },
  { id: 'msg-011', agentId: 'agent-003', role: 'assistant', content: 'Pulling data from the last 7 days. I\'ll cover revenue metrics, user engagement, churn rate, and agent performance KPIs.', timestamp: iso(subHours(now, 3)) },
  { id: 'msg-012', agentId: 'agent-003', role: 'assistant', content: 'Report ready. Key highlights: MRR up 12%, DAU steady at 4.2k, churn reduced to 2.1%. Full PDF attached to task-003.', timestamp: iso(subHours(now, 2)) },
  // agent-004 ContentWriter
  { id: 'msg-013', agentId: 'agent-004', role: 'user', content: 'Draft a blog post about our Q1 product updates.', timestamp: iso(subMinutes(now, 180)) },
  { id: 'msg-014', agentId: 'agent-004', role: 'assistant', content: 'I\'ll structure it as: intro, top 3 features shipped, performance improvements, and a forward-looking section on Q2 roadmap. Target length: 1,200 words.', timestamp: iso(subMinutes(now, 179)) },
  { id: 'msg-015', agentId: 'agent-004', role: 'user', content: 'Add a section about the new agent monitoring dashboard.', timestamp: iso(subMinutes(now, 120)) },
  { id: 'msg-016', agentId: 'agent-004', role: 'assistant', content: 'Added a dedicated section highlighting real-time monitoring, token usage analytics, and the new cost optimization alerts. Draft is now at 1,450 words.', timestamp: iso(subMinutes(now, 118)) },
  // agent-005 SecurityGuard
  { id: 'msg-017', agentId: 'agent-005', role: 'user', content: 'Run a vulnerability scan on all public API endpoints.', timestamp: iso(subMinutes(now, 30)) },
  { id: 'msg-018', agentId: 'agent-005', role: 'assistant', content: 'Initiating scan across 24 endpoints. Checking for OWASP Top 10 vulnerabilities, rate limiting bypass, and authentication edge cases.', timestamp: iso(subMinutes(now, 29)) },
  { id: 'msg-019', agentId: 'agent-005', role: 'assistant', content: 'Scan complete. Found 2 medium-severity issues: missing CSRF token on /api/settings and overly permissive CORS on /api/webhooks. No critical vulnerabilities detected.', timestamp: iso(subMinutes(now, 10)) },
];

// ---------------------------------------------------------------------------
// 11. Mock Agent Activities
// ---------------------------------------------------------------------------

export const mockAgentActivities: AgentActivity[] = [
  // agent-001
  { id: 'act-001', agentId: 'agent-001', type: 'reasoning', description: 'Analyzing competitor pricing data from 5 sources', timestamp: iso(subMinutes(now, 5)), metadata: { sources: '5' } },
  { id: 'act-002', agentId: 'agent-001', type: 'tool_call', description: 'Called web_scraper on competitor-pricing.com', timestamp: iso(subMinutes(now, 15)), metadata: { tool: 'web_scraper' } },
  { id: 'act-003', agentId: 'agent-001', type: 'file_operation', description: 'Created report: competitor-analysis-q1.pdf', timestamp: iso(subMinutes(now, 25)) },
  { id: 'act-004', agentId: 'agent-001', type: 'task_update', description: 'Updated task "Analyze competitor pricing data" to in_progress', timestamp: iso(subMinutes(now, 60)) },
  { id: 'act-005', agentId: 'agent-001', type: 'status_change', description: 'Status changed from idle to active', timestamp: iso(subMinutes(now, 65)) },
  // agent-002
  { id: 'act-006', agentId: 'agent-002', type: 'tool_call', description: 'Executed code_review on auth-middleware.ts', timestamp: iso(subMinutes(now, 2)), metadata: { tool: 'code_review' } },
  { id: 'act-007', agentId: 'agent-002', type: 'file_operation', description: 'Modified src/middleware/auth.ts (142 lines changed)', timestamp: iso(subMinutes(now, 10)) },
  { id: 'act-008', agentId: 'agent-002', type: 'file_operation', description: 'Created src/stores/sessionStore.ts', timestamp: iso(subMinutes(now, 20)) },
  { id: 'act-009', agentId: 'agent-002', type: 'reasoning', description: 'Planning refresh token rotation strategy', timestamp: iso(subMinutes(now, 35)) },
  { id: 'act-010', agentId: 'agent-002', type: 'tool_call', description: 'Ran test suite: 47 passed, 0 failed', timestamp: iso(subMinutes(now, 40)), metadata: { passed: '47', failed: '0' } },
  { id: 'act-011', agentId: 'agent-002', type: 'task_update', description: 'Completed subtask "Implement session store"', timestamp: iso(subMinutes(now, 45)) },
  { id: 'act-012', agentId: 'agent-002', type: 'error', description: 'TypeScript compilation error in migration script', timestamp: iso(subMinutes(now, 50)), metadata: { file: 'migrate.ts', line: '42' } },
  // agent-003
  { id: 'act-013', agentId: 'agent-003', type: 'tool_call', description: 'Queried analytics database for weekly metrics', timestamp: iso(subHours(now, 2)), metadata: { tool: 'sql_query' } },
  { id: 'act-014', agentId: 'agent-003', type: 'reasoning', description: 'Calculating MRR growth rate and churn analysis', timestamp: iso(subHours(now, 2)) },
  { id: 'act-015', agentId: 'agent-003', type: 'file_operation', description: 'Generated weekly-kpi-report.pdf', timestamp: iso(subHours(now, 2)) },
  { id: 'act-016', agentId: 'agent-003', type: 'task_update', description: 'Marked "Generate weekly report" as review', timestamp: iso(subHours(now, 2)) },
  { id: 'act-017', agentId: 'agent-003', type: 'status_change', description: 'Status changed from active to idle', timestamp: iso(subHours(now, 2)) },
  // agent-004
  { id: 'act-018', agentId: 'agent-004', type: 'reasoning', description: 'Outlining blog post structure for Q1 updates', timestamp: iso(subMinutes(now, 160)) },
  { id: 'act-019', agentId: 'agent-004', type: 'file_operation', description: 'Created draft: q1-product-updates.md (1,450 words)', timestamp: iso(subMinutes(now, 120)) },
  { id: 'act-020', agentId: 'agent-004', type: 'tool_call', description: 'Called grammar_check on blog draft', timestamp: iso(subMinutes(now, 100)), metadata: { tool: 'grammar_check' } },
  { id: 'act-021', agentId: 'agent-004', type: 'task_update', description: 'Updated "Draft Q1 blog post" to review', timestamp: iso(subMinutes(now, 95)) },
  { id: 'act-022', agentId: 'agent-004', type: 'status_change', description: 'Status changed from idle to active', timestamp: iso(subMinutes(now, 170)) },
  // agent-005
  { id: 'act-023', agentId: 'agent-005', type: 'tool_call', description: 'Initiated OWASP vulnerability scan on 24 endpoints', timestamp: iso(subMinutes(now, 25)), metadata: { tool: 'vuln_scanner' } },
  { id: 'act-024', agentId: 'agent-005', type: 'reasoning', description: 'Analyzing scan results and classifying severity levels', timestamp: iso(subMinutes(now, 12)) },
  { id: 'act-025', agentId: 'agent-005', type: 'error', description: 'CSRF token missing on /api/settings endpoint', timestamp: iso(subMinutes(now, 10)), metadata: { severity: 'medium' } },
  { id: 'act-026', agentId: 'agent-005', type: 'file_operation', description: 'Generated security-audit-report.pdf', timestamp: iso(subMinutes(now, 8)) },
  { id: 'act-027', agentId: 'agent-005', type: 'task_update', description: 'Updated "Run quarterly security audit" status', timestamp: iso(subMinutes(now, 7)) },
  // agent-006
  { id: 'act-028', agentId: 'agent-006', type: 'error', description: 'Connection timeout while executing cron job', timestamp: iso(subHours(now, 1)), metadata: { job: 'cron-004' } },
  { id: 'act-029', agentId: 'agent-006', type: 'status_change', description: 'Status changed from active to error', timestamp: iso(subHours(now, 1)) },
  // agent-007
  { id: 'act-030', agentId: 'agent-007', type: 'tool_call', description: 'Processed incoming Telegram message', timestamp: iso(subSeconds(now, 30)), metadata: { channel: 'telegram' } },
  { id: 'act-031', agentId: 'agent-007', type: 'reasoning', description: 'Generating contextual response for support ticket #4821', timestamp: iso(subSeconds(now, 25)) },
  { id: 'act-032', agentId: 'agent-007', type: 'tool_call', description: 'Sent response via Telegram channel', timestamp: iso(subSeconds(now, 20)), metadata: { channel: 'telegram' } },
  { id: 'act-033', agentId: 'agent-007', type: 'status_change', description: 'Opened 3 concurrent chat sessions', timestamp: iso(subMinutes(now, 5)) },
];

// ---------------------------------------------------------------------------
// 12. Mock Agent Sessions
// ---------------------------------------------------------------------------

export const mockAgentSessions: AgentSession[] = [
  // agent-001
  { id: 'sess-001', agentId: 'agent-001', status: 'active', startedAt: iso(subMinutes(now, 120)), tokensUsed: 45_200, cost: 8.50 },
  { id: 'sess-002', agentId: 'agent-001', status: 'active', startedAt: iso(subMinutes(now, 60)), tokensUsed: 12_800, cost: 2.40 },
  { id: 'sess-003', agentId: 'agent-001', status: 'completed', startedAt: iso(subHours(now, 8)), endedAt: iso(subHours(now, 6)), tokensUsed: 89_400, cost: 16.80 },
  // agent-002
  { id: 'sess-004', agentId: 'agent-002', status: 'active', startedAt: iso(subMinutes(now, 90)), tokensUsed: 78_300, cost: 14.70 },
  { id: 'sess-005', agentId: 'agent-002', status: 'active', startedAt: iso(subMinutes(now, 45)), tokensUsed: 23_100, cost: 4.35 },
  { id: 'sess-006', agentId: 'agent-002', status: 'completed', startedAt: iso(subHours(now, 12)), endedAt: iso(subHours(now, 10)), tokensUsed: 156_000, cost: 29.30 },
  { id: 'sess-007', agentId: 'agent-002', status: 'error', startedAt: iso(subHours(now, 5)), endedAt: iso(subHours(now, 5)), tokensUsed: 3_200, cost: 0.60 },
  // agent-003
  { id: 'sess-008', agentId: 'agent-003', status: 'completed', startedAt: iso(subHours(now, 4)), endedAt: iso(subHours(now, 2)), tokensUsed: 67_800, cost: 12.75 },
  { id: 'sess-009', agentId: 'agent-003', status: 'completed', startedAt: iso(subHours(now, 24)), endedAt: iso(subHours(now, 22)), tokensUsed: 42_100, cost: 7.90 },
  // agent-004
  { id: 'sess-010', agentId: 'agent-004', status: 'active', startedAt: iso(subMinutes(now, 180)), tokensUsed: 95_000, cost: 6.25 },
  { id: 'sess-011', agentId: 'agent-004', status: 'completed', startedAt: iso(subHours(now, 10)), endedAt: iso(subHours(now, 8)), tokensUsed: 120_000, cost: 7.90 },
  // agent-005
  { id: 'sess-012', agentId: 'agent-005', status: 'active', startedAt: iso(subMinutes(now, 30)), tokensUsed: 18_600, cost: 3.50 },
  { id: 'sess-013', agentId: 'agent-005', status: 'completed', startedAt: iso(subHours(now, 6)), endedAt: iso(subHours(now, 4)), tokensUsed: 51_200, cost: 9.60 },
  // agent-006
  { id: 'sess-014', agentId: 'agent-006', status: 'error', startedAt: iso(subHours(now, 1)), endedAt: iso(subHours(now, 1)), tokensUsed: 8_400, cost: 0.11 },
  { id: 'sess-015', agentId: 'agent-006', status: 'completed', startedAt: iso(subHours(now, 6)), endedAt: iso(subHours(now, 5)), tokensUsed: 34_200, cost: 0.43 },
  // agent-007
  { id: 'sess-016', agentId: 'agent-007', status: 'active', startedAt: iso(subMinutes(now, 15)), tokensUsed: 5_400, cost: 0.07 },
  { id: 'sess-017', agentId: 'agent-007', status: 'active', startedAt: iso(subMinutes(now, 10)), tokensUsed: 3_200, cost: 0.04 },
  { id: 'sess-018', agentId: 'agent-007', status: 'completed', startedAt: iso(subHours(now, 3)), endedAt: iso(subHours(now, 2)), tokensUsed: 48_000, cost: 0.62 },
];

// ---------------------------------------------------------------------------
// 13. Mock AI Responses (for chat simulation)
// ---------------------------------------------------------------------------

export const mockAIResponses: Record<string, string[]> = {
  'agent-001': [
    'I\'ve found 3 new data sources that could improve our analysis. Shall I cross-reference them?',
    'The research is progressing well. I\'ve compiled findings from 12 sources so far.',
    'I noticed a discrepancy in the competitor data. Let me verify with an additional source.',
    'Analysis complete. The key insight is that pricing trends show a 15% YoY increase across the market.',
  ],
  'agent-002': [
    'I\'ve refactored the module using the strategy pattern. All 47 tests still pass.',
    'Found a potential memory leak in the event handler. I\'ll fix it in the next iteration.',
    'The code review is complete. I\'ve identified 3 areas for improvement with suggested fixes.',
    'Build successful. No breaking changes detected in the public API.',
  ],
  'agent-003': [
    'The dataset has been cleaned and normalised. 2,847 rows processed with 12 outliers flagged.',
    'I\'ve generated the visualisation. Revenue trends show strong Q1 performance.',
    'Statistical analysis complete. The correlation coefficient is 0.87, indicating a strong relationship.',
    'Report exported to PDF. Key metrics are highlighted in the executive summary.',
  ],
  'agent-004': [
    'Draft completed. The blog post is 1,200 words with SEO-optimised headings.',
    'I\'ve revised the copy to be more conversational while maintaining technical accuracy.',
    'Added three call-to-action sections as requested. The conversion flow looks natural.',
    'Content proofread and ready for review. Grammar score: 98/100.',
  ],
  'agent-005': [
    'Scan complete. No critical vulnerabilities detected in the latest deployment.',
    'I\'ve updated the security policy to include the new compliance requirements.',
    'Found a potential XSS vector in the search input. Patching now.',
    'All endpoints are properly rate-limited and CORS policies are correctly configured.',
  ],
  'agent-006': [
    'Retry logic has been updated. Jobs will now retry 3 times with exponential backoff.',
    'The cron scheduler is back online. All pending jobs have been queued.',
    'I\'ve added error reporting for failed job executions.',
  ],
  'agent-007': [
    'Responded to 14 support tickets in the last hour. Average response time: 2.3 seconds.',
    'I\'ve escalated ticket #4821 to human review — the customer needs billing assistance.',
    'Chat session metrics: 94% satisfaction rate, 12 conversations resolved.',
    'Updated the FAQ knowledge base with 5 new entries from common questions.',
  ],
  'agent-008': [
    'Deployment pipeline is green. All stages passed in 4m 32s.',
    'Infrastructure monitoring shows normal resource utilisation across all nodes.',
    'I\'ve configured auto-scaling rules for the new microservice.',
  ],
};
