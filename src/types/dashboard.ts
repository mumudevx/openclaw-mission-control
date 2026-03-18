export interface DashboardStats {
  activeAgents: number;
  activeTasks: number;
  gatewayStatus: 'connected' | 'disconnected' | 'connecting';
  todayCost: number;
  cronJobs: number;
}
