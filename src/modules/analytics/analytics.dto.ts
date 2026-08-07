export interface OverviewDTO {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  createdToday: number;
  closedToday: number;
  averageResolutionTimeMs: number; // in milliseconds
}

export interface TrendDataPoint {
  date: string;
  count: number;
}

export interface WorkloadDataPoint {
  agentName: string;
  count: number;
}

export interface DistributionDataPoint {
  name: string;
  count: number;
}
