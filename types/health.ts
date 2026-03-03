export interface HealthComponentStatus {
  status: string;
  message?: string;
  responseTimeMs?: number;
}

export interface HealthCheckResponse {
  status: string;
  checkedAt: string;
  database?: HealthComponentStatus;
  cache?: HealthComponentStatus;
}
