// Redis, BullMQ Queue, Prometheus Metrics, and Cloud Storage Backup Manager
export interface RedisClusterStats {
  host: string;
  port: number;
  status: 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED';
  memoryUsedMb: number;
  maxMemoryMb: number;
  connectedClients: number;
  hitRatePct: number;
  pubSubChannels: number;
  keysCount: number;
}

export interface BullMQJob {
  id: string;
  name: string;
  data: {
    pair: string;
    type: 'BUY' | 'SELL';
    entryPrice: number;
    tp1: number;
    stopLoss: number;
    timestamp: string;
  };
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  attempts: number;
  maxAttempts: number;
  processedByWorker: string;
  processedAt?: string;
  latencyMs?: number;
}

export interface PrometheusMetricItem {
  name: string;
  help: string;
  type: 'counter' | 'gauge' | 'histogram';
  value: number;
  labels?: Record<string, string>;
}

export interface CloudBackupConfig {
  provider: 'GCS' | 'AWS_S3';
  bucketName: string;
  schedule: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  lastUploadedAt: string;
  lastSnapshotSizeMb: number;
  encryptionAlgorithm: 'AES-256-GCM';
  checksumSha256: string;
  autoUploadEnabled: boolean;
}

class RedisQueueManager {
  private redisStats: RedisClusterStats = {
    host: '127.0.0.1',
    port: 6379,
    status: 'CONNECTED',
    memoryUsedMb: 18.4,
    maxMemoryMb: 512,
    connectedClients: 12,
    hitRatePct: 99.6,
    pubSubChannels: 4,
    keysCount: 1420,
  };

  private bullJobs: BullMQJob[] = [
    {
      id: 'job-101',
      name: 'dispatch_signal_push',
      data: {
        pair: 'EUR/USD',
        type: 'BUY',
        entryPrice: 1.085,
        tp1: 1.089,
        stopLoss: 1.081,
        timestamp: new Date().toISOString(),
      },
      status: 'completed',
      attempts: 1,
      maxAttempts: 3,
      processedByWorker: 'worker-node-01',
      processedAt: new Date().toISOString(),
      latencyMs: 14,
    },
    {
      id: 'job-102',
      name: 'dispatch_signal_push',
      data: {
        pair: 'GBP/USD',
        type: 'BUY',
        entryPrice: 1.272,
        tp1: 1.276,
        stopLoss: 1.268,
        timestamp: new Date().toISOString(),
      },
      status: 'active',
      attempts: 1,
      maxAttempts: 3,
      processedByWorker: 'worker-node-02',
    },
    {
      id: 'job-103',
      name: 'dispatch_signal_push',
      data: {
        pair: 'XAU/USD',
        type: 'SELL',
        entryPrice: 2640.5,
        tp1: 2625.0,
        stopLoss: 2655.0,
        timestamp: new Date().toISOString(),
      },
      status: 'waiting',
      attempts: 0,
      maxAttempts: 3,
      processedByWorker: 'worker-node-01',
    },
  ];

  private cloudBackupConfig: CloudBackupConfig = {
    provider: 'GCS',
    bucketName: 'gs://forex-trading-engine-backups',
    schedule: 'DAILY',
    lastUploadedAt: new Date().toISOString(),
    lastSnapshotSizeMb: 42.8,
    encryptionAlgorithm: 'AES-256-GCM',
    checksumSha256: '9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a',
    autoUploadEnabled: true,
  };

  private listeners: (() => void)[] = [];

  constructor() {
    // Simulate active Redis job processing loop
    setInterval(() => {
      this.processWaitingJobs();
      this.notify();
    }, 4000);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public getRedisStats(): RedisClusterStats {
    return { ...this.redisStats };
  }

  public getBullJobs(): BullMQJob[] {
    return [...this.bullJobs];
  }

  public getCloudBackupConfig(): CloudBackupConfig {
    return { ...this.cloudBackupConfig };
  }

  public triggerManualCloudBackup(provider: 'GCS' | 'AWS_S3'): CloudBackupConfig {
    this.cloudBackupConfig = {
      ...this.cloudBackupConfig,
      provider,
      bucketName:
        provider === 'GCS'
          ? 'gs://forex-trading-engine-backups'
          : 's3://forex-trading-engine-encrypted-snapshots',
      lastUploadedAt: new Date().toISOString(),
      checksumSha256: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
    };
    this.notify();
    return this.cloudBackupConfig;
  }

  public pushNewJob(job: Omit<BullMQJob, 'id' | 'status' | 'attempts' | 'maxAttempts' | 'processedByWorker'>) {
    const newJob: BullMQJob = {
      ...job,
      id: `job-${Math.floor(100 + Math.random() * 900)}`,
      status: 'waiting',
      attempts: 0,
      maxAttempts: 3,
      processedByWorker: `worker-node-0${Math.floor(1 + Math.random() * 3)}`,
    };
    this.bullJobs.unshift(newJob);
    if (this.bullJobs.length > 30) this.bullJobs.pop();
    this.notify();
  }

  private processWaitingJobs() {
    const active = this.bullJobs.find((j) => j.status === 'active');
    if (active) {
      active.status = 'completed';
      active.processedAt = new Date().toISOString();
      active.latencyMs = Math.floor(10 + Math.random() * 25);
    }

    const waiting = this.bullJobs.find((j) => j.status === 'waiting');
    if (waiting) {
      waiting.status = 'active';
      waiting.attempts += 1;
    }
  }

  public getPrometheusMetricsText(): string {
    return `# HELP forex_engine_signals_total Total signals generated by Trading Engine
# TYPE forex_engine_signals_total counter
forex_engine_signals_total{pair="EURUSD",strategy="EMA_CROSS"} 142
forex_engine_signals_total{pair="GBPUSD",strategy="RSI_MACD"} 98
forex_engine_signals_total{pair="XAUUSD",strategy="ICT_ORDER_BLOCK"} 64

# HELP forex_engine_quality_score Average signal quality score percentage
# TYPE forex_engine_quality_score gauge
forex_engine_quality_score 93.4

# HELP bullmq_queue_jobs_waiting Number of waiting jobs in Redis BullMQ
# TYPE bullmq_queue_jobs_waiting gauge
bullmq_queue_jobs_waiting ${this.bullJobs.filter((j) => j.status === 'waiting').length}

# HELP bullmq_queue_jobs_active Number of active jobs currently being processed
# TYPE bullmq_queue_jobs_active gauge
bullmq_queue_jobs_active ${this.bullJobs.filter((j) => j.status === 'active').length}

# HELP redis_memory_used_bytes Redis memory usage in bytes
# TYPE redis_memory_used_bytes gauge
redis_memory_used_bytes ${Math.round(this.redisStats.memoryUsedMb * 1024 * 1024)}

# HELP redis_connected_clients Total connected Redis client sockets
# TYPE redis_connected_clients gauge
redis_connected_clients ${this.redisStats.connectedClients}

# HELP http_requests_total Total HTTP requests handled by Express API
# TYPE http_requests_total counter
http_requests_total{status="200",method="GET"} 8421
http_requests_total{status="200",method="POST"} 1240
http_requests_total{status="401",method="POST"} 12
`;
  }
}

export const globalRedisQueueManager = new RedisQueueManager();
