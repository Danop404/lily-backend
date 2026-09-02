export interface ProcessMetrics {
  uptimeSeconds: number;
  memoryUsage: {
    rssBytes: number;
    heapTotalBytes: number;
    heapUsedBytes: number;
    externalBytes: number;
  };
  nodeVersion: string;
  environment: string;
  timestamp: string;
}
